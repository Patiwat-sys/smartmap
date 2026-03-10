using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartMap.API.Models
{
    [Table("GeophysicHoles")]
    public class GeophysicHole
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string HoleName { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,3)")]
        public decimal Easting { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,3)")]
        public decimal Northing { get; set; }

        [Column(TypeName = "decimal(18,3)")]
        public decimal? Elevation { get; set; }

        [Required]
        [MaxLength(255)]
        public string FileName { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string FilePath { get; set; } = string.Empty;

        public long? FileSize { get; set; }

        [Required]
        public int UploadedBy { get; set; }

        [Required]
        public DateTime UploadedAt { get; set; } = DateTime.Now;

        public DateTime? UpdatedAt { get; set; }

        public int? UpdatedBy { get; set; }

        public bool IsActive { get; set; } = true;

        [MaxLength(500)]
        public string? Description { get; set; }

        // Navigation properties
        [ForeignKey("UploadedBy")]
        public User? UploadedByUser { get; set; }

        [ForeignKey("UpdatedBy")]
        public User? UpdatedByUser { get; set; }
    }
}
