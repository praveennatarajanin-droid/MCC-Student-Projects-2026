using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace MccPortfolio.Api.Entities
{
    public class User
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [JsonIgnore]
        public string PasswordHash { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = "Student"; // "SuperAdmin" or "Student"
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [JsonIgnore]
        public virtual StudentProfile? StudentProfile { get; set; }
        
        [JsonIgnore]
        public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
        
        [JsonIgnore]
        public virtual ICollection<PortfolioApproval> ReviewedApprovals { get; set; } = new List<PortfolioApproval>();
    }

    public class Institution
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;
        
        public string Address { get; set; } = string.Empty;
        
        public string ContactEmail { get; set; } = string.Empty;

        [JsonIgnore]
        public virtual ICollection<Department> Departments { get; set; } = new List<Department>();
    }

    public class Department
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(20)]
        public string Code { get; set; } = string.Empty;
        
        [Required]
        public Guid InstitutionId { get; set; }
        
        [ForeignKey("InstitutionId")]
        [JsonIgnore]
        public virtual Institution? Institution { get; set; }

        [JsonIgnore]
        public virtual ICollection<StudentProfile> StudentProfiles { get; set; } = new List<StudentProfile>();
    }

    public class StudentProfile
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [Required]
        public Guid UserId { get; set; }
        
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
        
        [Required]
        public Guid DepartmentId { get; set; }
        
        [ForeignKey("DepartmentId")]
        public virtual Department? Department { get; set; }
        
        public string Bio { get; set; } = string.Empty;
        public string Headline { get; set; } = string.Empty;
        
        // Stored as semi-colon separated values
        public string Skills { get; set; } = string.Empty;
        
        // Themes: "Academic", "Corporate", "Startup", "Creative", "AI-Futuristic"
        [Required]
        [MaxLength(30)]
        public string Theme { get; set; } = "Apple-Minimal";
        
        // JSON block for user customizable theme settings (colors, glass opacity, etc.)
        public string CustomThemeConfig { get; set; } = "{}";
        
        [Required]
        public bool IsApproved { get; set; } = false;
        
        // SEO friendly url slug, e.g. "franklinraj"
        [Required]
        [MaxLength(100)]
        public string UsernameSlug { get; set; } = string.Empty;
        
        public string QRCodeUrl { get; set; } = string.Empty;
        public string GitHubUrl { get; set; } = string.Empty;
        public string BehanceUrl { get; set; } = string.Empty;
        public string LinkedInUrl { get; set; } = string.Empty;
        public string ResumeUrl { get; set; } = string.Empty;

        [MaxLength(30)]
        public string RegistrationNumber { get; set; } = string.Empty;

        public string ProfilePictureUrl { get; set; } = string.Empty;

        // Custom story & SOP
        public string PersonalStory { get; set; } = string.Empty;
        public string StatementOfPurpose { get; set; } = string.Empty;
        public string AcademicRecordsJson { get; set; } = "[]"; // [{degree, institution, cgpa, year}]

        public virtual ICollection<Certification> Certifications { get; set; } = new List<Certification>();
        public virtual ICollection<ResearchPaper> ResearchPapers { get; set; } = new List<ResearchPaper>();
        public virtual ICollection<Project> Projects { get; set; } = new List<Project>();
        public virtual ICollection<Achievement> Achievements { get; set; } = new List<Achievement>();
        public virtual ICollection<Hackathon> Hackathons { get; set; } = new List<Hackathon>();
        public virtual ICollection<CommunityService> CommunityServices { get; set; } = new List<CommunityService>();
        public virtual ICollection<CreativeWork> CreativeWorks { get; set; } = new List<CreativeWork>();
        
        [JsonIgnore]
        public virtual ICollection<PortfolioApproval> Approvals { get; set; } = new List<PortfolioApproval>();
        
        [JsonIgnore]
        public virtual ICollection<AISuggestion> AISuggestions { get; set; } = new List<AISuggestion>();
    }

    public class Certification
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [Required]
        public Guid StudentProfileId { get; set; }
        
        [ForeignKey("StudentProfileId")]
        [JsonIgnore]
        public virtual StudentProfile? StudentProfile { get; set; }
        
        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string Issuer { get; set; } = string.Empty;
        
        public DateTime? IssueDate { get; set; }
        public string CredentialUrl { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;

        [MaxLength(50)]
        public string CredentialId { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "pending"; // "pending", "verified", "failed"
    }

    public class ResearchPaper
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [Required]
        public Guid StudentProfileId { get; set; }
        
        [ForeignKey("StudentProfileId")]
        [JsonIgnore]
        public virtual StudentProfile? StudentProfile { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        
        public string Abstract { get; set; } = string.Empty;
        
        [MaxLength(150)]
        public string JournalOrConference { get; set; } = string.Empty;
        
        public DateTime? PublishDate { get; set; }
        public string PaperUrl { get; set; } = string.Empty;
        
        // Innovation details
        public bool IsInnovationProject { get; set; } = false;
        public string PrototypeStatus { get; set; } = string.Empty; // "Idea", "Prototype", "Production"
        public string StartupIdeaPitch { get; set; } = string.Empty;
    }

    public class Project
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [Required]
        public Guid StudentProfileId { get; set; }
        
        [ForeignKey("StudentProfileId")]
        [JsonIgnore]
        public virtual StudentProfile? StudentProfile { get; set; }
        
        [Required]
        [MaxLength(150)]
        public string Title { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        public string GitHubUrl { get; set; } = string.Empty;
        public string LiveDemoUrl { get; set; } = string.Empty;
        
        // Semi-colon separated
        public string TechStack { get; set; } = string.Empty;
    }

    public class Achievement
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [Required]
        public Guid StudentProfileId { get; set; }
        
        [ForeignKey("StudentProfileId")]
        [JsonIgnore]
        public virtual StudentProfile? StudentProfile { get; set; }
        
        [Required]
        [MaxLength(150)]
        public string Title { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        public DateTime? Date { get; set; }
        
        [MaxLength(50)]
        public string Category { get; set; } = "Academic"; // "Academic", "Sports", "Competition", "Olympiad", "Other"
    }

    public class Hackathon
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [Required]
        public Guid StudentProfileId { get; set; }
        
        [ForeignKey("StudentProfileId")]
        [JsonIgnore]
        public virtual StudentProfile? StudentProfile { get; set; }
        
        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(150)]
        public string ProjectName { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        public string AchievementPosition { get; set; } = string.Empty; // "Winner", "Runner Up", "Participant", etc.
        public DateTime? Date { get; set; }
    }

    public class CommunityService
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [Required]
        public Guid StudentProfileId { get; set; }
        
        [ForeignKey("StudentProfileId")]
        [JsonIgnore]
        public virtual StudentProfile? StudentProfile { get; set; }
        
        [Required]
        [MaxLength(150)]
        public string OrganizationName { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(150)]
        public string Activity { get; set; } = string.Empty;
        
        public int HoursServed { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime? Date { get; set; }
    }

    public class CreativeWork
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [Required]
        public Guid StudentProfileId { get; set; }
        
        [ForeignKey("StudentProfileId")]
        [JsonIgnore]
        public virtual StudentProfile? StudentProfile { get; set; }
        
        [Required]
        [MaxLength(150)]
        public string Title { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        public string MediaUrl { get; set; } = string.Empty;
        public string BehanceUrl { get; set; } = string.Empty;
    }

    public class PortfolioApproval
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [Required]
        public Guid StudentProfileId { get; set; }
        
        [ForeignKey("StudentProfileId")]
        [JsonIgnore]
        public virtual StudentProfile? StudentProfile { get; set; }
        
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Pending"; // "Pending", "Approved", "Rejected"
        
        public string Comments { get; set; } = string.Empty;
        
        public Guid? ReviewedById { get; set; }
        
        [ForeignKey("ReviewedById")]
        [JsonIgnore]
        public virtual User? ReviewedBy { get; set; }
        
        public DateTime ReviewedAt { get; set; } = DateTime.UtcNow;
    }

    public class Notification
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [Required]
        public Guid UserId { get; set; }
        
        [ForeignKey("UserId")]
        [JsonIgnore]
        public virtual User? User { get; set; }
        
        [Required]
        [MaxLength(150)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string Message { get; set; } = string.Empty;
        
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class AISuggestion
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [Required]
        public Guid StudentProfileId { get; set; }
        
        [ForeignKey("StudentProfileId")]
        [JsonIgnore]
        public virtual StudentProfile? StudentProfile { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = "SOP"; // "SOP", "Resume", "Career", "General"
        
        [Required]
        public string PromptText { get; set; } = string.Empty;
        
        [Required]
        public string GeneratedText { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    // ─── Student Affairs ────────────────────────────────────────────────────────

    public class Announcement
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Body { get; set; } = string.Empty;

        /// <summary>"Event" | "Notice" | "Welfare"</summary>
        [Required]
        [MaxLength(30)]
        public string Category { get; set; } = "Notice";

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Guid? CreatedByUserId { get; set; }

        [ForeignKey("CreatedByUserId")]
        [JsonIgnore]
        public virtual User? CreatedBy { get; set; }
    }

    public class Grievance
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid StudentProfileId { get; set; }

        [ForeignKey("StudentProfileId")]
        [JsonIgnore]
        public virtual StudentProfile? StudentProfile { get; set; }

        [Required]
        [MaxLength(200)]
        public string Subject { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        /// <summary>"Open" | "Resolved" | "Dismissed"</summary>
        [MaxLength(20)]
        public string Status { get; set; } = "Open";

        public string AdminReply { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ResolvedAt { get; set; }
    }

    // ─── Alumni Tracking ────────────────────────────────────────────────────────

    public class AlumniRecord
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(20)]
        public string RegistrationNumber { get; set; } = string.Empty;

        [Required]
        public int GraduationYear { get; set; }

        [MaxLength(100)]
        public string Degree { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Department { get; set; } = string.Empty;

        [MaxLength(150)]
        public string CurrentEmployer { get; set; } = string.Empty;

        [MaxLength(100)]
        public string JobTitle { get; set; } = string.Empty;

        public string LinkedInUrl { get; set; } = string.Empty;

        [MaxLength(100)]
        public string City { get; set; } = string.Empty;

        public bool IsVerified { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Optional link to a User account (if alumni registered on the platform)
        public Guid? UserId { get; set; }

        [ForeignKey("UserId")]
        [JsonIgnore]
        public virtual User? User { get; set; }
    }
}
