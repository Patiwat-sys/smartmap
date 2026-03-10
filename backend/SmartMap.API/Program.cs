using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using SmartMap.API.Data;
using SmartMap.API.Models;
using SmartMap.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

// Add SQL Server connection
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add HttpContextAccessor for ActivityLogService
builder.Services.AddHttpContextAccessor();

// Configure FileUpload settings
var fileUploadConfig = builder.Configuration.GetSection("FileUpload").Get<FileUploadConfig>() 
    ?? new FileUploadConfig 
    { 
        BasePath = "C:\\SmartMapFiles",
        MapsPath = "uploads/maps",
        VerifySeamsPath = "uploads/verify-seams",
        GeophysicPath = "uploads/geophysic"
    };

builder.Services.AddSingleton(fileUploadConfig);

// Add Services
builder.Services.AddScoped<ActivityLogService>();
builder.Services.AddScoped<FileUploadService>();

var app = builder.Build();

// Configure the HTTP request pipeline.

// Enable CORS - must be before UseHttpsRedirection
app.UseCors("AllowReactApp");

// Serve static files from uploads folder
var fileProvider = new PhysicalFileProvider(fileUploadConfig.BasePath);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = fileProvider,
    RequestPath = "/files",
    OnPrepareResponse = ctx =>
    {
        // Add cache headers
        ctx.Context.Response.Headers.Append("Cache-Control", "public,max-age=3600");
    }
});

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
