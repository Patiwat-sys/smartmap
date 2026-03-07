using Microsoft.AspNetCore.Mvc;
using SmartMap.API.Models;

namespace SmartMap.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        // Temporary mock data - will be replaced with database
        private static List<User> _users = new List<User>
        {
            new User { Id = 1, Username = "admin", Email = "admin@smartmap.com", Password = "admin123", Role = "Admin" },
            new User { Id = 2, Username = "user", Email = "user@smartmap.com", Password = "user123", Role = "User" }
        };

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var user = _users.FirstOrDefault(u => 
                (u.Username == request.Username || u.Email == request.Username) && 
                u.Password == request.Password);

            if (user == null)
            {
                return Unauthorized(new { message = "Invalid username or password" });
            }

            if (!user.IsActive)
            {
                return Unauthorized(new { message = "Account is inactive" });
            }

            return Ok(new
            {
                token = "mock-jwt-token", // Will implement JWT later
                user = new
                {
                    id = user.Id,
                    username = user.Username,
                    email = user.Email,
                    role = user.Role
                }
            });
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequest request)
        {
            if (_users.Any(u => u.Username == request.Username || u.Email == request.Email))
            {
                return BadRequest(new { message = "Username or email already exists" });
            }

            var newUser = new User
            {
                Id = _users.Count + 1,
                Username = request.Username,
                Email = request.Email,
                Password = request.Password,
                Role = "User",
                CreatedAt = DateTime.Now,
                IsActive = true
            };

            _users.Add(newUser);

            return Ok(new
            {
                message = "User registered successfully",
                user = new
                {
                    id = newUser.Id,
                    username = newUser.Username,
                    email = newUser.Email,
                    role = newUser.Role
                }
            });
        }
    }

    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
