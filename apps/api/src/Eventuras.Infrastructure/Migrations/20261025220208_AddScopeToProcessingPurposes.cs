using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eventuras.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddScopeToProcessingPurposes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Scope",
                table: "ProcessingPurposes",
                type: "integer",
                nullable: false,
                // Every existing purpose was decided organization-wide.
                defaultValue: 1);

            migrationBuilder.AddCheckConstraint(
                name: "CK_ProcessingPurposes_Scope",
                table: "ProcessingPurposes",
                sql: "\"Scope\" IN (1, 2)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_ProcessingPurposes_Scope",
                table: "ProcessingPurposes");

            migrationBuilder.DropColumn(
                name: "Scope",
                table: "ProcessingPurposes");
        }
    }
}
