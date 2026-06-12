using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MCC.Portfolio.API.Models
{
    public class Student
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid UserId { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        [Required]
        [MaxLength(20)]
        public string RollNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Department { get; set; } = string.Empty;

        [Required]
        [MaxLength(10)]
        public string BatchYear { get; set; } = string.Empty; // e.g. "2023-2026"

        [MaxLength(500)]
        public string Bio { get; set; } = string.Empty;

        [OptionalUrl]
        public string AvatarUrl { get; set; } = string.Empty;

        public double Cgpa { get; set; } = 0.0;

        [MaxLength(100)]
        public string GithubUsername { get; set; } = string.Empty;

        [MaxLength(100)]
        public string BehanceUsername { get; set; } = string.Empty;

        public bool IsAlumni { get; set; } = false;

        [MaxLength(150)]
        public string CurrentCompany { get; set; } = string.Empty;

        [MaxLength(150)]
        public string CurrentRole { get; set; } = string.Empty;

        // Navigation Collections
        public virtual ICollection<Project> Projects { get; set; } = new List<Project>();
        public virtual ICollection<Certification> Certifications { get; set; } = new List<Certification>();
        public virtual ICollection<Publication> Publications { get; set; } = new List<Publication>();
        public virtual ICollection<Achievement> Achievements { get; set; } = new List<Achievement>();
        public virtual ICollection<CommunityService> CommunityServices { get; set; } = new List<CommunityService>();
        public virtual ICollection<ConferencePresentation> ConferencePresentations { get; set; } = new List<ConferencePresentation>();
        public virtual ICollection<ScienceFairEntry> ScienceFairEntries { get; set; } = new List<ScienceFairEntry>();
        public virtual MCC.Portfolio.API.Models.Portfolio? Portfolio { get; set; }
    }
}
