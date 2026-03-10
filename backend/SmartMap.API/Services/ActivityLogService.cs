using SmartMap.API.Data;
using SmartMap.API.Models;

namespace SmartMap.API.Services
{
    public class ActivityLogService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ActivityLogService(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task LogActivityAsync(
            int userId,
            string actionType,
            string? entityType = null,
            int? entityId = null,
            string? description = null,
            string status = "Success")
        {
            var ipAddress = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();
            var userAgent = _httpContextAccessor.HttpContext?.Request.Headers["User-Agent"].ToString();

            var log = new ActivityLog
            {
                UserId = userId,
                ActionType = actionType,
                EntityType = entityType,
                EntityId = entityId,
                Description = description,
                IpAddress = ipAddress,
                UserAgent = userAgent,
                Status = status,
                CreatedAt = DateTime.Now
            };

            _context.ActivityLogs.Add(log);
            await _context.SaveChangesAsync();
        }
    }
}
