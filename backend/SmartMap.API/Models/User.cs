using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartMap.API.Models
{
    [Table("Users")]
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = "User"; // Admin or User

        [MaxLength(100)]
        public string? FullName { get; set; }

        public bool IsActive { get; set; } = true;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime? UpdatedAt { get; set; }

        public DateTime? LastLoginAt { get; set; }

        // Navigation properties
        public ICollection<MonthlyMap> MonthlyMaps { get; set; } = new List<MonthlyMap>();
        public ICollection<VerifySeam> CreatedVerifySeams { get; set; } = new List<VerifySeam>();
        public ICollection<VerifySeam> UpdatedVerifySeams { get; set; } = new List<VerifySeam>();
        public ICollection<VerifySeamVerifier> VerifySeamVerifiers { get; set; } = new List<VerifySeamVerifier>();
        public ICollection<VerifySeamPhoto> VerifySeamPhotos { get; set; } = new List<VerifySeamPhoto>();
        public ICollection<GeophysicHole> UploadedGeophysicHoles { get; set; } = new List<GeophysicHole>();
        public ICollection<GeophysicHole> UpdatedGeophysicHoles { get; set; } = new List<GeophysicHole>();
        public ICollection<ActivityLog> ActivityLogs { get; set; } = new List<ActivityLog>();
    }
}
