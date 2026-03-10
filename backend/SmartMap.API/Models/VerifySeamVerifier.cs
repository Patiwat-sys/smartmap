using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartMap.API.Models
{
    [Table("VerifySeamVerifiers")]
    public class VerifySeamVerifier
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int VerifySeamId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public DateTime VerifiedAt { get; set; } = DateTime.Now;

        [MaxLength(500)]
        public string? VerificationNotes { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Verified"; // Verified, Rejected

        // Navigation properties
        [ForeignKey("VerifySeamId")]
        public VerifySeam? VerifySeam { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}
