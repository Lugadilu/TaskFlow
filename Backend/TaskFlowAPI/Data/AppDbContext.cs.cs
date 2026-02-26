using System;
using Microsoft.EntityFrameworkCore;
using TaskFlowAPI.Models;

namespace TaskFlowAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<TaskItem> TaskItems { get; set; }
    public DbSet<User> Users { get; set; } 

    protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure the relationship
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasMany(u => u.Tasks)
                    .WithOne(t => t.User)
                    .HasForeignKey(t => t.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure TaskItem with soft delete filter and relationships
            modelBuilder.Entity<TaskItem>(entity =>
            {
                // Global query filter - automatically excludes soft-deleted tasks
                entity.HasQueryFilter(t => !t.IsDeleted);

                // Set default value for IsDeleted
                entity.Property(t => t.IsDeleted)
                    .HasDefaultValue(false);

                // Index on UserId for faster queries
                entity.HasIndex(t => t.UserId);

                // AssignedToUser relationship
                entity.HasOne(t => t.AssignedToUser)
                    .WithMany()
                    .HasForeignKey(t => t.AssignedToUserId)
                    .OnDelete(DeleteBehavior.SetNull);

                // AssignedByUser relationship
                entity.HasOne(t => t.AssignedByUser)
                    .WithMany()
                    .HasForeignKey(t => t.AssignedByUserId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    Username = "demo_user",
                    Email = "demo@taskflow.com",
                    PasswordHash = "temp_password_hash", 
                    Role = "User",
                    CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                },
                new User  
                {
                    Id = 2,
                    Username = "test_user",
                    Email = "test@taskflow.com", 
                    PasswordHash = "test_password_hash",
                    Role = "User",
                    CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                },
                // admin
                new User
                {
                    Id = 3,
                    Username = "admin",
                    Email = "admin@taskflow.com",
                    PasswordHash = "$2a$10$Zwr2I2HZA635nc93HThiT./SU9IznGM3oeBOsEa9AQQTHh9ZJSiye", // password
                    Role = "Admin",
                    CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                }
            );

            
            modelBuilder.Entity<TaskItem>().HasData(
                new TaskItem
                {
                    Id = 1,
                    Title = "Learn .NET API",
                    Description = "This is a sample task description.",
                    CreatedAt = new DateTime(2024, 1, 15, 10, 0, 0, DateTimeKind.Utc),
                    DueDate = new DateTime(2024, 1, 22, 23, 59, 59, DateTimeKind.Utc), 
                    IsCompleted = false,
                    Priority = "High",
                    UserId = 1, 
                    IsDeleted = false,
                    DeletedBy = ""
                },
                new TaskItem
                {
                    Id = 2,
                    Title = "Learn React",
                    Description = "This is another task description.",
                    CreatedAt = new DateTime(2024, 1, 15, 11, 0, 0, DateTimeKind.Utc), 
                    DueDate = new DateTime(2024, 1, 29, 23, 59, 59, DateTimeKind.Utc),
                    IsCompleted = false,
                    Priority = "High",
                    UserId = 2, 
                    IsDeleted = false,
                    DeletedBy = ""
                }
            );
        }
}