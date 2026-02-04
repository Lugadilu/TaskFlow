using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskFlowAPI.Migrations
{
    /// <inheritdoc />
    public partial class HardcodedTime : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "TaskItems",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "DueDate", "Title" },
                values: new object[] { new DateTime(2024, 1, 15, 10, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 22, 23, 59, 59, 0, DateTimeKind.Utc), "Learn .NET API" });

            migrationBuilder.UpdateData(
                table: "TaskItems",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "DueDate" },
                values: new object[] { new DateTime(2024, 1, 15, 11, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 29, 23, 59, 59, 0, DateTimeKind.Utc) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "TaskItems",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "DueDate", "Title" },
                values: new object[] { "2026-01-29 17:38:55", new DateTime(2026, 2, 5, 17, 38, 55, 388, DateTimeKind.Local).AddTicks(6440), "Learn  .NET API" });

            migrationBuilder.UpdateData(
                table: "TaskItems",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "DueDate" },
                values: new object[] { "2026-01-29 17:38:55", new DateTime(2026, 2, 12, 17, 38, 55, 388, DateTimeKind.Local).AddTicks(7883) });
        }
    }
}
