using System;
using Microsoft.EntityFrameworkCore.Migrations;
using NodaTime;

#nullable disable

namespace Eventuras.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProcessingPurposes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProcessingPurposes",
                columns: table => new
                {
                    Uuid = table.Column<Guid>(type: "uuid", nullable: false),
                    OrganizationUuid = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Version = table.Column<int>(type: "integer", nullable: false),
                    Kind = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Text = table.Column<string>(type: "text", nullable: false),
                    RequiresReconsent = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false),
                    RetiredAt = table.Column<Instant>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProcessingPurposes", x => x.Uuid);
                    table.UniqueConstraint("AK_ProcessingPurposes_Uuid_OrganizationUuid_Code", x => new { x.Uuid, x.OrganizationUuid, x.Code });
                    table.ForeignKey(
                        name: "FK_ProcessingPurposes_Organizations_OrganizationUuid",
                        column: x => x.OrganizationUuid,
                        principalTable: "Organizations",
                        principalColumn: "Uuid",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PurposeDecisions",
                columns: table => new
                {
                    Uuid = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrganizationUuid = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ProcessingPurposeUuid = table.Column<Guid>(type: "uuid", nullable: false),
                    Decision = table.Column<int>(type: "integer", nullable: false),
                    Source = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false),
                    DecidedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PurposeDecisions", x => x.Uuid);
                    table.ForeignKey(
                        name: "FK_PurposeDecisions_Organizations_OrganizationUuid",
                        column: x => x.OrganizationUuid,
                        principalTable: "Organizations",
                        principalColumn: "Uuid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PurposeDecisions_ProcessingPurposes",
                        columns: x => new { x.ProcessingPurposeUuid, x.OrganizationUuid, x.Code },
                        principalTable: "ProcessingPurposes",
                        principalColumns: new[] { "Uuid", "OrganizationUuid", "Code" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PurposeDecisions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProcessingPurposes_OrganizationUuid_Code",
                table: "ProcessingPurposes",
                columns: new[] { "OrganizationUuid", "Code" },
                unique: true,
                filter: "\"RetiredAt\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_ProcessingPurposes_OrganizationUuid_Code_Version",
                table: "ProcessingPurposes",
                columns: new[] { "OrganizationUuid", "Code", "Version" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PurposeDecisions_OrganizationUuid_Code_Decision",
                table: "PurposeDecisions",
                columns: new[] { "OrganizationUuid", "Code", "Decision" });

            migrationBuilder.CreateIndex(
                name: "IX_PurposeDecisions_ProcessingPurposeUuid_OrganizationUuid_Code",
                table: "PurposeDecisions",
                columns: new[] { "ProcessingPurposeUuid", "OrganizationUuid", "Code" });

            migrationBuilder.CreateIndex(
                name: "IX_PurposeDecisions_UserId_OrganizationUuid_Code",
                table: "PurposeDecisions",
                columns: new[] { "UserId", "OrganizationUuid", "Code" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PurposeDecisions");

            migrationBuilder.DropTable(
                name: "ProcessingPurposes");
        }
    }
}
