using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartMap.API.Data;
using SmartMap.API.Models;
using SmartMap.API.Services;

namespace SmartMap.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ActivityLogService _activityLogService;

        public AuthController(ApplicationDbContext context, ActivityLogService activityLogService)
        {
            _context = context;
            _activityLogService = activityLogService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.Username == request.Username || u.Email == request.Username);

            if (user == null)
            {
                return Unauthorized(new { message = "Invalid username or password" });
            }

            if (!user.IsActive)
            {
                return Unauthorized(new { message = "Account is inactive" });
            }

            // Verify password - handle both hashed and plain text (for migration)
            bool passwordValid = false;
            if (PasswordService.IsPasswordHashed(user.Password))
            {
                // Password is hashed, verify using BCrypt
                passwordValid = PasswordService.VerifyPassword(request.Password, user.Password);
            }
            else
            {
                // Password is plain text (legacy), compare directly
                // This allows migration period where some passwords might still be plain text
                passwordValid = user.Password == request.Password;
                
                // Auto-upgrade: If password matches and is plain text, hash it
                if (passwordValid)
                {
                    user.Password = PasswordService.HashPassword(request.Password);
                    await _context.SaveChangesAsync();
                }
            }

            if (!passwordValid)
            {
                await _activityLogService.LogActivityAsync(
                    user.Id,
                    "Login",
                    null,
                    null,
                    $"Failed login attempt for {request.Username}",
                    "Failed"
                );
                return Unauthorized(new { message = "Invalid username or password" });
            }

            // Update last login
            user.LastLoginAt = DateTime.Now;
            await _context.SaveChangesAsync();

            // Log activity
            await _activityLogService.LogActivityAsync(
                user.Id,
                "Login",
                null,
                null,
                $"User {user.Username} logged in",
                "Success"
            );

            return Ok(new
            {
                token = "mock-jwt-token", // Will implement JWT later
                user = new
                {
                    id = user.Id,
                    username = user.Username,
                    email = user.Email,
                    role = user.Role,
                    fullName = user.FullName
                }
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Username == request.Username || u.Email == request.Email))
            {
                return BadRequest(new { message = "Username or email already exists" });
            }

            // Validate password strength (optional)
            if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
            {
                return BadRequest(new { message = "Password must be at least 6 characters long" });
            }

            // Hash password before saving
            var hashedPassword = PasswordService.HashPassword(request.Password);

            var newUser = new User
            {
                Username = request.Username,
                Email = request.Email,
                Password = hashedPassword, // Store hashed password
                Role = "User",
                CreatedAt = DateTime.Now,
                IsActive = true
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            // Log activity
            await _activityLogService.LogActivityAsync(
                newUser.Id,
                "Register",
                "User",
                newUser.Id,
                $"New user registered: {newUser.Username}",
                "Success"
            );

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
