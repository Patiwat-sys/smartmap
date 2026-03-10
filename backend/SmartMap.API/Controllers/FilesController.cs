using Microsoft.AspNetCore.Mvc;
using SmartMap.API.Services;

namespace SmartMap.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FilesController : ControllerBase
    {
        private readonly FileUploadService _fileUploadService;
        private readonly ILogger<FilesController> _logger;

        public FilesController(FileUploadService fileUploadService, ILogger<FilesController> logger)
        {
            _fileUploadService = fileUploadService;
            _logger = logger;
        }

        /// <summary>
        /// Get file by relative path (for direct download or viewing)
        /// Files are also accessible via /files/{relativePath} through Static Files Middleware
        /// </summary>
        [HttpGet("{*relativePath}")]
        public IActionResult GetFile(string relativePath)
        {
            try
            {
                // Security: Prevent path traversal attacks
                if (relativePath.Contains("..") || Path.IsPathRooted(relativePath))
                {
                    return BadRequest(new { message = "Invalid file path" });
                }

                if (!_fileUploadService.FileExists(relativePath))
                {
                    return NotFound(new { message = "File not found" });
                }

                var fullPath = _fileUploadService.GetFullPath(relativePath);
                var fileInfo = new FileInfo(fullPath);

                // Determine content type
                var contentType = GetContentType(fileInfo.Extension);

                return PhysicalFile(fullPath, contentType, fileInfo.Name);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving file: {Path}", relativePath);
                return StatusCode(500, new { message = "Error retrieving file" });
            }
        }

        private string GetContentType(string extension)
        {
            return extension.ToLowerInvariant() switch
            {
                ".pdf" => "application/pdf",
                ".jpg" => "image/jpeg",
                ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".bmp" => "image/bmp",
                _ => "application/octet-stream"
            };
        }
    }
}
