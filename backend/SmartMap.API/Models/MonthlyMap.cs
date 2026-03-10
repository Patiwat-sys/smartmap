using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartMap.API.Models
{
    [Table("MonthlyMaps")]
    public class MonthlyMap
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [Range(1, 12)]
        public int Month { get; set; }

        [Required]
        public int Year { get; set; }

        [Required]
        [MaxLength(255)]
        public string FileName { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string FilePath { get; set; } = string.Empty;

        public long? FileSize { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,3)")]
        public decimal EastMin { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,3)")]
        public decimal EastMax { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,3)")]
        public decimal NorthMin { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,3)")]
        public decimal NorthMax { get; set; }

        [Required]
        public int UploadedBy { get; set; }

        [Required]
        public DateTime UploadedAt { get; set; } = DateTime.Now;

        public DateTime? UpdatedAt { get; set; }

        public bool IsActive { get; set; } = true;

        [MaxLength(500)]
        public string? Description { get; set; }

        // Navigation property
        [ForeignKey("UploadedBy")]
        public User? UploadedByUser { get; set; }
    }
}
