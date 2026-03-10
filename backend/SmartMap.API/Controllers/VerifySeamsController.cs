using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartMap.API.Data;
using SmartMap.API.Models;
using SmartMap.API.Services;

namespace SmartMap.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VerifySeamsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ActivityLogService _activityLogService;
        private readonly FileUploadService _fileUploadService;

        public VerifySeamsController(
            ApplicationDbContext context,
            ActivityLogService activityLogService,
            FileUploadService fileUploadService)
        {
            _context = context;
            _activityLogService = activityLogService;
            _fileUploadService = fileUploadService;
        }

        [HttpGet]
        public async Task<IActionResult> GetVerifySeams([FromQuery] string? blockName, [FromQuery] string? status)
        {
            var query = _context.VerifySeams
                .Include(vs => vs.CreatedByUser)
                .Include(vs => vs.UpdatedByUser)
                .Include(vs => vs.Photos)
                .Include(vs => vs.Verifiers)
                    .ThenInclude(v => v.User)
                .Where(vs => vs.IsActive)
                .AsQueryable();

            if (!string.IsNullOrEmpty(blockName))
            {
                query = query.Where(vs => vs.BlockName.Contains(blockName));
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(vs => vs.Status == status);
            }

            var verifySeams = await query
                .OrderByDescending(vs => vs.VerifyDate)
                .Select(vs => new
                {
                    id = vs.Id,
                    blockName = vs.BlockName,
                    easting = vs.Easting,
                    northing = vs.Northing,
                    elevation = vs.Elevation,
                    verifyDate = vs.VerifyDate,
                    createdBy = vs.CreatedBy,
                    createdByUsername = vs.CreatedByUser != null ? vs.CreatedByUser.Username : null,
                    createdAt = vs.CreatedAt,
                    updatedAt = vs.UpdatedAt,
                    updatedBy = vs.UpdatedBy,
                    updatedByUsername = vs.UpdatedByUser != null ? vs.UpdatedByUser.Username : null,
                    status = vs.Status,
                    notes = vs.Notes,
                    photoCount = vs.Photos.Count,
                    verifierCount = vs.Verifiers.Count
                })
                .ToListAsync();

            return Ok(verifySeams);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetVerifySeam(int id)
        {
            var verifySeam = await _context.VerifySeams
                .Include(vs => vs.CreatedByUser)
                .Include(vs => vs.UpdatedByUser)
                .Include(vs => vs.Photos)
                .Include(vs => vs.Verifiers)
                    .ThenInclude(v => v.User)
                .FirstOrDefaultAsync(vs => vs.Id == id && vs.IsActive);

            if (verifySeam == null)
            {
                return NotFound();
            }

            return Ok(new
            {
                id = verifySeam.Id,
                blockName = verifySeam.BlockName,
                easting = verifySeam.Easting,
                northing = verifySeam.Northing,
                elevation = verifySeam.Elevation,
                verifyDate = verifySeam.VerifyDate,
                createdBy = verifySeam.CreatedBy,
                createdByUsername = verifySeam.CreatedByUser?.Username,
                createdAt = verifySeam.CreatedAt,
                updatedAt = verifySeam.UpdatedAt,
                updatedBy = verifySeam.UpdatedBy,
                updatedByUsername = verifySeam.UpdatedByUser?.Username,
                status = verifySeam.Status,
                notes = verifySeam.Notes,
                photos = verifySeam.Photos.Select(p => new
                {
                    id = p.Id,
                    fileName = p.FileName,
                    filePath = p.FilePath,
                    fileUrl = $"/files/{p.FilePath}",
                    uploadedAt = p.UploadedAt,
                    displayOrder = p.DisplayOrder,
                    description = p.Description
                }),
                verifiers = verifySeam.Verifiers.Select(v => new
                {
                    id = v.Id,
                    userId = v.UserId,
                    username = v.User != null ? v.User.Username : null,
                    verifiedAt = v.VerifiedAt,
                    verificationNotes = v.VerificationNotes,
                    status = v.Status
                })
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateVerifySeam([FromBody] CreateVerifySeamRequest request)
        {
            var verifySeam = new VerifySeam
            {
                BlockName = request.BlockName,
                Easting = request.Easting,
                Northing = request.Northing,
                Elevation = request.Elevation,
                VerifyDate = request.VerifyDate,
                CreatedBy = request.CreatedBy, // TODO: Get from authenticated user
                CreatedAt = DateTime.Now,
                Status = "Verified", // Auto-verified when created, no approval needed
                Notes = request.Notes
            };

            _context.VerifySeams.Add(verifySeam);
            await _context.SaveChangesAsync();

            // Log activity
            await _activityLogService.LogActivityAsync(
                request.CreatedBy,
                "CreateVerifySeam",
                "VerifySeam",
                verifySeam.Id,
                $"Created verify seam for block {request.BlockName}",
                "Success"
            );

            return Ok(new
            {
                message = "Verify seam created successfully",
                verifySeam = new
                {
                    id = verifySeam.Id,
                    blockName = verifySeam.BlockName,
                    easting = verifySeam.Easting,
                    northing = verifySeam.Northing
                }
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateVerifySeam(int id, [FromBody] UpdateVerifySeamRequest request)
        {
            var verifySeam = await _context.VerifySeams.FindAsync(id);
            if (verifySeam == null)
            {
                return NotFound();
            }

            verifySeam.BlockName = request.BlockName ?? verifySeam.BlockName;
            verifySeam.Easting = request.Easting ?? verifySeam.Easting;
            verifySeam.Northing = request.Northing ?? verifySeam.Northing;
            verifySeam.Elevation = request.Elevation ?? verifySeam.Elevation;
            verifySeam.VerifyDate = request.VerifyDate ?? verifySeam.VerifyDate;
            verifySeam.Status = request.Status ?? verifySeam.Status;
            verifySeam.Notes = request.Notes ?? verifySeam.Notes;
            verifySeam.UpdatedAt = DateTime.Now;
            verifySeam.UpdatedBy = request.UpdatedBy; // TODO: Get from authenticated user

            await _context.SaveChangesAsync();

            // Log activity
            await _activityLogService.LogActivityAsync(
                verifySeam.CreatedBy,
                "UpdateVerifySeam",
                "VerifySeam",
                id,
                $"Updated verify seam for block {verifySeam.BlockName}",
                "Success"
            );

            return Ok(new { message = "Verify seam updated successfully", verifySeam });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVerifySeam(int id)
        {
            var verifySeam = await _context.VerifySeams
                .Include(vs => vs.Photos)
                .FirstOrDefaultAsync(vs => vs.Id == id && vs.IsActive);

            if (verifySeam == null)
            {
                return NotFound();
            }

            // Delete all photos
            foreach (var photo in verifySeam.Photos)
            {
                _fileUploadService.DeleteFile(photo.FilePath);
            }

            // Soft delete
            verifySeam.IsActive = false;
            verifySeam.UpdatedAt = DateTime.Now;
            await _context.SaveChangesAsync();

            // Log activity
            await _activityLogService.LogActivityAsync(
                verifySeam.CreatedBy,
                "DeleteVerifySeam",
                "VerifySeam",
                id,
                $"Deleted verify seam for block {verifySeam.BlockName}",
                "Success"
            );

            return Ok(new { message = "Verify seam deleted successfully" });
        }

        [HttpPost("{id}/photos")]
        public async Task<IActionResult> UploadPhoto(int id, [FromForm] IFormFile file, [FromForm] string? description)
        {
            var verifySeam = await _context.VerifySeams.FindAsync(id);
            if (verifySeam == null)
            {
                return NotFound();
            }

            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "File is required" });
            }

            // Get current user ID (should come from authentication)
            var uploadedBy = 1; // TODO: Get from authenticated user

            // Upload file using FileUploadService
            var uploadResult = await _fileUploadService.UploadVerifySeamPhotoAsync(file, id);

            if (!uploadResult.Success)
            {
                return BadRequest(new { message = uploadResult.ErrorMessage });
            }

            // Get max display order
            var maxOrder = await _context.VerifySeamPhotos
                .Where(p => p.VerifySeamId == id)
                .MaxAsync(p => (int?)p.DisplayOrder) ?? -1;

            var photo = new VerifySeamPhoto
            {
                VerifySeamId = id,
                FileName = uploadResult.FileName,
                FilePath = uploadResult.FilePath,
                FileSize = uploadResult.FileSize,
                UploadedBy = uploadedBy,
                UploadedAt = DateTime.Now,
                DisplayOrder = maxOrder + 1,
                Description = description
            };

            _context.VerifySeamPhotos.Add(photo);
            await _context.SaveChangesAsync();

            // Log activity
            await _activityLogService.LogActivityAsync(
                uploadedBy,
                "UploadVerifySeamPhoto",
                "VerifySeamPhoto",
                photo.Id,
                $"Uploaded photo for verify seam {id}",
                "Success"
            );

            return Ok(new
            {
                message = "Photo uploaded successfully",
                photo = new
                {
                    id = photo.Id,
                    fileName = photo.FileName,
                    filePath = photo.FilePath,
                    fileUrl = $"/files/{photo.FilePath}"
                }
            });
        }

        [HttpPost("{id}/photos/multiple")]
        public async Task<IActionResult> UploadMultiplePhotos(int id, [FromForm] List<IFormFile> files, [FromForm] string? description)
        {
            var verifySeam = await _context.VerifySeams.FindAsync(id);
            if (verifySeam == null)
            {
                return NotFound();
            }

            if (files == null || files.Count == 0)
            {
                return BadRequest(new { message = "At least one file is required" });
            }

            var uploadedBy = 1; // TODO: Get from authenticated user
            var uploadedPhotos = new List<object>();
            var errors = new List<string>();

            // Get max display order
            var maxOrder = await _context.VerifySeamPhotos
                .Where(p => p.VerifySeamId == id)
                .MaxAsync(p => (int?)p.DisplayOrder) ?? -1;

            foreach (var file in files)
            {
                if (file.Length == 0) continue;

                var uploadResult = await _fileUploadService.UploadVerifySeamPhotoAsync(file, id);

                if (!uploadResult.Success)
                {
                    errors.Add($"{file.FileName}: {uploadResult.ErrorMessage}");
                    continue;
                }

                maxOrder++;
                var photo = new VerifySeamPhoto
                {
                    VerifySeamId = id,
                    FileName = uploadResult.FileName,
                    FilePath = uploadResult.FilePath,
                    FileSize = uploadResult.FileSize,
                    UploadedBy = uploadedBy,
                    UploadedAt = DateTime.Now,
                    DisplayOrder = maxOrder,
                    Description = description
                };

                _context.VerifySeamPhotos.Add(photo);
                await _context.SaveChangesAsync();

                uploadedPhotos.Add(new
                {
                    id = photo.Id,
                    fileName = photo.FileName,
                    filePath = photo.FilePath,
                    fileUrl = $"/files/{photo.FilePath}"
                });

                // Log activity
                await _activityLogService.LogActivityAsync(
                    uploadedBy,
                    "UploadVerifySeamPhoto",
                    "VerifySeamPhoto",
                    photo.Id,
                    $"Uploaded photo for verify seam {id}",
                    "Success"
                );
            }

            return Ok(new
            {
                message = $"Uploaded {uploadedPhotos.Count} photo(s) successfully",
                uploadedPhotos,
                errors = errors.Count > 0 ? errors : null
            });
        }

        [HttpDelete("{id}/photos/{photoId}")]
        public async Task<IActionResult> DeletePhoto(int id, int photoId)
        {
            var photo = await _context.VerifySeamPhotos
                .FirstOrDefaultAsync(p => p.Id == photoId && p.VerifySeamId == id);

            if (photo == null)
            {
                return NotFound();
            }

            // Delete file
            _fileUploadService.DeleteFile(photo.FilePath);

            _context.VerifySeamPhotos.Remove(photo);
            await _context.SaveChangesAsync();

            // Log activity
            await _activityLogService.LogActivityAsync(
                photo.UploadedBy,
                "DeleteVerifySeamPhoto",
                "VerifySeamPhoto",
                photoId,
                $"Deleted photo from verify seam {id}",
                "Success"
            );

            return Ok(new { message = "Photo deleted successfully" });
        }

        [HttpPost("{id}/verifiers")]
        public async Task<IActionResult> AddVerifier(int id, [FromBody] AddVerifierRequest request)
        {
            var verifySeam = await _context.VerifySeams.FindAsync(id);
            if (verifySeam == null)
            {
                return NotFound();
            }

            // Check if user already verified
            if (await _context.VerifySeamVerifiers.AnyAsync(v => v.VerifySeamId == id && v.UserId == request.UserId))
            {
                return BadRequest(new { message = "User has already verified this seam" });
            }

            var verifier = new VerifySeamVerifier
            {
                VerifySeamId = id,
                UserId = request.UserId,
                VerifiedAt = DateTime.Now,
                VerificationNotes = request.VerificationNotes,
                Status = request.Status ?? "Verified"
            };

            _context.VerifySeamVerifiers.Add(verifier);
            await _context.SaveChangesAsync();

            // Log activity
            await _activityLogService.LogActivityAsync(
                request.UserId,
                "VerifySeam",
                "VerifySeamVerifier",
                verifier.Id,
                $"Verified seam {id}",
                "Success"
            );

            return Ok(new { message = "Verifier added successfully", verifier });
        }
    }

    public class CreateVerifySeamRequest
    {
        public string BlockName { get; set; } = string.Empty;
        public decimal Easting { get; set; }
        public decimal Northing { get; set; }
        public decimal? Elevation { get; set; }
        public DateTime VerifyDate { get; set; }
        public int CreatedBy { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateVerifySeamRequest
    {
        public string? BlockName { get; set; }
        public decimal? Easting { get; set; }
        public decimal? Northing { get; set; }
        public decimal? Elevation { get; set; }
        public DateTime? VerifyDate { get; set; }
        public string? Status { get; set; }
        public string? Notes { get; set; }
        public int? UpdatedBy { get; set; }
    }

    public class AddVerifierRequest
    {
        public int UserId { get; set; }
        public string? VerificationNotes { get; set; }
        public string? Status { get; set; }
    }
}
