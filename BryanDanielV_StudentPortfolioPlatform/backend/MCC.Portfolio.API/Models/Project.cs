using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MCC.Portfolio.API.Models
{
    public class Project
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid StudentId { get; set; }

        [ForeignKey("StudentId")]
        public virtual Student Student { get; set; } = null!;

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        [OptionalUrl]
        public string GithubUrl { get; set; } = string.Empty;

        [OptionalUrl]
        public string LiveUrl { get; set; } = string.Empty;

        [MaxLength(500)]
        public string TechnologiesUsed { get; set; } = string.Empty; // e.g. "React,Next.js,C#"

        [OptionalUrl]
        public string ImageUrl { get; set; } = string.Empty;

        /// <summary>Technical | Innovation | Research | Design</summary>
        [MaxLength(50)]
        public string ProjectType { get; set; } = "Technical";

        [OptionalUrl]
        public string DemoVideoUrl { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
