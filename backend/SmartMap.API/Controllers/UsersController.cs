using Microsoft.AspNetCore.Mvc;
using SmartMap.API.Models;

namespace SmartMap.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        // Temporary mock data - will be replaced with database
        private static List<User> _users = new List<User>
        {
            new User { Id = 1, Username = "admin", Email = "admin@smartmap.com", Password = "admin123", Role = "Admin", CreatedAt = DateTime.Now, IsActive = true },
            new User { Id = 2, Username = "user", Email = "user@smartmap.com", Password = "user123", Role = "User", CreatedAt = DateTime.Now, IsActive = true }
        };

        [HttpGet]
        public IActionResult GetUsers()
        {
            var users = _users.Select(u => new
            {
                id = u.Id,
                username = u.Username,
                email = u.Email,
                role = u.Role,
                createdAt = u.CreatedAt,
                isActive = u.IsActive
            }).ToList();

            return Ok(users);
        }

        [HttpGet("{id}")]
        public IActionResult GetUser(int id)
        {
            var user = _users.FirstOrDefault(u => u.Id == id);
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
                createdAt = user.CreatedAt,
                isActive = user.IsActive
            });
        }

        [HttpPut("{id}")]
        public IActionResult UpdateUser(int id, [FromBody] UpdateUserRequest request)
        {
            var user = _users.FirstOrDefault(u => u.Id == id);
            if (user == null)
            {
                return NotFound();
            }

            user.Username = request.Username ?? user.Username;
            user.Email = request.Email ?? user.Email;
            user.Role = request.Role ?? user.Role;
            user.IsActive = request.IsActive ?? user.IsActive;

            return Ok(new
            {
                message = "User updated successfully",
                user = new
                {
                    id = user.Id,
                    username = user.Username,
                    email = user.Email,
                    role = user.Role,
                    isActive = user.IsActive
                }
            });
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteUser(int id)
        {
            var user = _users.FirstOrDefault(u => u.Id == id);
            if (user == null)
            {
                return NotFound();
            }

            _users.Remove(user);
            return Ok(new { message = "User deleted successfully" });
        }
    }

    public class UpdateUserRequest
    {
        public string? Username { get; set; }
        public string? Email { get; set; }
        public string? Role { get; set; }
        public bool? IsActive { get; set; }
    }
}
