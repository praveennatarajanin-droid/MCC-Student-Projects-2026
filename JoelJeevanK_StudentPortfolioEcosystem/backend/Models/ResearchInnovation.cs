using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace MccPortfolioBackend.Models
{
    public class ResearchInnovation
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid UserId { get; set; }

        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = string.Empty; // "ResearchPaper", "InnovationProject", "Prototype", "ConferencePresentation", "ScienceFair", "StartupIdea"

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Category { get; set; } = string.Empty; // Subject / Domain / Field

        [Required]
        public DateTime Date { get; set; }

        public string Link { get; set; } = string.Empty; // Project link, Startup link, Presentation slides link

        public string AttachmentPath { get; set; } = string.Empty; // Uploaded PDF paper or project description document

        [MaxLength(200)]
        public string InstitutionOrEvent { get; set; } = string.Empty; // Conference name, Science fair name, etc.

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("UserId")]
        [JsonIgnore]
        public virtual User? User { get; set; }
    }
}
