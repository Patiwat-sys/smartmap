using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartMap.API.Models
{
    [Table("ActivityLogs")]
    public class ActivityLog
    {
        [Key]
        public long Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [MaxLength(50)]
        public string ActionType { get; set; } = string.Empty; // Login, UploadMap, CreateVerifySeam, etc.

        [MaxLength(50)]
        public string? EntityType { get; set; } // MonthlyMap, VerifySeam, GeophysicHole, etc.

        public int? EntityId { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(50)]
        public string? IpAddress { get; set; }

        [MaxLength(255)]
        public string? UserAgent { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Success"; // Success, Failed, Error

        // Navigation property
        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}
