using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskFlowAPI.Data;
using TaskFlowAPI.Models;

namespace TaskFlowAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TasksController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskItem>>> GetTask(
            [FromQuery] string? search, 
            [FromQuery] bool? isCompleted,
            [FromQuery] string? sortBy,
            [FromQuery] string? priority)
            
        {
            try
            {
                // 1. Create a queryable object (No data is fetched yet)
                var query = _context.TaskItems.AsQueryable();

                // 2. Filter by Search (Title or Description)
                if (!string.IsNullOrWhiteSpace(search))
                {
                    // Case-insensitive search in SQLite/SQL Server by default
                    query = query.Where(t => t.Title.Contains(search) || 
                                            (t.Description != null && t.Description.Contains(search)));
                }

                // 3. Filter by Status (Advanced Filter)
                if (isCompleted.HasValue)
                {
                    query = query.Where(t => t.IsCompleted == isCompleted.Value);
                }

                // 4. Implement Sorting
                query = sortBy?.ToLower() switch
                {
                    "title" => query.OrderBy(t => t.Title),
                    "oldest" => query.OrderBy(t => t.CreatedAt), // Ensure your model has CreatedAt
                    _ => query.OrderByDescending(t => t.Id) // Default: show newest created first
                };

                // 5. Finally, execute the query and fetch data
                var tasks = await query.ToListAsync();
                return Ok(tasks);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    "Error retrieving filtered data: " + ex.Message);
            }
        }
       
        [HttpPost]
        public async Task<IActionResult> CreateTask(TaskItem taskItem)
        {
            try
            {
                _context.TaskItems.Add(taskItem);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetTask), new { id = taskItem.Id }, taskItem);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Error creating new task: " + ex.Message);
            }
        }

        [HttpGet("{id}")]
       public async Task<ActionResult<TaskItem>> GetTaskItem(int id)
        {
           try
           {
             var taskItem = await _context.TaskItems.FindAsync(id);
             if (taskItem ==null)
             {
                 return NotFound();
             }
                return Ok(taskItem);
 
           }
           catch (Exception ex)
           {
            
            return StatusCode(StatusCodes.Status500InternalServerError, "Error retrieving task: " + ex.Message);
           }
        } 

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] TaskItem taskItem)
        {
          try
            {
                if (id != taskItem.Id)
                {
                    return BadRequest("Task ID mismatch");
                }
                if (!await _context.TaskItems.AnyAsync(t=> t.Id == id))
                {
                    return NotFound();
                }
                _context.TaskItems.Update(taskItem);
                await _context.SaveChangesAsync();
                return NoContent();
            }  
            catch (Exception ex)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, "Error updating task: " + ex.Message);
                }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            try
            {
                var taskItem = await _context.TaskItems.FindAsync(id);
                if (taskItem == null)
                {
                    return NotFound();
                }
                _context.TaskItems.Remove(taskItem);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Error deleting task: " + ex.Message);
            }
        }
    }
}

 // [HttpGet]
        // public async Task<ActionResult<IEnumerable<TaskItem>>> GetTask()
        // {
            
        //    try
        //     {
        //         var tasks = await _context.TaskItems.ToListAsync();
        //         return Ok(tasks);
        //     }
        //     catch (Exception ex)
        //     {
        //         return StatusCode(StatusCodes.Status500InternalServerError, "Error retrieving data from the database: " + ex.Message);
        //     }
        // }
