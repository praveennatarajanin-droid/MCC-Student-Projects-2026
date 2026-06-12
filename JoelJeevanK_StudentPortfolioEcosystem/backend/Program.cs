using Microsoft.EntityFrameworkCore;
using MccPortfolioBackend.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Database connection
builder.Services.AddDbContext<MccDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
           .ConfigureWarnings(warnings => warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning)));

// CORS setup
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// JWT Authentication Setup
var jwtKey = builder.Configuration["Jwt:Key"] ?? "MadrasChristianCollegePortfolioManagementSystemSuperSecretKey123!";
var key = Encoding.UTF8.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowFrontend");

// Ensure upload directories exist
var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot", "uploads");
var profilesPath = Path.Combine(uploadsPath, "profiles");
var certsPath = Path.Combine(uploadsPath, "certifications");
var projectsPath = Path.Combine(uploadsPath, "projects");
var researchPath = Path.Combine(uploadsPath, "researchinnovations");

if (!Directory.Exists(uploadsPath)) Directory.CreateDirectory(uploadsPath);
if (!Directory.Exists(profilesPath)) Directory.CreateDirectory(profilesPath);
if (!Directory.Exists(certsPath)) Directory.CreateDirectory(certsPath);
if (!Directory.Exists(projectsPath)) Directory.CreateDirectory(projectsPath);
if (!Directory.Exists(researchPath)) Directory.CreateDirectory(researchPath);

app.UseStaticFiles(); // Serve files from wwwroot/

// Seed database with Admin credentials
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<MccDbContext>();
    context.Database.Migrate();

    // Seed database with default departments
    if (!context.Departments.Any())
    {
        var defaultDepartments = new List<string>
        {
            "Computer Science",
            "Computer Applications (BCA)",
            "Commerce (B.Com)",
            "Business Administration (BBA)",
            "Chemistry",
            "Physics",
            "Mathematics",
            "English Literature",
            "Economics",
            "History",
            "Visual Communication"
        };
        foreach (var name in defaultDepartments)
        {
            context.Departments.Add(new MccPortfolioBackend.Models.Department { Name = name });
        }
        context.SaveChanges();
    }

    var adminEmail = "admin@mcc.edu.in";
    if (!context.Users.Any(u => u.Email.ToLower() == adminEmail.ToLower()))
    {
        var admin = new MccPortfolioBackend.Models.User
        {
            Name = "MCC Admin",
            Email = adminEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@1234"),
            Gender = "Male",
            Department = "Administration",
            Role = "Admin",
            Username = "admin",
            IsApproved = true,
            Title = "Administrator",
            Phone = "1234567890"
        };
        context.Users.Add(admin);
        context.SaveChanges();
    }
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
