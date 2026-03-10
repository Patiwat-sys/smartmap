using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartMap.API.Data;
using SmartMap.API.Models;
using SmartMap.API.Services;

namespace SmartMap.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MonthlyMapsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ActivityLogService _activityLogService;
        private readonly FileUploadService _fileUploadService;

        public MonthlyMapsController(
            ApplicationDbContext context,
            ActivityLogService activityLogService,
            FileUploadService fileUploadService)
        {
            _context = context;
            _activityLogService = activityLogService;
            _fileUploadService = fileUploadService;
        }

        [HttpGet]
        public async Task<IActionResult> GetMonthlyMaps([FromQuery] int? year, [FromQuery] int? month)
        {
            var query = _context.MonthlyMaps
                .Include(m => m.UploadedByUser)
                .Where(m => m.IsActive)
                .AsQueryable();

            if (year.HasValue)
            {
                query = query.Where(m => m.Year == year.Value);
            }

            if (month.HasValue)
            {
                query = query.Where(m => m.Month == month.Value);
            }

            var maps = await query
                .OrderByDescending(m => m.Year)
                .ThenByDescending(m => m.Month)
                .Select(m => new
                {
                    id = m.Id,
                    month = m.Month,
                    year = m.Year,
                    fileName = m.FileName,
                    filePath = m.FilePath,
                    fileUrl = $"/files/{m.FilePath}", // URL สำหรับดูไฟล์ผ่าน web
                    fileSize = m.FileSize,
                    eastMin = m.EastMin,
                    eastMax = m.EastMax,
                    northMin = m.NorthMin,
                    northMax = m.NorthMax,
                    uploadedBy = m.UploadedBy,
                    uploadedByUsername = m.UploadedByUser != null ? m.UploadedByUser.Username : null,
                    uploadedAt = m.UploadedAt,
                    updatedAt = m.UpdatedAt,
                    description = m.Description
                })
                .ToListAsync();

            return Ok(maps);
        }

        [HttpGet("{year}/{month}")]
        public async Task<IActionResult> GetMonthlyMap(int year, int month)
        {
            var map = await _context.MonthlyMaps
                .Include(m => m.UploadedByUser)
                .FirstOrDefaultAsync(m => m.Year == year && m.Month == month && m.IsActive);

            if (map == null)
            {
                return NotFound();
            }

            return Ok(new
            {
                id = map.Id,
                month = map.Month,
                year = map.Year,
                fileName = map.FileName,
                filePath = map.FilePath,
                fileUrl = $"/files/{map.FilePath}",
                fileSize = map.FileSize,
                eastMin = map.EastMin,
                eastMax = map.EastMax,
                northMin = map.NorthMin,
                northMax = map.NorthMax,
                uploadedBy = map.UploadedBy,
                uploadedByUsername = map.UploadedByUser?.Username,
                uploadedAt = map.UploadedAt,
                updatedAt = map.UpdatedAt,
                description = map.Description
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateMonthlyMap([FromForm] CreateMonthlyMapRequest request)
        {
            // Check if map already exists for this month/year
            if (await _context.MonthlyMaps.AnyAsync(m => m.Year == request.Year && m.Month == request.Month))
            {
                return BadRequest(new { message = "Map already exists for this month and year" });
            }

            if (request.File == null || request.File.Length == 0)
            {
                return BadRequest(new { message = "File is required" });
            }

            // Get current user ID (should come from authentication)
            var uploadedBy = request.UploadedBy; // TODO: Get from authenticated user

            // Upload file using FileUploadService
            var uploadResult = await _fileUploadService.UploadMapFileAsync(request.File, request.Year, request.Month);

            if (!uploadResult.Success)
            {
                return BadRequest(new { message = uploadResult.ErrorMessage });
            }

            var monthlyMap = new MonthlyMap
            {
                Month = request.Month,
                Year = request.Year,
                FileName = uploadResult.FileName,
                FilePath = uploadResult.FilePath,
                FileSize = uploadResult.FileSize,
                EastMin = request.EastMin,
                EastMax = request.EastMax,
                NorthMin = request.NorthMin,
                NorthMax = request.NorthMax,
                UploadedBy = uploadedBy,
                UploadedAt = DateTime.Now,
                Description = request.Description
            };

            _context.MonthlyMaps.Add(monthlyMap);
            await _context.SaveChangesAsync();

            // Log activity
            await _activityLogService.LogActivityAsync(
                uploadedBy,
                "UploadMap",
                "MonthlyMap",
                monthlyMap.Id,
                $"Uploaded map for {request.Year}/{request.Month}",
                "Success"
            );

            return Ok(new
            {
                message = "Monthly map uploaded successfully",
                map = new
                {
                    id = monthlyMap.Id,
                    month = monthlyMap.Month,
                    year = monthlyMap.Year,
                    fileName = monthlyMap.FileName,
                    filePath = monthlyMap.FilePath,
                    fileUrl = $"/files/{monthlyMap.FilePath}"
                }
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMonthlyMap(int id, [FromBody] UpdateMonthlyMapRequest request)
        {
            var map = await _context.MonthlyMaps.FindAsync(id);
            if (map == null)
            {
                return NotFound();
            }

            map.EastMin = request.EastMin ?? map.EastMin;
            map.EastMax = request.EastMax ?? map.EastMax;
            map.NorthMin = request.NorthMin ?? map.NorthMin;
            map.NorthMax = request.NorthMax ?? map.NorthMax;
            map.Description = request.Description ?? map.Description;
            map.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            // Log activity
            await _activityLogService.LogActivityAsync(
                map.UploadedBy, // TODO: Get from authenticated user
                "UpdateMap",
                "MonthlyMap",
                id,
                $"Updated map for {map.Year}/{map.Month}",
                "Success"
            );

            return Ok(new { message = "Monthly map updated successfully", map });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMonthlyMap(int id)
        {
            var map = await _context.MonthlyMaps.FindAsync(id);
            if (map == null)
            {
                return NotFound();
            }

            // Delete file
            _fileUploadService.DeleteFile(map.FilePath);

            // Soft delete
            map.IsActive = false;
            map.UpdatedAt = DateTime.Now;
            await _context.SaveChangesAsync();

            // Log activity
            await _activityLogService.LogActivityAsync(
                map.UploadedBy, // TODO: Get from authenticated user
                "DeleteMap",
                "MonthlyMap",
                id,
                $"Deleted map for {map.Year}/{map.Month}",
                "Success"
            );

            return Ok(new { message = "Monthly map deleted successfully" });
        }
    }

    public class CreateMonthlyMapRequest
    {
        public int Month { get; set; }
        public int Year { get; set; }
        public IFormFile File { get; set; } = null!;
        public decimal EastMin { get; set; }
        public decimal EastMax { get; set; }
        public decimal NorthMin { get; set; }
        public decimal NorthMax { get; set; }
        public int UploadedBy { get; set; }
        public string? Description { get; set; }
    }

    public class UpdateMonthlyMapRequest
    {
        public decimal? EastMin { get; set; }
        public decimal? EastMax { get; set; }
        public decimal? NorthMin { get; set; }
        public decimal? NorthMax { get; set; }
        public string? Description { get; set; }
    }
}
