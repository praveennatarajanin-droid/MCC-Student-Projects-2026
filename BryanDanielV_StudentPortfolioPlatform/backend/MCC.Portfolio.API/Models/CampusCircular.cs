using System;
using System.ComponentModel.DataAnnotations;

namespace MCC.Portfolio.API.Models
{
    public class CampusCircular
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(3000)]
        public string Content { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string SenderRole { get; set; } = "Admin"; // Admin, PlacementCoordinator, etc.

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
