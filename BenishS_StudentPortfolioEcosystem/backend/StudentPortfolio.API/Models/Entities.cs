using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace StudentPortfolio.API.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        
        [JsonIgnore]
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "Student"; // "Student" or "Admin"
    }

    public class StudentProfile
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public string SOP { get; set; } = string.Empty;
        public string Theme { get; set; } = "Academic"; // Academic, Corporate, Startup, Creative, AI Futuristic
        public string Department { get; set; } = string.Empty;
        public string BannerUrl { get; set; } = string.Empty;
        public string AvatarUrl { get; set; } = string.Empty;
        public string GithubUrl { get; set; } = string.Empty;
        public string BehanceUrl { get; set; } = string.Empty;
        public bool Approved { get; set; } = false;

        public List<Project> Projects { get; set; } = new();
        public List<Certification> Certifications { get; set; } = new();
        public List<ResearchPaper> ResearchPapers { get; set; } = new();
        public List<Achievement> Achievements { get; set; } = new();
        public List<Hackathon> Hackathons { get; set; } = new();
        public List<CommunityService> CommunityServices { get; set; } = new();
        public List<CreativeWork> CreativeWorks { get; set; } = new();
    }

    public class Project
    {
        public int Id { get; set; }
        public int ProfileId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string TechStack { get; set; } = string.Empty; // Comma-separated (e.g. "React, .NET, PostgreSQL")
        public string GithubUrl { get; set; } = string.Empty;
        public string DemoUrl { get; set; } = string.Empty;
    }

    public class Certification
    {
        public int Id { get; set; }
        public int ProfileId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Issuer { get; set; } = string.Empty;
        public DateTime IssueDate { get; set; }
        public string CredentialUrl { get; set; } = string.Empty;
    }

    public class ResearchPaper
    {
        public int Id { get; set; }
        public int ProfileId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string JournalName { get; set; } = string.Empty;
        public DateTime PublishDate { get; set; }
        public string Abstract { get; set; } = string.Empty;
        public string PaperUrl { get; set; } = string.Empty;
    }

    public class Achievement
    {
        public int Id { get; set; }
        public int ProfileId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime Date { get; set; }
    }

    public class Hackathon
    {
        public int Id { get; set; }
        public int ProfileId { get; set; }
        public string EventName { get; set; } = string.Empty;
        public string ProjectName { get; set; } = string.Empty;
        public string PrizeWon { get; set; } = string.Empty; // E.g. "1st Place", "Runner Up", "Participant"
        public DateTime Date { get; set; }
    }

    public class CommunityService
    {
        public int Id { get; set; }
        public int ProfileId { get; set; }
        public string Organization { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime Date { get; set; }
    }

    public class CreativeWork
    {
        public int Id { get; set; }
        public int ProfileId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty; // Base64 data or link
        public string ProjectUrl { get; set; } = string.Empty;
        public DateTime Date { get; set; }
    }

    public class Notification
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;
    }

    public class Institution
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ShortName { get; set; } = string.Empty;
        public string LogoUrl { get; set; } = string.Empty;
        public string BannerUrl { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string ContactEmail { get; set; } = string.Empty;
        public string WebsiteUrl { get; set; } = string.Empty;
    }

    public class ThemeConfig
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string PrimaryColor { get; set; } = string.Empty;
        public bool IsEnabled { get; set; } = true;
    }
}
