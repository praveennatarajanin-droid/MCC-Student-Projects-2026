using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MccPortfolio.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCertificationStatusAndId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CredentialId",
                table: "Certifications",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Certifications",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Certifications",
                keyColumn: "Id",
                keyValue: new Guid("55555555-1111-1111-1111-111111111111"),
                columns: new[] { "CredentialId", "Status" },
                values: new object[] { "AWS-SAA-1092837", "verified" });

            migrationBuilder.UpdateData(
                table: "Certifications",
                keyColumn: "Id",
                keyValue: new Guid("55555555-1111-1111-1111-222222222222"),
                columns: new[] { "CredentialId", "Status" },
                values: new object[] { "AZ-204-890217", "verified" });

            migrationBuilder.UpdateData(
                table: "StudentProfiles",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "Theme",
                value: "Apple-Minimal");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CredentialId",
                table: "Certifications");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Certifications");

            migrationBuilder.UpdateData(
                table: "StudentProfiles",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "Theme",
                value: "Academic");
        }
    }
}
