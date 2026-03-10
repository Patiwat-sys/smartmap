namespace SmartMap.API.Models
{
    public class FileUploadConfig
    {
        public string BasePath { get; set; } = string.Empty;
        public string MapsPath { get; set; } = string.Empty;
        public string VerifySeamsPath { get; set; } = string.Empty;
        public string GeophysicPath { get; set; } = string.Empty;
        public long MaxMapFileSize { get; set; } = 52428800; // 50MB
        public long MaxPhotoFileSize { get; set; } = 10485760; // 10MB
        public long MaxPdfFileSize { get; set; } = 52428800; // 50MB
        public string[] AllowedImageExtensions { get; set; } = Array.Empty<string>();
        public string[] AllowedPdfExtensions { get; set; } = Array.Empty<string>();
    }
}
