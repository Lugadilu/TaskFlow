using System.Text;
using System.Text.Json;
using CsvHelper;
using CsvHelper.Configuration;
using iTextSharp.text;
using iTextSharp.text.pdf;
using TaskFlowAPI.Models;

namespace TaskFlowAPI.Services;

public interface IExportService
{
    byte[] ExportToCSV(List<TaskItem> tasks);
    byte[] ExportToPDF(List<TaskItem> tasks, string username);
    string ExportToJSON(List<TaskItem> tasks);
}

public class ExportService : IExportService
{
    public byte[] ExportToCSV(List<TaskItem> tasks)
    {
        using var memoryStream = new MemoryStream();
        using var streamWriter = new StreamWriter(memoryStream, Encoding.UTF8);
        using var csvWriter = new CsvWriter(streamWriter, new CsvConfiguration(System.Globalization.CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true,
        });

        // Write CSV data
        csvWriter.WriteRecords(tasks.Select(t => new
        {
            Id = t.Id,
            Title = t.Title,
            Description = t.Description,
            Priority = t.Priority,
            IsCompleted = t.IsCompleted,
            DueDate = t.DueDate.ToString("yyyy-MM-dd"),
            CreatedAt = t.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"),
            Status = t.IsCompleted ? "Completed" : "Active"
        }));

        streamWriter.Flush();
        return memoryStream.ToArray();
    }

    public byte[] ExportToPDF(List<TaskItem> tasks, string username)
    {
        using var memoryStream = new MemoryStream();
        var document = new Document(PageSize.A4, 25, 25, 30, 30);
        var writer = PdfWriter.GetInstance(document, memoryStream);

        document.Open();

        // Add title
        var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 18, BaseColor.Black);
        var title = new Paragraph("Task Report", titleFont)
        {
            Alignment = Element.ALIGN_CENTER,
            SpacingAfter = 20
        };
        document.Add(title);

        // Add metadata
        var metaFont = FontFactory.GetFont(FontFactory.HELVETICA, 10, BaseColor.Gray);
        var meta = new Paragraph($"Generated for: {username}\nDate: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC\nTotal Tasks: {tasks.Count}", metaFont)
        {
            SpacingAfter = 20
        };
        document.Add(meta);

        // Add tasks table
        var table = new PdfPTable(5)
        {
            WidthPercentage = 100,
            SpacingBefore = 10
        };
        table.SetWidths(new float[] { 15f, 30f, 15f, 20f, 20f });

        // Table headers
        var headerFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.White);
        var headerBg = new BaseColor(79, 70, 229); // Blue color

        AddCell(table, "ID", headerFont, headerBg);
        AddCell(table, "Title", headerFont, headerBg);
        AddCell(table, "Priority", headerFont, headerBg);
        AddCell(table, "Status", headerFont, headerBg);
        AddCell(table, "Due Date", headerFont, headerBg);

        // Table rows
        var cellFont = FontFactory.GetFont(FontFactory.HELVETICA, 9, BaseColor.Black);
        foreach (var task in tasks.OrderBy(t => t.DueDate))
        {
            AddCell(table, task.Id.ToString(), cellFont, BaseColor.White);
            AddCell(table, task.Title, cellFont, BaseColor.White);
            
            // Priority with color
            var priorityColor = task.Priority switch
            {
                "High" => new BaseColor(239, 68, 68),    // Red
                "Medium" => new BaseColor(251, 146, 60), // Orange
                "Low" => new BaseColor(34, 197, 94),     // Green
                _ => BaseColor.Gray
            };
            AddCell(table, task.Priority, cellFont, priorityColor, true);
            
            // Status
            var status = task.IsCompleted ? "✓ Completed" : "○ Active";
            var statusColor = task.IsCompleted ? new BaseColor(34, 197, 94) : new BaseColor(100, 116, 139);
            AddCell(table, status, cellFont, statusColor, true);
            
            AddCell(table, task.DueDate.ToString("yyyy-MM-dd"), cellFont, BaseColor.White);
        }

        document.Add(table);

        // Add summary statistics
        document.Add(new Paragraph("\n"));
        var statsFont = FontFactory.GetFont(FontFactory.HELVETICA, 10, BaseColor.Black);
        var stats = new Paragraph($"Summary:\n" +
            $"• Total Tasks: {tasks.Count}\n" +
            $"• Completed: {tasks.Count(t => t.IsCompleted)}\n" +
            $"• Active: {tasks.Count(t => !t.IsCompleted)}\n" +
            $"• High Priority: {tasks.Count(t => t.Priority == "High")}\n" +
            $"• Medium Priority: {tasks.Count(t => t.Priority == "Medium")}\n" +
            $"• Low Priority: {tasks.Count(t => t.Priority == "Low")}", statsFont)
        {
            SpacingBefore = 20
        };
        document.Add(stats);

        document.Close();
        writer.Close();

        return memoryStream.ToArray();
    }

    public string ExportToJSON(List<TaskItem> tasks)
    {
        var exportData = new
        {
            ExportDate = DateTime.UtcNow,
            TotalTasks = tasks.Count,
            Tasks = tasks.Select(t => new
            {
                t.Id,
                t.Title,
                t.Description,
                t.Priority,
                t.IsCompleted,
                DueDate = t.DueDate.ToString("yyyy-MM-dd"),
                CreatedAt = t.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"),
                Status = t.IsCompleted ? "Completed" : "Active"
            })
        };

        return JsonSerializer.Serialize(exportData, new JsonSerializerOptions
        {
            WriteIndented = true
        });
    }

    private void AddCell(PdfPTable table, string text, Font font, BaseColor backgroundColor, bool isColored = false)
    {
        var cell = new PdfPCell(new Phrase(text, font))
        {
            BackgroundColor = isColored ? new BaseColor(backgroundColor.R, backgroundColor.G, backgroundColor.B, 50) : backgroundColor,
            Padding = 5,
            VerticalAlignment = Element.ALIGN_MIDDLE,
            HorizontalAlignment = Element.ALIGN_LEFT
        };
        table.AddCell(cell);
    }
}