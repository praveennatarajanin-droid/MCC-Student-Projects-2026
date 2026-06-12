using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace MccPortfolioBackend.Models
{
    public class Project
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid UserId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public string TechnologiesUsed { get; set; } = string.Empty; // Comma-separated, e.g., "Next.js, Tailwind, Postgres"

        public string ProjectUrl { get; set; } = string.Empty;

        public string RepositoryUrl { get; set; } = string.Empty;

        public string MediaUrl { get; set; } = string.Empty; // URL for showcase image/video

        [ForeignKey("UserId")]
        [JsonIgnore]
        public virtual User? User { get; set; }
    }
}
