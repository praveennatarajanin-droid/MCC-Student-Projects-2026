using System;
using System.ComponentModel.DataAnnotations;

namespace MccPortfolioBackend.DTOs
{
    public class StudentProfileUpdateDto
    {
        public string Bio { get; set; } = string.Empty;
        
        [MaxLength(20)]
        public string Phone { get; set; } = string.Empty;

        public string PersonalEmail { get; set; } = string.Empty;

        public string PersonalStory { get; set; } = string.Empty;

        public string Sop { get; set; } = string.Empty;

        public string Skills { get; set; } = string.Empty; // Comma-separated

        public string Theme { get; set; } = "Academic"; // "Academic", "Corporate", "Startup", "Creative", "AIFuturistic"

        public string GitHubUsername { get; set; } = string.Empty;

        public string BehanceUsername { get; set; } = string.Empty;
    }

    public class AcademicRecordDto
    {
        [Required]
        [MaxLength(150)]
        public string Degree { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Institution { get; set; } = string.Empty;

        [Required]
        public int StartYear { get; set; }

        [Required]
        public int EndYear { get; set; }

        [Required]
        [MaxLength(50)]
        public string GradeOrCgpa { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Level { get; set; } = "UG";

        [Required]
        public bool IsCurrentlyStudying { get; set; } = false;
    }

    public class CertificationDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string IssuingOrganization { get; set; } = string.Empty;

        [Required]
        public DateTime IssueDate { get; set; }

        public string? CredentialId { get; set; } = string.Empty;
    }

    public class ActivityDto
    {
        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = string.Empty; // "NGO", "CommunityService", "Sports", "Extracurricular"

        [Required]
        [MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Organization { get; set; } = string.Empty;

        [Required]
        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public string? Description { get; set; } = string.Empty;
    }

    public class ProjectDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public string TechnologiesUsed { get; set; } = string.Empty;

        public string ProjectUrl { get; set; } = string.Empty;

        public string RepositoryUrl { get; set; } = string.Empty;
        
        public string MediaUrl { get; set; } = string.Empty;
    }
}
