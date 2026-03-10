using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartMap.API.Models
{
    [Table("VerifySeams")]
    public class VerifySeam
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string BlockName { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,3)")]
        public decimal Easting { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,3)")]
        public decimal Northing { get; set; }

        [Column(TypeName = "decimal(18,3)")]
        public decimal? Elevation { get; set; }

        [Required]
        public DateTime VerifyDate { get; set; }

        [Required]
        public int CreatedBy { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime? UpdatedAt { get; set; }

        public int? UpdatedBy { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Verified"; // Verified (auto-verified when created, no approval needed)

        [MaxLength(1000)]
        public string? Notes { get; set; }

        public bool IsActive { get; set; } = true;

        // Navigation properties
        [ForeignKey("CreatedBy")]
        public User? CreatedByUser { get; set; }

        [ForeignKey("UpdatedBy")]
        public User? UpdatedByUser { get; set; }

        public ICollection<VerifySeamPhoto> Photos { get; set; } = new List<VerifySeamPhoto>();
        public ICollection<VerifySeamVerifier> Verifiers { get; set; } = new List<VerifySeamVerifier>();
    }
}
