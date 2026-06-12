using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MCC.Portfolio.API.Models
{
    public class Certification
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid StudentId { get; set; }

        [ForeignKey("StudentId")]
        public virtual Student Student { get; set; } = null!;

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string IssuingOrganization { get; set; } = string.Empty;

        public DateTime IssueDate { get; set; }

        public DateTime? ExpirationDate { get; set; }

        [MaxLength(100)]
        public string CredentialId { get; set; } = string.Empty;

        [OptionalUrl]
        public string CredentialUrl { get; set; } = string.Empty;
    }
}
