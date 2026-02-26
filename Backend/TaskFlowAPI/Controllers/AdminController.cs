using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskFlowAPI.Data;
using TaskFlowAPI.Models;
using System.Security.Claims;

namespace TaskFlowAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]  // Must be logged in
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        // Helper to check if current user is admin
        private bool IsAdmin()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            return role == "Admin";
        }

        // Helper to get current user ID
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(userIdClaim ?? "0");
        }

                // POST /api/admin/users - Create a new user (admin only)
        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            if (!IsAdmin())
                return Forbid();

            // Check if email already exists
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);
            
            if (existingUser != null)
                return BadRequest(new { message = "Email already exists" });

            // Check if username already exists
            existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == request.Username);
            
            if (existingUser != null)
                return BadRequest(new { message = "Username already exists" });

            // Validate role
            if (request.Role != "User" && request.Role != "Admin")
                return BadRequest(new { message = "Role must be 'User' or 'Admin'" });

            // Create new user
            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = request.Role,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "User created successfully",
                user = new
                {
                    user.Id,
                    user.Username,
                    user.Email,
                    user.Role,
                    user.CreatedAt
                }
            });
        }

        // GET /api/admin/users - Get all users
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            if (!IsAdmin())
                return Forbid(); // 403 Forbidden

            var users = await _context.Users
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.Email,
                    u.Role,
                    u.CreatedAt,
                    TaskCount = u.Tasks.Count(t => !t.IsDeleted)
                })
                .ToListAsync();

            return Ok(users);
        }

        // GET /api/admin/users/{id} - Get user with their tasks
        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUserDetail(int id)
        {
            if (!IsAdmin())
                return Forbid();

            var user = await _context.Users
                .Include(u => u.Tasks.Where(t => !t.IsDeleted))
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return NotFound(new { message = "User not found" });

            var userDetail = new
            {
                user.Id,
                user.Username,
                user.Email,
                user.Role,
                user.CreatedAt,
                Tasks = user.Tasks.Select(t => new
                {
                    t.Id,
                    t.Title,
                    t.Priority,
                    t.IsCompleted,
                    t.DueDate
                })
            };

            return Ok(userDetail);
        }

        // DELETE /api/admin/users/{id} - Delete a user
        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            if (!IsAdmin())
                return Forbid();

            var adminId = GetCurrentUserId();
            
            // Prevent deleting yourself
            if (id == adminId)
                return BadRequest(new { message = "Cannot delete your own account" });

            var user = await _context.Users.FindAsync(id);
            
            if (user == null)
                return NotFound(new { message = "User not found" });

            // Don't allow deleting other admins
            if (user.Role == "Admin")
                return BadRequest(new { message = "Cannot delete other admin accounts" });

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"User {user.Username} deleted successfully" });
        }

        // PUT /api/admin/users/{id}/role - Change user role
        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> ChangeUserRole(int id, [FromBody] ChangeRoleRequest request)
        {
            if (!IsAdmin())
                return Forbid();

            var user = await _context.Users.FindAsync(id);
            
            if (user == null)
                return NotFound(new { message = "User not found" });

            if (request.Role != "User" && request.Role != "Admin")
                return BadRequest(new { message = "Role must be 'User' or 'Admin'" });

            user.Role = request.Role;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"User role updated to {request.Role}" });
        }

        // TASK MANAGEMENT
        

        // GET /api/admin/tasks - Get ALL tasks (all users)
        [HttpGet("tasks")]
        public async Task<IActionResult> GetAllTasks(
            [FromQuery] string? search = null,
            [FromQuery] bool? isCompleted = null)
        {
            if (!IsAdmin())
                return Forbid();

            var query = _context.TaskItems
                .Include(t => t.User)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
                query = query.Where(t => t.Title.Contains(search));

            if (isCompleted.HasValue)
                query = query.Where(t => t.IsCompleted == isCompleted.Value);

            var tasks = await query
                .Select(t => new
                {
                    t.Id,
                    t.Title,
                    t.Description,
                    t.Priority,
                    t.IsCompleted,
                    t.DueDate,
                    t.CreatedAt,
                    OwnerUsername = t.User != null ? t.User.Username : "Unknown",
                    OwnerEmail = t.User != null ? t.User.Email : "Unknown"
                })
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return Ok(tasks);
        }

        // POST /api/admin/tasks/create-and-assign
        [HttpPost("tasks/create-and-assign")]
        public async Task<IActionResult> CreateAndAssignTask([FromBody] CreateAssignTaskRequest request)
        {
            if (!IsAdmin())
                return Forbid();

            var adminId = GetCurrentUserId();
            
            var user = await _context.Users.FindAsync(request.AssignToUserId);
            if (user == null)
                return NotFound(new { message = "User not found" });

            var task = new TaskItem
            {
                Title = request.Title,
                Description = request.Description ?? string.Empty,
                DueDate = request.DueDate,
                Priority = request.Priority ?? "Medium",
                UserId = adminId,
                AssignedToUserId = request.AssignToUserId,
                AssignedByUserId = adminId,
                AssignedAt = DateTime.UtcNow,
                IsCompleted = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.TaskItems.Add(task);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Task created and assigned to {user.Username}",
                task
            });
        }

        // DELETE /api/admin/tasks/{id}/force
        [HttpDelete("tasks/{id}/force")]
        public async Task<IActionResult> ForceDeleteTask(int id)
        {
            if (!IsAdmin())
                return Forbid();

            var task = await _context.TaskItems
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null)
                return NotFound(new { message = "Task not found" });

            _context.TaskItems.Remove(task);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Task permanently deleted" });
        }

        
        // STATISTICS
        

        // GET /api/admin/stats
        [HttpGet("stats")]
        public async Task<IActionResult> GetStatistics()
        {
            if (!IsAdmin())
                return Forbid();

            var totalUsers = await _context.Users.CountAsync();
            var totalAdmins = await _context.Users.CountAsync(u => u.Role == "Admin");
            var totalTasks = await _context.TaskItems.CountAsync();
            var completedTasks = await _context.TaskItems.CountAsync(t => t.IsCompleted);
            var deletedTasks = await _context.TaskItems
                .IgnoreQueryFilters()
                .CountAsync(t => t.IsDeleted);

            var stats = new
            {
                TotalUsers = totalUsers,
                TotalAdmins = totalAdmins,
                TotalTasks = totalTasks,
                CompletedTasks = completedTasks,
                ActiveTasks = totalTasks - completedTasks,
                DeletedTasks = deletedTasks,
                TasksPerUser = totalUsers > 0 ? (double)totalTasks / totalUsers : 0
            };

            return Ok(stats);
        }
    }

   
    // REQUEST DTOs
    

    public class ChangeRoleRequest
    {
        public string Role { get; set; } = string.Empty;
    }

    public class CreateAssignTaskRequest
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime DueDate { get; set; }
        public string? Priority { get; set; }
        public int AssignToUserId { get; set; }
    }
        public class CreateUserRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "User";
    }
}