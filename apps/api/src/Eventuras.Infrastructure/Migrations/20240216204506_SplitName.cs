using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eventuras.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SplitName : Migration
    {
        /// <inheritdoc />
        ///
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Populate Name from GivenName
            migrationBuilder.Sql(@"
                UPDATE public.""AspNetUsers""
                SET ""GivenName"" = ""Name""
                WHERE ""Name"" IS NOT NULL;
            ");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "AspNetUsers");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.Sql(@"
                UPDATE public.""AspNetUsers""
                SET ""Name"" = ""GivenName"";
            ");
        }
    }
}
