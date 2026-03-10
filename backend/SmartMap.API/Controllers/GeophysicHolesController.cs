using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartMap.API.Data;
using SmartMap.API.Models;
using SmartMap.API.Services;

namespace SmartMap.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GeophysicHolesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ActivityLogService _activityLogService;
        private readonly FileUploadService _fileUploadService;

        public GeophysicHolesController(
            ApplicationDbContext context,
            ActivityLogService activityLogService,
            FileUploadService fileUploadService)
        {
            _context = context;
            _activityLogService = activityLogService;
            _fileUploadService = fileUploadService;
        }

        [HttpGet]
        public async Task<IActionResult> GetGeophysicHoles([FromQuery] string? holeName)
        {
            var query = _context.GeophysicHoles
                .Include(g => g.UploadedByUser)
                .Include(g => g.UpdatedByUser)
                .Where(g => g.IsActive)
                .AsQueryable();

            if (!string.IsNullOrEmpty(holeName))
            {
                query = query.Where(g => g.HoleName.Contains(holeName));
            }

            var holes = await query
                .OrderBy(g => g.HoleName)
                .Select(g => new
                {
                    id = g.Id,
                    holeName = g.HoleName,
                    easting = g.Easting,
                    northing = g.Northing,
                    elevation = g.Elevation,
                    fileName = g.FileName,
                    filePath = g.FilePath,
                    fileUrl = $"/files/{g.FilePath}",
                    fileSize = g.FileSize,
                    uploadedBy = g.UploadedBy,
                    uploadedByUsername = g.UploadedByUser != null ? g.UploadedByUser.Username : null,
                    uploadedAt = g.UploadedAt,
                    updatedAt = g.UpdatedAt,
                    updatedBy = g.UpdatedBy,
                    updatedByUsername = g.UploadedByUser != null ? g.UploadedByUser.Username : null,
                    description = g.Description
                })
                .ToListAsync();

            return Ok(holes);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetGeophysicHole(int id)
        {
            var hole = await _context.GeophysicHoles
                .Include(g => g.UploadedByUser)
                .Include(g => g.UpdatedByUser)
                .FirstOrDefaultAsync(g => g.Id == id && g.IsActive);

            if (hole == null)
            {
                return NotFound();
            }

            return Ok(new
            {
                id = hole.Id,
                holeName = hole.HoleName,
                easting = hole.Easting,
                northing = hole.Northing,
                elevation = hole.Elevation,
                fileName = hole.FileName,
                filePath = hole.FilePath,
                fileUrl = $"/files/{hole.FilePath}",
                fileSize = hole.FileSize,
                uploadedBy = hole.UploadedBy,
                uploadedByUsername = hole.UploadedByUser?.Username,
                uploadedAt = hole.UploadedAt,
                updatedAt = hole.UpdatedAt,
                updatedBy = hole.UpdatedBy,
                updatedByUsername = hole.UpdatedByUser?.Username,
                description = hole.Description
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateGeophysicHole([FromForm] CreateGeophysicHoleRequest request)
        {
            // Check if hole name already exists
            if (await _context.GeophysicHoles.AnyAsync(g => g.HoleName == request.HoleName))
            {
                return BadRequest(new { message = "Hole name already exists" });
            }

            if (request.File == null || request.File.Length == 0)
            {
                return BadRequest(new { message = "PDF file is required" });
            }

            // Get current user ID (should come from authentication)
            var uploadedBy = request.UploadedBy; // TODO: Get from authenticated user

            // Upload file using FileUploadService
            var uploadResult = await _fileUploadService.UploadGeophysicFileAsync(request.File, request.HoleName);

            if (!uploadResult.Success)
            {
                return BadRequest(new { message = uploadResult.ErrorMessage });
            }

            var hole = new GeophysicHole
            {
                HoleName = request.HoleName,
                Easting = request.Easting,
                Northing = request.Northing,
                Elevation = request.Elevation,
                FileName = uploadResult.FileName,
                FilePath = uploadResult.FilePath,
                FileSize = uploadResult.FileSize,
                UploadedBy = uploadedBy,
                UploadedAt = DateTime.Now,
                Description = request.Description
            };

            _context.GeophysicHoles.Add(hole);
            await _context.SaveChangesAsync();

            // Log activity
            await _activityLogService.LogActivityAsync(
                uploadedBy,
                "UploadGeophysic",
                "GeophysicHole",
                hole.Id,
                $"Uploaded geophysic data for hole {request.HoleName}",
                "Success"
            );

            return Ok(new
            {
                message = "Geophysic hole created successfully",
                hole = new
                {
                    id = hole.Id,
                    holeName = hole.HoleName,
                    fileName = hole.FileName,
                    filePath = hole.FilePath,
                    fileUrl = $"/files/{hole.FilePath}"
                }
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGeophysicHole(int id, [FromBody] UpdateGeophysicHoleRequest request)
        {
            var hole = await _context.GeophysicHoles.FindAsync(id);
            if (hole == null)
            {
                return NotFound();
            }

            // Check if new hole name conflicts with existing
            if (!string.IsNullOrEmpty(request.HoleName) && request.HoleName != hole.HoleName)
            {
                if (await _context.GeophysicHoles.AnyAsync(g => g.HoleName == request.HoleName))
                {
                    return BadRequest(new { message = "Hole name already exists" });
                }
            }

            hole.HoleName = request.HoleName ?? hole.HoleName;
            hole.Easting = request.Easting ?? hole.Easting;
            hole.Northing = request.Northing ?? hole.Northing;
            hole.Elevation = request.Elevation ?? hole.Elevation;
            hole.Description = request.Description ?? hole.Description;
            hole.UpdatedAt = DateTime.Now;
            hole.UpdatedBy = request.UpdatedBy; // TODO: Get from authenticated user

            await _context.SaveChangesAsync();

            // Log activity
            await _activityLogService.LogActivityAsync(
                hole.UploadedBy,
                "UpdateGeophysic",
                "GeophysicHole",
                id,
                $"Updated geophysic data for hole {hole.HoleName}",
                "Success"
            );

            return Ok(new { message = "Geophysic hole updated successfully", hole });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGeophysicHole(int id)
        {
            var hole = await _context.GeophysicHoles.FindAsync(id);
            if (hole == null)
            {
                return NotFound();
            }

            // Delete file
            _fileUploadService.DeleteFile(hole.FilePath);

            // Soft delete
            hole.IsActive = false;
            hole.UpdatedAt = DateTime.Now;
            await _context.SaveChangesAsync();

            // Log activity
            await _activityLogService.LogActivityAsync(
                hole.UploadedBy,
                "DeleteGeophysic",
                "GeophysicHole",
                id,
                $"Deleted geophysic data for hole {hole.HoleName}",
                "Success"
            );

            return Ok(new { message = "Geophysic hole deleted successfully" });
        }
    }

    public class CreateGeophysicHoleRequest
    {
        public string HoleName { get; set; } = string.Empty;
        public decimal Easting { get; set; }
        public decimal Northing { get; set; }
        public decimal? Elevation { get; set; }
        public IFormFile File { get; set; } = null!;
        public int UploadedBy { get; set; }
        public string? Description { get; set; }
    }

    public class UpdateGeophysicHoleRequest
    {
        public string? HoleName { get; set; }
        public decimal? Easting { get; set; }
        public decimal? Northing { get; set; }
        public decimal? Elevation { get; set; }
        public string? Description { get; set; }
        public int? UpdatedBy { get; set; }
    }
}
