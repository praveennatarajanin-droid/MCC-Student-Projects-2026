using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MccPortfolio.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddRegNumberAndProfilePic : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProfilePictureUrl",
                table: "StudentProfiles",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "RegistrationNumber",
                table: "StudentProfiles",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "StudentProfiles",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                columns: new[] { "ProfilePictureUrl", "RegistrationNumber" },
                values: new object[] { "", "" });

            migrationBuilder.UpdateData(
                table: "StudentProfiles",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-555555555555"),
                columns: new[] { "ProfilePictureUrl", "RegistrationNumber" },
                values: new object[] { "", "" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProfilePictureUrl",
                table: "StudentProfiles");

            migrationBuilder.DropColumn(
                name: "RegistrationNumber",
                table: "StudentProfiles");
        }
    }
}
