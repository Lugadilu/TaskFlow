using Microsoft.EntityFrameworkCore;
using TaskFlowAPI.Data;

namespace TaskFlowAPI.Services;

public class TaskCleanupService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<TaskCleanupService> _logger;
    private readonly TimeSpan _cleanupInterval = TimeSpan.FromHours(24); // Run once per day

    public TaskCleanupService(
        IServiceProvider serviceProvider,
        ILogger<TaskCleanupService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Task Cleanup Service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CleanupOldDeletedTasks();
                
                // Wait 24 hours before next cleanup
                await Task.Delay(_cleanupInterval, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during task cleanup");
                
                // Wait 1 hour before retrying on error
                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
            }
        }

        _logger.LogInformation("Task Cleanup Service stopped");
    }

    private async Task CleanupOldDeletedTasks()
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Calculate cutoff date (30 days ago)
        var cutoffDate = DateTime.UtcNow.AddDays(-30);

        // Find tasks deleted more than 30 days ago
        var tasksToDelete = await context.TaskItems
            .IgnoreQueryFilters()
            .Where(t => t.IsDeleted && t.DeletedAt != null && t.DeletedAt < cutoffDate)
            .ToListAsync();

        if (tasksToDelete.Any())
        {
            _logger.LogInformation(
                "Found {Count} tasks to permanently delete (older than 30 days)",
                tasksToDelete.Count);

            // Permanently delete them
            context.TaskItems.RemoveRange(tasksToDelete);
            await context.SaveChangesAsync();

            _logger.LogInformation(
                "Successfully deleted {Count} old tasks",
                tasksToDelete.Count);
        }
        else
        {
            _logger.LogInformation("No old deleted tasks found for cleanup");
        }
    }
}