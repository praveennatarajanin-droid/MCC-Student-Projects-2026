using System;
using System.ComponentModel.DataAnnotations;

namespace MccPortfolioBackend.Models
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
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Gender { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Department { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = "Student"; // "Student", "Staff", or "Admin"

        [Required]
        [MaxLength(100)]
        public string Username { get; set; } = string.Empty; // for profile url: /student/[username]

        public bool IsApproved { get; set; } = false; // Admin approval for student profile to go public

        [MaxLength(100)]
        public string Title { get; set; } = string.Empty; // for staff designation, e.g., HOD

        [MaxLength(20)]
        public string Phone { get; set; } = string.Empty; // staff phone number

        public bool IsBlocked { get; set; } = false;
        public bool IsSuperAdmin { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual StudentProfile? Profile { get; set; }
        public virtual ICollection<AcademicRecord> AcademicRecords { get; set; } = new List<AcademicRecord>();
        public virtual ICollection<Certification> Certifications { get; set; } = new List<Certification>();
        public virtual ICollection<Activity> Activities { get; set; } = new List<Activity>();
        public virtual ICollection<Project> Projects { get; set; } = new List<Project>();
        public virtual ICollection<ResearchInnovation> ResearchInnovations { get; set; } = new List<ResearchInnovation>();
        public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    }
}
