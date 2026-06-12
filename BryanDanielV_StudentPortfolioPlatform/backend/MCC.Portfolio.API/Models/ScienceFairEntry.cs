using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MCC.Portfolio.API.Models
{
    public class ScienceFairEntry
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid StudentId { get; set; }

        [ForeignKey("StudentId")]
        public virtual Student Student { get; set; } = null!;

        [Required]
        [MaxLength(300)]
        public string FairName { get; set; } = string.Empty;

        [Required]
        [MaxLength(300)]
        public string ProjectTitle { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        /// <summary>School, District, State, National, International</summary>
        [MaxLength(50)]
        public string Level { get; set; } = "School";

        [MaxLength(300)]
        public string AwardReceived { get; set; } = string.Empty;

        public DateTime FairDate { get; set; } = DateTime.UtcNow;

        [OptionalUrl]
        public string CertificateUrl { get; set; } = string.Empty;

        public bool IsVerified { get; set; } = false;

        [MaxLength(1000)]
        public string VerificationRemarks { get; set; } = string.Empty;

        [MaxLength(200)]
        public string VerifiedBy { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
