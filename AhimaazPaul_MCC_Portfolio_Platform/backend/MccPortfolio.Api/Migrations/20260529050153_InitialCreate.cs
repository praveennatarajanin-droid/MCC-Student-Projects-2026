using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace MccPortfolio.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Institutions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Address = table.Column<string>(type: "text", nullable: false),
                    ContactEmail = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Institutions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Departments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    InstitutionId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Departments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Departments_Institutions_InstitutionId",
                        column: x => x.InstitutionId,
                        principalTable: "Institutions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    IsRead = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notifications_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StudentProfiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    DepartmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    Bio = table.Column<string>(type: "text", nullable: false),
                    Headline = table.Column<string>(type: "text", nullable: false),
                    Skills = table.Column<string>(type: "text", nullable: false),
                    Theme = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    CustomThemeConfig = table.Column<string>(type: "text", nullable: false),
                    IsApproved = table.Column<bool>(type: "boolean", nullable: false),
                    UsernameSlug = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    QRCodeUrl = table.Column<string>(type: "text", nullable: false),
                    GitHubUrl = table.Column<string>(type: "text", nullable: false),
                    BehanceUrl = table.Column<string>(type: "text", nullable: false),
                    LinkedInUrl = table.Column<string>(type: "text", nullable: false),
                    ResumeUrl = table.Column<string>(type: "text", nullable: false),
                    PersonalStory = table.Column<string>(type: "text", nullable: false),
                    StatementOfPurpose = table.Column<string>(type: "text", nullable: false),
                    AcademicRecordsJson = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StudentProfiles_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StudentProfiles_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Achievements",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StudentProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Achievements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Achievements_StudentProfiles_StudentProfileId",
                        column: x => x.StudentProfileId,
                        principalTable: "StudentProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AISuggestions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StudentProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PromptText = table.Column<string>(type: "text", nullable: false),
                    GeneratedText = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AISuggestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AISuggestions_StudentProfiles_StudentProfileId",
                        column: x => x.StudentProfileId,
                        principalTable: "StudentProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Certifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StudentProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Issuer = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IssueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CredentialUrl = table.Column<string>(type: "text", nullable: false),
                    FileUrl = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Certifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Certifications_StudentProfiles_StudentProfileId",
                        column: x => x.StudentProfileId,
                        principalTable: "StudentProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CommunityServices",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StudentProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrganizationName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Activity = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    HoursServed = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommunityServices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CommunityServices_StudentProfiles_StudentProfileId",
                        column: x => x.StudentProfileId,
                        principalTable: "StudentProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CreativeWorks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StudentProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    MediaUrl = table.Column<string>(type: "text", nullable: false),
                    BehanceUrl = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CreativeWorks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CreativeWorks_StudentProfiles_StudentProfileId",
                        column: x => x.StudentProfileId,
                        principalTable: "StudentProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Hackathons",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StudentProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    ProjectName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    AchievementPosition = table.Column<string>(type: "text", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Hackathons", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Hackathons_StudentProfiles_StudentProfileId",
                        column: x => x.StudentProfileId,
                        principalTable: "StudentProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PortfolioApprovals",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StudentProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Comments = table.Column<string>(type: "text", nullable: false),
                    ReviewedById = table.Column<Guid>(type: "uuid", nullable: true),
                    ReviewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PortfolioApprovals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PortfolioApprovals_StudentProfiles_StudentProfileId",
                        column: x => x.StudentProfileId,
                        principalTable: "StudentProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PortfolioApprovals_Users_ReviewedById",
                        column: x => x.ReviewedById,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Projects",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StudentProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    GitHubUrl = table.Column<string>(type: "text", nullable: false),
                    LiveDemoUrl = table.Column<string>(type: "text", nullable: false),
                    TechStack = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Projects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Projects_StudentProfiles_StudentProfileId",
                        column: x => x.StudentProfileId,
                        principalTable: "StudentProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ResearchPapers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StudentProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Abstract = table.Column<string>(type: "text", nullable: false),
                    JournalOrConference = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    PublishDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PaperUrl = table.Column<string>(type: "text", nullable: false),
                    IsInnovationProject = table.Column<bool>(type: "boolean", nullable: false),
                    PrototypeStatus = table.Column<string>(type: "text", nullable: false),
                    StartupIdeaPitch = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResearchPapers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ResearchPapers_StudentProfiles_StudentProfileId",
                        column: x => x.StudentProfileId,
                        principalTable: "StudentProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Institutions",
                columns: new[] { "Id", "Address", "Code", "ContactEmail", "Name" },
                values: new object[] { new Guid("11111111-1111-1111-1111-111111111111"), "Tambaram East, Chennai, Tamil Nadu 600059", "MCC", "info@mcc.edu.in", "Madras Christian College" });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "Name", "PasswordHash", "Role" },
                values: new object[,]
                {
                    { new Guid("33333333-3333-3333-3333-333333333333"), new DateTime(2026, 5, 29, 0, 0, 0, 0, DateTimeKind.Utc), "admin@mcc.edu", "Dr. Paul Wilson", "jGl25bVBBBW96Qi9Te4V37Fnqchz/Eu4qB9vKrRIqRg=", "SuperAdmin" },
                    { new Guid("33333333-3333-3333-3333-444444444444"), new DateTime(2026, 5, 29, 0, 0, 0, 0, DateTimeKind.Utc), "student@mcc.edu", "Default Student", "JkyMOBvxbJgqTlmw3UxveAjFGgX2TDXbQsx4oqcodbs=", "Student" },
                    { new Guid("33333333-3333-3333-3333-555555555555"), new DateTime(2026, 5, 29, 0, 0, 0, 0, DateTimeKind.Utc), "franklinraj@mcc.edu", "Franklin Raj", "JkyMOBvxbJgqTlmw3UxveAjFGgX2TDXbQsx4oqcodbs=", "Student" }
                });

            migrationBuilder.InsertData(
                table: "Departments",
                columns: new[] { "Id", "Code", "InstitutionId", "Name" },
                values: new object[,]
                {
                    { new Guid("22222222-2222-2222-2222-222222222222"), "CS", new Guid("11111111-1111-1111-1111-111111111111"), "Computer Science" },
                    { new Guid("22222222-2222-2222-2222-333333333333"), "COM", new Guid("11111111-1111-1111-1111-111111111111"), "Commerce" },
                    { new Guid("22222222-2222-2222-2222-444444444444"), "CHEM", new Guid("11111111-1111-1111-1111-111111111111"), "Chemistry" }
                });

            migrationBuilder.InsertData(
                table: "StudentProfiles",
                columns: new[] { "Id", "AcademicRecordsJson", "BehanceUrl", "Bio", "CustomThemeConfig", "DepartmentId", "GitHubUrl", "Headline", "IsApproved", "LinkedInUrl", "PersonalStory", "QRCodeUrl", "ResumeUrl", "Skills", "StatementOfPurpose", "Theme", "UserId", "UsernameSlug" },
                values: new object[,]
                {
                    { new Guid("44444444-4444-4444-4444-444444444444"), "[{\"degree\":\"B.Sc. Computer Science\",\"institution\":\"Madras Christian College\",\"cgpa\":\"8.5\",\"year\":\"2026\"}]", "", "Aspiring Software Engineer studying Computer Science at MCC.", "{}", new Guid("22222222-2222-2222-2222-222222222222"), "https://github.com", "Computer Science Student | Web Enthusiast", true, "https://linkedin.com", "My journey began with basic HTML and has grown into building modern web services.", "", "", "React;Next.js;C#;.NET;SQL", "To research and build scalable architectures that solve community problems.", "Academic", new Guid("33333333-3333-3333-3333-444444444444"), "student" },
                    { new Guid("44444444-4444-4444-4444-555555555555"), "[{\"degree\":\"B.Sc. Computer Science\",\"institution\":\"Madras Christian College\",\"cgpa\":\"9.2\",\"year\":\"2026\"}]", "https://behance.net/franklinraj", "Passionate tech innovator, Full-Stack Developer, and undergraduate researcher at Madras Christian College. Building solutions at the intersection of AI, Web Technologies, and Social Good.", "{}", new Guid("22222222-2222-2222-2222-222222222222"), "https://github.com/franklinraj", "Undergraduate Researcher & Full-Stack Engineer | President, MCC Computer Club", true, "https://linkedin.com/in/franklinraj", "Ever since I compiled my first 'Hello World' on the historic MCC campus, I've been fascinated by how software can impact society. Over the last three years, I have worked with local NGOs, organized hackathons, and published research papers on deep learning models.", "", "", "Next.js;React;ASP.NET Core;PostgreSQL;Tailwind CSS;Framer Motion;Python;TypeScript;Docker", "To pursue advanced studies in Artificial Intelligence and build robust web tools that democratize access to education and resource management for public institutions.", "AI-Futuristic", new Guid("33333333-3333-3333-3333-555555555555"), "franklinraj" }
                });

            migrationBuilder.InsertData(
                table: "Achievements",
                columns: new[] { "Id", "Category", "Date", "Description", "StudentProfileId", "Title" },
                values: new object[,]
                {
                    { new Guid("55555555-4444-4444-4444-111111111111"), "Competition", new DateTime(2025, 9, 12, 0, 0, 0, 0, DateTimeKind.Utc), "Won first place out of 80 teams for proposing and coding a smart traffic diversion grid using edge computing.", new Guid("44444444-4444-4444-4444-555555555555"), "1st Place - Chennai Inter-Collegiate Smart City Hackathon" },
                    { new Guid("55555555-4444-4444-4444-222222222222"), "Olympiad", new DateTime(2024, 12, 5, 0, 0, 0, 0, DateTimeKind.Utc), "Achieved percentile rank of 99.8% in cybersecurity analytics assessment.", new Guid("44444444-4444-4444-4444-555555555555"), "Rank 152 in National Cyber Olympiad" }
                });

            migrationBuilder.InsertData(
                table: "Certifications",
                columns: new[] { "Id", "CredentialUrl", "FileUrl", "IssueDate", "Issuer", "Name", "StudentProfileId" },
                values: new object[,]
                {
                    { new Guid("55555555-1111-1111-1111-111111111111"), "https://aws.amazon.com", "", new DateTime(2025, 8, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Amazon Web Services", "AWS Certified Solutions Architect – Associate", new Guid("44444444-4444-4444-4444-555555555555") },
                    { new Guid("55555555-1111-1111-1111-222222222222"), "https://microsoft.com", "", new DateTime(2025, 11, 20, 0, 0, 0, 0, DateTimeKind.Utc), "Microsoft", "Microsoft Certified: Azure Developer Associate", new Guid("44444444-4444-4444-4444-555555555555") }
                });

            migrationBuilder.InsertData(
                table: "CommunityServices",
                columns: new[] { "Id", "Activity", "Date", "Description", "HoursServed", "OrganizationName", "StudentProfileId" },
                values: new object[] { new Guid("55555555-6666-6666-6666-111111111111"), "Digital Literacy Campaign", new DateTime(2025, 5, 10, 0, 0, 0, 0, DateTimeKind.Utc), "Taught basic computer operations, internet safety, and banking security to over 150 school children and seniors in nearby villages.", 60, "MCC National Service Scheme (NSS)", new Guid("44444444-4444-4444-4444-555555555555") });

            migrationBuilder.InsertData(
                table: "CreativeWorks",
                columns: new[] { "Id", "BehanceUrl", "Description", "MediaUrl", "StudentProfileId", "Title" },
                values: new object[] { new Guid("55555555-7777-7777-7777-111111111111"), "https://behance.net/gallery/scrub-jungle", "A visual exploration of MCC's unique biodiversity, showcasing flora and fauna captured over four seasons.", "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d", new Guid("44444444-4444-4444-4444-555555555555"), "MCC Scrub Jungle Photography Exhibition" });

            migrationBuilder.InsertData(
                table: "Hackathons",
                columns: new[] { "Id", "AchievementPosition", "Date", "Description", "Name", "ProjectName", "StudentProfileId" },
                values: new object[] { new Guid("55555555-5555-5555-5555-111111111111"), "Winner", new DateTime(2025, 3, 14, 0, 0, 0, 0, DateTimeKind.Utc), "A 36-hour sprint creating decentralized medical record portals.", "DevHacks Chennai 2025", "MediSync", new Guid("44444444-4444-4444-4444-555555555555") });

            migrationBuilder.InsertData(
                table: "Projects",
                columns: new[] { "Id", "Description", "GitHubUrl", "LiveDemoUrl", "StudentProfileId", "TechStack", "Title" },
                values: new object[,]
                {
                    { new Guid("55555555-3333-3333-3333-111111111111"), "A real-time WebApp using Leaflet.js and ASP.NET Core that maps MCC's 365-acre scrub jungle campus and manages registrations for inter-collegiate cultural festivals.", "https://github.com/franklinraj/mcc-navigator", "https://mccnavigator.demo.in", new Guid("44444444-4444-4444-4444-555555555555"), "React;Tailwind CSS;.NET Web API;PostgreSQL;LeafletJS", "MCC Campus Navigator & Event Planner" },
                    { new Guid("55555555-3333-3333-3333-222222222222"), "A hackathon-winning application that secures patient medical files using decentralized storage, verified via public-key cryptography.", "https://github.com/franklinraj/medisync", "https://medisync.demo.in", new Guid("44444444-4444-4444-4444-555555555555"), "Next.js;Solidity;Ethers.js;Node.js;Express", "MediSync - Decentralized Electronic Health Records" }
                });

            migrationBuilder.InsertData(
                table: "ResearchPapers",
                columns: new[] { "Id", "Abstract", "IsInnovationProject", "JournalOrConference", "PaperUrl", "PrototypeStatus", "PublishDate", "StartupIdeaPitch", "StudentProfileId", "Title" },
                values: new object[] { new Guid("55555555-2222-2222-2222-111111111111"), "This paper presents a convolutional neural network (CNN) model optimized for low-compute mobile devices to identify leaf-spot diseases in Tamil Nadu agricultural sectors with 96.4% validation accuracy.", true, "IEEE International Conference on Agrotechnology & AI (ICAAI 2025)", "https://ieee.org", "Prototype", new DateTime(2025, 10, 5, 0, 0, 0, 0, DateTimeKind.Utc), "AgriScan AI: An app enabling farmers to snap pictures of crop leaves and receive instant organic remedies, bypassing middleman consulting fees.", new Guid("44444444-4444-4444-4444-555555555555"), "Leveraging Deep Neural Networks for Plant Disease Detection in South Indian Crops" });

            migrationBuilder.CreateIndex(
                name: "IX_Achievements_StudentProfileId",
                table: "Achievements",
                column: "StudentProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_AISuggestions_StudentProfileId",
                table: "AISuggestions",
                column: "StudentProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Certifications_StudentProfileId",
                table: "Certifications",
                column: "StudentProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_CommunityServices_StudentProfileId",
                table: "CommunityServices",
                column: "StudentProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_CreativeWorks_StudentProfileId",
                table: "CreativeWorks",
                column: "StudentProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_InstitutionId",
                table: "Departments",
                column: "InstitutionId");

            migrationBuilder.CreateIndex(
                name: "IX_Hackathons_StudentProfileId",
                table: "Hackathons",
                column: "StudentProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_PortfolioApprovals_ReviewedById",
                table: "PortfolioApprovals",
                column: "ReviewedById");

            migrationBuilder.CreateIndex(
                name: "IX_PortfolioApprovals_StudentProfileId",
                table: "PortfolioApprovals",
                column: "StudentProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_StudentProfileId",
                table: "Projects",
                column: "StudentProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_ResearchPapers_StudentProfileId",
                table: "ResearchPapers",
                column: "StudentProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentProfiles_DepartmentId",
                table: "StudentProfiles",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentProfiles_UserId",
                table: "StudentProfiles",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Achievements");

            migrationBuilder.DropTable(
                name: "AISuggestions");

            migrationBuilder.DropTable(
                name: "Certifications");

            migrationBuilder.DropTable(
                name: "CommunityServices");

            migrationBuilder.DropTable(
                name: "CreativeWorks");

            migrationBuilder.DropTable(
                name: "Hackathons");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "PortfolioApprovals");

            migrationBuilder.DropTable(
                name: "Projects");

            migrationBuilder.DropTable(
                name: "ResearchPapers");

            migrationBuilder.DropTable(
                name: "StudentProfiles");

            migrationBuilder.DropTable(
                name: "Departments");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Institutions");
        }
    }
}
