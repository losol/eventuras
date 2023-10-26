using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using System;

namespace Eventuras.Infrastructure.Migrations
{
    public partial class InitialMigration : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(nullable: false),
                    Name = table.Column<string>(maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<string>(nullable: false),
                    UserName = table.Column<string>(maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(maxLength: 256, nullable: true),
                    Email = table.Column<string>(maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(nullable: false),
                    PasswordHash = table.Column<string>(nullable: true),
                    SecurityStamp = table.Column<string>(nullable: true),
                    ConcurrencyStamp = table.Column<string>(nullable: true),
                    PhoneNumber = table.Column<string>(nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(nullable: false),
                    TwoFactorEnabled = table.Column<bool>(nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(nullable: true),
                    LockoutEnabled = table.Column<bool>(nullable: false),
                    AccessFailedCount = table.Column<int>(nullable: false),
                    Name = table.Column<string>(nullable: true),
                    SignatureImageBase64 = table.Column<string>(nullable: true),
                    Archived = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Organizations",
                columns: table => new
                {
                    OrganizationId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(nullable: false),
                    Description = table.Column<string>(maxLength: 300, nullable: true),
                    Url = table.Column<string>(maxLength: 300, nullable: true),
                    Phone = table.Column<string>(maxLength: 100, nullable: true),
                    Email = table.Column<string>(maxLength: 300, nullable: true),
                    LogoUrl = table.Column<string>(maxLength: 300, nullable: true),
                    LogoBase64 = table.Column<string>(nullable: true),
                    VatId = table.Column<string>(nullable: true),
                    AccountNumber = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Organizations", x => x.OrganizationId);
                });

            migrationBuilder.CreateTable(
                name: "PaymentMethods",
                columns: table => new
                {
                    Provider = table.Column<int>(nullable: false),
                    Type = table.Column<int>(nullable: false),
                    Name = table.Column<string>(nullable: true),
                    Active = table.Column<bool>(nullable: false),
                    AdminOnly = table.Column<bool>(nullable: false),
                    IsDefault = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentMethods", x => x.Provider);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RoleId = table.Column<string>(nullable: false),
                    ClaimType = table.Column<string>(nullable: true),
                    ClaimValue = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(nullable: false),
                    ClaimType = table.Column<string>(nullable: true),
                    ClaimValue = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(nullable: false),
                    ProviderKey = table.Column<string>(nullable: false),
                    ProviderDisplayName = table.Column<string>(nullable: true),
                    UserId = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<string>(nullable: false),
                    RoleId = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<string>(nullable: false),
                    LoginProvider = table.Column<string>(nullable: false),
                    Name = table.Column<string>(nullable: false),
                    Value = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Certificates",
                columns: table => new
                {
                    CertificateId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CertificateGuid = table.Column<Guid>(nullable: false),
                    Auth = table.Column<Guid>(nullable: false),
                    Status = table.Column<int>(nullable: false),
                    StatusComment = table.Column<string>(nullable: true),
                    Title = table.Column<string>(nullable: false),
                    Description = table.Column<string>(nullable: true),
                    Comment = table.Column<string>(nullable: true),
                    RecipientName = table.Column<string>(nullable: true),
                    RecipientEmail = table.Column<string>(nullable: true),
                    RecipientUserId = table.Column<string>(nullable: true),
                    EvidenceDescription = table.Column<string>(nullable: true),
                    IssuingOrganizationName = table.Column<string>(nullable: true),
                    IssuingOrganizationId = table.Column<int>(nullable: true),
                    IssuedByName = table.Column<string>(nullable: true),
                    IssuingUserId = table.Column<string>(nullable: true),
                    IssuedInCity = table.Column<string>(nullable: true),
                    IssuedDate = table.Column<DateTime>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Certificates", x => x.CertificateId);
                    table.ForeignKey(
                        name: "FK_Certificates_Organizations_IssuingOrganizationId",
                        column: x => x.IssuingOrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "OrganizationId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Certificates_AspNetUsers_IssuingUserId",
                        column: x => x.IssuingUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Certificates_AspNetUsers_RecipientUserId",
                        column: x => x.RecipientUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EventInfos",
                columns: table => new
                {
                    EventInfoId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Status = table.Column<int>(nullable: false),
                    Type = table.Column<int>(nullable: false),
                    Title = table.Column<string>(nullable: true),
                    Code = table.Column<string>(nullable: false),
                    Category = table.Column<string>(nullable: true),
                    Description = table.Column<string>(maxLength: 300, nullable: true),
                    Featured = table.Column<bool>(nullable: false),
                    MoreInformation = table.Column<string>(nullable: true),
                    Program = table.Column<string>(nullable: true),
                    PracticalInformation = table.Column<string>(nullable: true),
                    WelcomeLetter = table.Column<string>(nullable: true),
                    OnDemand = table.Column<bool>(nullable: false),
                    Published = table.Column<bool>(nullable: false),
                    ManageRegistrations = table.Column<bool>(nullable: false),
                    ExternalInfoPageUrl = table.Column<string>(nullable: true),
                    ExternalRegistrationsUrl = table.Column<string>(nullable: true),
                    InformationRequest = table.Column<string>(nullable: true),
                    Location = table.Column<string>(nullable: true),
                    City = table.Column<string>(nullable: true),
                    DateStart = table.Column<DateTime>(nullable: true),
                    DateEnd = table.Column<DateTime>(nullable: true),
                    LastRegistrationDate = table.Column<DateTime>(nullable: true),
                    LastCancellationDate = table.Column<DateTime>(nullable: true),
                    MaxParticipants = table.Column<int>(nullable: false),
                    CertificateTitle = table.Column<string>(nullable: true),
                    CertificateDescription = table.Column<string>(nullable: true),
                    FeaturedImageUrl = table.Column<string>(nullable: true),
                    FeaturedImageCaption = table.Column<string>(nullable: true),
                    ProjectCode = table.Column<string>(nullable: true),
                    OrganizerUserId = table.Column<string>(nullable: true),
                    OrganizationId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventInfos", x => x.EventInfoId);
                    table.ForeignKey(
                        name: "FK_EventInfos_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "OrganizationId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EventInfos_AspNetUsers_OrganizerUserId",
                        column: x => x.OrganizerUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MessageLogs",
                columns: table => new
                {
                    MessageLogId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EventInfoId = table.Column<int>(nullable: false),
                    Recipients = table.Column<string>(nullable: true),
                    MessageContent = table.Column<string>(nullable: true),
                    MessageType = table.Column<string>(nullable: true),
                    TimeStamp = table.Column<DateTime>(nullable: false),
                    Provider = table.Column<string>(nullable: true),
                    Result = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MessageLogs", x => x.MessageLogId);
                    table.ForeignKey(
                        name: "FK_MessageLogs_EventInfos_EventInfoId",
                        column: x => x.EventInfoId,
                        principalTable: "EventInfos",
                        principalColumn: "EventInfoId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    ProductId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(nullable: false),
                    Description = table.Column<string>(maxLength: 300, nullable: true),
                    MoreInformation = table.Column<string>(nullable: true),
                    EnableQuantity = table.Column<bool>(nullable: false),
                    MinimumQuantity = table.Column<int>(nullable: false),
                    Price = table.Column<decimal>(nullable: false),
                    VatPercent = table.Column<int>(nullable: false),
                    Inventory = table.Column<int>(nullable: false),
                    Published = table.Column<bool>(nullable: false),
                    DisplayOrder = table.Column<int>(nullable: false),
                    EventInfoId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.ProductId);
                    table.ForeignKey(
                        name: "FK_Products_EventInfos_EventInfoId",
                        column: x => x.EventInfoId,
                        principalTable: "EventInfos",
                        principalColumn: "EventInfoId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Registrations",
                columns: table => new
                {
                    RegistrationId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EventInfoId = table.Column<int>(nullable: false),
                    UserId = table.Column<string>(nullable: true),
                    Status = table.Column<int>(nullable: false),
                    Type = table.Column<int>(nullable: false),
                    Diploma = table.Column<bool>(nullable: false),
                    ParticipantName = table.Column<string>(nullable: true),
                    ParticipantJobTitle = table.Column<string>(nullable: true),
                    ParticipantEmployer = table.Column<string>(nullable: true),
                    ParticipantCity = table.Column<string>(nullable: true),
                    CustomerName = table.Column<string>(nullable: true),
                    CustomerEmail = table.Column<string>(nullable: true),
                    CustomerAddress = table.Column<string>(nullable: true),
                    CustomerZip = table.Column<string>(nullable: true),
                    CustomerCity = table.Column<string>(nullable: true),
                    CustomerCountry = table.Column<string>(nullable: true),
                    CustomerVatNumber = table.Column<string>(nullable: true),
                    CustomerInvoiceReference = table.Column<string>(nullable: true),
                    Notes = table.Column<string>(nullable: true),
                    Log = table.Column<string>(nullable: true),
                    RegistrationTime = table.Column<DateTime>(nullable: true),
                    RegistrationBy = table.Column<string>(nullable: true),
                    FreeRegistration = table.Column<bool>(nullable: false),
                    PaymentMethod = table.Column<int>(nullable: false),
                    Verified = table.Column<bool>(nullable: false),
                    VerificationCode = table.Column<string>(nullable: true),
                    CertificateId = table.Column<int>(nullable: true),
                    CertificateComment = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Registrations", x => x.RegistrationId);
                    table.ForeignKey(
                        name: "FK_Registrations_Certificates_CertificateId",
                        column: x => x.CertificateId,
                        principalTable: "Certificates",
                        principalColumn: "CertificateId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Registrations_EventInfos_EventInfoId",
                        column: x => x.EventInfoId,
                        principalTable: "EventInfos",
                        principalColumn: "EventInfoId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Registrations_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProductVariants",
                columns: table => new
                {
                    ProductVariantId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(nullable: true),
                    Description = table.Column<string>(maxLength: 300, nullable: true),
                    Price = table.Column<decimal>(nullable: false),
                    VatPercent = table.Column<int>(nullable: false),
                    AdminOnly = table.Column<bool>(nullable: false),
                    Inventory = table.Column<int>(nullable: false),
                    Published = table.Column<bool>(nullable: false),
                    ProductId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductVariants", x => x.ProductVariantId);
                    table.ForeignKey(
                        name: "FK_ProductVariants_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "ProductId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    OrderId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(nullable: true),
                    RegistrationId = table.Column<int>(nullable: false),
                    ExternalInvoiceId = table.Column<string>(nullable: true),
                    Paid = table.Column<bool>(nullable: false),
                    Status = table.Column<int>(nullable: false),
                    CustomerName = table.Column<string>(nullable: true),
                    CustomerEmail = table.Column<string>(nullable: true),
                    CustomerVatNumber = table.Column<string>(nullable: true),
                    CustomerInvoiceReference = table.Column<string>(nullable: true),
                    PaymentMethod = table.Column<int>(nullable: false),
                    OrderTime = table.Column<DateTime>(nullable: false),
                    Comments = table.Column<string>(nullable: true),
                    Log = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Orders", x => x.OrderId);
                    table.ForeignKey(
                        name: "FK_Orders_Registrations_RegistrationId",
                        column: x => x.RegistrationId,
                        principalTable: "Registrations",
                        principalColumn: "RegistrationId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Orders_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "OrderLines",
                columns: table => new
                {
                    OrderLineId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    OrderId = table.Column<int>(nullable: false),
                    ProductId = table.Column<int>(nullable: true),
                    ProductVariantId = table.Column<int>(nullable: true),
                    Quantity = table.Column<int>(nullable: false),
                    ProductName = table.Column<string>(nullable: true),
                    ProductDescription = table.Column<string>(nullable: true),
                    ProductVariantName = table.Column<string>(nullable: true),
                    ProductVariantDescription = table.Column<string>(nullable: true),
                    RefundOrderId = table.Column<int>(nullable: true),
                    RefundOrderLineId = table.Column<int>(nullable: true),
                    Price = table.Column<decimal>(nullable: false),
                    VatPercent = table.Column<decimal>(nullable: false),
                    Comments = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderLines", x => x.OrderLineId);
                    table.ForeignKey(
                        name: "FK_OrderLines_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "OrderId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrderLines_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "ProductId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OrderLines_ProductVariants_ProductVariantId",
                        column: x => x.ProductVariantId,
                        principalTable: "ProductVariants",
                        principalColumn: "ProductVariantId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OrderLines_Orders_RefundOrderId",
                        column: x => x.RefundOrderId,
                        principalTable: "Orders",
                        principalColumn: "OrderId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OrderLines_OrderLines_RefundOrderLineId",
                        column: x => x.RefundOrderLineId,
                        principalTable: "OrderLines",
                        principalColumn: "OrderLineId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Certificates_IssuingOrganizationId",
                table: "Certificates",
                column: "IssuingOrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_Certificates_IssuingUserId",
                table: "Certificates",
                column: "IssuingUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Certificates_RecipientUserId",
                table: "Certificates",
                column: "RecipientUserId");

            migrationBuilder.CreateIndex(
                name: "IX_EventInfos_OrganizationId",
                table: "EventInfos",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_EventInfos_OrganizerUserId",
                table: "EventInfos",
                column: "OrganizerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_MessageLogs_EventInfoId",
                table: "MessageLogs",
                column: "EventInfoId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderLines_OrderId",
                table: "OrderLines",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderLines_ProductId",
                table: "OrderLines",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderLines_ProductVariantId",
                table: "OrderLines",
                column: "ProductVariantId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderLines_RefundOrderId",
                table: "OrderLines",
                column: "RefundOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderLines_RefundOrderLineId",
                table: "OrderLines",
                column: "RefundOrderLineId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_RegistrationId",
                table: "Orders",
                column: "RegistrationId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_UserId",
                table: "Orders",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_EventInfoId",
                table: "Products",
                column: "EventInfoId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariants_ProductId",
                table: "ProductVariants",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Registrations_CertificateId",
                table: "Registrations",
                column: "CertificateId");

            migrationBuilder.CreateIndex(
                name: "IX_Registrations_EventInfoId",
                table: "Registrations",
                column: "EventInfoId");

            migrationBuilder.CreateIndex(
                name: "IX_Registrations_UserId",
                table: "Registrations",
                column: "UserId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "MessageLogs");

            migrationBuilder.DropTable(
                name: "OrderLines");

            migrationBuilder.DropTable(
                name: "PaymentMethods");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "Orders");

            migrationBuilder.DropTable(
                name: "ProductVariants");

            migrationBuilder.DropTable(
                name: "Registrations");

            migrationBuilder.DropTable(
                name: "Products");

            migrationBuilder.DropTable(
                name: "Certificates");

            migrationBuilder.DropTable(
                name: "EventInfos");

            migrationBuilder.DropTable(
                name: "Organizations");

            migrationBuilder.DropTable(
                name: "AspNetUsers");
        }
    }
}
