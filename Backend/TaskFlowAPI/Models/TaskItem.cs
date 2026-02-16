using System;

namespace TaskFlowAPI.Models;

public class TaskItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.Now; 
    public DateTime DueDate { get; set; }
    public bool IsCompleted { get; set; }
    public string Priority { get; set; } = "Medium";

    public bool IsDeleted { get; set; } = false; // Soft delete flag
    public DateTime? DeletedAt { get; set; } // Timestamp for when the task was deleted
    public string DeletedBy { get; set; } = string.Empty; // User who deleted the task
    public int UserId { get; set; } // Foreign key to associate task with a user
    public User? User { get; set; } // Navigation property to the User
    
}
