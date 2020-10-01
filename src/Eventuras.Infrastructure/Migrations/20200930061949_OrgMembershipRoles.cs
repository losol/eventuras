using Microsoft.EntityFrameworkCore.Migrations;

namespace Eventuras.Infrastructure.Migrations
{
    public partial class OrgMembershipRoles : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OrganizationMemberRoles",
                columns: table => new
                {
                    OrganizationMemberId = table.Column<int>(nullable: false),
                    Role = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrganizationMemberRoles", x => new { x.OrganizationMemberId, x.Role });
                    table.ForeignKey(
                        name: "FK_OrganizationMemberRoles_OrganizationMembers_OrganizationMem~",
                        column: x => x.OrganizationMemberId,
                        principalTable: "OrganizationMembers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OrganizationMemberRoles");
        }
    }
}
