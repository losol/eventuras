using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eventuras.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EventInfo_AddOptionsWithPolicies : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Options_RegistrationPolicy_AllowModificationsAfterCancellation~",
                table: "EventInfos",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "Options_RegistrationPolicy_AllowedRegistrationEditHours",
                table: "EventInfos",
                type: "integer",
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE public."EventInfos"
                SET "Options_RegistrationPolicy_AllowModificationsAfterCancellation~" = true;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Options_RegistrationPolicy_AllowModificationsAfterCancellation~",
                table: "EventInfos");

            migrationBuilder.DropColumn(
                name: "Options_RegistrationPolicy_AllowedRegistrationEditHours",
                table: "EventInfos");
        }
    }
}
