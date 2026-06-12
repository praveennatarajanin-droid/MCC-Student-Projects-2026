using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MCC.Portfolio.API.Models
{
    public class Portfolio
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid StudentId { get; set; }

        [ForeignKey("StudentId")]
        public virtual Student Student { get; set; } = null!;

        [Required]
        [MaxLength(100)]
        public string Slug { get; set; } = string.Empty; // e.g., "bryan-manuel"

        public bool IsPublic { get; set; } = true;

        public bool IsApproved { get; set; } = false;

        [MaxLength(2000)]
        public string LayoutSettingsJson { get; set; } = "{}"; // Store customizable template preferences JSON

        [MaxLength(4000)]
        public string StatementOfPurpose { get; set; } = string.Empty;

        [MaxLength(200)]
        public string StoryTitle { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string StoryContent { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? ReviewRemarks { get; set; }

        [MaxLength(100)]
        public string? ReviewedBy { get; set; }
    }
}
