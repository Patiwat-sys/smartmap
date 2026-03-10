using Microsoft.AspNetCore.Http;
using SmartMap.API.Models;
using System.Text.RegularExpressions;

namespace SmartMap.API.Services
{
    public class FileUploadService
    {
        private readonly FileUploadConfig _config;
        private readonly ILogger<FileUploadService> _logger;

        public FileUploadService(FileUploadConfig config, ILogger<FileUploadService> logger)
        {
            _config = config;
            _logger = logger;
        }

        /// <summary>
        /// Upload monthly map image file
        /// </summary>
        public async Task<FileUploadResult> UploadMapFileAsync(IFormFile file, int year, int month)
        {
            // Validate file
            var validation = ValidateImageFile(file, _config.MaxMapFileSize);
            if (!validation.IsValid)
            {
                return new FileUploadResult { Success = false, ErrorMessage = validation.ErrorMessage };
            }

            // Create folder structure: uploads/maps/{Year}/{Month}/
            var folderPath = Path.Combine(_config.BasePath, _config.MapsPath, year.ToString(), month.ToString());
            Directory.CreateDirectory(folderPath);

            // Generate filename: GUID + Original Name
            var fileExtension = Path.GetExtension(file.FileName);
            var uniqueFileName = $"{Guid.NewGuid()}_{SanitizeFileName(file.FileName)}";
            var filePath = Path.Combine(folderPath, uniqueFileName);
            var relativePath = Path.Combine(_config.MapsPath, year.ToString(), month.ToString(), uniqueFileName).Replace("\\", "/");

            try
            {
                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                return new FileUploadResult
                {
                    Success = true,
                    FileName = file.FileName,
                    FilePath = relativePath,
                    FullPath = filePath,
                    FileSize = file.Length
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading map file");
                return new FileUploadResult { Success = false, ErrorMessage = "Failed to save file" };
            }
        }

        /// <summary>
        /// Upload verify seam photo
        /// </summary>
        public async Task<FileUploadResult> UploadVerifySeamPhotoAsync(IFormFile file, int verifySeamId)
        {
            // Validate file
            var validation = ValidateImageFile(file, _config.MaxPhotoFileSize);
            if (!validation.IsValid)
            {
                return new FileUploadResult { Success = false, ErrorMessage = validation.ErrorMessage };
            }

            // Create folder structure: uploads/verify-seams/{VerifySeamId}/
            var folderPath = Path.Combine(_config.BasePath, _config.VerifySeamsPath, verifySeamId.ToString());
            Directory.CreateDirectory(folderPath);

            // Generate filename: GUID + Original Name
            var uniqueFileName = $"{Guid.NewGuid()}_{SanitizeFileName(file.FileName)}";
            var filePath = Path.Combine(folderPath, uniqueFileName);
            var relativePath = Path.Combine(_config.VerifySeamsPath, verifySeamId.ToString(), uniqueFileName).Replace("\\", "/");

            try
            {
                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                return new FileUploadResult
                {
                    Success = true,
                    FileName = file.FileName,
                    FilePath = relativePath,
                    FullPath = filePath,
                    FileSize = file.Length
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading verify seam photo");
                return new FileUploadResult { Success = false, ErrorMessage = "Failed to save file" };
            }
        }

        /// <summary>
        /// Upload geophysic PDF file
        /// </summary>
        public async Task<FileUploadResult> UploadGeophysicFileAsync(IFormFile file, string holeName)
        {
            // Validate file
            var validation = ValidatePdfFile(file, _config.MaxPdfFileSize);
            if (!validation.IsValid)
            {
                return new FileUploadResult { Success = false, ErrorMessage = validation.ErrorMessage };
            }

            // Sanitize hole name for folder name
            var sanitizedHoleName = SanitizeFolderName(holeName);

            // Create folder structure: uploads/geophysic/{HoleName}/
            var folderPath = Path.Combine(_config.BasePath, _config.GeophysicPath, sanitizedHoleName);
            Directory.CreateDirectory(folderPath);

            // Generate filename: GUID + Original Name
            var uniqueFileName = $"{Guid.NewGuid()}_{SanitizeFileName(file.FileName)}";
            var filePath = Path.Combine(folderPath, uniqueFileName);
            var relativePath = Path.Combine(_config.GeophysicPath, sanitizedHoleName, uniqueFileName).Replace("\\", "/");

            try
            {
                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                return new FileUploadResult
                {
                    Success = true,
                    FileName = file.FileName,
                    FilePath = relativePath,
                    FullPath = filePath,
                    FileSize = file.Length
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading geophysic file");
                return new FileUploadResult { Success = false, ErrorMessage = "Failed to save file" };
            }
        }

        /// <summary>
        /// Delete file
        /// </summary>
        public bool DeleteFile(string relativePath)
        {
            try
            {
                var fullPath = Path.Combine(_config.BasePath, relativePath);
                if (System.IO.File.Exists(fullPath))
                {
                    System.IO.File.Delete(fullPath);
                    return true;
                }
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting file: {Path}", relativePath);
                return false;
            }
        }

        /// <summary>
        /// Get full file path from relative path
        /// </summary>
        public string GetFullPath(string relativePath)
        {
            return Path.Combine(_config.BasePath, relativePath);
        }

        /// <summary>
        /// Check if file exists
        /// </summary>
        public bool FileExists(string relativePath)
        {
            var fullPath = Path.Combine(_config.BasePath, relativePath);
            return System.IO.File.Exists(fullPath);
        }

        /// <summary>
        /// Validate image file
        /// </summary>
        private (bool IsValid, string ErrorMessage) ValidateImageFile(IFormFile file, long maxSize)
        {
            if (file == null || file.Length == 0)
            {
                return (false, "File is required");
            }

            if (file.Length > maxSize)
            {
                return (false, $"File size exceeds maximum allowed size ({maxSize / 1048576}MB)");
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!_config.AllowedImageExtensions.Contains(extension))
            {
                return (false, $"File type not allowed. Allowed types: {string.Join(", ", _config.AllowedImageExtensions)}");
            }

            // Validate MIME type
            var allowedMimeTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/bmp" };
            if (!allowedMimeTypes.Contains(file.ContentType.ToLowerInvariant()))
            {
                return (false, "Invalid file type");
            }

            return (true, string.Empty);
        }

        /// <summary>
        /// Validate PDF file
        /// </summary>
        private (bool IsValid, string ErrorMessage) ValidatePdfFile(IFormFile file, long maxSize)
        {
            if (file == null || file.Length == 0)
            {
                return (false, "File is required");
            }

            if (file.Length > maxSize)
            {
                return (false, $"File size exceeds maximum allowed size ({maxSize / 1048576}MB)");
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!_config.AllowedPdfExtensions.Contains(extension))
            {
                return (false, $"File type not allowed. Allowed types: {string.Join(", ", _config.AllowedPdfExtensions)}");
            }

            // Validate MIME type
            if (file.ContentType.ToLowerInvariant() != "application/pdf")
            {
                return (false, "File must be a PDF");
            }

            return (true, string.Empty);
        }

        /// <summary>
        /// Sanitize filename to remove dangerous characters
        /// </summary>
        private string SanitizeFileName(string fileName)
        {
            // Remove path separators and dangerous characters
            var sanitized = Regex.Replace(fileName, @"[<>:""/\\|?*]", "_");
            // Limit length
            if (sanitized.Length > 200)
            {
                var extension = Path.GetExtension(sanitized);
                sanitized = sanitized.Substring(0, 200 - extension.Length) + extension;
            }
            return sanitized;
        }

        /// <summary>
        /// Sanitize folder name
        /// </summary>
        private string SanitizeFolderName(string folderName)
        {
            // Remove dangerous characters for folder names
            var sanitized = Regex.Replace(folderName, @"[<>:""/\\|?*]", "_");
            // Limit length
            if (sanitized.Length > 100)
            {
                sanitized = sanitized.Substring(0, 100);
            }
            return sanitized;
        }
    }

    public class FileUploadResult
    {
        public bool Success { get; set; }
        public string? ErrorMessage { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string FullPath { get; set; } = string.Empty;
        public long FileSize { get; set; }
    }
}
