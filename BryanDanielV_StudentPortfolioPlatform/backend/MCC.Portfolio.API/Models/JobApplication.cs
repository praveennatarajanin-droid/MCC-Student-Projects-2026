using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MCC.Portfolio.API.Models
{
    public class JobApplication
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid PlacementDriveId { get; set; }

        [ForeignKey("PlacementDriveId")]
        public virtual PlacementDrive PlacementDrive { get; set; } = null!;

        [Required]
        public Guid StudentId { get; set; }

        [ForeignKey("StudentId")]
        public virtual Student Student { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Applied"; // "Applied", "Under Review", "Shortlisted", "Selected", "Rejected"

        [MaxLength(1000)]
        public string Remarks { get; set; } = string.Empty;

        public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
    }
}
