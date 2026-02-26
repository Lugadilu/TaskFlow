using System;

namespace TaskFlowAPI.Models;

public class User
{
    public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public string? PasswordResetToken { get; set; }
        public DateTime? PasswordResetTokenExpiry { get; set; }


        public string Role { get; set; } = "User"; // Default to "User"
        // Possible values: "User" or "Admin"
        
    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();


}
