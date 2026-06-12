using Microsoft.EntityFrameworkCore;
using MccPortfolio.Api.Entities;
using MccPortfolio.Api.Utils;
using System;

namespace MccPortfolio.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Institution> Institutions { get; set; } = null!;
        public DbSet<Department> Departments { get; set; } = null!;
        public DbSet<StudentProfile> StudentProfiles { get; set; } = null!;
        public DbSet<Certification> Certifications { get; set; } = null!;
        public DbSet<ResearchPaper> ResearchPapers { get; set; } = null!;
        public DbSet<Project> Projects { get; set; } = null!;
        public DbSet<Achievement> Achievements { get; set; } = null!;
        public DbSet<Hackathon> Hackathons { get; set; } = null!;
        public DbSet<CommunityService> CommunityServices { get; set; } = null!;
        public DbSet<CreativeWork> CreativeWorks { get; set; } = null!;
        public DbSet<PortfolioApproval> PortfolioApprovals { get; set; } = null!;
        public DbSet<Notification> Notifications { get; set; } = null!;
        public DbSet<AISuggestion> AISuggestions { get; set; } = null!;
        public DbSet<Announcement> Announcements { get; set; } = null!;
        public DbSet<Grievance> Grievances { get; set; } = null!;
        public DbSet<AlumniRecord> AlumniRecords { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure cascade deletes or restrict deletes where needed
            modelBuilder.Entity<User>()
                .HasOne(u => u.StudentProfile)
                .WithOne(p => p.User)
                .HasForeignKey<StudentProfile>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<StudentProfile>()
                .HasMany(p => p.Certifications)
                .WithOne(c => c.StudentProfile)
                .HasForeignKey(c => c.StudentProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<StudentProfile>()
                .HasMany(p => p.ResearchPapers)
                .WithOne(r => r.StudentProfile)
                .HasForeignKey(r => r.StudentProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<StudentProfile>()
                .HasMany(p => p.Projects)
                .WithOne(pr => pr.StudentProfile)
                .HasForeignKey(pr => pr.StudentProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<StudentProfile>()
                .HasMany(p => p.Achievements)
                .WithOne(a => a.StudentProfile)
                .HasForeignKey(a => a.StudentProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<StudentProfile>()
                .HasMany(p => p.Hackathons)
                .WithOne(h => h.StudentProfile)
                .HasForeignKey(h => h.StudentProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<StudentProfile>()
                .HasMany(p => p.CommunityServices)
                .WithOne(c => c.StudentProfile)
                .HasForeignKey(c => c.StudentProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<StudentProfile>()
                .HasMany(p => p.CreativeWorks)
                .WithOne(c => c.StudentProfile)
                .HasForeignKey(c => c.StudentProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<StudentProfile>()
                .HasMany(p => p.Approvals)
                .WithOne(a => a.StudentProfile)
                .HasForeignKey(a => a.StudentProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<StudentProfile>()
                .HasMany(p => p.AISuggestions)
                .WithOne(a => a.StudentProfile)
                .HasForeignKey(a => a.StudentProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Grievance>()
                .HasOne(g => g.StudentProfile)
                .WithMany()
                .HasForeignKey(g => g.StudentProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Announcement>()
                .HasOne(a => a.CreatedBy)
                .WithMany()
                .HasForeignKey(a => a.CreatedByUserId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<AlumniRecord>()
                .HasOne(a => a.User)
                .WithMany()
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Seed Initial Data
            var mccId = Guid.Parse("11111111-1111-1111-1111-111111111111");
            modelBuilder.Entity<Institution>().HasData(new Institution
            {
                Id = mccId,
                Name = "Madras Christian College",
                Code = "MCC",
                Address = "Tambaram East, Chennai, Tamil Nadu 600059",
                ContactEmail = "info@mcc.edu.in"
            });

            var csDeptId = Guid.Parse("22222222-2222-2222-2222-222222222222");
            var commerceDeptId = Guid.Parse("22222222-2222-2222-2222-333333333333");
            var chemistryDeptId = Guid.Parse("22222222-2222-2222-2222-444444444444");

            modelBuilder.Entity<Department>().HasData(
                new Department { Id = csDeptId, Name = "Computer Science", Code = "CS", InstitutionId = mccId },
                new Department { Id = commerceDeptId, Name = "Commerce", Code = "COM", InstitutionId = mccId },
                new Department { Id = chemistryDeptId, Name = "Chemistry", Code = "CHEM", InstitutionId = mccId },
                new Department { Id = Guid.Parse("22222222-2222-2222-2222-555555555555"), Name = "History", Code = "HIST", InstitutionId = mccId },
                new Department { Id = Guid.Parse("22222222-2222-2222-2222-666666666666"), Name = "Political Science", Code = "POL", InstitutionId = mccId },
                new Department { Id = Guid.Parse("22222222-2222-2222-2222-777777777777"), Name = "Economics", Code = "ECO", InstitutionId = mccId },
                new Department { Id = Guid.Parse("22222222-2222-2222-2222-888888888888"), Name = "Philosophy", Code = "PHIL", InstitutionId = mccId },
                new Department { Id = Guid.Parse("22222222-2222-2222-2222-999999999999"), Name = "Tamil", Code = "TAM", InstitutionId = mccId },
                new Department { Id = Guid.Parse("22222222-2222-2222-2222-aaaaaaaaaaaa"), Name = "English", Code = "ENG", InstitutionId = mccId },
                new Department { Id = Guid.Parse("22222222-2222-2222-2222-bbbbbbbbbbbb"), Name = "Mathematics", Code = "MATH", InstitutionId = mccId },
                new Department { Id = Guid.Parse("22222222-2222-2222-2222-cccccccccccc"), Name = "Statistics", Code = "STAT", InstitutionId = mccId },
                new Department { Id = Guid.Parse("22222222-2222-2222-2222-dddddddddddd"), Name = "Physics", Code = "PHYS", InstitutionId = mccId },
                new Department { Id = Guid.Parse("22222222-2222-2222-2222-eeeeeeeeeeee"), Name = "Plant Biology and Plant Biotechnology", Code = "PB", InstitutionId = mccId },
                new Department { Id = Guid.Parse("22222222-2222-2222-2222-ffffffffffff"), Name = "Zoology", Code = "ZOO", InstitutionId = mccId },
                new Department { Id = Guid.Parse("22222222-2222-2222-3333-111111111111"), Name = "Social Work", Code = "SW", InstitutionId = mccId },
                new Department { Id = Guid.Parse("22222222-2222-2222-3333-222222222222"), Name = "Journalism", Code = "JOUR", InstitutionId = mccId },
                new Department { Id = Guid.Parse("22222222-2222-2222-3333-333333333333"), Name = "Business Administration", Code = "BBA", InstitutionId = mccId },
                new Department { Id = Guid.Parse("22222222-2222-2222-3333-444444444444"), Name = "Computer Applications", Code = "CA", InstitutionId = mccId },
                new Department { Id = Guid.Parse("22222222-2222-2222-3333-555555555555"), Name = "Microbiology", Code = "MICRO", InstitutionId = mccId },
                new Department { Id = Guid.Parse("22222222-2222-2222-3333-666666666666"), Name = "Visual Communication", Code = "VISCOM", InstitutionId = mccId },
                new Department { Id = Guid.Parse("22222222-2222-2222-3333-777777777777"), Name = "Physical Education", Code = "PE", InstitutionId = mccId },
                new Department { Id = Guid.Parse("22222222-2222-2222-3333-888888888888"), Name = "Psychology", Code = "PSY", InstitutionId = mccId },
                new Department { Id = Guid.Parse("22222222-2222-2222-3333-999999999999"), Name = "Geography, Tourism and Travel Management", Code = "GEO", InstitutionId = mccId },
                new Department { Id = Guid.Parse("22222222-2222-2222-3333-aaaaaaaaaaaa"), Name = "Data Science", Code = "DS", InstitutionId = mccId },
                new Department { Id = Guid.Parse("22222222-2222-2222-3333-bbbbbbbbbbbb"), Name = "Public Administration", Code = "PA", InstitutionId = mccId },
                new Department { Id = Guid.Parse("22222222-2222-2222-3333-cccccccccccc"), Name = "Tourism Studies", Code = "TS", InstitutionId = mccId }
            );

            // Hashed Passwords
            var adminPasswordHash = PasswordHasher.HashPassword("admin");
            var studentPasswordHash = PasswordHasher.HashPassword("student");

            var adminUserId = Guid.Parse("33333333-3333-3333-3333-333333333333");
            var studentUserId = Guid.Parse("33333333-3333-3333-3333-444444444444");
            var franklinUserId = Guid.Parse("33333333-3333-3333-3333-555555555555");

            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = adminUserId,
                    Name = "Super Admin",
                    Email = "admin@mcc.edu",
                    PasswordHash = adminPasswordHash,
                    Role = "SuperAdmin",
                    CreatedAt = new DateTime(2026, 5, 29, 0, 0, 0, DateTimeKind.Utc)
                },
                new User
                {
                    Id = studentUserId,
                    Name = "Default Student",
                    Email = "student@mcc.edu",
                    PasswordHash = studentPasswordHash,
                    Role = "Student",
                    CreatedAt = new DateTime(2026, 5, 29, 0, 0, 0, DateTimeKind.Utc)
                },
                new User
                {
                    Id = franklinUserId,
                    Name = "Franklin Raj",
                    Email = "franklinraj@mcc.edu",
                    PasswordHash = studentPasswordHash,
                    Role = "Student",
                    CreatedAt = new DateTime(2026, 5, 29, 0, 0, 0, DateTimeKind.Utc)
                }
            );

            var studentProfileId = Guid.Parse("44444444-4444-4444-4444-444444444444");
            var franklinProfileId = Guid.Parse("44444444-4444-4444-4444-555555555555");

            modelBuilder.Entity<StudentProfile>().HasData(
                new StudentProfile
                {
                    Id = studentProfileId,
                    UserId = studentUserId,
                    DepartmentId = csDeptId,
                    Bio = "Aspiring Software Engineer studying Computer Science at MCC.",
                    Headline = "Computer Science Student | Web Enthusiast",
                    Skills = "React;Next.js;C#;.NET;SQL",
                    Theme = "Apple-Minimal",
                    IsApproved = true,
                    UsernameSlug = "student",
                    GitHubUrl = "https://github.com",
                    LinkedInUrl = "https://linkedin.com",
                    PersonalStory = "My journey began with basic HTML and has grown into building modern web services.",
                    StatementOfPurpose = "To research and build scalable architectures that solve community problems.",
                    AcademicRecordsJson = "[{\"degree\":\"B.Sc. Computer Science\",\"institution\":\"Madras Christian College\",\"cgpa\":\"8.5\",\"year\":\"2026\"}]"
                },
                new StudentProfile
                {
                    Id = franklinProfileId,
                    UserId = franklinUserId,
                    DepartmentId = csDeptId,
                    Bio = "Passionate tech innovator, Full-Stack Developer, and undergraduate researcher at Madras Christian College. Building solutions at the intersection of AI, Web Technologies, and Social Good.",
                    Headline = "Undergraduate Researcher & Full-Stack Engineer | President, MCC Computer Club",
                    Skills = "Next.js;React;ASP.NET Core;PostgreSQL;Tailwind CSS;Framer Motion;Python;TypeScript;Docker",
                    Theme = "AI-Futuristic",
                    IsApproved = true,
                    UsernameSlug = "franklinraj",
                    GitHubUrl = "https://github.com/franklinraj",
                    LinkedInUrl = "https://linkedin.com/in/franklinraj",
                    BehanceUrl = "https://behance.net/franklinraj",
                    PersonalStory = "Ever since I compiled my first 'Hello World' on the historic MCC campus, I've been fascinated by how software can impact society. Over the last three years, I have worked with local NGOs, organized hackathons, and published research papers on deep learning models.",
                    StatementOfPurpose = "To pursue advanced studies in Artificial Intelligence and build robust web tools that democratize access to education and resource management for public institutions.",
                    AcademicRecordsJson = "[{\"degree\":\"B.Sc. Computer Science\",\"institution\":\"Madras Christian College\",\"cgpa\":\"9.2\",\"year\":\"2026\"}]"
                }
            );

            // Seed Franklin Raj's profile details
            modelBuilder.Entity<Certification>().HasData(
                new Certification
                {
                    Id = Guid.Parse("55555555-1111-1111-1111-111111111111"),
                    StudentProfileId = franklinProfileId,
                    Name = "AWS Certified Solutions Architect – Associate",
                    Issuer = "Amazon Web Services",
                    IssueDate = new DateTime(2025, 08, 15, 0, 0, 0, DateTimeKind.Utc),
                    CredentialUrl = "https://aws.amazon.com",
                    CredentialId = "AWS-SAA-1092837",
                    Status = "verified"
                },
                new Certification
                {
                    Id = Guid.Parse("55555555-1111-1111-1111-222222222222"),
                    StudentProfileId = franklinProfileId,
                    Name = "Microsoft Certified: Azure Developer Associate",
                    Issuer = "Microsoft",
                    IssueDate = new DateTime(2025, 11, 20, 0, 0, 0, DateTimeKind.Utc),
                    CredentialUrl = "https://microsoft.com",
                    CredentialId = "AZ-204-890217",
                    Status = "verified"
                }
            );

            modelBuilder.Entity<ResearchPaper>().HasData(
                new ResearchPaper
                {
                    Id = Guid.Parse("55555555-2222-2222-2222-111111111111"),
                    StudentProfileId = franklinProfileId,
                    Title = "Leveraging Deep Neural Networks for Plant Disease Detection in South Indian Crops",
                    Abstract = "This paper presents a convolutional neural network (CNN) model optimized for low-compute mobile devices to identify leaf-spot diseases in Tamil Nadu agricultural sectors with 96.4% validation accuracy.",
                    JournalOrConference = "IEEE International Conference on Agrotechnology & AI (ICAAI 2025)",
                    PublishDate = new DateTime(2025, 10, 05, 0, 0, 0, DateTimeKind.Utc),
                    PaperUrl = "https://ieee.org",
                    IsInnovationProject = true,
                    PrototypeStatus = "Prototype",
                    StartupIdeaPitch = "AgriScan AI: An app enabling farmers to snap pictures of crop leaves and receive instant organic remedies, bypassing middleman consulting fees."
                }
            );

            modelBuilder.Entity<Project>().HasData(
                new Project
                {
                    Id = Guid.Parse("55555555-3333-3333-3333-111111111111"),
                    StudentProfileId = franklinProfileId,
                    Title = "MCC Campus Navigator & Event Planner",
                    Description = "A real-time WebApp using Leaflet.js and ASP.NET Core that maps MCC's 365-acre scrub jungle campus and manages registrations for inter-collegiate cultural festivals.",
                    GitHubUrl = "https://github.com/franklinraj/mcc-navigator",
                    LiveDemoUrl = "https://mccnavigator.demo.in",
                    TechStack = "React;Tailwind CSS;.NET Web API;PostgreSQL;LeafletJS"
                },
                new Project
                {
                    Id = Guid.Parse("55555555-3333-3333-3333-222222222222"),
                    StudentProfileId = franklinProfileId,
                    Title = "MediSync - Decentralized Electronic Health Records",
                    Description = "A hackathon-winning application that secures patient medical files using decentralized storage, verified via public-key cryptography.",
                    GitHubUrl = "https://github.com/franklinraj/medisync",
                    LiveDemoUrl = "https://medisync.demo.in",
                    TechStack = "Next.js;Solidity;Ethers.js;Node.js;Express"
                }
            );

            modelBuilder.Entity<Achievement>().HasData(
                new Achievement
                {
                    Id = Guid.Parse("55555555-4444-4444-4444-111111111111"),
                    StudentProfileId = franklinProfileId,
                    Title = "1st Place - Chennai Inter-Collegiate Smart City Hackathon",
                    Description = "Won first place out of 80 teams for proposing and coding a smart traffic diversion grid using edge computing.",
                    Date = new DateTime(2025, 09, 12, 0, 0, 0, DateTimeKind.Utc),
                    Category = "Competition"
                },
                new Achievement
                {
                    Id = Guid.Parse("55555555-4444-4444-4444-222222222222"),
                    StudentProfileId = franklinProfileId,
                    Title = "Rank 152 in National Cyber Olympiad",
                    Description = "Achieved percentile rank of 99.8% in cybersecurity analytics assessment.",
                    Date = new DateTime(2024, 12, 05, 0, 0, 0, DateTimeKind.Utc),
                    Category = "Olympiad"
                }
            );

            modelBuilder.Entity<Hackathon>().HasData(
                new Hackathon
                {
                    Id = Guid.Parse("55555555-5555-5555-5555-111111111111"),
                    StudentProfileId = franklinProfileId,
                    Name = "DevHacks Chennai 2025",
                    ProjectName = "MediSync",
                    Description = "A 36-hour sprint creating decentralized medical record portals.",
                    AchievementPosition = "Winner",
                    Date = new DateTime(2025, 03, 14, 0, 0, 0, DateTimeKind.Utc)
                }
            );

            modelBuilder.Entity<CommunityService>().HasData(
                new CommunityService
                {
                    Id = Guid.Parse("55555555-6666-6666-6666-111111111111"),
                    StudentProfileId = franklinProfileId,
                    OrganizationName = "MCC National Service Scheme (NSS)",
                    Activity = "Digital Literacy Campaign",
                    HoursServed = 60,
                    Description = "Taught basic computer operations, internet safety, and banking security to over 150 school children and seniors in nearby villages.",
                    Date = new DateTime(2025, 05, 10, 0, 0, 0, DateTimeKind.Utc)
                }
            );

            modelBuilder.Entity<CreativeWork>().HasData(
                new CreativeWork
                {
                    Id = Guid.Parse("55555555-7777-7777-7777-111111111111"),
                    StudentProfileId = franklinProfileId,
                    Title = "MCC Scrub Jungle Photography Exhibition",
                    Description = "A visual exploration of MCC's unique biodiversity, showcasing flora and fauna captured over four seasons.",
                    MediaUrl = "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d",
                    BehanceUrl = "https://behance.net/gallery/scrub-jungle"
                }
            );
        }
    }
}
