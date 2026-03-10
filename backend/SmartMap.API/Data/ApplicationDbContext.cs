using Microsoft.EntityFrameworkCore;
using SmartMap.API.Models;

namespace SmartMap.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<MonthlyMap> MonthlyMaps { get; set; }
        public DbSet<VerifySeam> VerifySeams { get; set; }
        public DbSet<VerifySeamPhoto> VerifySeamPhotos { get; set; }
        public DbSet<VerifySeamVerifier> VerifySeamVerifiers { get; set; }
        public DbSet<GeophysicHole> GeophysicHoles { get; set; }
        public DbSet<ActivityLog> ActivityLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(e => e.Username).IsUnique();
                entity.HasIndex(e => e.Email).IsUnique();
            });

            // MonthlyMap configuration
            modelBuilder.Entity<MonthlyMap>(entity =>
            {
                entity.HasIndex(e => new { e.Year, e.Month }).IsUnique();
                entity.HasOne(e => e.UploadedByUser)
                    .WithMany(u => u.MonthlyMaps)
                    .HasForeignKey(e => e.UploadedBy)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // VerifySeam configuration
            modelBuilder.Entity<VerifySeam>(entity =>
            {
                entity.HasOne(e => e.CreatedByUser)
                    .WithMany(u => u.CreatedVerifySeams)
                    .HasForeignKey(e => e.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.UpdatedByUser)
                    .WithMany(u => u.UpdatedVerifySeams)
                    .HasForeignKey(e => e.UpdatedBy)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // VerifySeamPhoto configuration
            modelBuilder.Entity<VerifySeamPhoto>(entity =>
            {
                entity.HasOne(e => e.VerifySeam)
                    .WithMany(vs => vs.Photos)
                    .HasForeignKey(e => e.VerifySeamId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.UploadedByUser)
                    .WithMany(u => u.VerifySeamPhotos)
                    .HasForeignKey(e => e.UploadedBy)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // VerifySeamVerifier configuration
            modelBuilder.Entity<VerifySeamVerifier>(entity =>
            {
                entity.HasIndex(e => new { e.VerifySeamId, e.UserId }).IsUnique();

                entity.HasOne(e => e.VerifySeam)
                    .WithMany(vs => vs.Verifiers)
                    .HasForeignKey(e => e.VerifySeamId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                    .WithMany(u => u.VerifySeamVerifiers)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // GeophysicHole configuration
            modelBuilder.Entity<GeophysicHole>(entity =>
            {
                entity.HasIndex(e => e.HoleName).IsUnique();

                entity.HasOne(e => e.UploadedByUser)
                    .WithMany(u => u.UploadedGeophysicHoles)
                    .HasForeignKey(e => e.UploadedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.UpdatedByUser)
                    .WithMany(u => u.UpdatedGeophysicHoles)
                    .HasForeignKey(e => e.UpdatedBy)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ActivityLog configuration
            modelBuilder.Entity<ActivityLog>(entity =>
            {
                entity.HasOne(e => e.User)
                    .WithMany(u => u.ActivityLogs)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
