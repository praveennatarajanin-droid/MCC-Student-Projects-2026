using System;
using System.ComponentModel.DataAnnotations;

namespace MCC.Portfolio.API.Models
{
    public class PlacementDrive
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(2000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string CompanyName { get; set; } = string.Empty;

        public double EligibilityCgpa { get; set; } = 0.0;

        public DateTime DriveDate { get; set; }

        [OptionalUrl]
        public string ApplicationLink { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
