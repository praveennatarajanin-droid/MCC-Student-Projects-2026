using Microsoft.EntityFrameworkCore;
using StudentPortfolio.API.Models;

namespace StudentPortfolio.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<StudentProfile> StudentProfiles { get; set; } = null!;
        public DbSet<Project> Projects { get; set; } = null!;
        public DbSet<Certification> Certifications { get; set; } = null!;
        public DbSet<ResearchPaper> ResearchPapers { get; set; } = null!;
        public DbSet<Achievement> Achievements { get; set; } = null!;
        public DbSet<Hackathon> Hackathons { get; set; } = null!;
        public DbSet<CommunityService> CommunityServices { get; set; } = null!;
        public DbSet<CreativeWork> CreativeWorks { get; set; } = null!;
        public DbSet<Notification> Notifications { get; set; } = null!;
        public DbSet<Institution> Institutions { get; set; } = null!;
        public DbSet<ThemeConfig> ThemeConfigs { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure foreign key relations
            modelBuilder.Entity<StudentProfile>()
                .HasOne(sp => sp.User)
                .WithMany()
                .HasForeignKey(sp => sp.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Project>()
                .HasOne<StudentProfile>()
                .WithMany(sp => sp.Projects)
                .HasForeignKey(p => p.ProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Certification>()
                .HasOne<StudentProfile>()
                .WithMany(sp => sp.Certifications)
                .HasForeignKey(c => c.ProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ResearchPaper>()
                .HasOne<StudentProfile>()
                .WithMany(sp => sp.ResearchPapers)
                .HasForeignKey(rp => rp.ProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Achievement>()
                .HasOne<StudentProfile>()
                .WithMany(sp => sp.Achievements)
                .HasForeignKey(a => a.ProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Hackathon>()
                .HasOne<StudentProfile>()
                .WithMany(sp => sp.Hackathons)
                .HasForeignKey(h => h.ProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CommunityService>()
                .HasOne<StudentProfile>()
                .WithMany(sp => sp.CommunityServices)
                .HasForeignKey(cs => cs.ProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CreativeWork>()
                .HasOne<StudentProfile>()
                .WithMany(sp => sp.CreativeWorks)
                .HasForeignKey(cw => cw.ProfileId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
