using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartMap.API.Data;

namespace SmartMap.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ActivityLogsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ActivityLogsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetActivityLogs(
            [FromQuery] int? userId,
            [FromQuery] string? actionType,
            [FromQuery] string? entityType,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            var query = _context.ActivityLogs
                .Include(log => log.User)
                .AsQueryable();

            if (userId.HasValue)
            {
                query = query.Where(log => log.UserId == userId.Value);
            }

            if (!string.IsNullOrEmpty(actionType))
            {
                query = query.Where(log => log.ActionType == actionType);
            }

            if (!string.IsNullOrEmpty(entityType))
            {
                query = query.Where(log => log.EntityType == entityType);
            }

            if (startDate.HasValue)
            {
                query = query.Where(log => log.CreatedAt >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(log => log.CreatedAt <= endDate.Value);
            }

            var totalCount = await query.CountAsync();

            var logs = await query
                .OrderByDescending(log => log.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(log => new
                {
                    id = log.Id,
                    userId = log.UserId,
                    username = log.User != null ? log.User.Username : null,
                    actionType = log.ActionType,
                    entityType = log.EntityType,
                    entityId = log.EntityId,
                    description = log.Description,
                    ipAddress = log.IpAddress,
                    userAgent = log.UserAgent,
                    createdAt = log.CreatedAt,
                    status = log.Status
                })
                .ToListAsync();

            return Ok(new
            {
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                data = logs
            });
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserActivityLogs(int userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var query = _context.ActivityLogs
                .Include(log => log.User)
                .Where(log => log.UserId == userId);

            var totalCount = await query.CountAsync();

            var logs = await query
                .OrderByDescending(log => log.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(log => new
                {
                    id = log.Id,
                    actionType = log.ActionType,
                    entityType = log.EntityType,
                    entityId = log.EntityId,
                    description = log.Description,
                    createdAt = log.CreatedAt,
                    status = log.Status
                })
                .ToListAsync();

            return Ok(new
            {
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                data = logs
            });
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetActivityStats([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var query = _context.ActivityLogs.AsQueryable();

            if (startDate.HasValue)
            {
                query = query.Where(log => log.CreatedAt >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(log => log.CreatedAt <= endDate.Value);
            }

            var stats = new
            {
                totalActivities = await query.CountAsync(),
                byActionType = await query
                    .GroupBy(log => log.ActionType)
                    .Select(g => new { actionType = g.Key, count = g.Count() })
                    .ToListAsync(),
                byStatus = await query
                    .GroupBy(log => log.Status)
                    .Select(g => new { status = g.Key, count = g.Count() })
                    .ToListAsync(),
                byEntityType = await query
                    .Where(log => log.EntityType != null)
                    .GroupBy(log => log.EntityType!)
                    .Select(g => new { entityType = g.Key, count = g.Count() })
                    .ToListAsync()
            };

            return Ok(stats);
        }
    }
}
