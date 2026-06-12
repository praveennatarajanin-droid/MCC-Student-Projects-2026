using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MccPortfolio.Api.Data;
using MccPortfolio.Api.Services;
using MccPortfolio.Api.Entities;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Configure EF Core with PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Configure JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "SuperSecretKeyForMccPortfolioPlatform123!";
var key = Encoding.ASCII.GetBytes(jwtKey);
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
        ValidateIssuer = false,
        ValidateAudience = false,
        ClockSkew = TimeSpan.Zero
    };
});

// Register Custom Services
builder.Services.AddScoped<IAISuggestionService, AISuggestionService>();
builder.Services.AddScoped<IFileStorageService, FileStorageService>();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Ensure seeded Super Admin name is updated in the database and official MCC departments exist
using (var scope = app.Services.CreateScope())
{
    try
    {
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var seededAdmin = context.Users.FirstOrDefault(u => u.Email == "admin@mcc.edu" && u.Name == "Dr. Paul Wilson");
        if (seededAdmin != null)
        {
            seededAdmin.Name = "Super Admin";
            context.SaveChanges();
        }

        // Seeding official MCC Departments if not present
        var mccId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var officialDepartments = new (string Name, string Code, Guid Id)[]
        {
            ("Computer Science", "CS", Guid.Parse("22222222-2222-2222-2222-222222222222")),
            ("Commerce", "COM", Guid.Parse("22222222-2222-2222-2222-333333333333")),
            ("Chemistry", "CHEM", Guid.Parse("22222222-2222-2222-2222-444444444444")),
            ("History", "HIST", Guid.Parse("22222222-2222-2222-2222-555555555555")),
            ("Political Science", "POL", Guid.Parse("22222222-2222-2222-2222-666666666666")),
            ("Economics", "ECO", Guid.Parse("22222222-2222-2222-2222-777777777777")),
            ("Philosophy", "PHIL", Guid.Parse("22222222-2222-2222-2222-888888888888")),
            ("Tamil", "TAM", Guid.Parse("22222222-2222-2222-2222-999999999999")),
            ("English", "ENG", Guid.Parse("22222222-2222-2222-2222-aaaaaaaaaaaa")),
            ("Mathematics", "MATH", Guid.Parse("22222222-2222-2222-2222-bbbbbbbbbbbb")),
            ("Statistics", "STAT", Guid.Parse("22222222-2222-2222-2222-cccccccccccc")),
            ("Physics", "PHYS", Guid.Parse("22222222-2222-2222-2222-dddddddddddd")),
            ("Plant Biology and Plant Biotechnology", "PB", Guid.Parse("22222222-2222-2222-2222-eeeeeeeeeeee")),
            ("Zoology", "ZOO", Guid.Parse("22222222-2222-2222-2222-ffffffffffff")),
            ("Social Work", "SW", Guid.Parse("22222222-2222-2222-3333-111111111111")),
            ("Journalism", "JOUR", Guid.Parse("22222222-2222-2222-3333-222222222222")),
            ("Business Administration", "BBA", Guid.Parse("22222222-2222-2222-3333-333333333333")),
            ("Computer Applications", "CA", Guid.Parse("22222222-2222-2222-3333-444444444444")),
            ("Microbiology", "MICRO", Guid.Parse("22222222-2222-2222-3333-555555555555")),
            ("Visual Communication", "VISCOM", Guid.Parse("22222222-2222-2222-3333-666666666666")),
            ("Physical Education", "PE", Guid.Parse("22222222-2222-2222-3333-777777777777")),
            ("Psychology", "PSY", Guid.Parse("22222222-2222-2222-3333-888888888888")),
            ("Geography, Tourism and Travel Management", "GEO", Guid.Parse("22222222-2222-2222-3333-999999999999")),
            ("Data Science", "DS", Guid.Parse("22222222-2222-2222-3333-aaaaaaaaaaaa")),
            ("Public Administration", "PA", Guid.Parse("22222222-2222-2222-3333-bbbbbbbbbbbb")),
            ("Tourism Studies", "TS", Guid.Parse("22222222-2222-2222-3333-cccccccccccc"))
        };

        bool anyAdded = false;
        foreach (var dept in officialDepartments)
        {
            var exists = context.Departments.Any(d => d.Id == dept.Id || d.Name == dept.Name);
            if (!exists)
            {
                context.Departments.Add(new Department
                {
                    Id = dept.Id,
                    Name = dept.Name,
                    Code = dept.Code,
                    InstitutionId = mccId
                });
                anyAdded = true;
            }
        }
        if (anyAdded)
        {
            context.SaveChanges();
            Console.WriteLine("Successfully seeded missing official MCC departments on startup.");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error running startup seed update: {ex.Message}");
    }
}

// Ensure wwwroot folder exists for uploads
var wwwrootPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot");
if (!Directory.Exists(wwwrootPath))
{
    Directory.CreateDirectory(wwwrootPath);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseStaticFiles(); // Serves items in wwwroot/ (resumes, research papers)

// Global exception handler - returns JSON instead of HTML for uncaught exceptions
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new { message = "An internal server error occurred. Please try again." });
    });
});

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

