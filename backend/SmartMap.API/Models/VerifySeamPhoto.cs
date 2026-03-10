using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartMap.API.Models
{
    [Table("VerifySeamPhotos")]
    public class VerifySeamPhoto
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int VerifySeamId { get; set; }

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

        public int DisplayOrder { get; set; } = 0;

        [MaxLength(500)]
        public string? Description { get; set; }

        // Navigation properties
        [ForeignKey("VerifySeamId")]
        public VerifySeam? VerifySeam { get; set; }

        [ForeignKey("UploadedBy")]
        public User? UploadedByUser { get; set; }
    }
}
