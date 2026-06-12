using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MCC.Portfolio.API.Models
{
    public class ConferencePresentation
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid StudentId { get; set; }

        [ForeignKey("StudentId")]
        public virtual Student Student { get; set; } = null!;

        [Required]
        [MaxLength(300)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(300)]
        public string ConferenceName { get; set; } = string.Empty;

        /// <summary>Presenter, Panelist, Session Chair, Organizer</summary>
        [MaxLength(100)]
        public string Role { get; set; } = "Presenter";

        [MaxLength(200)]
        public string Location { get; set; } = string.Empty;

        public DateTime PresentationDate { get; set; } = DateTime.UtcNow;

        [OptionalUrl]
        public string AbstractUrl { get; set; } = string.Empty;

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
