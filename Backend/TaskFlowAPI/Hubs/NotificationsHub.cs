using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace TaskFlowAPI.Hubs
{
    [Authorize]  // Only authenticated users can connect
    public class NotificationHub : Hub
    {
        // Called when a user connects to the hub
        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = Context.User?.FindFirst(ClaimTypes.Role)?.Value;
            
            // If user is admin, add them to "Admins" group
            if (role == "Admin")
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
                Console.WriteLine($"Admin {userId} connected");
            }
            
            await base.OnConnectedAsync();
        }

        // Called when user disconnects
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Console.WriteLine($"User {userId} disconnected");
            await base.OnDisconnectedAsync(exception);
        }

        // Optional: Send a test notification
        public async Task SendTestNotification()
        {
            await Clients.Group("Admins")
                .SendAsync("ReceiveNotification", new 
                { 
                    message = "Test notification",
                    timestamp = DateTime.UtcNow 
                });
        }
    }
}