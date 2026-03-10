using BCrypt.Net;

namespace SmartMap.API.Services
{
    public class PasswordService
    {
        /// <summary>
        /// Hash password using BCrypt
        /// </summary>
        /// <param name="password">Plain text password</param>
        /// <returns>Hashed password</returns>
        public static string HashPassword(string password)
        {
            // BCrypt automatically generates a salt and includes it in the hash
            // Work factor of 12 is a good balance between security and performance
            return BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
        }

        /// <summary>
        /// Verify password against hash
        /// </summary>
        /// <param name="password">Plain text password to verify</param>
        /// <param name="hash">Hashed password from database</param>
        /// <returns>True if password matches, false otherwise</returns>
        public static bool VerifyPassword(string password, string hash)
        {
            try
            {
                return BCrypt.Net.BCrypt.Verify(password, hash);
            }
            catch
            {
                // If hash is invalid or password doesn't match
                return false;
            }
        }

        /// <summary>
        /// Check if a password string is already hashed
        /// BCrypt hashes start with $2a$, $2b$, or $2y$
        /// </summary>
        /// <param name="password">Password string to check</param>
        /// <returns>True if already hashed, false if plain text</returns>
        public static bool IsPasswordHashed(string password)
        {
            return password.StartsWith("$2a$") || 
                   password.StartsWith("$2b$") || 
                   password.StartsWith("$2y$");
        }
    }
}
