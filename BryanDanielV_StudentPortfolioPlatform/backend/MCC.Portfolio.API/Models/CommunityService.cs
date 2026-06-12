using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MCC.Portfolio.API.Models
{
    public class CommunityService
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid StudentId { get; set; }

        [ForeignKey("StudentId")]
        public virtual Student Student { get; set; } = null!;

        [Required]
        [MaxLength(200)]
        public string Organization { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Role { get; set; } = string.Empty; // e.g. "Volunteer", "Lead"

        [Required]
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public bool IsVerified { get; set; } = false;

        [MaxLength(1000)]
        public string VerificationRemarks { get; set; } = string.Empty;

        [MaxLength(200)]
        public string VerifiedBy { get; set; } = string.Empty;
    }
}
