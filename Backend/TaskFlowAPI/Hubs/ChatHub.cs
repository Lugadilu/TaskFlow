using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace TaskFlowAPI.Hubs
{
    //[Authorize]  // Only authenticated users
    public class ChatHub : Hub
    {
        // When a user connects to chat
        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var username = Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? $"User_{userId}";
            var role = Context.User?.FindFirst(ClaimTypes.Role)?.Value;
            
            Console.WriteLine($"DEBUG: userId={userId}, username={username}, role={role}");
            Console.WriteLine($"DEBUG: username is null? {username == null}");
            Console.WriteLine($"DEBUG: username is empty? {string.IsNullOrWhiteSpace(username)}");

            Console.WriteLine($"✅ {username} (ID: {userId}, Role: {role}) connected to chat");
            
            // Add user to a personal group (for direct messages)
            // This allows sending messages to specific user by their ID
            await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
            Console.WriteLine($"✅ User added to User_{userId} group");
            
            // Add admins to "Admins" group
            if (role == "Admin")
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
                Console.WriteLine($"✅ Admin {username} added to Admins group");
            }
            
            // Add regular users to "Users" group
            if (role == "User")
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, "Users");
                Console.WriteLine($"✅ User {username} added to Users group");
            }
            
            await base.OnConnectedAsync();
        }

        // When user disconnects
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var username = Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? $"User_{userId}";
            
            Console.WriteLine($"❌ {username} (ID: {userId}) disconnected from chat");
            
            // Notify admins that a user left
            await Clients.Group("Admins")
                .SendAsync("UserDisconnected", new
                {
                    userId = userId,
                    username = username,
                    timestamp = DateTime.UtcNow
                });
            
            await base.OnDisconnectedAsync(exception);
        }

        // ===== USER TO ADMIN MESSAGING =====

        // User sends message to all admins
        public async Task SendMessageToAdmins(string message)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var username = Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? $"User_{userId}";
            
            Console.WriteLine($"📩 Message from {username} to admins: {message}");
            
            // Validate message
            if (string.IsNullOrWhiteSpace(message))
            {
                await Clients.Caller.SendAsync("Error", new { message = "Message cannot be empty" });
                return;
            }
            
            // Send to all admins
            await Clients.Group("Admins")
                .SendAsync("ReceiveMessageFromUser", new
                {
                    userId = userId,
                    username = username,
                    message = message,
                    timestamp = DateTime.UtcNow
                });
            
            // Also send confirmation back to sender
            await Clients.Caller.SendAsync("MessageSent", new
            {
                message = message,
                timestamp = DateTime.UtcNow
            });
        }

        // Admin sends message to specific user
        public async Task SendMessageToUser(int userId, string message)
        {
            var adminId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var adminName = Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? $"User_{adminId}";
            var role = Context.User?.FindFirst(ClaimTypes.Role)?.Value;
            
            // Check if sender is admin
            if (role != "Admin")
            {
                await Clients.Caller.SendAsync("Error", 
                    new { message = "Only admins can send messages to users" });
                return;
            }
            
            Console.WriteLine($"📩 Message from admin {adminName} to user {userId}: {message}");
            
            if (string.IsNullOrWhiteSpace(message))
            {
                await Clients.Caller.SendAsync("Error", new { message = "Message cannot be empty" });
                return;
            }
            
            // Send to specific user
            await Clients.Group($"User_{userId}")
                .SendAsync("ReceiveMessageFromAdmin", new
                {
                    adminId = adminId,
                    adminName = adminName,
                    message = message,
                    timestamp = DateTime.UtcNow
                });
            
            // Send confirmation to admin
            await Clients.Caller.SendAsync("MessageSent", new
            {
                message = message,
                sentTo = userId,
                timestamp = DateTime.UtcNow
            });
        }

        // Admin sends message to all users
        public async Task BroadcastToAllUsers(string message)
        {
            var role = Context.User?.FindFirst(ClaimTypes.Role)?.Value;
            var adminId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var adminName = Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? $"User_{adminId}";
            
            // Only admins can broadcast
            if (role != "Admin")
            {
                await Clients.Caller.SendAsync("Error", 
                    new { message = "Only admins can broadcast messages" });
                return;
            }
            
            Console.WriteLine($"📢 Broadcast from {adminName}: {message}");
            
            // Send to all users
            await Clients.Group("Users")
                .SendAsync("ReceiveBroadcast", new
                {
                    adminName = adminName,
                    message = message,
                    timestamp = DateTime.UtcNow
                });
        }
    }
}