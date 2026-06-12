using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MCC.Portfolio.API.Models
{
    public class StartupIdea
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
        [MaxLength(3000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string TeamMembers { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Stage { get; set; } = "Idea"; // Idea, Prototype, MVP

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Pending"; // Pending, Review, IncubationApproved

        [MaxLength(200)]
        public string FundingAsk { get; set; } = string.Empty; // e.g. "₹50,000 seed grant"

        [MaxLength(200)]
        public string MentorName { get; set; } = string.Empty;

        [OptionalUrl]
        public string PitchDeckUrl { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
