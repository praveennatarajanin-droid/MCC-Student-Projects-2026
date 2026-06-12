using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MCC.Portfolio.API.Models
{
    public class Publication
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
        public string JournalOrConference { get; set; } = string.Empty;

        public DateTime PublishDate { get; set; }

        [OptionalUrl]
        public string PaperUrl { get; set; } = string.Empty;

        [Required]
        [MaxLength(2000)]
        public string Abstract { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Authors { get; set; } = string.Empty; // e.g. "Bryan Manuel, Dr. Franklin Raj"

        /// <summary>Journal | Conference | Workshop | Book Chapter | Preprint</summary>
        [MaxLength(50)]
        public string PublicationType { get; set; } = "Journal";

        [MaxLength(200)]
        public string DoiOrIsbn { get; set; } = string.Empty;
    }
}
