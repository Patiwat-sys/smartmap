using Microsoft.AspNetCore.Mvc;
using SmartMap.API.Models;

namespace SmartMap.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LocationPinsController : ControllerBase
    {
        // Temporary mock data - will be replaced with database
        private static List<LocationPin> _pins = new List<LocationPin>
        {
            new LocationPin { Id = 1, Title = "Bangkok", Description = "Capital of Thailand", Latitude = 13.7563, Longitude = 100.5018, UserId = 1, CreatedAt = DateTime.Now },
            new LocationPin { Id = 2, Title = "Chiang Mai", Description = "Northern city", Latitude = 18.7883, Longitude = 98.9853, UserId = 1, CreatedAt = DateTime.Now }
        };

        [HttpGet]
        public IActionResult GetLocationPins()
        {
            return Ok(_pins);
        }

        [HttpGet("{id}")]
        public IActionResult GetLocationPin(int id)
        {
            var pin = _pins.FirstOrDefault(p => p.Id == id);
            if (pin == null)
            {
                return NotFound();
            }
            return Ok(pin);
        }

        [HttpPost]
        public IActionResult CreateLocationPin([FromBody] CreateLocationPinRequest request)
        {
            var newPin = new LocationPin
            {
                Id = _pins.Count + 1,
                Title = request.Title,
                Description = request.Description,
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                UserId = request.UserId,
                CreatedAt = DateTime.Now
            };

            _pins.Add(newPin);
            return Ok(newPin);
        }

        [HttpPut("{id}")]
        public IActionResult UpdateLocationPin(int id, [FromBody] UpdateLocationPinRequest request)
        {
            var pin = _pins.FirstOrDefault(p => p.Id == id);
            if (pin == null)
            {
                return NotFound();
            }

            pin.Title = request.Title ?? pin.Title;
            pin.Description = request.Description ?? pin.Description;
            pin.Latitude = request.Latitude ?? pin.Latitude;
            pin.Longitude = request.Longitude ?? pin.Longitude;

            return Ok(pin);
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteLocationPin(int id)
        {
            var pin = _pins.FirstOrDefault(p => p.Id == id);
            if (pin == null)
            {
                return NotFound();
            }

            _pins.Remove(pin);
            return Ok(new { message = "Location pin deleted successfully" });
        }
    }

    public class CreateLocationPinRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public int UserId { get; set; }
    }

    public class UpdateLocationPinRequest
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
    }
}
