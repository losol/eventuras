using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class RemoveEvidenceTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CertificateEvidences");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CertificateEvidences",
                columns: table => new
                {
                    CertificateEvidenceId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CertificateId = table.Column<int>(nullable: false),
                    RegistrationId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CertificateEvidences", x => x.CertificateEvidenceId);
                    table.ForeignKey(
                        name: "FK_CertificateEvidences_Certificates_CertificateId",
                        column: x => x.CertificateId,
                        principalTable: "Certificates",
                        principalColumn: "CertificateId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CertificateEvidences_Registrations_RegistrationId",
                        column: x => x.RegistrationId,
                        principalTable: "Registrations",
                        principalColumn: "RegistrationId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CertificateEvidences_CertificateId",
                table: "CertificateEvidences",
                column: "CertificateId");

            migrationBuilder.CreateIndex(
                name: "IX_CertificateEvidences_RegistrationId",
                table: "CertificateEvidences",
                column: "RegistrationId");
        }
    }
}
