using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using TaskFlowAPI.Models;

namespace TaskFlowAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<TaskItem> TaskItems { get; set; }
    public DbSet<User> Users { get; set; } 

    protected  override void OnModelCreating(ModelBuilder modelBuilder)
        {

            modelBuilder.Entity<TaskItem>().HasData(
                new TaskItem
            {
            Id = 1,
            Title = "Learn .NET API",
            Description = "This is a sample task description.",
            CreatedAt = new DateTime(2024, 1, 15, 10, 0, 0, DateTimeKind.Utc),
            DueDate = new DateTime(2024, 1, 22, 23, 59, 59, DateTimeKind.Utc), 
            IsCompleted = false
            },
            new TaskItem
            {
             Id = 2,
            Title = "Learn React",
            Description = "This is another task description.",
            CreatedAt = new DateTime(2024, 1, 15, 11, 0, 0, DateTimeKind.Utc), 
            DueDate = new DateTime(2024, 1, 29, 23, 59, 59, DateTimeKind.Utc),
            IsCompleted = false

            }
            );
        }

}

