using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartMap.API.Data;
using SmartMap.API.Models;
using SmartMap.API.Services;

namespace SmartMap.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ActivityLogService _activityLogService;

        public UsersController(ApplicationDbContext context, ActivityLogService activityLogService)
        {
            _context = context;
            _activityLogService = activityLogService;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new
                {
                    id = u.Id,
                    username = u.Username,
                    email = u.Email,
                    role = u.Role,
                    fullName = u.FullName,
                    isActive = u.IsActive,
                    createdAt = u.CreatedAt,
                    lastLoginAt = u.LastLoginAt
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            return Ok(new
            {
                id = user.Id,
                username = user.Username,
                email = user.Email,
                role = user.Role,
                fullName = user.FullName,
                isActive = user.IsActive,
                createdAt = user.CreatedAt,
                updatedAt = user.UpdatedAt,
                lastLoginAt = user.LastLoginAt
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            user.Username = request.Username ?? user.Username;
            user.Email = request.Email ?? user.Email;
            user.Role = request.Role ?? user.Role;
            user.FullName = request.FullName ?? user.FullName;
            user.IsActive = request.IsActive ?? user.IsActive;
            user.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            // Log activity (assuming we have current user ID from auth)
            await _activityLogService.LogActivityAsync(
                id, // This should come from authenticated user
                "UpdateUser",
                "User",
                id,
                $"User {user.Username} updated",
                "Success"
            );

            return Ok(new
            {
                message = "User updated successfully",
                user = new
                {
                    id = user.Id,
                    username = user.Username,
                    email = user.Email,
                    role = user.Role,
                    fullName = user.FullName,
                    isActive = user.IsActive
                }
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            // Log activity
            await _activityLogService.LogActivityAsync(
                id, // This should come from authenticated user
                "DeleteUser",
                "User",
                id,
                $"User {user.Username} deleted",
                "Success"
            );

            return Ok(new { message = "User deleted successfully" });
        }
    }

    public class UpdateUserRequest
    {
        public string? Username { get; set; }
        public string? Email { get; set; }
        public string? Role { get; set; }
        public string? FullName { get; set; }
        public bool? IsActive { get; set; }
    }
}
