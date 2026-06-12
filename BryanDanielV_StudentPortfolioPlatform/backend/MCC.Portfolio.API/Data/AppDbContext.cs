using Microsoft.EntityFrameworkCore;
using MCC.Portfolio.API.Models;

namespace MCC.Portfolio.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Student> Students { get; set; } = null!;
        public DbSet<Project> Projects { get; set; } = null!;
        public DbSet<Certification> Certifications { get; set; } = null!;
        public DbSet<Publication> Publications { get; set; } = null!;
        public DbSet<Achievement> Achievements { get; set; } = null!;
        public DbSet<CommunityService> CommunityServices { get; set; } = null!;
        public DbSet<MCC.Portfolio.API.Models.Portfolio> Portfolios { get; set; } = null!;
        public DbSet<RecruiterLead> RecruiterLeads { get; set; } = null!;
        public DbSet<PlacementDrive> PlacementDrives { get; set; } = null!;
        public DbSet<StartupIdea> StartupIdeas { get; set; } = null!;
        public DbSet<CampusCircular> CampusCirculars { get; set; } = null!;
        public DbSet<Notification> Notifications { get; set; } = null!;
        public DbSet<JobApplication> JobApplications { get; set; } = null!;
        public DbSet<ConferencePresentation> ConferencePresentations { get; set; } = null!;
        public DbSet<ScienceFairEntry> ScienceFairEntries { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure unique keys
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Student>()
                .HasIndex(s => s.RollNumber)
                .IsUnique();

            modelBuilder.Entity<MCC.Portfolio.API.Models.Portfolio>()
                .HasIndex(p => p.Slug)
                .IsUnique();

            // Configure User <-> Student 1:1 relationship
            modelBuilder.Entity<Student>()
                .HasOne(s => s.User)
                .WithOne(u => u.Student)
                .HasForeignKey<Student>(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Student <-> Portfolio 1:1 relationship
            modelBuilder.Entity<MCC.Portfolio.API.Models.Portfolio>()
                .HasOne(p => p.Student)
                .WithOne(s => s.Portfolio)
                .HasForeignKey<MCC.Portfolio.API.Models.Portfolio>(p => p.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Student <-> RecruiterLeads 1:N relationship
            modelBuilder.Entity<RecruiterLead>()
                .HasOne(r => r.Student)
                .WithMany()
                .HasForeignKey(r => r.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Student <-> StartupIdeas 1:N relationship
            modelBuilder.Entity<StartupIdea>()
                .HasOne(s => s.Student)
                .WithMany()
                .HasForeignKey(s => s.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Student <-> Notifications 1:N relationship
            modelBuilder.Entity<Notification>()
                .HasOne(n => n.Student)
                .WithMany()
                .HasForeignKey(n => n.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Student <-> JobApplications 1:N relationship
            modelBuilder.Entity<JobApplication>()
                .HasOne(ja => ja.Student)
                .WithMany()
                .HasForeignKey(ja => ja.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure PlacementDrive <-> JobApplications 1:N relationship
            modelBuilder.Entity<JobApplication>()
                .HasOne(ja => ja.PlacementDrive)
                .WithMany()
                .HasForeignKey(ja => ja.PlacementDriveId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Student <-> ConferencePresentations 1:N relationship
            modelBuilder.Entity<ConferencePresentation>()
                .HasOne(c => c.Student)
                .WithMany(s => s.ConferencePresentations)
                .HasForeignKey(c => c.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Student <-> ScienceFairEntries 1:N relationship
            modelBuilder.Entity<ScienceFairEntry>()
                .HasOne(sf => sf.Student)
                .WithMany(s => s.ScienceFairEntries)
                .HasForeignKey(sf => sf.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
