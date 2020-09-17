using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace Eventuras.Infrastructure.Migrations
{
    public partial class ExternalEvents : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EnrolledInLms",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "LmsCourseId",
                table: "EventInfos");

            migrationBuilder.CreateTable(
                name: "ExternalAccounts",
                columns: table => new
                {
                    LocalId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ExternalServiceName = table.Column<string>(nullable: false),
                    ExternalAccountId = table.Column<string>(nullable: false),
                    DisplayName = table.Column<string>(nullable: false),
                    RegistrationId = table.Column<int>(nullable: true),
                    UserId = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExternalAccounts", x => x.LocalId);
                    table.ForeignKey(
                        name: "FK_ExternalAccounts_Registrations_RegistrationId",
                        column: x => x.RegistrationId,
                        principalTable: "Registrations",
                        principalColumn: "RegistrationId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ExternalAccounts_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ExternalEvents",
                columns: table => new
                {
                    LocalId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EventInfoId = table.Column<int>(nullable: false),
                    ExternalServiceName = table.Column<string>(nullable: false),
                    ExternalEventId = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExternalEvents", x => x.LocalId);
                    table.ForeignKey(
                        name: "FK_ExternalEvents_EventInfos_EventInfoId",
                        column: x => x.EventInfoId,
                        principalTable: "EventInfos",
                        principalColumn: "EventInfoId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ExternalRegistrations",
                columns: table => new
                {
                    LocalId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ExternalRegistrationId = table.Column<string>(nullable: true),
                    ExternalEventId = table.Column<int>(nullable: false),
                    ExternalAccountId = table.Column<int>(nullable: false),
                    RegistrationId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExternalRegistrations", x => x.LocalId);
                    table.ForeignKey(
                        name: "FK_ExternalRegistrations_ExternalAccounts_ExternalAccountId",
                        column: x => x.ExternalAccountId,
                        principalTable: "ExternalAccounts",
                        principalColumn: "LocalId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ExternalRegistrations_ExternalEvents_ExternalEventId",
                        column: x => x.ExternalEventId,
                        principalTable: "ExternalEvents",
                        principalColumn: "LocalId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ExternalRegistrations_Registrations_RegistrationId",
                        column: x => x.RegistrationId,
                        principalTable: "Registrations",
                        principalColumn: "RegistrationId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ExternalAccounts_RegistrationId",
                table: "ExternalAccounts",
                column: "RegistrationId");

            migrationBuilder.CreateIndex(
                name: "IX_ExternalAccounts_UserId",
                table: "ExternalAccounts",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ExternalAccounts_ExternalServiceName_ExternalAccountId",
                table: "ExternalAccounts",
                columns: new[] { "ExternalServiceName", "ExternalAccountId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExternalEvents_EventInfoId_ExternalServiceName_ExternalEven~",
                table: "ExternalEvents",
                columns: new[] { "EventInfoId", "ExternalServiceName", "ExternalEventId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExternalRegistrations_ExternalEventId",
                table: "ExternalRegistrations",
                column: "ExternalEventId");

            migrationBuilder.CreateIndex(
                name: "IX_ExternalRegistrations_RegistrationId",
                table: "ExternalRegistrations",
                column: "RegistrationId");

            migrationBuilder.CreateIndex(
                name: "IX_ExternalRegistrations_ExternalAccountId_ExternalEventId",
                table: "ExternalRegistrations",
                columns: new[] { "ExternalAccountId", "ExternalEventId" },
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExternalRegistrations");

            migrationBuilder.DropTable(
                name: "ExternalAccounts");

            migrationBuilder.DropTable(
                name: "ExternalEvents");

            migrationBuilder.AddColumn<bool>(
                name: "EnrolledInLms",
                table: "Registrations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "LmsCourseId",
                table: "EventInfos",
                type: "text",
                nullable: true);
        }
    }
}
