using System;
using System.ComponentModel.DataAnnotations;

namespace MccPortfolioBackend.DTOs
{
    public class ResearchInnovationDto
    {
        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = string.Empty; // "ResearchPaper", "InnovationProject", "Prototype", "ConferencePresentation", "ScienceFair", "StartupIdea"

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Category { get; set; } = string.Empty;

        [Required]
        public DateTime Date { get; set; }

        public string? Link { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? InstitutionOrEvent { get; set; } = string.Empty;
    }
}
