using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace MccPortfolioBackend.Models
{
    public class StudentProfile
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid UserId { get; set; }

        public string Bio { get; set; } = string.Empty;
        
        [MaxLength(20)]
        public string Phone { get; set; } = string.Empty;

        public string PersonalEmail { get; set; } = string.Empty;

        public string PersonalStory { get; set; } = string.Empty;

        public string Sop { get; set; } = string.Empty; // Statement of Purpose

        public string ProfileImageUrl { get; set; } = string.Empty;

        public string Skills { get; set; } = string.Empty; // Comma-separated list of skills, e.g., "React, C#, PostgreSQL"

        public string Theme { get; set; } = "Academic"; // "Academic", "Corporate", "Startup", "Creative", "AIFuturistic"

        public string GitHubUsername { get; set; } = string.Empty;

        public string BehanceUsername { get; set; } = string.Empty;

        [ForeignKey("UserId")]
        [JsonIgnore]
        public virtual User? User { get; set; }
    }
}
