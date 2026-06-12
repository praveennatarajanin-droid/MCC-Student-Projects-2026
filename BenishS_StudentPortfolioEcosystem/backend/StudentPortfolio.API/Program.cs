using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using StudentPortfolio.API.Data;
using StudentPortfolio.API.Models;

var builder = WebApplication.CreateBuilder(args);

// Add Services to Container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Allow camelCase from frontend to map to PascalCase C# properties
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

// Allow large request bodies for base64 file uploads (photos, PDFs, banners)
builder.Services.Configure<Microsoft.AspNetCore.Server.Kestrel.Core.KestrelServerOptions>(options =>
{
    options.Limits.MaxRequestBodySize = 52_428_800; // 50 MB
});
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 52_428_800; // 50 MB
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Configure PostgreSQL DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var keyString = jwtSettings["Key"] ?? "madrasChristianCollegeSuperSecretKeyForJWTAuthTokenGenerations";
var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "MCCPortfolioAPI",
        ValidAudience = jwtSettings["Audience"] ?? "MCCPortfolioApp",
        IssuerSigningKey = key,
        ClockSkew = TimeSpan.Zero
    };
});

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Seed Database
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    // Ensure database is created
    context.Database.EnsureCreated();

    // Ensure all new tables exist (EnsureCreated won't update schema for existing DBs)
    EnsureMissingTables(context);

    SeedDatabase(context);
}

app.Run();

// Ensure missing tables exist (handles schema drift when EnsureCreated was already run)
void EnsureMissingTables(AppDbContext context)
{
    var conn = context.Database.GetDbConnection();
    conn.Open();
    try
    {
        using var cmd = conn.CreateCommand();

        // CreativeWorks table
        cmd.CommandText = @"
            CREATE TABLE IF NOT EXISTS ""CreativeWorks"" (
                ""Id"" SERIAL PRIMARY KEY,
                ""ProfileId"" INTEGER NOT NULL REFERENCES ""StudentProfiles""(""Id"") ON DELETE CASCADE,
                ""Title"" TEXT NOT NULL DEFAULT '',
                ""Description"" TEXT NOT NULL DEFAULT '',
                ""ImageUrl"" TEXT NOT NULL DEFAULT '',
                ""ProjectUrl"" TEXT NOT NULL DEFAULT '',
                ""Date"" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
            );";
        cmd.ExecuteNonQuery();

        // Notifications table
        cmd.CommandText = @"
            CREATE TABLE IF NOT EXISTS ""Notifications"" (
                ""Id"" SERIAL PRIMARY KEY,
                ""Title"" TEXT NOT NULL DEFAULT '',
                ""Message"" TEXT NOT NULL DEFAULT '',
                ""CreatedAt"" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
                ""IsActive"" BOOLEAN NOT NULL DEFAULT TRUE
            );";
        cmd.ExecuteNonQuery();

        // Institutions table
        cmd.CommandText = @"
            CREATE TABLE IF NOT EXISTS ""Institutions"" (
                ""Id"" SERIAL PRIMARY KEY,
                ""Name"" TEXT NOT NULL DEFAULT '',
                ""ShortName"" TEXT NOT NULL DEFAULT '',
                ""LogoUrl"" TEXT NOT NULL DEFAULT '',
                ""BannerUrl"" TEXT NOT NULL DEFAULT '',
                ""Address"" TEXT NOT NULL DEFAULT '',
                ""ContactEmail"" TEXT NOT NULL DEFAULT '',
                ""WebsiteUrl"" TEXT NOT NULL DEFAULT ''
            );";
        cmd.ExecuteNonQuery();

        // ThemeConfigs table
        cmd.CommandText = @"
            CREATE TABLE IF NOT EXISTS ""ThemeConfigs"" (
                ""Id"" SERIAL PRIMARY KEY,
                ""Name"" TEXT NOT NULL DEFAULT '',
                ""PrimaryColor"" TEXT NOT NULL DEFAULT '',
                ""IsEnabled"" BOOLEAN NOT NULL DEFAULT TRUE
            );";
        cmd.ExecuteNonQuery();
    }
    finally
    {
        conn.Close();
    }
}

// Data Seeding Helper
void SeedDatabase(AppDbContext context)
{
    // Helper function for SHA256 hashing
    string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }

    if (!context.Users.Any())
    {
        // Seed Admin
        var admin = new User
        {
            Username = "admin",
            Email = "admin@mcc.edu",
            Role = "Admin",
            PasswordHash = HashPassword("admin123")
        };
        context.Users.Add(admin);

        // Seed Student 1 (Franklin Raj)
        var student1 = new User
        {
            Username = "franklinraj",
            Email = "franklin@mcc.edu",
            Role = "Student",
            PasswordHash = HashPassword("student123")
        };
        context.Users.Add(student1);

        // Seed Student 2 (Benish Samuel)
        var student2 = new User
        {
            Username = "benish",
            Email = "benish@mcc.edu",
            Role = "Student",
            PasswordHash = HashPassword("student123")
        };
        context.Users.Add(student2);

        context.SaveChanges(); // Save to generate User IDs

        // Seed Student 1 Profile
        var profile1 = new StudentProfile
        {
            UserId = student1.Id,
            FullName = "Franklin Raj",
            Department = "Computer Science",
            Bio = "Passionate full-stack developer with keen interest in cloud architecture, distributed systems, and modern web application development. Active member of the MCC Tech Club.",
            SOP = "My Statement of Purpose is to seek admission into a premium master's program in Computer Science to specialize in Distributed Cloud Architectures and high-throughput backend systems.",
            Theme = "AI Futuristic",
            AvatarUrl = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80",
            BannerUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
            GithubUrl = "https://github.com/franklinraj",
            BehanceUrl = "",
            Approved = true,
            Projects = new List<Project>
            {
                new Project
                {
                    Title = "MCC Campus Navigator",
                    Description = "An interactive, web-based 3D navigation assistant for students and visitors of Madras Christian College. Built with React, Three.js, and an ASP.NET Core backend to manage paths.",
                    TechStack = "React, Three.js, Tailwind CSS, ASP.NET Core, SQLite",
                    GithubUrl = "https://github.com/franklinraj/campus-navigator",
                    DemoUrl = "https://navigator.mcc.edu"
                },
                new Project
                {
                    Title = "EcoRoute Logistics Optimizer",
                    Description = "A smart routing system that optimizes delivery schedules and paths using generic algorithms, lowering fuel emissions for commercial logistics.",
                    TechStack = "Next.js, Python, Flask, Google Maps API",
                    GithubUrl = "https://github.com/franklinraj/ecoroute-optimizer",
                    DemoUrl = ""
                }
            },
            Certifications = new List<Certification>
            {
                new Certification
                {
                    Name = "AWS Certified Developer - Associate",
                    Issuer = "Amazon Web Services (AWS)",
                    IssueDate = DateTime.Now.AddMonths(-6),
                    CredentialUrl = "https://aws.amazon.com/verification"
                },
                new Certification
                {
                    Name = "Microsoft Certified: Azure Fundamentals",
                    Issuer = "Microsoft",
                    IssueDate = DateTime.Now.AddMonths(-12),
                    CredentialUrl = "https://learn.microsoft.com/verification"
                }
            },
            ResearchPapers = new List<ResearchPaper>
            {
                new ResearchPaper
                {
                    Title = "Optimizing Core Web Vitals in Decoupled Next.js Architectures",
                    JournalName = "International Journal of Software Engineering",
                    PublishDate = DateTime.Now.AddMonths(-3),
                    Abstract = "This paper presents methodologies to optimize bundle sizes, caching, and server-side rendering execution speeds for Next.js applications deployed on global edge networks, improving performance metrics by 35%.",
                    PaperUrl = "https://ijse.org/papers/nextjs-performance"
                }
            },
            Achievements = new List<Achievement>
            {
                new Achievement
                {
                    Title = "First Place at MCC Annual Hackathon",
                    Description = "Won 1st prize among 50 teams for developing an automated class attendance system using facial recognition and encrypted QR scans.",
                    Date = DateTime.Now.AddMonths(-2)
                }
            },
            Hackathons = new List<Hackathon>
            {
                new Hackathon
                {
                    EventName = "Smart India Hackathon 2025",
                    ProjectName = "AgriScan - Crop Disease Scanner",
                    PrizeWon = "Finalist / Top 10",
                    Date = DateTime.Now.AddMonths(-5)
                }
            },
            CommunityServices = new List<CommunityService>
            {
                new CommunityService
                {
                    Organization = "MCC National Service Scheme (NSS)",
                    Role = "Technical Coordinator & Volunteer",
                    Description = "Conducted free weekend digital literacy seminars for children in local municipal schools, teaching basic Scratch coding, internet safety, and hardware configuration.",
                    Date = DateTime.Now.AddMonths(-8)
                }
            }
        };
        context.StudentProfiles.Add(profile1);

        // Seed Student 2 Profile
        var profile2 = new StudentProfile
        {
            UserId = student2.Id,
            FullName = "Benish Samuel",
            Department = "Computer Science",
            Bio = "UI/UX enthusiast and frontend developer interested in creating gorgeous, accessible, and interactive web platforms. Experimenting with Framer Motion and WebGL.",
            SOP = "To specialize in Human-Computer Interaction (HCI) and build assistive user interfaces that make software accessible to users with physical disabilities.",
            Theme = "Creative",
            AvatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
            BannerUrl = "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80",
            GithubUrl = "https://github.com/benish",
            BehanceUrl = "https://behance.net/benish",
            Approved = false, // Pending Approval for demo
            Projects = new List<Project>
            {
                new Project
                {
                    Title = "Student Portfolio Portal",
                    Description = "Designed and developed the frontend interfaces for the student portfolio ecosystem, implementing glassmorphism, responsive styles, and quick template changes.",
                    TechStack = "Next.js, Tailwind CSS, Framer Motion, TypeScript",
                    GithubUrl = "https://github.com/benish/portfolio-ecosystem",
                    DemoUrl = ""
                }
            },
            Certifications = new List<Certification>
            {
                new Certification
                {
                    Name = "Google UX Design Professional Certificate",
                    Issuer = "Coursera / Google",
                    IssueDate = DateTime.Now.AddMonths(-4),
                    CredentialUrl = "https://coursera.org/verify/google-ux"
                }
            },
            CreativeWorks = new List<CreativeWork>
            {
                new CreativeWork
                {
                    Title = "Glassmorphism UI Design System",
                    Description = "A premium component package showcasing frosted-glass panels, sidebars, interactive metric cards, and border glow styling custom-tailored for university applications.",
                    ImageUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=450&q=80",
                    ProjectUrl = "https://behance.net/gallery/glass-ui-system",
                    Date = DateTime.Now.AddMonths(-1)
                }
            }
        };
        context.StudentProfiles.Add(profile2);

        context.SaveChanges();
    }

    // Seed Institution Branding
    if (!context.Institutions.Any())
    {
        context.Institutions.Add(new Institution
        {
            Name = "Madras Christian College (Autonomous)",
            ShortName = "MCC",
            LogoUrl = "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=150&h=150&q=80", // Premium academic cap
            BannerUrl = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80", // Dynamic campus building
            Address = "Tambaram, Chennai, Tamil Nadu 600059",
            ContactEmail = "principal@mcc.edu",
            WebsiteUrl = "https://mcc.edu"
        });
    }

    // Seed Campus Announcements
    if (!context.Notifications.Any())
    {
        context.Notifications.AddRange(new List<Notification>
        {
            new Notification
            {
                Title = "NAAC Accreditation Portfolio Audit",
                Message = "Attention all MCC Students: Please update your certifications, research manuscripts, and community service coordinates by Friday for automated NAAC documentation export.",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            },
            new Notification
            {
                Title = "Smart India Hackathon 2026 Pitch Auditions",
                Message = "Registrations are now open. Log your SIH competition projects in the Hackathons module of your dashboard to request faculty reviews.",
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                IsActive = true
            },
            new Notification
            {
                Title = "AI SOP Generator Upgraded",
                Message = "The simulated LLM generator has been loaded with MCC-specific academic and placement history datasets for improved resume guidance accuracy.",
                CreatedAt = DateTime.UtcNow.AddDays(-4),
                IsActive = true
            }
        });
    }

    // Seed Theme Settings
    if (!context.ThemeConfigs.Any())
    {
        context.ThemeConfigs.AddRange(new List<ThemeConfig>
        {
            new ThemeConfig { Name = "Academic", PrimaryColor = "#800020", IsEnabled = true },
            new ThemeConfig { Name = "Corporate", PrimaryColor = "#1e40af", IsEnabled = true },
            new ThemeConfig { Name = "Startup", PrimaryColor = "#10b981", IsEnabled = true },
            new ThemeConfig { Name = "Creative", PrimaryColor = "#d946ef", IsEnabled = true },
            new ThemeConfig { Name = "AI Futuristic", PrimaryColor = "#06b6d4", IsEnabled = true }
        });
    }

    context.SaveChanges();
}
