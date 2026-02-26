using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using TaskFlowAPI.Data;
using TaskFlowAPI.Hubs;
using TaskFlowAPI.Models;
using TaskFlowAPI.Services;

namespace TaskFlowAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]  // Require JWT token for all endpoints
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IExportService _exportService;
        private readonly IHubContext<NotificationHub> _hubContext;

        public TasksController(AppDbContext context, IExportService exportService,
         IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _exportService = exportService;
            _hubContext = hubContext;
        }

        // Get user ID from JWT token
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userIdClaim))
            {
                throw new UnauthorizedAccessException("User ID not found in token");
            }
            
            return int.Parse(userIdClaim);
        }

        // Get username from JWT token
        private string GetCurrentUsername()
        {
            return User.FindFirst(ClaimTypes.Name)?.Value ?? "Unknown";
        }

        // GET: api/tasks
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskItem>>> GetTask(
            [FromQuery] string? search, 
            [FromQuery] bool? isCompleted,
            [FromQuery] string? sortBy,
            [FromQuery] string? priority)
        {
            try
            {
                var userId = GetCurrentUserId();  // Get from JWT
                
                var query = _context.TaskItems
                     .Where(t => t.UserId == userId || t.AssignedToUserId == userId)  // Filter by user/assigned task
                    .AsQueryable();

                if (!string.IsNullOrWhiteSpace(search))
                {
                    query = query.Where(t => t.Title.Contains(search) || 
                                            (t.Description != null && t.Description.Contains(search)));
                }

                if (isCompleted.HasValue)
                {
                    query = query.Where(t => t.IsCompleted == isCompleted.Value);
                }

                if (!string.IsNullOrWhiteSpace(priority))
                {
                    query = query.Where(t => t.Priority == priority);
                }

                query = sortBy?.ToLower() switch
                {
                    "title" => query.OrderBy(t => t.Title),
                    "duedate" => query.OrderBy(t => t.DueDate),
                    "priority" => query.OrderBy(t => t.Priority),
                    "oldest" => query.OrderBy(t => t.CreatedAt),
                    _ => query.OrderByDescending(t => t.Id)
                };

                var tasks = await query.ToListAsync();
                return Ok(tasks);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    "Error retrieving filtered data: " + ex.Message);
            }
        }

        // GET: api/tasks/deleted
        [HttpGet("deleted")]
        public async Task<ActionResult<IEnumerable<TaskItem>>> GetDeletedTasks()
        {
            try
            {
                var userId = GetCurrentUserId();
                
                var deletedTasks = await _context.TaskItems
                    .IgnoreQueryFilters()
                    .Where(t => t.UserId == userId && t.IsDeleted)
                    .OrderByDescending(t => t.DeletedAt)
                    .ToListAsync();

                return Ok(deletedTasks);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    "Error retrieving deleted tasks: " + ex.Message);
            }
        }

        // GET: api/tasks/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TaskItem>> GetTaskItem(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                
                var taskItem = await _context.TaskItems
                    .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
                
                if (taskItem == null)
                {
                    return NotFound(new { message = "Task not found" });
                }
                
                return Ok(taskItem);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    "Error retrieving task: " + ex.Message);
            }
        }

        
        // POST: api/tasks
        [HttpPost]
        public async Task<IActionResult> CreateTask(TaskItem taskItem)
        {
            try
            {
                var userId = GetCurrentUserId();
                var username = GetCurrentUsername();  
                
                taskItem.UserId = userId;
                taskItem.CreatedAt = DateTime.UtcNow;
                taskItem.IsDeleted = false;
                taskItem.DeletedBy = string.Empty;
                
                _context.TaskItems.Add(taskItem);
                await _context.SaveChangesAsync();

                // SEND SIGNALR NOTIFICATION TO ALL ADMINS
                await _hubContext.Clients.Group("Admins")
                    .SendAsync("TaskCreated", new
                    {
                        taskId = taskItem.Id,
                        title = taskItem.Title,
                        description = taskItem.Description,
                        priority = taskItem.Priority,
                        createdBy = username,
                        createdAt = taskItem.CreatedAt,
                        message = $"{username} created a new task: {taskItem.Title}"
                    });
                
                return CreatedAtAction(nameof(GetTaskItem), new { id = taskItem.Id }, taskItem);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    "Error creating new task: " + ex.Message);
            }
        }

        // PUT: api/tasks/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] TaskItem taskItem)
        {
            try
            {
                var userId = GetCurrentUserId();
                var username = GetCurrentUsername();
                
                if (id != taskItem.Id)
                {
                    return BadRequest(new { message = "Task ID mismatch" });
                }
                
                var existingTask = await _context.TaskItems
                    .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
                
                if (existingTask == null)
                {
                    return NotFound(new { message = "Task not found" });
                }
                
                existingTask.Title = taskItem.Title;
                existingTask.Description = taskItem.Description;
                existingTask.DueDate = taskItem.DueDate;
                existingTask.IsCompleted = taskItem.IsCompleted;
                existingTask.Priority = taskItem.Priority;
                
                await _context.SaveChangesAsync();

                 
        // OPTIONAL: Notify admins of update
        await _hubContext.Clients.Group("Admins")
            .SendAsync("TaskUpdated", new
            {
                taskId = taskItem.Id,
                title = taskItem.Title,
                updatedBy = username,
                updatedAt = DateTime.UtcNow,
                message = $"{username} updated task: {taskItem.Title}"
            });
                return NoContent();
            }  
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    "Error updating task: " + ex.Message);
            }
        }

        // DELETE: api/tasks/5 (SOFT DELETE)
        [HttpDelete("{id}")]
        public async Task<IActionResult> SoftDeleteTask(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var username = GetCurrentUsername();  // Get real username
                
                var taskItem = await _context.TaskItems
                    .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
                
                if (taskItem == null)
                {
                    return NotFound(new { message = "Task not found" });
                }
                
                taskItem.IsDeleted = true;
                taskItem.DeletedAt = DateTime.UtcNow;
                taskItem.DeletedBy = username;  // Use real username
                
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    "Error deleting task: " + ex.Message);
            }
        }

        // POST: api/tasks/5/restore
        [HttpPost("{id}/restore")]
        public async Task<IActionResult> RestoreTask(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                
                var taskItem = await _context.TaskItems
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId && t.IsDeleted);
                
                if (taskItem == null)
                {
                    return NotFound(new { message = "Task not found in trash" });
                }
                
                taskItem.IsDeleted = false;
                taskItem.DeletedAt = null;
                taskItem.DeletedBy = string.Empty;
                
                await _context.SaveChangesAsync();

                
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    "Error restoring task: " + ex.Message);
            }
        }

        // DELETE: api/tasks/5/permanent
        [HttpDelete("{id}/permanent")]
        public async Task<IActionResult> PermanentDeleteTask(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                
                var taskItem = await _context.TaskItems
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
                
                if (taskItem == null)
                {
                    return NotFound(new { message = "Task not found" });
                }
                
                _context.TaskItems.Remove(taskItem);
                await _context.SaveChangesAsync();
                
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    "Error permanently deleting task: " + ex.Message);
            }
        }
        // Export endpoint
    [HttpGet("export")]
    public async Task<IActionResult> ExportTasks(
        [FromQuery] string format = "json",
        [FromQuery] bool includeCompleted = true)
    {
        try
        {
            // 1. Find out WHO is making this request (from JWT token)
            var userId = GetCurrentUserId();
            var username = GetCurrentUsername();

            // Get tasks based on filter
            var query = _context.TaskItems
                .Where(t => t.UserId == userId);
            // 3. Apply filter if they don't want completed tasks
            if (!includeCompleted)
            {
                query = query.Where(t => !t.IsCompleted);
            }

            var tasks = await query
                .OrderBy(t => t.DueDate)
                .ToListAsync();

            // Generate export based on format
            return format.ToLower() switch
            {
                "csv" => File(
                    _exportService.ExportToCSV(tasks),
                    "text/csv",
                    $"tasks-{DateTime.UtcNow:yyyyMMdd-HHmmss}.csv"),

                "pdf" => File(
                    _exportService.ExportToPDF(tasks, username),
                    "application/pdf",
                    $"tasks-{DateTime.UtcNow:yyyyMMdd-HHmmss}.pdf"),

                "json" => Content(
                    _exportService.ExportToJSON(tasks),
                    "application/json"),

                _ => BadRequest(new { message = "Invalid format. Use 'csv', 'pdf', or 'json'" })
            };
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Export failed", error = ex.Message });
        }
    }
    }
}