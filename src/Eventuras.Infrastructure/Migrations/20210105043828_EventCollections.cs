using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace Eventuras.Infrastructure.Migrations
{
    public partial class EventCollections : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EventCollections",
                columns: table => new
                {
                    CollectionId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    OrganizationId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Slug = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Featured = table.Column<bool>(type: "boolean", nullable: false),
                    FeaturedImageUrl = table.Column<string>(type: "text", nullable: true),
                    FeaturedImageCaption = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventCollections", x => x.CollectionId);
                    table.ForeignKey(
                        name: "FK_EventCollections_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "OrganizationId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EventCollectionMappings",
                columns: table => new
                {
                    CollectionId = table.Column<int>(type: "integer", nullable: false),
                    EventId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventCollectionMappings", x => new { x.CollectionId, x.EventId });
                    table.ForeignKey(
                        name: "FK_EventCollectionMappings_EventCollections_CollectionId",
                        column: x => x.CollectionId,
                        principalTable: "EventCollections",
                        principalColumn: "CollectionId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EventCollectionMappings_EventInfos_EventId",
                        column: x => x.EventId,
                        principalTable: "EventInfos",
                        principalColumn: "EventInfoId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EventCollectionMappings_EventId",
                table: "EventCollectionMappings",
                column: "EventId");

            migrationBuilder.CreateIndex(
                name: "IX_EventCollections_OrganizationId",
                table: "EventCollections",
                column: "OrganizationId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EventCollectionMappings");

            migrationBuilder.DropTable(
                name: "EventCollections");
        }
    }
}
