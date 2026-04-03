using System;
using Microsoft.EntityFrameworkCore.Migrations;
using NodaTime;

#nullable disable

namespace Eventuras.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBusinessEvent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BusinessEvents",
                columns: table => new
                {
                    Uuid = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false),
                    EventType = table.Column<string>(type: "text", nullable: false),
                    SubjectType = table.Column<string>(type: "text", nullable: false),
                    SubjectUuid = table.Column<Guid>(type: "uuid", nullable: false),
                    ActorUserUuid = table.Column<Guid>(type: "uuid", nullable: true),
                    Message = table.Column<string>(type: "text", nullable: false),
                    MetadataJson = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BusinessEvents", x => x.Uuid);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BusinessEvents_ActorUserUuid",
                table: "BusinessEvents",
                column: "ActorUserUuid");

            migrationBuilder.CreateIndex(
                name: "IX_BusinessEvents_CreatedAt",
                table: "BusinessEvents",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_BusinessEvents_EventType",
                table: "BusinessEvents",
                column: "EventType");

            migrationBuilder.CreateIndex(
                name: "IX_BusinessEvents_SubjectType_SubjectUuid",
                table: "BusinessEvents",
                columns: new[] { "SubjectType", "SubjectUuid" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BusinessEvents");
        }
    }
}
