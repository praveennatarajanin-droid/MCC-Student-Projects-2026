using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MCC.Portfolio.API.Models
{
    public class Achievement
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

        public DateTime DateEarned { get; set; }

        [Required]
        [MaxLength(100)]
        public string Category { get; set; } = "Hackathon"; // e.g., "Hackathon", "Sports", "Extracurricular", "Startup"

        [OptionalUrl]
        public string CertificateUrl { get; set; } = string.Empty;

        public bool IsVerified { get; set; } = false;

        [MaxLength(1000)]
        public string VerificationRemarks { get; set; } = string.Empty;

        [MaxLength(200)]
        public string VerifiedBy { get; set; } = string.Empty;
    }
}
