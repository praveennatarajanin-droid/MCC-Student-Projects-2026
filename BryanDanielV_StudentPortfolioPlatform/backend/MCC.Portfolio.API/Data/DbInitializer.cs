using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using MCC.Portfolio.API.Models;

namespace MCC.Portfolio.API.Data
{
    public static class DbInitializer
    {
        public static void Initialize(AppDbContext context)
        {
            // Only run EnsureCreated, do NOT run EnsureDeleted to avoid deleting existing accounts!
            context.Database.EnsureCreated();

            // Run raw ALTER TABLE and CREATE TABLE sql commands to dynamically update the schema if it doesn't exist
            try
            {
                context.Database.ExecuteSqlRaw(@"
                    ALTER TABLE ""Achievements"" ADD COLUMN IF NOT EXISTS ""IsVerified"" boolean DEFAULT false;
                    ALTER TABLE ""Achievements"" ADD COLUMN IF NOT EXISTS ""VerificationRemarks"" text DEFAULT '';
                    ALTER TABLE ""Achievements"" ADD COLUMN IF NOT EXISTS ""VerifiedBy"" text DEFAULT '';

                    ALTER TABLE ""CommunityServices"" ADD COLUMN IF NOT EXISTS ""IsVerified"" boolean DEFAULT false;
                    ALTER TABLE ""CommunityServices"" ADD COLUMN IF NOT EXISTS ""VerificationRemarks"" text DEFAULT '';
                    ALTER TABLE ""CommunityServices"" ADD COLUMN IF NOT EXISTS ""VerifiedBy"" text DEFAULT '';

                    ALTER TABLE ""Publications"" ADD COLUMN IF NOT EXISTS ""PublicationType"" character varying(50) NOT NULL DEFAULT 'Journal';
                    ALTER TABLE ""Publications"" ADD COLUMN IF NOT EXISTS ""DoiOrIsbn"" character varying(100) NOT NULL DEFAULT '';

                    ALTER TABLE ""Projects"" ADD COLUMN IF NOT EXISTS ""ProjectType"" character varying(50) NOT NULL DEFAULT 'Technical';
                    ALTER TABLE ""Projects"" ADD COLUMN IF NOT EXISTS ""DemoVideoUrl"" character varying(500) NOT NULL DEFAULT '';

                    ALTER TABLE ""StartupIdeas"" ADD COLUMN IF NOT EXISTS ""FundingAsk"" character varying(200) NOT NULL DEFAULT '';
                    ALTER TABLE ""StartupIdeas"" ADD COLUMN IF NOT EXISTS ""MentorName"" character varying(200) NOT NULL DEFAULT '';
                    ALTER TABLE ""StartupIdeas"" ADD COLUMN IF NOT EXISTS ""PitchDeckUrl"" character varying(500) NOT NULL DEFAULT '';

                    CREATE TABLE IF NOT EXISTS ""ConferencePresentations"" (
                        ""Id"" uuid NOT NULL CONSTRAINT ""PK_ConferencePresentations"" PRIMARY KEY,
                        ""StudentId"" uuid NOT NULL,
                        ""Title"" character varying(300) NOT NULL,
                        ""ConferenceName"" character varying(300) NOT NULL,
                        ""Role"" character varying(100) NOT NULL DEFAULT 'Presenter',
                        ""Location"" character varying(200) NOT NULL DEFAULT '',
                        ""PresentationDate"" timestamp with time zone NOT NULL,
                        ""AbstractUrl"" character varying(2000) NOT NULL DEFAULT '',
                        ""CertificateUrl"" character varying(2000) NOT NULL DEFAULT '',
                        ""IsVerified"" boolean NOT NULL DEFAULT false,
                        ""VerificationRemarks"" character varying(1000) NOT NULL DEFAULT '',
                        ""VerifiedBy"" character varying(200) NOT NULL DEFAULT '',
                        ""CreatedAt"" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        CONSTRAINT ""FK_ConferencePresentations_Students_StudentId"" FOREIGN KEY (""StudentId"") REFERENCES ""Students"" (""Id"") ON DELETE CASCADE
                    );

                    CREATE TABLE IF NOT EXISTS ""ScienceFairEntries"" (
                        ""Id"" uuid NOT NULL CONSTRAINT ""PK_ScienceFairEntries"" PRIMARY KEY,
                        ""StudentId"" uuid NOT NULL,
                        ""FairName"" character varying(300) NOT NULL,
                        ""ProjectTitle"" character varying(300) NOT NULL,
                        ""Description"" character varying(1000) NOT NULL DEFAULT '',
                        ""Level"" character varying(50) NOT NULL DEFAULT 'School',
                        ""AwardReceived"" character varying(300) NOT NULL DEFAULT '',
                        ""FairDate"" timestamp with time zone NOT NULL,
                        ""CertificateUrl"" character varying(2000) NOT NULL DEFAULT '',
                        ""IsVerified"" boolean NOT NULL DEFAULT false,
                        ""VerificationRemarks"" character varying(1000) NOT NULL DEFAULT '',
                        ""VerifiedBy"" character varying(200) NOT NULL DEFAULT '',
                        ""CreatedAt"" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        CONSTRAINT ""FK_ScienceFairEntries_Students_StudentId"" FOREIGN KEY (""StudentId"") REFERENCES ""Students"" (""Id"") ON DELETE CASCADE
                    );
                ");
            }
            catch (Exception ex)
            {
                Console.WriteLine("Schema update warning: " + ex.Message);
            }

            if (!context.Users.Any())
            {
                // ─────────────────────────────────────────────────────────────
                // COORDINATOR / ADMIN ACCOUNTS
                // ─────────────────────────────────────────────────────────────
                var adminUser = new User
                {
                    Id = Guid.NewGuid(),
                    Email = "admin@mcc.edu.in",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                    Role = "Admin",
                    FirstName = "System",
                    LastName = "Administrator",
                    Department = "Administration",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                var placementUser = new User
                {
                    Id = Guid.NewGuid(),
                    Email = "placement@mcc.edu.in",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                    Role = "PlacementCoordinator",
                    FirstName = "Sandra",
                    LastName = "Joseph",
                    Department = "Placement Cell",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                var researchUser = new User
                {
                    Id = Guid.NewGuid(),
                    Email = "research@mcc.edu.in",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                    Role = "ResearchCoordinator",
                    FirstName = "Franklin",
                    LastName = "Raj",
                    Department = "Computer Applications (MCA)",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                var innovationUser = new User
                {
                    Id = Guid.NewGuid(),
                    Email = "innovation@mcc.edu.in",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                    Role = "InnovationCoordinator",
                    FirstName = "Latha",
                    LastName = "Krishnan",
                    Department = "Business Administration (MBA)",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                var studentAffairsUser = new User
                {
                    Id = Guid.NewGuid(),
                    Email = "studentaffairs@mcc.edu.in",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                    Role = "StudentAffairsCoordinator",
                    FirstName = "Michael",
                    LastName = "Vasanth",
                    Department = "Student Affairs",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                // ─────────────────────────────────────────────────────────────
                // 10 STUDENT USER ACCOUNTS  (password: password123)
                // ─────────────────────────────────────────────────────────────
                var su1  = new User { Id = Guid.NewGuid(), Email = "student01@mcc.edu.in", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Student", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
                var su2  = new User { Id = Guid.NewGuid(), Email = "student02@mcc.edu.in", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Student", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
                var su3  = new User { Id = Guid.NewGuid(), Email = "student03@mcc.edu.in", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Student", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
                var su4  = new User { Id = Guid.NewGuid(), Email = "student04@mcc.edu.in", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Student", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
                var su5  = new User { Id = Guid.NewGuid(), Email = "student05@mcc.edu.in", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Student", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
                var su6  = new User { Id = Guid.NewGuid(), Email = "student06@mcc.edu.in", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Student", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
                var su7  = new User { Id = Guid.NewGuid(), Email = "student07@mcc.edu.in", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Student", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
                var su8  = new User { Id = Guid.NewGuid(), Email = "student08@mcc.edu.in", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Student", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
                var su9  = new User { Id = Guid.NewGuid(), Email = "student09@mcc.edu.in", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Student", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
                var su10 = new User { Id = Guid.NewGuid(), Email = "student10@mcc.edu.in", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Student", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };

                context.Users.AddRange(adminUser, placementUser, researchUser, innovationUser, studentAffairsUser,
                    su1, su2, su3, su4, su5, su6, su7, su8, su9, su10);
                context.SaveChanges();

                // ─────────────────────────────────────────────────────────────
                // STUDENT 1 — Bryan Manuel  (MCA | Full-Stack & AI)
                // ─────────────────────────────────────────────────────────────
                var s1 = new Student
                {
                    Id = Guid.NewGuid(), UserId = su1.Id,
                    RollNumber = "24-MCA-001", FirstName = "Bryan", LastName = "Manuel",
                    Department = "Computer Applications (MCA)", BatchYear = "2024-2026",
                    Bio = "Aspiring Full-Stack Engineer & AI Specialist. Passionate about institutional digital transformation and software craftsmanship.",
                    AvatarUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
                    Cgpa = 8.95, GithubUsername = "bryan-manuel", BehanceUsername = "bryandesign"
                };
                context.Students.Add(s1); context.SaveChanges();

                context.Portfolios.Add(new MCC.Portfolio.API.Models.Portfolio
                {
                    Id = Guid.NewGuid(), StudentId = s1.Id, Slug = "bryan-manuel", IsPublic = true, IsApproved = true,
                    LayoutSettingsJson = "{\"theme\":\"futuristic\",\"visibleSections\":[\"about\",\"projects\",\"publications\",\"certifications\",\"achievements\",\"community\"]}",
                    StatementOfPurpose = "My objective is to leverage AI and modern web engineering paradigms to build scalable, resilient enterprise architectures that solve real-world problems.",
                    StoryTitle = "My Journey into Tech",
                    StoryContent = "It started with a simple line of code in high school which evolved into a burning passion for full-stack development. Today I build platforms for the MCC ecosystem."
                });
                context.Projects.AddRange(
                    new Project { Id = Guid.NewGuid(), StudentId = s1.Id, Title = "MCC Student Portfolio Ecosystem", Description = "An AI-powered digital registry showcasing student achievements, research publications, and resume profiling for institutional use.", TechnologiesUsed = "Next.js,React,C#,ASP.NET Core,SQLite", GithubUrl = "https://github.com/bryan-manuel/mcc-portfolio", LiveUrl = "https://mcc-portfolio.edu", ImageUrl = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=300", CreatedAt = DateTime.UtcNow.AddDays(-30) },
                    new Project { Id = Guid.NewGuid(), StudentId = s1.Id, Title = "AI-Driven Placement Predictor", Description = "A machine learning utility predicting student placement probability using historical academic CGPA and mock interview metrics.", TechnologiesUsed = "Python,Scikit-Learn,FastAPI,React", GithubUrl = "https://github.com/bryan-manuel/placement-predictor", LiveUrl = "", ImageUrl = "https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&q=80&w=300", CreatedAt = DateTime.UtcNow.AddDays(-60) },
                    new Project { Id = Guid.NewGuid(), StudentId = s1.Id, Title = "Blockchain Credential Vault", Description = "A decentralised credential system storing verifiable student certificates on a private Ethereum testnet using Solidity smart contracts.", TechnologiesUsed = "Solidity,Hardhat,Next.js,IPFS", GithubUrl = "https://github.com/bryan-manuel/cred-vault", LiveUrl = "", ImageUrl = "https://images.unsplash.com/photo-1644361566696-3d442b5b482a?auto=format&fit=crop&q=80&w=300", CreatedAt = DateTime.UtcNow.AddDays(-90) }
                );
                context.Certifications.AddRange(
                    new Certification { Id = Guid.NewGuid(), StudentId = s1.Id, Name = "AWS Certified Developer – Associate", IssuingOrganization = "Amazon Web Services", IssueDate = new DateTime(2025, 3, 15, 0, 0, 0, DateTimeKind.Utc), CredentialId = "AWS-CDA-10293", CredentialUrl = "https://aws.amazon.com/verification" },
                    new Certification { Id = Guid.NewGuid(), StudentId = s1.Id, Name = "Meta Front-End Developer Professional Certificate", IssuingOrganization = "Meta / Coursera", IssueDate = new DateTime(2024, 8, 22, 0, 0, 0, DateTimeKind.Utc), CredentialId = "META-FED-93820", CredentialUrl = "https://coursera.org/verify/meta-fed" }
                );
                context.Publications.Add(new Publication { Id = Guid.NewGuid(), StudentId = s1.Id, Title = "AI-Enhanced Resume Scoring Systems: A Comparative Study", JournalOrConference = "International Journal of Computer Sciences & Engineering", PublishDate = new DateTime(2025, 1, 10, 0, 0, 0, DateTimeKind.Utc), PaperUrl = "https://arxiv.org/abs/2501.10293", Abstract = "This paper details an NLP approach to scoring student resume relevance against industry-standard job descriptions using cosine similarity of embedding vectors.", Authors = "Bryan Manuel, Dr. Franklin Raj" });
                context.Achievements.AddRange(
                    new Achievement { Id = Guid.NewGuid(), StudentId = s1.Id, Title = "1st Place – Inter-College Hackathon 2025", Description = "Won first prize for designing a decentralised student credential vault using blockchain stubs.", DateEarned = new DateTime(2025, 2, 20, 0, 0, 0, DateTimeKind.Utc), Category = "Hackathon" },
                    new Achievement { Id = Guid.NewGuid(), StudentId = s1.Id, Title = "College Sports Day – 100m Track Gold", Description = "Secured first position in the athletic 100-meter sprint representing Computer Applications.", DateEarned = new DateTime(2024, 12, 10, 0, 0, 0, DateTimeKind.Utc), Category = "Sports" }
                );
                context.CommunityServices.Add(new CommunityService { Id = Guid.NewGuid(), StudentId = s1.Id, Organization = "MCC NSS Unit II", Role = "Student Volunteer Coordinator", Description = "Coordinated a team of 40 students during a 3-day beach cleanup and conservation campaign in Chennai.", StartDate = new DateTime(2024, 6, 1, 0, 0, 0, DateTimeKind.Utc), EndDate = new DateTime(2024, 6, 3, 0, 0, 0, DateTimeKind.Utc) });
                context.StartupIdeas.Add(new StartupIdea { Id = Guid.NewGuid(), StudentId = s1.Id, Title = "MCC Eco-Campus Hub", Description = "A student-led platform to exchange textbooks, coordinate carpooling, and track eco-credits generated from recycling plastic on campus.", TeamMembers = "Bryan Manuel, Sandra Joseph", Stage = "Prototype", Status = "Review", CreatedAt = DateTime.UtcNow.AddDays(-5) });
                context.Notifications.AddRange(
                    new Notification { Id = Guid.NewGuid(), StudentId = s1.Id, Title = "Welcome to MCC Portfolio Builder", Message = "Your digital portfolio is active! Explore themes, fill out your achievements, and set up your dynamic custom layout.", IsRead = true, Type = "System", Link = "/dashboard/student", CreatedAt = DateTime.UtcNow.AddDays(-3) },
                    new Notification { Id = Guid.NewGuid(), StudentId = s1.Id, Title = "Startup Pitch Under Review", Message = "Your startup pitch 'MCC Eco-Campus Hub' has been submitted and is currently under review by the Innovation Cell.", IsRead = false, Type = "StartupIdea", Link = "/dashboard/student", CreatedAt = DateTime.UtcNow.AddHours(-6) }
                );

                // ─────────────────────────────────────────────────────────────
                // STUDENT 2 — Priya Krishnamurthy  (MCA | Data Science & ML)
                // ─────────────────────────────────────────────────────────────
                var s2 = new Student
                {
                    Id = Guid.NewGuid(), UserId = su2.Id,
                    RollNumber = "24-MCA-002", FirstName = "Priya", LastName = "Krishnamurthy",
                    Department = "Computer Applications (MCA)", BatchYear = "2024-2026",
                    Bio = "Data Science enthusiast specialising in NLP and predictive analytics. Published researcher with a focus on healthcare ML models.",
                    AvatarUrl = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
                    Cgpa = 9.21, GithubUsername = "priya-krish", BehanceUsername = ""
                };
                context.Students.Add(s2); context.SaveChanges();

                context.Portfolios.Add(new MCC.Portfolio.API.Models.Portfolio
                {
                    Id = Guid.NewGuid(), StudentId = s2.Id, Slug = "priya-krishnamurthy", IsPublic = true, IsApproved = true,
                    LayoutSettingsJson = "{\"theme\":\"academic\",\"visibleSections\":[\"about\",\"projects\",\"publications\",\"certifications\",\"achievements\"]}",
                    StatementOfPurpose = "I aspire to pursue a PhD in Computational Linguistics and develop ML models that bridge the gap between human language understanding and automated systems.",
                    StoryTitle = "From Statistics to Intelligence",
                    StoryContent = "A statistics elective in my undergraduate sparked my passion for machine learning. Since then I have been obsessed with transforming raw data into meaningful stories."
                });
                context.Projects.AddRange(
                    new Project { Id = Guid.NewGuid(), StudentId = s2.Id, Title = "HealthSense – Diabetic Risk Predictor", Description = "An ensemble ML pipeline combining XGBoost and Random Forest to predict diabetic onset risk using PIMA dataset features with 94.2% accuracy.", TechnologiesUsed = "Python,XGBoost,Pandas,Streamlit", GithubUrl = "https://github.com/priya-krish/healthsense", LiveUrl = "https://healthsense-demo.streamlit.app", ImageUrl = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=300", CreatedAt = DateTime.UtcNow.AddDays(-45) },
                    new Project { Id = Guid.NewGuid(), StudentId = s2.Id, Title = "SentimentScope – Social Media Analyser", Description = "Real-time sentiment classification of Twitter streams using fine-tuned BERT transformers. Includes emotion wheel visualisation dashboard.", TechnologiesUsed = "Python,HuggingFace,FastAPI,React,D3.js", GithubUrl = "https://github.com/priya-krish/sentimentscope", LiveUrl = "", ImageUrl = "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=300", CreatedAt = DateTime.UtcNow.AddDays(-70) }
                );
                context.Certifications.AddRange(
                    new Certification { Id = Guid.NewGuid(), StudentId = s2.Id, Name = "Google Professional Data Engineer", IssuingOrganization = "Google Cloud", IssueDate = new DateTime(2025, 2, 10, 0, 0, 0, DateTimeKind.Utc), CredentialId = "GCP-PDE-88231", CredentialUrl = "https://cloud.google.com/certification" },
                    new Certification { Id = Guid.NewGuid(), StudentId = s2.Id, Name = "IBM Data Science Professional Certificate", IssuingOrganization = "IBM / Coursera", IssueDate = new DateTime(2024, 9, 5, 0, 0, 0, DateTimeKind.Utc), CredentialId = "IBM-DS-20481", CredentialUrl = "https://coursera.org/verify/ibm-ds" }
                );
                context.Publications.AddRange(
                    new Publication { Id = Guid.NewGuid(), StudentId = s2.Id, Title = "Ensemble Learning Approaches for Early Diabetic Retinopathy Detection", JournalOrConference = "IEEE International Conference on Biomedical Engineering", PublishDate = new DateTime(2025, 3, 18, 0, 0, 0, DateTimeKind.Utc), PaperUrl = "https://ieeexplore.ieee.org/paper/93812", Abstract = "We propose a CNN-XGBoost ensemble achieving 96.3% sensitivity in retinopathy grade classification using fundus image augmentation.", Authors = "Priya Krishnamurthy, Dr. Anitha Rajan" },
                    new Publication { Id = Guid.NewGuid(), StudentId = s2.Id, Title = "Transformer-Based Multi-Class Sentiment Analysis on Code-Mixed Tamil-English Datasets", JournalOrConference = "ACL Workshop on South Asian NLP", PublishDate = new DateTime(2024, 11, 2, 0, 0, 0, DateTimeKind.Utc), PaperUrl = "https://aclanthology.org/2024.sa-nlp", Abstract = "We fine-tuned mBERT on a novel code-mixed corpus achieving 88.7% F1 score on Tamil-English sentiment classification.", Authors = "Priya Krishnamurthy, Dr. Sunita Devi" }
                );
                context.Achievements.AddRange(
                    new Achievement { Id = Guid.NewGuid(), StudentId = s2.Id, Title = "Best Research Paper – MCC Annual Research Symposium 2025", Description = "Awarded best paper for the HealthSense diabetic prediction model presented before a faculty jury.", DateEarned = new DateTime(2025, 4, 5, 0, 0, 0, DateTimeKind.Utc), Category = "Extracurricular" },
                    new Achievement { Id = Guid.NewGuid(), StudentId = s2.Id, Title = "National Science Olympiad – Silver Medal", Description = "Secured silver medal in the All India Science Olympiad conducted by the DST, Government of India.", DateEarned = new DateTime(2024, 10, 12, 0, 0, 0, DateTimeKind.Utc), Category = "Olympiad" }
                );
                context.CommunityServices.Add(new CommunityService { Id = Guid.NewGuid(), StudentId = s2.Id, Organization = "Teach For India – MCC Chapter", Role = "Academic Mentor", Description = "Provided weekend mathematics and science tutoring to 25 underprivileged students from government schools in Chennai.", StartDate = new DateTime(2024, 7, 1, 0, 0, 0, DateTimeKind.Utc), EndDate = null });
                context.Notifications.Add(new Notification { Id = Guid.NewGuid(), StudentId = s2.Id, Title = "Placement Drive: Freshworks – Analytics Role", Message = "You are eligible for the Freshworks Analytics hiring drive. Please update your resume and register by Friday.", IsRead = false, Type = "Placement", Link = "/dashboard/student", CreatedAt = DateTime.UtcNow.AddHours(-3) });

                // ─────────────────────────────────────────────────────────────
                // STUDENT 3 — Arjun Selvakumar  (MCA | Cybersecurity & Networks)
                // ─────────────────────────────────────────────────────────────
                var s3 = new Student
                {
                    Id = Guid.NewGuid(), UserId = su3.Id,
                    RollNumber = "24-MCA-003", FirstName = "Arjun", LastName = "Selvakumar",
                    Department = "Computer Applications (MCA)", BatchYear = "2024-2026",
                    Bio = "Cybersecurity researcher and ethical hacker. CTF champion with expertise in network forensics and penetration testing.",
                    AvatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
                    Cgpa = 8.40, GithubUsername = "arjun-selva-sec", BehanceUsername = ""
                };
                context.Students.Add(s3); context.SaveChanges();

                context.Portfolios.Add(new MCC.Portfolio.API.Models.Portfolio
                {
                    Id = Guid.NewGuid(), StudentId = s3.Id, Slug = "arjun-selvakumar", IsPublic = true, IsApproved = true,
                    LayoutSettingsJson = "{\"theme\":\"startup\",\"visibleSections\":[\"about\",\"projects\",\"certifications\",\"achievements\",\"community\"]}",
                    StatementOfPurpose = "I aim to build next-generation threat intelligence platforms and contribute to national cybersecurity infrastructure through applied research at leading security labs.",
                    StoryTitle = "Cracking the Code of Security",
                    StoryContent = "My curiosity began when I intercepted an unencrypted WiFi packet in my first networking lab. Since then, every vulnerability has been a puzzle I cannot stop solving."
                });
                context.Projects.AddRange(
                    new Project { Id = Guid.NewGuid(), StudentId = s3.Id, Title = "NetGuard – Real-Time Intrusion Detection System", Description = "A packet-sniffing IDS built with Scapy and ML anomaly detection models. Flags port scans, DDoS patterns, and DNS spoofing in real time.", TechnologiesUsed = "Python,Scapy,Scikit-Learn,Elasticsearch,Kibana", GithubUrl = "https://github.com/arjun-selva-sec/netguard", LiveUrl = "", ImageUrl = "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=300", CreatedAt = DateTime.UtcNow.AddDays(-40) },
                    new Project { Id = Guid.NewGuid(), StudentId = s3.Id, Title = "VaultBreaker CTF Toolkit", Description = "A curated suite of CTF automation scripts covering steganography, crypto puzzles, binary exploitation, and web challenge enumeration.", TechnologiesUsed = "Python,Pwntools,Ghidra,Bash", GithubUrl = "https://github.com/arjun-selva-sec/vaultbreaker", LiveUrl = "", ImageUrl = "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=300", CreatedAt = DateTime.UtcNow.AddDays(-80) }
                );
                context.Certifications.AddRange(
                    new Certification { Id = Guid.NewGuid(), StudentId = s3.Id, Name = "Certified Ethical Hacker (CEH) v12", IssuingOrganization = "EC-Council", IssueDate = new DateTime(2024, 11, 20, 0, 0, 0, DateTimeKind.Utc), CredentialId = "CEH-V12-77342", CredentialUrl = "https://eccouncil.org/verify" },
                    new Certification { Id = Guid.NewGuid(), StudentId = s3.Id, Name = "CompTIA Security+ SY0-701", IssuingOrganization = "CompTIA", IssueDate = new DateTime(2025, 1, 8, 0, 0, 0, DateTimeKind.Utc), CredentialId = "COMP-SEC-44129", CredentialUrl = "https://comptia.org/verify" }
                );
                context.Publications.Add(new Publication { Id = Guid.NewGuid(), StudentId = s3.Id, Title = "Adversarial ML Attacks on Intrusion Detection Systems: A Threat Taxonomy", JournalOrConference = "ACM CCS Student Research Competition", PublishDate = new DateTime(2025, 2, 14, 0, 0, 0, DateTimeKind.Utc), PaperUrl = "https://dl.acm.org/doi/ccs2025-sec", Abstract = "We classify gradient-based and black-box adversarial attacks on NIDS models and propose a certified defence mechanism using ensemble diversity.", Authors = "Arjun Selvakumar, Prof. Vijayakumar S." });
                context.Achievements.AddRange(
                    new Achievement { Id = Guid.NewGuid(), StudentId = s3.Id, Title = "1st Place – NIT Trichy CTF Championship 2025", Description = "Top rank in a 24-hour Capture the Flag event competing against 300 teams from premier institutions.", DateEarned = new DateTime(2025, 3, 10, 0, 0, 0, DateTimeKind.Utc), Category = "Hackathon" },
                    new Achievement { Id = Guid.NewGuid(), StudentId = s3.Id, Title = "TCS HackQuest Finalist", Description = "Reached the final round of TCS HackQuest national cybersecurity competition, top 5% of 12,000 participants.", DateEarned = new DateTime(2024, 9, 28, 0, 0, 0, DateTimeKind.Utc), Category = "Hackathon" }
                );
                context.CommunityServices.Add(new CommunityService { Id = Guid.NewGuid(), StudentId = s3.Id, Organization = "CyberAware India", Role = "Campus Ambassador", Description = "Conducted 4 cybersecurity awareness workshops for 200+ first-year students on phishing, social engineering, and safe browsing habits.", StartDate = new DateTime(2024, 8, 15, 0, 0, 0, DateTimeKind.Utc), EndDate = new DateTime(2025, 1, 30, 0, 0, 0, DateTimeKind.Utc) });
                context.Notifications.Add(new Notification { Id = Guid.NewGuid(), StudentId = s3.Id, Title = "CEH Certification Verified", Message = "Your Certified Ethical Hacker credential has been verified and is now visible on your public portfolio.", IsRead = true, Type = "System", Link = "/dashboard/student", CreatedAt = DateTime.UtcNow.AddDays(-1) });

                // ─────────────────────────────────────────────────────────────
                // STUDENT 4 — Kavitha Rajan  (MSc CS | Theoretical CS & Algorithms)
                // ─────────────────────────────────────────────────────────────
                var s4 = new Student
                {
                    Id = Guid.NewGuid(), UserId = su4.Id,
                    RollNumber = "23-MSC-004", FirstName = "Kavitha", LastName = "Rajan",
                    Department = "Computer Science (MSc)", BatchYear = "2023-2025",
                    Bio = "Theoretical computer scientist focused on graph algorithms, combinatorial optimisation, and quantum computing. Recipient of the DST-INSPIRE Fellowship.",
                    AvatarUrl = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150",
                    Cgpa = 9.60, GithubUsername = "kavitha-rajan-cs", BehanceUsername = ""
                };
                context.Students.Add(s4); context.SaveChanges();

                context.Portfolios.Add(new MCC.Portfolio.API.Models.Portfolio
                {
                    Id = Guid.NewGuid(), StudentId = s4.Id, Slug = "kavitha-rajan", IsPublic = true, IsApproved = true,
                    LayoutSettingsJson = "{\"theme\":\"academic\",\"visibleSections\":[\"about\",\"publications\",\"projects\",\"certifications\",\"achievements\"]}",
                    StatementOfPurpose = "I intend to pursue doctoral research in quantum algorithms and contribute to post-quantum cryptography, with an aim to join TIFR or IISc as a research scholar.",
                    StoryTitle = "The Beauty of Abstraction",
                    StoryContent = "When I first encountered P vs NP in a textbook, I did not just see a problem – I saw the definition of what it means to think. Theory has been my compass ever since."
                });
                context.Projects.AddRange(
                    new Project { Id = Guid.NewGuid(), StudentId = s4.Id, Title = "QuantumSim – Variational Quantum Eigensolver Visualiser", Description = "A web-based simulator demonstrating VQE circuits for molecular energy estimation, built using Qiskit primitives with a React visualisation layer.", TechnologiesUsed = "Python,Qiskit,NumPy,React,Flask", GithubUrl = "https://github.com/kavitha-rajan-cs/quantumsim", LiveUrl = "https://quantumsim.vercel.app", ImageUrl = "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=300", CreatedAt = DateTime.UtcNow.AddDays(-50) },
                    new Project { Id = Guid.NewGuid(), StudentId = s4.Id, Title = "GraphMax – Parallel Graph Algorithm Benchmark Suite", Description = "Benchmarks for parallel BFS, shortest path, and max-flow algorithms using OpenMP, comparing CUDA GPU vs multi-core CPU performance.", TechnologiesUsed = "C++,CUDA,OpenMP,Python,Matplotlib", GithubUrl = "https://github.com/kavitha-rajan-cs/graphmax", LiveUrl = "", ImageUrl = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=300", CreatedAt = DateTime.UtcNow.AddDays(-100) }
                );
                context.Certifications.AddRange(
                    new Certification { Id = Guid.NewGuid(), StudentId = s4.Id, Name = "IBM Quantum Developer Certification", IssuingOrganization = "IBM Quantum", IssueDate = new DateTime(2025, 1, 20, 0, 0, 0, DateTimeKind.Utc), CredentialId = "IBM-QD-55029", CredentialUrl = "https://quantum.ibm.com/certification" },
                    new Certification { Id = Guid.NewGuid(), StudentId = s4.Id, Name = "Stanford Algorithms Specialisation", IssuingOrganization = "Stanford University / Coursera", IssueDate = new DateTime(2024, 6, 15, 0, 0, 0, DateTimeKind.Utc), CredentialId = "STAN-ALG-18374", CredentialUrl = "https://coursera.org/verify/algorithms-stanford" }
                );
                context.Publications.AddRange(
                    new Publication { Id = Guid.NewGuid(), StudentId = s4.Id, Title = "Parallel Approximation Algorithms for NP-Hard Graph Problems on Heterogeneous Architectures", JournalOrConference = "Journal of Parallel and Distributed Computing (Elsevier)", PublishDate = new DateTime(2025, 2, 28, 0, 0, 0, DateTimeKind.Utc), PaperUrl = "https://sciencedirect.com/jpdc-2025-graphapprox", Abstract = "We propose PTAS-GPU, a parallel approximation scheme for vertex cover and set cover achieving 2x-4x speedup over CPU baselines on NVIDIA A100.", Authors = "Kavitha Rajan, Prof. Subramanian T." },
                    new Publication { Id = Guid.NewGuid(), StudentId = s4.Id, Title = "Post-Quantum Lattice-Based Signature Schemes: A Comparative Security Analysis", JournalOrConference = "Cryptography and Communications (Springer)", PublishDate = new DateTime(2024, 10, 5, 0, 0, 0, DateTimeKind.Utc), PaperUrl = "https://link.springer.com/pq-lattice-2024", Abstract = "We evaluate CRYSTALS-Dilithium, Falcon, and SPHINCS+ under adaptive chosen-message attacks, providing a unified security reduction framework.", Authors = "Kavitha Rajan, Dr. Meenatchi V." }
                );
                context.Achievements.AddRange(
                    new Achievement { Id = Guid.NewGuid(), StudentId = s4.Id, Title = "DST-INSPIRE Fellowship 2024 Recipient", Description = "Awarded the Department of Science & Technology INSPIRE scholarship for outstanding academic performance in science.", DateEarned = new DateTime(2024, 8, 1, 0, 0, 0, DateTimeKind.Utc), Category = "Extracurricular" },
                    new Achievement { Id = Guid.NewGuid(), StudentId = s4.Id, Title = "ICPC Regional Finalist – Chennai Site 2024", Description = "Qualified for ICPC Asia Regional Final, ranked 14th among 480 teams in the Chennai regionals.", DateEarned = new DateTime(2024, 12, 15, 0, 0, 0, DateTimeKind.Utc), Category = "Olympiad" }
                );
                context.CommunityServices.Add(new CommunityService { Id = Guid.NewGuid(), StudentId = s4.Id, Organization = "MCC Computer Science Society", Role = "President", Description = "Led a 120-member student technical society, organising 12 coding bootcamps, 3 guest lecture series, and an annual national-level symposium.", StartDate = new DateTime(2024, 6, 1, 0, 0, 0, DateTimeKind.Utc), EndDate = null });
                context.Notifications.Add(new Notification { Id = Guid.NewGuid(), StudentId = s4.Id, Title = "Research Symposium Invite", Message = "You have been invited to present your lattice cryptography paper at the MCC Annual Research Symposium on June 20.", IsRead = false, Type = "Circular", Link = "/dashboard/student", CreatedAt = DateTime.UtcNow.AddHours(-18) });

                // ─────────────────────────────────────────────────────────────
                // STUDENT 5 — Rahul Venkatesh  (MBA | Business Analytics & Fintech)
                // ─────────────────────────────────────────────────────────────
                var s5 = new Student
                {
                    Id = Guid.NewGuid(), UserId = su5.Id,
                    RollNumber = "24-MBA-005", FirstName = "Rahul", LastName = "Venkatesh",
                    Department = "Business Administration (MBA)", BatchYear = "2024-2026",
                    Bio = "Business Analytics graduate with a strong interest in fintech product management, startup ecosystems, and strategic consulting for digital enterprises.",
                    AvatarUrl = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150",
                    Cgpa = 8.10, GithubUsername = "rahul-venky-biz", BehanceUsername = "rahul-ux-studio"
                };
                context.Students.Add(s5); context.SaveChanges();

                context.Portfolios.Add(new MCC.Portfolio.API.Models.Portfolio
                {
                    Id = Guid.NewGuid(), StudentId = s5.Id, Slug = "rahul-venkatesh", IsPublic = true, IsApproved = false,
                    LayoutSettingsJson = "{\"theme\":\"corporate\",\"visibleSections\":[\"about\",\"projects\",\"certifications\",\"achievements\",\"community\"]}",
                    StatementOfPurpose = "My goal is to build and scale fintech products that democratise financial access for Tier-2 and Tier-3 cities across India, combining data analytics with human-centred design.",
                    StoryTitle = "Numbers Tell Stories",
                    StoryContent = "Growing up watching my father manage a small textile business with ledgers, I realised early that every number hid a story. Business analytics became my way of telling those stories at scale."
                });
                context.Projects.AddRange(
                    new Project { Id = Guid.NewGuid(), StudentId = s5.Id, Title = "FinPulse – SME Credit Scoring Dashboard", Description = "An interactive analytics dashboard for MSME credit risk scoring using RBI data, GST filings, and alternative lending bureau APIs.", TechnologiesUsed = "Python,Tableau,FastAPI,React,PostgreSQL", GithubUrl = "https://github.com/rahul-venky-biz/finpulse", LiveUrl = "https://finpulse-demo.vercel.app", ImageUrl = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=300", CreatedAt = DateTime.UtcNow.AddDays(-35) },
                    new Project { Id = Guid.NewGuid(), StudentId = s5.Id, Title = "StartupMapper India", Description = "An interactive geographic map of Indian startup ecosystems categorising 5000+ funded startups by sector, city, and funding stage.", TechnologiesUsed = "React,Leaflet.js,Node.js,MongoDB,D3.js", GithubUrl = "https://github.com/rahul-venky-biz/startup-mapper", LiveUrl = "https://startup-mapper.in", ImageUrl = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=300", CreatedAt = DateTime.UtcNow.AddDays(-65) }
                );
                context.Certifications.AddRange(
                    new Certification { Id = Guid.NewGuid(), StudentId = s5.Id, Name = "CFA Institute – Investment Foundations", IssuingOrganization = "CFA Institute", IssueDate = new DateTime(2024, 12, 5, 0, 0, 0, DateTimeKind.Utc), CredentialId = "CFA-IF-30281", CredentialUrl = "https://cfainstitute.org/verify" },
                    new Certification { Id = Guid.NewGuid(), StudentId = s5.Id, Name = "Google Analytics Individual Qualification", IssuingOrganization = "Google", IssueDate = new DateTime(2025, 2, 18, 0, 0, 0, DateTimeKind.Utc), CredentialId = "GAIQ-78293", CredentialUrl = "https://skillshop.google.com/verify" }
                );
                context.Publications.Add(new Publication { Id = Guid.NewGuid(), StudentId = s5.Id, Title = "Digital Lending Ecosystems in India: Risk Scoring Models for MSME Segments", JournalOrConference = "Journal of Financial Technology (FinTech)", PublishDate = new DateTime(2025, 3, 1, 0, 0, 0, DateTimeKind.Utc), PaperUrl = "https://jfintech.com/msme-risk-2025", Abstract = "We propose a multi-modal credit scoring framework integrating GST, UPI, and bureau data achieving 89.2% AUC on MSME default prediction.", Authors = "Rahul Venkatesh, Prof. Latha Krishnan" });
                context.Achievements.AddRange(
                    new Achievement { Id = Guid.NewGuid(), StudentId = s5.Id, Title = "National B-Plan Competition – Runner-Up", Description = "Secured 2nd place in IIM Bangalore's national business plan competition for FinPulse SME lending platform.", DateEarned = new DateTime(2025, 1, 22, 0, 0, 0, DateTimeKind.Utc), Category = "Startup" },
                    new Achievement { Id = Guid.NewGuid(), StudentId = s5.Id, Title = "Best Intern – Deloitte Analytics Internship 2024", Description = "Recognised as best intern for building an automated GST reconciliation dashboard adopted by the client finance team.", DateEarned = new DateTime(2024, 9, 15, 0, 0, 0, DateTimeKind.Utc), Category = "Extracurricular" }
                );
                context.CommunityServices.Add(new CommunityService { Id = Guid.NewGuid(), StudentId = s5.Id, Organization = "Entrepreneurship Development Cell – MCC", Role = "Co-Founder & Secretary", Description = "Established the first formally recognised entrepreneurship cell at MCC, hosting 8 startup pitching events and mentoring 30 student teams.", StartDate = new DateTime(2024, 7, 1, 0, 0, 0, DateTimeKind.Utc), EndDate = null });
                context.Notifications.Add(new Notification { Id = Guid.NewGuid(), StudentId = s5.Id, Title = "Portfolio Pending Approval", Message = "Your public portfolio has been submitted for coordinator approval. You will be notified once it goes live.", IsRead = false, Type = "System", Link = "/dashboard/student", CreatedAt = DateTime.UtcNow.AddHours(-2) });

                // ─────────────────────────────────────────────────────────────
                // STUDENT 6 — Sneha Balaji  (MCA | UI/UX Design & Frontend)
                // ─────────────────────────────────────────────────────────────
                var s6 = new Student
                {
                    Id = Guid.NewGuid(), UserId = su6.Id,
                    RollNumber = "24-MCA-006", FirstName = "Sneha", LastName = "Balaji",
                    Department = "Computer Applications (MCA)", BatchYear = "2024-2026",
                    Bio = "UI/UX Designer and React developer crafting inclusive, accessible digital experiences. Figma Community contributor with 14K+ downloads on her open design systems.",
                    AvatarUrl = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
                    Cgpa = 8.65, GithubUsername = "sneha-balaji-dev", BehanceUsername = "sneha-design"
                };
                context.Students.Add(s6); context.SaveChanges();

                context.Portfolios.Add(new MCC.Portfolio.API.Models.Portfolio
                {
                    Id = Guid.NewGuid(), StudentId = s6.Id, Slug = "sneha-balaji", IsPublic = true, IsApproved = true,
                    LayoutSettingsJson = "{\"theme\":\"creative\",\"visibleSections\":[\"about\",\"projects\",\"certifications\",\"achievements\",\"community\"]}",
                    StatementOfPurpose = "I aim to join a product design team at a tech unicorn where I can build design systems that set accessibility and delight as non-negotiable standards.",
                    StoryTitle = "Design is Problem-Solving",
                    StoryContent = "I began as a coder frustrated by ugly interfaces. When I discovered Figma, I realised design was not decoration – it was empathy made visual. I have been bridging code and design ever since."
                });
                context.Projects.AddRange(
                    new Project { Id = Guid.NewGuid(), StudentId = s6.Id, Title = "Aurora Design System", Description = "An open-source React component library with 60+ WCAG 2.1 AA compliant components, dark mode support, and Storybook documentation.", TechnologiesUsed = "React,TypeScript,Storybook,Radix UI,CSS Modules", GithubUrl = "https://github.com/sneha-balaji-dev/aurora-ds", LiveUrl = "https://aurora-design.vercel.app", ImageUrl = "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=300", CreatedAt = DateTime.UtcNow.AddDays(-20) },
                    new Project { Id = Guid.NewGuid(), StudentId = s6.Id, Title = "EcoCommute App – Figma to React", Description = "A carpooling app UX redesign reducing cognitive load by 40% measured via usability testing. Full Figma prototype and React implementation.", TechnologiesUsed = "Figma,React,Framer Motion,TailwindCSS", GithubUrl = "https://github.com/sneha-balaji-dev/ecocommute", LiveUrl = "https://ecocommute-app.vercel.app", ImageUrl = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=300", CreatedAt = DateTime.UtcNow.AddDays(-55) }
                );
                context.Certifications.AddRange(
                    new Certification { Id = Guid.NewGuid(), StudentId = s6.Id, Name = "Google UX Design Professional Certificate", IssuingOrganization = "Google / Coursera", IssueDate = new DateTime(2024, 10, 30, 0, 0, 0, DateTimeKind.Utc), CredentialId = "GOOG-UX-49182", CredentialUrl = "https://coursera.org/verify/google-ux" },
                    new Certification { Id = Guid.NewGuid(), StudentId = s6.Id, Name = "Figma Advanced Design Certification", IssuingOrganization = "Figma", IssueDate = new DateTime(2025, 3, 2, 0, 0, 0, DateTimeKind.Utc), CredentialId = "FIGMA-ADV-20394", CredentialUrl = "https://figma.com/certification" }
                );
                context.Publications.Add(new Publication { Id = Guid.NewGuid(), StudentId = s6.Id, Title = "Accessibility-First Design: Measuring WCAG Compliance Impact on User Task Completion", JournalOrConference = "ACM CHI Conference on Human Factors in Computing Systems", PublishDate = new DateTime(2025, 4, 10, 0, 0, 0, DateTimeKind.Utc), PaperUrl = "https://dl.acm.org/doi/chi2025-a11y", Abstract = "Through a controlled usability study with 64 participants including 18 with disabilities, we demonstrate a 31% increase in task completion when WCAG 2.1 AA guidelines are strictly enforced.", Authors = "Sneha Balaji, Dr. Preethi Nair" });
                context.Achievements.AddRange(
                    new Achievement { Id = Guid.NewGuid(), StudentId = s6.Id, Title = "Adobe Creative Jam – 1st Place", Description = "Won the Adobe Creative Jam design sprint for crafting a mental health companion app UI in 3 hours.", DateEarned = new DateTime(2025, 2, 5, 0, 0, 0, DateTimeKind.Utc), Category = "Hackathon" },
                    new Achievement { Id = Guid.NewGuid(), StudentId = s6.Id, Title = "Figma Community – Top Contributor 2024", Description = "Aurora Design System reached 14,000 downloads on Figma Community, featured in the official Figma newsletter.", DateEarned = new DateTime(2024, 11, 20, 0, 0, 0, DateTimeKind.Utc), Category = "Extracurricular" }
                );
                context.CommunityServices.Add(new CommunityService { Id = Guid.NewGuid(), StudentId = s6.Id, Organization = "Women in Tech – Chennai Chapter", Role = "Speaker & Workshop Host", Description = "Conducted 3 UI/UX design workshops for 120 women students across Chennai colleges, covering Figma fundamentals and accessibility.", StartDate = new DateTime(2024, 9, 1, 0, 0, 0, DateTimeKind.Utc), EndDate = null });
                context.Notifications.Add(new Notification { Id = Guid.NewGuid(), StudentId = s6.Id, Title = "New Recruiter Lead", Message = "A recruiter from Swiggy Design Team has viewed your portfolio and sent an inquiry. Check your Recruiter Connections.", IsRead = false, Type = "Placement", Link = "/dashboard/student", CreatedAt = DateTime.UtcNow.AddHours(-5) });

                // ─────────────────────────────────────────────────────────────
                // STUDENT 7 — Vikram Sundaresan  (MSc Physics | Computational Physics & HPC)
                // ─────────────────────────────────────────────────────────────
                var s7 = new Student
                {
                    Id = Guid.NewGuid(), UserId = su7.Id,
                    RollNumber = "23-MSC-007", FirstName = "Vikram", LastName = "Sundaresan",
                    Department = "Physics (MSc)", BatchYear = "2023-2025",
                    Bio = "Computational physicist using HPC clusters and FORTRAN/Python to simulate quantum many-body systems. Aspiring CERN summer student with two indexed publications.",
                    AvatarUrl = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
                    Cgpa = 9.02, GithubUsername = "vikram-hpc-phys", BehanceUsername = ""
                };
                context.Students.Add(s7); context.SaveChanges();

                context.Portfolios.Add(new MCC.Portfolio.API.Models.Portfolio
                {
                    Id = Guid.NewGuid(), StudentId = s7.Id, Slug = "vikram-sundaresan", IsPublic = true, IsApproved = true,
                    LayoutSettingsJson = "{\"theme\":\"academic\",\"visibleSections\":[\"about\",\"publications\",\"projects\",\"achievements\"]}",
                    StatementOfPurpose = "I seek to join a world-class research institution to work on lattice QCD simulations, ultimately bridging computational methods and experimental high-energy physics.",
                    StoryTitle = "From Stars to Simulations",
                    StoryContent = "A childhood spent stargazing turned into a pursuit of the equations governing the cosmos. When I found I could simulate quantum fields on a laptop, the universe became even more beautiful."
                });
                context.Projects.AddRange(
                    new Project { Id = Guid.NewGuid(), StudentId = s7.Id, Title = "LatticeSim – Quantum Field Theory Lattice Simulator", Description = "An MPI-parallelised C++ framework simulating SU(2) lattice gauge theories. Benchmarked on the PARAM Shivay HPC cluster achieving 92% parallel efficiency.", TechnologiesUsed = "C++,MPI,OpenMP,Python,ROOT Framework", GithubUrl = "https://github.com/vikram-hpc-phys/latticesim", LiveUrl = "", ImageUrl = "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&q=80&w=300", CreatedAt = DateTime.UtcNow.AddDays(-60) },
                    new Project { Id = Guid.NewGuid(), StudentId = s7.Id, Title = "PhysicsViz – Interactive Quantum Mechanics Web App", Description = "An educational web application visualising wave function evolution, probability densities, and quantum tunnelling for undergraduate students.", TechnologiesUsed = "Python,NumPy,Flask,Three.js,React", GithubUrl = "https://github.com/vikram-hpc-phys/physicsviz", LiveUrl = "https://physicsviz.vercel.app", ImageUrl = "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=300", CreatedAt = DateTime.UtcNow.AddDays(-90) }
                );
                context.Certifications.AddRange(
                    new Certification { Id = Guid.NewGuid(), StudentId = s7.Id, Name = "NPTEL – Quantum Computing and Information", IssuingOrganization = "IIT Madras / NPTEL", IssueDate = new DateTime(2024, 11, 15, 0, 0, 0, DateTimeKind.Utc), CredentialId = "NPTEL-QCI-33829", CredentialUrl = "https://nptel.ac.in/verify" },
                    new Certification { Id = Guid.NewGuid(), StudentId = s7.Id, Name = "HPC Fundamentals – Supercomputing Training", IssuingOrganization = "National Supercomputing Mission (NSM)", IssueDate = new DateTime(2025, 1, 10, 0, 0, 0, DateTimeKind.Utc), CredentialId = "NSM-HPC-44021", CredentialUrl = "https://nsm.gov.in/verify" }
                );
                context.Publications.AddRange(
                    new Publication { Id = Guid.NewGuid(), StudentId = s7.Id, Title = "Confinement-Deconfinement Transition in SU(2) Gauge Theory: A Lattice Approach", JournalOrConference = "Physical Review D (APS)", PublishDate = new DateTime(2025, 3, 22, 0, 0, 0, DateTimeKind.Utc), PaperUrl = "https://journals.aps.org/prd/lattice-su2-2025", Abstract = "We simulate the confinement-deconfinement phase transition temperature in SU(2) pure gauge theory using improved Wilson action, reporting T_c/sqrt(sigma) = 0.709±0.003.", Authors = "Vikram Sundaresan, Dr. Arun Prasad" },
                    new Publication { Id = Guid.NewGuid(), StudentId = s7.Id, Title = "Parallel Scaling Analysis of Lattice QCD Algorithms on Heterogeneous HPC Clusters", JournalOrConference = "Computer Physics Communications (Elsevier)", PublishDate = new DateTime(2024, 9, 10, 0, 0, 0, DateTimeKind.Utc), PaperUrl = "https://sciencedirect.com/cpc-lattice-hpc", Abstract = "We analyse weak and strong scaling of Hybrid Monte Carlo on CPU-GPU heterogeneous systems, achieving 3.2x speedup using NVIDIA A100 GPUs.", Authors = "Vikram Sundaresan, Prof. Balaji Subramanian" }
                );
                context.Achievements.AddRange(
                    new Achievement { Id = Guid.NewGuid(), StudentId = s7.Id, Title = "CERN Summer Student Programme – Shortlisted 2025", Description = "Shortlisted (top 5%) for the CERN Summer Student Programme in Geneva among 11,000 global applicants.", DateEarned = new DateTime(2025, 3, 5, 0, 0, 0, DateTimeKind.Utc), Category = "Extracurricular" },
                    new Achievement { Id = Guid.NewGuid(), StudentId = s7.Id, Title = "SERB National Science Award for Students", Description = "Received the SERB junior researcher commendation award for outstanding contribution to computational physics.", DateEarned = new DateTime(2024, 12, 1, 0, 0, 0, DateTimeKind.Utc), Category = "Extracurricular" }
                );
                context.CommunityServices.Add(new CommunityService { Id = Guid.NewGuid(), StudentId = s7.Id, Organization = "Science Popularisation Society – MCC", Role = "Chief Organiser", Description = "Organised an annual public science exhibition 'Scientia 2024' attracting 800+ visitors including school students and educating them on quantum physics.", StartDate = new DateTime(2024, 10, 1, 0, 0, 0, DateTimeKind.Utc), EndDate = new DateTime(2024, 10, 3, 0, 0, 0, DateTimeKind.Utc) });
                context.Notifications.Add(new Notification { Id = Guid.NewGuid(), StudentId = s7.Id, Title = "Publication Indexed in Scopus", Message = "Your Physical Review D paper has been indexed in Scopus and Web of Science. Your h-index has been updated.", IsRead = true, Type = "System", Link = "/dashboard/student", CreatedAt = DateTime.UtcNow.AddDays(-4) });

                // ─────────────────────────────────────────────────────────────
                // STUDENT 8 — Deepika Murugan  (MCA | DevOps & Cloud Engineering)
                // ─────────────────────────────────────────────────────────────
                var s8 = new Student
                {
                    Id = Guid.NewGuid(), UserId = su8.Id,
                    RollNumber = "24-MCA-008", FirstName = "Deepika", LastName = "Murugan",
                    Department = "Computer Applications (MCA)", BatchYear = "2024-2026",
                    Bio = "DevOps and cloud infrastructure specialist with expertise in Kubernetes, Terraform, and GitOps workflows. Built CI/CD pipelines handling 1M+ daily deployments.",
                    AvatarUrl = "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=150",
                    Cgpa = 8.30, GithubUsername = "deepika-devops", BehanceUsername = ""
                };
                context.Students.Add(s8); context.SaveChanges();

                context.Portfolios.Add(new MCC.Portfolio.API.Models.Portfolio
                {
                    Id = Guid.NewGuid(), StudentId = s8.Id, Slug = "deepika-murugan", IsPublic = true, IsApproved = true,
                    LayoutSettingsJson = "{\"theme\":\"startup\",\"visibleSections\":[\"about\",\"projects\",\"certifications\",\"achievements\",\"community\"]}",
                    StatementOfPurpose = "I am determined to become a Senior Platform Engineer building cloud-native SRE frameworks that guarantee five nines uptime for distributed microservices at global scale.",
                    StoryTitle = "Containers Changed My World",
                    StoryContent = "The moment I containerised my first app and watched it deploy identically across 5 environments, I knew infrastructure was my calling. DevOps is not a role – it is a philosophy."
                });
                context.Projects.AddRange(
                    new Project { Id = Guid.NewGuid(), StudentId = s8.Id, Title = "K8sPilot – Kubernetes Cluster Autoscaler Dashboard", Description = "A real-time web dashboard for monitoring Kubernetes HPA/VPA scaling events, resource utilisation, and pod health across multi-cluster environments.", TechnologiesUsed = "Go,Kubernetes,Prometheus,Grafana,React", GithubUrl = "https://github.com/deepika-devops/k8spilot", LiveUrl = "", ImageUrl = "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&q=80&w=300", CreatedAt = DateTime.UtcNow.AddDays(-25) },
                    new Project { Id = Guid.NewGuid(), StudentId = s8.Id, Title = "TerraStack – Multi-Cloud IaC Template Library", Description = "A curated Terraform module library for provisioning production-grade AWS, GCP, and Azure infrastructure with security baseline hardening.", TechnologiesUsed = "Terraform,AWS,GCP,Azure,Python,GitHub Actions", GithubUrl = "https://github.com/deepika-devops/terrastack", LiveUrl = "https://terrastack.io", ImageUrl = "https://images.unsplash.com/photo-1629904853893-c2c8981a1dc5?auto=format&fit=crop&q=80&w=300", CreatedAt = DateTime.UtcNow.AddDays(-75) }
                );
                context.Certifications.AddRange(
                    new Certification { Id = Guid.NewGuid(), StudentId = s8.Id, Name = "Certified Kubernetes Administrator (CKA)", IssuingOrganization = "Cloud Native Computing Foundation (CNCF)", IssueDate = new DateTime(2025, 2, 5, 0, 0, 0, DateTimeKind.Utc), CredentialId = "CKA-LF-88219", CredentialUrl = "https://training.linuxfoundation.org/verify" },
                    new Certification { Id = Guid.NewGuid(), StudentId = s8.Id, Name = "HashiCorp Terraform Associate", IssuingOrganization = "HashiCorp", IssueDate = new DateTime(2024, 10, 12, 0, 0, 0, DateTimeKind.Utc), CredentialId = "HCP-TF-22839", CredentialUrl = "https://developer.hashicorp.com/verify" }
                );
                context.Publications.Add(new Publication { Id = Guid.NewGuid(), StudentId = s8.Id, Title = "GitOps-Driven Multi-Cloud Deployments: Reliability Patterns and Failure Mode Analysis", JournalOrConference = "IEEE International Conference on Cloud Computing (CLOUD)", PublishDate = new DateTime(2025, 4, 1, 0, 0, 0, DateTimeKind.Utc), PaperUrl = "https://ieeexplore.ieee.org/cloud2025-gitops", Abstract = "We propose a GitOps reconciliation architecture using ArgoCD + Flux achieving 99.97% deployment reliability across AWS EKS and GKE clusters under chaos engineering tests.", Authors = "Deepika Murugan, Prof. Anand R." });
                context.Achievements.AddRange(
                    new Achievement { Id = Guid.NewGuid(), StudentId = s8.Id, Title = "KCD Chennai Speaker 2025", Description = "Invited to speak at Kubernetes Community Days Chennai, presenting on multi-cluster GitOps patterns to an audience of 400 engineers.", DateEarned = new DateTime(2025, 3, 28, 0, 0, 0, DateTimeKind.Utc), Category = "Extracurricular" },
                    new Achievement { Id = Guid.NewGuid(), StudentId = s8.Id, Title = "AWS DeepRacer League – College Championship", Description = "Won the AWS DeepRacer reinforcement learning autonomous car racing championship organised for Tamil Nadu college students.", DateEarned = new DateTime(2024, 11, 5, 0, 0, 0, DateTimeKind.Utc), Category = "Hackathon" }
                );
                context.CommunityServices.Add(new CommunityService { Id = Guid.NewGuid(), StudentId = s8.Id, Organization = "FOSS Chennai Community", Role = "Core Contributor", Description = "Contributed to open-source Kubernetes tooling projects and co-maintained a community Helm chart repository with 2K+ stars on GitHub.", StartDate = new DateTime(2024, 5, 1, 0, 0, 0, DateTimeKind.Utc), EndDate = null });
                context.Notifications.Add(new Notification { Id = Guid.NewGuid(), StudentId = s8.Id, Title = "Cisco DevNet Hiring Drive", Message = "Cisco DevNet is conducting a campus placement drive for cloud and DevOps roles. CGPA cutoff: 7.5. Apply by June 10.", IsRead = false, Type = "Placement", Link = "/dashboard/student", CreatedAt = DateTime.UtcNow.AddHours(-8) });

                // ─────────────────────────────────────────────────────────────
                // STUDENT 9 — Aarav Pillai  (MSc CS | Game Dev & Graphics)
                // ─────────────────────────────────────────────────────────────
                var s9 = new Student
                {
                    Id = Guid.NewGuid(), UserId = su9.Id,
                    RollNumber = "23-MSC-009", FirstName = "Aarav", LastName = "Pillai",
                    Department = "Computer Science (MSc)", BatchYear = "2023-2025",
                    Bio = "Game developer and real-time graphics programmer specialising in Unity3D, Unreal Engine 5, and WebGL. Author of an Itch.io game with 8,000+ downloads.",
                    AvatarUrl = "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150",
                    Cgpa = 7.85, GithubUsername = "aarav-gamedev", BehanceUsername = "aarav-renders"
                };
                context.Students.Add(s9); context.SaveChanges();

                context.Portfolios.Add(new MCC.Portfolio.API.Models.Portfolio
                {
                    Id = Guid.NewGuid(), StudentId = s9.Id, Slug = "aarav-pillai", IsPublic = true, IsApproved = true,
                    LayoutSettingsJson = "{\"theme\":\"creative\",\"visibleSections\":[\"about\",\"projects\",\"certifications\",\"achievements\",\"community\"]}",
                    StatementOfPurpose = "I want to join a AAA game studio or an XR startup to create immersive experiences that push the boundaries of real-time rendering and spatial computing.",
                    StoryTitle = "I Play Games to Make Games",
                    StoryContent = "My first game was a Pygame clone of Snake. What started as fun became a relentless study of rendering pipelines, shader graphs, and physics engines. Every game I make teaches me more than any lecture."
                });
                context.Projects.AddRange(
                    new Project { Id = Guid.NewGuid(), StudentId = s9.Id, Title = "NeonRun – Cyberpunk Endless Runner (Itch.io)", Description = "A procedurally generated WebGL endless runner with neon aesthetics, dynamic music-reactive shaders, and global leaderboards. 8,000+ downloads on Itch.io.", TechnologiesUsed = "Unity3D,C#,WebGL,HLSL,Photon Networking", GithubUrl = "https://github.com/aarav-gamedev/neonrun", LiveUrl = "https://aarav-gamedev.itch.io/neonrun", ImageUrl = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=300", CreatedAt = DateTime.UtcNow.AddDays(-30) },
                    new Project { Id = Guid.NewGuid(), StudentId = s9.Id, Title = "MeshFlow – Real-Time Mesh Deformation Engine", Description = "A C++ real-time mesh deformation library using linear blend skinning and delta mush smoothing, integrated as a Unity Native Plugin.", TechnologiesUsed = "C++,Unity3D,HLSL,OpenGL,Python", GithubUrl = "https://github.com/aarav-gamedev/meshflow", LiveUrl = "", ImageUrl = "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?auto=format&fit=crop&q=80&w=300", CreatedAt = DateTime.UtcNow.AddDays(-80) },
                    new Project { Id = Guid.NewGuid(), StudentId = s9.Id, Title = "ARCampus – Augmented Reality Campus Navigator", Description = "An AR mobile app using ARCore to overlay navigation waypoints, classroom timetables, and student notices onto the MCC campus environment.", TechnologiesUsed = "Unity3D,ARCore,C#,Firebase,Google Maps API", GithubUrl = "https://github.com/aarav-gamedev/arcampus", LiveUrl = "", ImageUrl = "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&q=80&w=300", CreatedAt = DateTime.UtcNow.AddDays(-50) }
                );
                context.Certifications.AddRange(
                    new Certification { Id = Guid.NewGuid(), StudentId = s9.Id, Name = "Unity Certified Associate: Game Developer", IssuingOrganization = "Unity Technologies", IssueDate = new DateTime(2024, 9, 20, 0, 0, 0, DateTimeKind.Utc), CredentialId = "UNITY-CA-GD-10293", CredentialUrl = "https://unity.com/certification" },
                    new Certification { Id = Guid.NewGuid(), StudentId = s9.Id, Name = "Meta Spark AR Developer Certification", IssuingOrganization = "Meta", IssueDate = new DateTime(2024, 12, 18, 0, 0, 0, DateTimeKind.Utc), CredentialId = "META-SPAR-88391", CredentialUrl = "https://spark.meta.com/certification" }
                );
                context.Publications.Add(new Publication { Id = Guid.NewGuid(), StudentId = s9.Id, Title = "Procedural Terrain Generation Using Noise Compositing and GPU-Accelerated Erosion Simulation", JournalOrConference = "ACM SIGGRAPH Asia – Technical Papers", PublishDate = new DateTime(2024, 12, 5, 0, 0, 0, DateTimeKind.Utc), PaperUrl = "https://dl.acm.org/siggraph-asia-2024-terrain", Abstract = "We present a GPU compute-shader pipeline for procedural terrain combining domain-warped Perlin noise with hydraulic erosion simulation at interactive framerates.", Authors = "Aarav Pillai, Dr. Sriram Krishnamoorthy" });
                context.Achievements.AddRange(
                    new Achievement { Id = Guid.NewGuid(), StudentId = s9.Id, Title = "Global Game Jam 2025 – Best Technical Achievement", Description = "Received the Best Technical Achievement award at Global Game Jam 2025 Chennai site for NeonRun's reactive shader system.", DateEarned = new DateTime(2025, 1, 28, 0, 0, 0, DateTimeKind.Utc), Category = "Hackathon" },
                    new Achievement { Id = Guid.NewGuid(), StudentId = s9.Id, Title = "FICCI FRAMES – Young Animator of the Year", Description = "Recognised by the Federation of Indian Chambers of Commerce as Young Animator of the Year 2024 for 3D character rigging work.", DateEarned = new DateTime(2024, 11, 10, 0, 0, 0, DateTimeKind.Utc), Category = "Extracurricular" }
                );
                context.CommunityServices.Add(new CommunityService { Id = Guid.NewGuid(), StudentId = s9.Id, Organization = "MCC Game Development Club", Role = "Founder & Lead Developer", Description = "Founded the college game development club, running weekly Unity workshops for 45 members and shipping 3 jam entries per semester.", StartDate = new DateTime(2023, 9, 1, 0, 0, 0, DateTimeKind.Utc), EndDate = null });
                context.Notifications.Add(new Notification { Id = Guid.NewGuid(), StudentId = s9.Id, Title = "NeonRun Milestone: 8K Downloads!", Message = "Congratulations! Your game NeonRun has surpassed 8,000 downloads on Itch.io. Keep building.", IsRead = true, Type = "System", Link = "/dashboard/student", CreatedAt = DateTime.UtcNow.AddDays(-2) });

                // ─────────────────────────────────────────────────────────────
                // STUDENT 10 — Meenakshi Annamalai  (MCA | Backend & Distributed Systems)
                // ─────────────────────────────────────────────────────────────
                var s10 = new Student
                {
                    Id = Guid.NewGuid(), UserId = su10.Id,
                    RollNumber = "24-MCA-010", FirstName = "Meenakshi", LastName = "Annamalai",
                    Department = "Computer Applications (MCA)", BatchYear = "2024-2026",
                    Bio = "Backend engineer specialising in distributed systems, Kafka event streaming, and high-performance Java microservices. Open-source contributor to Apache Flink.",
                    AvatarUrl = "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=150",
                    Cgpa = 8.75, GithubUsername = "meenakshi-backend", BehanceUsername = ""
                };
                context.Students.Add(s10); context.SaveChanges();

                context.Portfolios.Add(new MCC.Portfolio.API.Models.Portfolio
                {
                    Id = Guid.NewGuid(), StudentId = s10.Id, Slug = "meenakshi-annamalai", IsPublic = true, IsApproved = true,
                    LayoutSettingsJson = "{\"theme\":\"corporate\",\"visibleSections\":[\"about\",\"projects\",\"publications\",\"certifications\",\"achievements\",\"community\"]}",
                    StatementOfPurpose = "I aim to build the infrastructure backbone of India's next unicorn – scalable, fault-tolerant, and observable distributed systems that can handle millions of concurrent users.",
                    StoryTitle = "The Invisible Architecture",
                    StoryContent = "Users never see the queue, the retry logic, or the circuit breaker. But without them, nothing works. I fell in love with distributed systems because good infrastructure is like good poetry – invisible but essential."
                });
                context.Projects.AddRange(
                    new Project { Id = Guid.NewGuid(), StudentId = s10.Id, Title = "StreamBridge – Real-Time Event Processing Platform", Description = "A Kafka-based event streaming platform with exactly-once delivery semantics, dead letter queues, and a React monitoring dashboard processing 500K events/sec.", TechnologiesUsed = "Java,Apache Kafka,Spring Boot,Apache Flink,React,Redis", GithubUrl = "https://github.com/meenakshi-backend/streambridge", LiveUrl = "", ImageUrl = "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=300", CreatedAt = DateTime.UtcNow.AddDays(-40) },
                    new Project { Id = Guid.NewGuid(), StudentId = s10.Id, Title = "DistCache – Distributed LRU Cache with Consistent Hashing", Description = "A Go implementation of a distributed in-memory cache using consistent hashing with virtual nodes, gossip-based node discovery, and gRPC communication.", TechnologiesUsed = "Go,gRPC,Protocol Buffers,Raft Consensus,Docker", GithubUrl = "https://github.com/meenakshi-backend/distcache", LiveUrl = "", ImageUrl = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=300", CreatedAt = DateTime.UtcNow.AddDays(-70) },
                    new Project { Id = Guid.NewGuid(), StudentId = s10.Id, Title = "CollegeMate API Gateway", Description = "A production-grade API gateway built with Spring Cloud Gateway implementing JWT auth, rate limiting (token bucket), circuit breaking, and OpenTelemetry tracing.", TechnologiesUsed = "Java,Spring Boot,Spring Cloud,Zipkin,Prometheus", GithubUrl = "https://github.com/meenakshi-backend/collegemate-gateway", LiveUrl = "", ImageUrl = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=300", CreatedAt = DateTime.UtcNow.AddDays(-15) }
                );
                context.Certifications.AddRange(
                    new Certification { Id = Guid.NewGuid(), StudentId = s10.Id, Name = "Confluent Certified Developer for Apache Kafka", IssuingOrganization = "Confluent", IssueDate = new DateTime(2025, 2, 28, 0, 0, 0, DateTimeKind.Utc), CredentialId = "CCDAK-88291", CredentialUrl = "https://confluent.io/certification" },
                    new Certification { Id = Guid.NewGuid(), StudentId = s10.Id, Name = "Oracle Certified Professional: Java SE 17 Developer", IssuingOrganization = "Oracle", IssueDate = new DateTime(2024, 11, 10, 0, 0, 0, DateTimeKind.Utc), CredentialId = "OCP-J17-20394", CredentialUrl = "https://oracle.com/certification" }
                );
                context.Publications.AddRange(
                    new Publication { Id = Guid.NewGuid(), StudentId = s10.Id, Title = "Exactly-Once Semantics in Distributed Stream Processing: A Formal Verification Approach", JournalOrConference = "VLDB Endowment (Proceedings of the VLDB)", PublishDate = new DateTime(2025, 4, 5, 0, 0, 0, DateTimeKind.Utc), PaperUrl = "https://vldb.org/pvldb/vol18/exactly-once-2025", Abstract = "We present a TLA+ model-checked exactly-once delivery protocol for Kafka consumers using idempotent producers and transactional APIs, reducing duplicate events by 99.9%.", Authors = "Meenakshi Annamalai, Dr. Rajesh Babu" },
                    new Publication { Id = Guid.NewGuid(), StudentId = s10.Id, Title = "Consistent Hashing with Virtual Nodes: A Comparative Load Distribution Analysis", JournalOrConference = "IEEE Transactions on Parallel and Distributed Systems", PublishDate = new DateTime(2024, 12, 20, 0, 0, 0, DateTimeKind.Utc), PaperUrl = "https://ieeexplore.ieee.org/tpds-consthash", Abstract = "We compare jump consistent hash, rendezvous hashing, and ring-based consistent hash under node addition/removal scenarios, showing jump hash achieves optimal load balance 94% of trials.", Authors = "Meenakshi Annamalai, Prof. Senthil Kumar" }
                );
                context.Achievements.AddRange(
                    new Achievement { Id = Guid.NewGuid(), StudentId = s10.Id, Title = "Apache Flink Contributor – Core Committer 2025", Description = "Merged 3 patches into Apache Flink's core streaming runtime, fixing critical watermark alignment bugs affecting millions of production deployments.", DateEarned = new DateTime(2025, 3, 15, 0, 0, 0, DateTimeKind.Utc), Category = "Extracurricular" },
                    new Achievement { Id = Guid.NewGuid(), StudentId = s10.Id, Title = "Goldman Sachs Hackers vs Systems – National Finalist", Description = "Reached the national final of Goldman Sachs distributed systems engineering competition, top 0.3% of 8,500 participants.", DateEarned = new DateTime(2025, 1, 18, 0, 0, 0, DateTimeKind.Utc), Category = "Hackathon" }
                );
                context.CommunityServices.Add(new CommunityService { Id = Guid.NewGuid(), StudentId = s10.Id, Organization = "MCC Open Source Club", Role = "Technical Lead", Description = "Led a team contributing to Apache Flink and Kafka documentation, and organised 5 open-source contribution workshops for 80 students.", StartDate = new DateTime(2024, 6, 15, 0, 0, 0, DateTimeKind.Utc), EndDate = null });
                context.Notifications.AddRange(
                    new Notification { Id = Guid.NewGuid(), StudentId = s10.Id, Title = "VLDB Paper Accepted!", Message = "Congratulations! Your paper on exactly-once semantics has been accepted at VLDB 2025. Please update your publications section.", IsRead = false, Type = "System", Link = "/dashboard/student", CreatedAt = DateTime.UtcNow.AddHours(-1) },
                    new Notification { Id = Guid.NewGuid(), StudentId = s10.Id, Title = "Placement Drive: Swiggy Backend Engineering", Message = "Swiggy is conducting a backend engineering drive for distributed systems roles. Eligible with CGPA 7.5+. Last date to register: June 8.", IsRead = false, Type = "Placement", Link = "/dashboard/student", CreatedAt = DateTime.UtcNow.AddHours(-12) }
                );

                // ─────────────────────────────────────────────────────────────
                // SHARED CAMPUS DATA: Placement Drives & Circulars
                // ─────────────────────────────────────────────────────────────
                var driveFreshworks = new PlacementDrive { Id = Guid.NewGuid(), Title = "Freshworks – Associate Software Engineer", Description = "Fresh graduate hiring for web and systems developers. Requires DSA, OOP, SQL fundamentals.", CompanyName = "Freshworks", EligibilityCgpa = 8.0, DriveDate = DateTime.UtcNow.AddDays(14), ApplicationLink = "https://freshworks.com/careers" };
                var driveZoho = new PlacementDrive { Id = Guid.NewGuid(), Title = "Zoho Corporation – Member Technical Staff (MTS)", Description = "MTS recruitment for frontend, backend, and fullstack roles. Structured programming test followed by interviews.", CompanyName = "Zoho Corporation", EligibilityCgpa = 7.5, DriveDate = DateTime.UtcNow.AddDays(7), ApplicationLink = "https://zoho.com/careers" };
                var driveSwiggy = new PlacementDrive { Id = Guid.NewGuid(), Title = "Swiggy – Backend Software Engineer", Description = "High-performance systems role focused on distributed backend, microservices, and real-time data pipelines.", CompanyName = "Swiggy", EligibilityCgpa = 7.5, DriveDate = DateTime.UtcNow.AddDays(21), ApplicationLink = "https://swiggy.com/careers" };
                var driveCisco = new PlacementDrive { Id = Guid.NewGuid(), Title = "Cisco DevNet – Cloud & DevOps Engineer", Description = "Cloud native and DevOps engineer hiring across Kubernetes, Terraform, and CI/CD domains.", CompanyName = "Cisco", EligibilityCgpa = 7.5, DriveDate = DateTime.UtcNow.AddDays(18), ApplicationLink = "https://cisco.com/careers" };
                var driveTcs = new PlacementDrive { Id = Guid.NewGuid(), Title = "TCS Research – Data Science & ML Analyst", Description = "Research analyst roles in NLP, CV, and predictive analytics. Open to MSc CS and MCA candidates.", CompanyName = "TCS Research", EligibilityCgpa = 8.5, DriveDate = DateTime.UtcNow.AddDays(10), ApplicationLink = "https://tcs.com/careers" };

                context.PlacementDrives.AddRange(driveFreshworks, driveZoho, driveSwiggy, driveCisco, driveTcs);

                context.CampusCirculars.AddRange(
                    new CampusCircular { Id = Guid.NewGuid(), Title = "Zoho Recruitment Drive – Register by June 7", Content = "Dear Students, Zoho Corporation conducts a recruitment drive next week. Please update your profiles and CGPA metrics by Friday to be audited for the eligibility list.", SenderRole = "PlacementCoordinator", CreatedAt = DateTime.UtcNow.AddHours(-12) },
                    new CampusCircular { Id = Guid.NewGuid(), Title = "MCC Startup Incubation Call – Summer 2026", Content = "The MCC Innovation Cell is accepting prototype descriptions and startup ideas for the summer incubation batch. Register your team pitch on your student dashboard by June 15.", SenderRole = "InnovationCoordinator", CreatedAt = DateTime.UtcNow.AddDays(-2) },
                    new CampusCircular { Id = Guid.NewGuid(), Title = "Annual Research Symposium – Paper Submission Open", Content = "The Research Cell invites student research paper submissions for MCC Annual Research Symposium 2026. Submit your abstract (max 300 words) via the dashboard by June 20.", SenderRole = "ResearchCoordinator", CreatedAt = DateTime.UtcNow.AddDays(-4) },
                    new CampusCircular { Id = Guid.NewGuid(), Title = "Portfolio Completion Drive – All Students", Content = "Attention all students: The Placement Cell is auditing portfolio completion scores this month. Please ensure your Projects, Certifications, and SOP sections are filled. Minimum 70% completion required for placement eligibility.", SenderRole = "PlacementCoordinator", CreatedAt = DateTime.UtcNow.AddDays(-6) }
                );

                context.SaveChanges();

                // ─────────────────────────────────────────────────────────────
                // PLACEMENT DRIVE APPLICATIONS
                // ─────────────────────────────────────────────────────────────
                context.JobApplications.AddRange(
                    new JobApplication { Id = Guid.NewGuid(), StudentId = s1.Id, PlacementDriveId = driveZoho.Id, Status = "Shortlisted", Remarks = "Highly recommended for fullstack role.", AppliedAt = DateTime.UtcNow.AddDays(-2) },
                    new JobApplication { Id = Guid.NewGuid(), StudentId = s2.Id, PlacementDriveId = driveZoho.Id, Status = "Applied", Remarks = "", AppliedAt = DateTime.UtcNow.AddDays(-2) },
                    new JobApplication { Id = Guid.NewGuid(), StudentId = s3.Id, PlacementDriveId = driveZoho.Id, Status = "Applied", Remarks = "", AppliedAt = DateTime.UtcNow.AddDays(-1) },
                    new JobApplication { Id = Guid.NewGuid(), StudentId = s1.Id, PlacementDriveId = driveFreshworks.Id, Status = "Applied", Remarks = "", AppliedAt = DateTime.UtcNow.AddDays(-3) },
                    new JobApplication { Id = Guid.NewGuid(), StudentId = s5.Id, PlacementDriveId = driveFreshworks.Id, Status = "Under Review", Remarks = "Portfolio under review by recruiters.", AppliedAt = DateTime.UtcNow.AddDays(-2) }
                );

                context.SaveChanges();
            }

            if (!context.Users.Any(u => u.Email == "ahimaaz@mcc.edu.in"))
            {
                var user = new User
                {
                    Id = Guid.NewGuid(),
                    Email = "ahimaaz@mcc.edu.in",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("trustinGod"),
                    Role = "Student",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                context.Users.Add(user);
                context.SaveChanges();

                var student = new Student
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    RollNumber = "24-MCA-011",
                    FirstName = "Ahimaaz",
                    LastName = "Student",
                    Department = "Computer Applications (MCA)",
                    BatchYear = "2024-2026",
                    Bio = "Student at Madras Christian College.",
                    AvatarUrl = "",
                    Cgpa = 8.5
                };
                context.Students.Add(student);
                context.SaveChanges();

                context.Portfolios.Add(new MCC.Portfolio.API.Models.Portfolio
                {
                    Id = Guid.NewGuid(),
                    StudentId = student.Id,
                    Slug = "ahimaaz-student",
                    IsPublic = true,
                    IsApproved = true,
                    LayoutSettingsJson = "{\"theme\":\"academic\",\"visibleSections\":[\"about\",\"projects\",\"publications\",\"certifications\",\"achievements\",\"community\"]}",
                    StatementOfPurpose = "My objective is to build modern, secure applications for institutional and enterprise needs.",
                    StoryTitle = "About Me",
                    StoryContent = "I am a computer applications student at Madras Christian College."
                });
                 context.SaveChanges();
            }

            if (!context.Users.Any(u => u.Email == "studentaffairs@mcc.edu.in"))
            {
                var studentAffairsUser = new User
                {
                    Id = Guid.NewGuid(),
                    Email = "studentaffairs@mcc.edu.in",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                    Role = "StudentAffairsCoordinator",
                    FirstName = "Michael",
                    LastName = "Vasanth",
                    Department = "Student Affairs",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                context.Users.Add(studentAffairsUser);
                context.SaveChanges();
            }

            // ─────────────────────────────────────────────────────────────
            // ALUMNI 1 — Divya Nair  (MCA 2020-2022 | Software Engineer @ Zoho)
            // ─────────────────────────────────────────────────────────────
            if (!context.Users.Any(u => u.Email == "alumni01@mcc.edu.in"))
            {
                var aUser1 = new User
                {
                    Id = Guid.NewGuid(), Email = "alumni01@mcc.edu.in",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                    Role = "Student", FirstName = "Divya", LastName = "Nair",
                    Department = "Computer Applications (MCA)",
                    CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
                };
                context.Users.Add(aUser1); context.SaveChanges();

                var al1 = new Student
                {
                    Id = Guid.NewGuid(), UserId = aUser1.Id,
                    RollNumber = "20-MCA-014", FirstName = "Divya", LastName = "Nair",
                    Department = "Computer Applications (MCA)", BatchYear = "2020-2022",
                    Bio = "Full-Stack Software Engineer at Zoho Corporation. Alumni of MCC MCA programme. Passionate about developer tooling and SaaS product engineering.",
                    AvatarUrl = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
                    Cgpa = 8.75, GithubUsername = "divya-nair-dev", BehanceUsername = "",
                    IsAlumni = true, CurrentCompany = "Zoho Corporation", CurrentRole = "Software Engineer II"
                };
                context.Students.Add(al1); context.SaveChanges();

                context.Portfolios.Add(new MCC.Portfolio.API.Models.Portfolio
                {
                    Id = Guid.NewGuid(), StudentId = al1.Id, Slug = "divya-nair", IsPublic = true, IsApproved = true,
                    LayoutSettingsJson = "{\"theme\":\"futuristic\",\"visibleSections\":[\"about\",\"projects\",\"certifications\",\"achievements\"]}",
                    StatementOfPurpose = "My journey from MCC to Zoho has taught me that great software is built by empathetic engineers. I aim to mentor the next generation of MCC students.",
                    StoryTitle = "From Campus to Corporation",
                    StoryContent = "I started at MCC with a curiosity for how apps are built. Four years of industry experience later, I lead a team of five engineers building Zoho's developer portal."
                });
                context.Projects.AddRange(
                    new Project { Id = Guid.NewGuid(), StudentId = al1.Id, Title = "Zoho Creator Workflow Engine", Description = "Designed and built the drag-and-drop workflow automation engine used by 50,000+ Zoho Creator subscribers.", TechnologiesUsed = "Java,React,Kafka,PostgreSQL", GithubUrl = "", LiveUrl = "https://creator.zoho.com", ImageUrl = "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=300", CreatedAt = DateTime.UtcNow.AddDays(-200) },
                    new Project { Id = Guid.NewGuid(), StudentId = al1.Id, Title = "MCC Alumni Connect App", Description = "A mobile-friendly alumni networking app built as a capstone project at MCC. Won Best Project Award 2022.", TechnologiesUsed = "React Native,Node.js,MongoDB", GithubUrl = "https://github.com/divya-nair-dev/alumni-connect", LiveUrl = "", ImageUrl = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=300", CreatedAt = DateTime.UtcNow.AddDays(-500) }
                );
                context.Certifications.Add(new Certification { Id = Guid.NewGuid(), StudentId = al1.Id, Name = "Oracle Certified Java SE 11 Developer", IssuingOrganization = "Oracle", IssueDate = new DateTime(2022, 7, 10, 0, 0, 0, DateTimeKind.Utc), CredentialId = "ORA-JAVA-11-30291", CredentialUrl = "https://oracle.com/verify" });
                context.Achievements.Add(new Achievement { Id = Guid.NewGuid(), StudentId = al1.Id, Title = "Best Outgoing Student – MCA 2022", Description = "Awarded best outgoing student for academic excellence and contributions to the MCC Tech Society.", DateEarned = new DateTime(2022, 5, 15, 0, 0, 0, DateTimeKind.Utc), Category = "Extracurricular" });
                context.SaveChanges();
            }

            // ─────────────────────────────────────────────────────────────
            // ALUMNI 2 — Suresh Babu  (MSc CS 2019-2021 | Data Scientist @ Freshworks)
            // ─────────────────────────────────────────────────────────────
            if (!context.Users.Any(u => u.Email == "alumni02@mcc.edu.in"))
            {
                var aUser2 = new User
                {
                    Id = Guid.NewGuid(), Email = "alumni02@mcc.edu.in",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                    Role = "Student", FirstName = "Suresh", LastName = "Babu",
                    Department = "Computer Science (MSc)",
                    CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
                };
                context.Users.Add(aUser2); context.SaveChanges();

                var al2 = new Student
                {
                    Id = Guid.NewGuid(), UserId = aUser2.Id,
                    RollNumber = "19-MSC-007", FirstName = "Suresh", LastName = "Babu",
                    Department = "Computer Science (MSc)", BatchYear = "2019-2021",
                    Bio = "Data Scientist at Freshworks leading CRM analytics initiatives. Research interests include recommendation systems and time-series forecasting.",
                    AvatarUrl = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
                    Cgpa = 9.10, GithubUsername = "suresh-babu-ds", BehanceUsername = "",
                    IsAlumni = true, CurrentCompany = "Freshworks", CurrentRole = "Senior Data Scientist"
                };
                context.Students.Add(al2); context.SaveChanges();

                context.Portfolios.Add(new MCC.Portfolio.API.Models.Portfolio
                {
                    Id = Guid.NewGuid(), StudentId = al2.Id, Slug = "suresh-babu", IsPublic = true, IsApproved = true,
                    LayoutSettingsJson = "{\"theme\":\"academic\",\"visibleSections\":[\"about\",\"projects\",\"publications\",\"certifications\",\"achievements\"]}",
                    StatementOfPurpose = "I leverage machine learning to decode customer behaviour patterns and drive product decisions at scale. My time at MCC gave me the analytical foundation I needed.",
                    StoryTitle = "Data is the New Language",
                    StoryContent = "Statistics felt abstract until I built my first ML model during my MSc at MCC. Today I ship models to millions of Freshworks users daily."
                });
                context.Projects.AddRange(
                    new Project { Id = Guid.NewGuid(), StudentId = al2.Id, Title = "Freshdesk Intelligent Ticket Routing", Description = "ML pipeline that auto-routes 2M+ monthly support tickets to the correct agent with 91% precision using NLP and collaborative filtering.", TechnologiesUsed = "Python,Scikit-Learn,Spark,Kafka,AWS SageMaker", GithubUrl = "", LiveUrl = "https://freshdesk.com", ImageUrl = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=300", CreatedAt = DateTime.UtcNow.AddDays(-180) },
                    new Project { Id = Guid.NewGuid(), StudentId = al2.Id, Title = "Customer Churn Predictor", Description = "Gradient boosted ensemble model predicting SaaS churn 90 days in advance with 87% recall, deployed on AWS.", TechnologiesUsed = "Python,XGBoost,LightGBM,FastAPI,Docker", GithubUrl = "https://github.com/suresh-babu-ds/churn-predictor", LiveUrl = "", ImageUrl = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=300", CreatedAt = DateTime.UtcNow.AddDays(-400) }
                );
                context.Certifications.Add(new Certification { Id = Guid.NewGuid(), StudentId = al2.Id, Name = "AWS Certified Machine Learning – Specialty", IssuingOrganization = "Amazon Web Services", IssueDate = new DateTime(2023, 3, 20, 0, 0, 0, DateTimeKind.Utc), CredentialId = "AWS-MLS-82910", CredentialUrl = "https://aws.amazon.com/verification" });
                context.Publications.Add(new Publication { Id = Guid.NewGuid(), StudentId = al2.Id, Title = "Temporal Fusion Transformers for Multi-Horizon B2B Churn Forecasting", JournalOrConference = "KDD Workshop on Applied Data Science", PublishDate = new DateTime(2023, 8, 12, 0, 0, 0, DateTimeKind.Utc), PaperUrl = "https://dl.acm.org/kdd2023-churn", Abstract = "We apply TFT models on enterprise SaaS telemetry to generate interpretable 30/60/90-day churn risk scores, outperforming LSTM baselines by 14% AUROC.", Authors = "Suresh Babu, Neha Sharma" });
                context.Achievements.Add(new Achievement { Id = Guid.NewGuid(), StudentId = al2.Id, Title = "Freshworks Innovator of the Quarter – Q3 2023", Description = "Recognised for delivering the churn predictor model that saved $2.4M in annual recurring revenue.", DateEarned = new DateTime(2023, 10, 1, 0, 0, 0, DateTimeKind.Utc), Category = "Extracurricular" });
                context.SaveChanges();
            }

            // ─────────────────────────────────────────────────────────────
            // ALUMNI 3 — Meenakshi Sundar  (MCA 2021-2023 | UI/UX Designer @ Infosys)
            // ─────────────────────────────────────────────────────────────
            if (!context.Users.Any(u => u.Email == "alumni03@mcc.edu.in"))
            {
                var aUser3 = new User
                {
                    Id = Guid.NewGuid(), Email = "alumni03@mcc.edu.in",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                    Role = "Student", FirstName = "Meenakshi", LastName = "Sundar",
                    Department = "Computer Applications (MCA)",
                    CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
                };
                context.Users.Add(aUser3); context.SaveChanges();

                var al3 = new Student
                {
                    Id = Guid.NewGuid(), UserId = aUser3.Id,
                    RollNumber = "21-MCA-009", FirstName = "Meenakshi", LastName = "Sundar",
                    Department = "Computer Applications (MCA)", BatchYear = "2021-2023",
                    Bio = "UI/UX Designer at Infosys BPM specialising in enterprise application redesign and design system architecture. MCC batch topper 2023.",
                    AvatarUrl = "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=150",
                    Cgpa = 9.35, GithubUsername = "meenakshi-ux", BehanceUsername = "meenakshi-sundar-design",
                    IsAlumni = true, CurrentCompany = "Infosys BPM", CurrentRole = "UI/UX Designer"
                };
                context.Students.Add(al3); context.SaveChanges();

                context.Portfolios.Add(new MCC.Portfolio.API.Models.Portfolio
                {
                    Id = Guid.NewGuid(), StudentId = al3.Id, Slug = "meenakshi-sundar", IsPublic = true, IsApproved = true,
                    LayoutSettingsJson = "{\"theme\":\"creative\",\"visibleSections\":[\"about\",\"projects\",\"certifications\",\"achievements\"]}",
                    StatementOfPurpose = "Design is not decoration — it is problem solving. I craft enterprise interfaces that reduce cognitive load and improve measurable business outcomes.",
                    StoryTitle = "Pixels with Purpose",
                    StoryContent = "My love for design began in the MCC computer labs, wireframing on paper before learning Figma. Now I lead redesign initiatives across Infosys's healthcare portfolio."
                });
                context.Projects.AddRange(
                    new Project { Id = Guid.NewGuid(), StudentId = al3.Id, Title = "Infosys HealthSuite Portal Redesign", Description = "End-to-end UX redesign of a hospital management portal used by 200+ hospitals in Southeast Asia, reducing task completion time by 34%.", TechnologiesUsed = "Figma,React,WCAG2.1,Storybook", GithubUrl = "", LiveUrl = "https://infosys.com/healthsuite", ImageUrl = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=300", CreatedAt = DateTime.UtcNow.AddDays(-150) },
                    new Project { Id = Guid.NewGuid(), StudentId = al3.Id, Title = "MCC Student Portal Design System", Description = "Designed the component library and visual design language for the MCC Student Portfolio Ecosystem as a capstone project.", TechnologiesUsed = "Figma,TailwindCSS,Next.js,Storybook", GithubUrl = "https://github.com/meenakshi-ux/mcc-design-system", LiveUrl = "", ImageUrl = "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=300", CreatedAt = DateTime.UtcNow.AddDays(-450) }
                );
                context.Certifications.AddRange(
                    new Certification { Id = Guid.NewGuid(), StudentId = al3.Id, Name = "Google UX Design Professional Certificate", IssuingOrganization = "Google / Coursera", IssueDate = new DateTime(2023, 6, 1, 0, 0, 0, DateTimeKind.Utc), CredentialId = "GOOG-UX-44820", CredentialUrl = "https://coursera.org/verify/ux-google" },
                    new Certification { Id = Guid.NewGuid(), StudentId = al3.Id, Name = "Nielsen Norman Group UX Certification", IssuingOrganization = "Nielsen Norman Group", IssueDate = new DateTime(2024, 2, 15, 0, 0, 0, DateTimeKind.Utc), CredentialId = "NNG-UX-9902", CredentialUrl = "https://nngroup.com/verify" }
                );
                context.Achievements.Add(new Achievement { Id = Guid.NewGuid(), StudentId = al3.Id, Title = "MCA Batch Topper 2023 – Gold Medal", Description = "Awarded the gold medal for achieving the highest CGPA in the MCA graduating class of 2023.", DateEarned = new DateTime(2023, 5, 20, 0, 0, 0, DateTimeKind.Utc), Category = "Extracurricular" });
                context.SaveChanges();
            }

            // ─────────────────────────────────────────────────────────────
            // ALUMNI 4 — Karthik Murali  (MBA 2020-2022 | Product Manager @ TCS)
            // ─────────────────────────────────────────────────────────────
            if (!context.Users.Any(u => u.Email == "alumni04@mcc.edu.in"))
            {
                var aUser4 = new User
                {
                    Id = Guid.NewGuid(), Email = "alumni04@mcc.edu.in",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                    Role = "Student", FirstName = "Karthik", LastName = "Murali",
                    Department = "Business Administration (MBA)",
                    CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
                };
                context.Users.Add(aUser4); context.SaveChanges();

                var al4 = new Student
                {
                    Id = Guid.NewGuid(), UserId = aUser4.Id,
                    RollNumber = "20-MBA-003", FirstName = "Karthik", LastName = "Murali",
                    Department = "Business Administration (MBA)", BatchYear = "2020-2022",
                    Bio = "Product Manager at TCS Digital driving fintech transformation initiatives. Alumnus of MCC MBA programme with a passion for agile product development.",
                    AvatarUrl = "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150",
                    Cgpa = 8.50, GithubUsername = "karthik-pm", BehanceUsername = "",
                    IsAlumni = true, CurrentCompany = "Tata Consultancy Services", CurrentRole = "Associate Product Manager"
                };
                context.Students.Add(al4); context.SaveChanges();

                context.Portfolios.Add(new MCC.Portfolio.API.Models.Portfolio
                {
                    Id = Guid.NewGuid(), StudentId = al4.Id, Slug = "karthik-murali", IsPublic = true, IsApproved = true,
                    LayoutSettingsJson = "{\"theme\":\"corporate\",\"visibleSections\":[\"about\",\"projects\",\"certifications\",\"achievements\",\"community\"]}",
                    StatementOfPurpose = "I bridge the gap between business strategy and technology execution. My goal is to build fintech products that serve the underbanked population of India.",
                    StoryTitle = "Strategy Meets Technology",
                    StoryContent = "An MBA at MCC shaped my understanding of markets and people. Joining TCS's digital division, I now define product roadmaps that reach 30M+ end users."
                });
                context.Projects.AddRange(
                    new Project { Id = Guid.NewGuid(), StudentId = al4.Id, Title = "TCS BaNCS Digital Onboarding Module", Description = "Led the product discovery and roadmap for a paperless bank account onboarding flow reducing processing time from 3 days to 4 hours.", TechnologiesUsed = "Figma,Jira,Confluence,REST APIs", GithubUrl = "", LiveUrl = "https://tcs.com/bancs", ImageUrl = "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=300", CreatedAt = DateTime.UtcNow.AddDays(-220) },
                    new Project { Id = Guid.NewGuid(), StudentId = al4.Id, Title = "MCC StartupLaunch Platform – Product Concept", Description = "Capstone MBA project: a platform connecting MCC student entrepreneurs with angel investors. Presented to CII Tamil Nadu Chapter.", TechnologiesUsed = "Market Research,Business Model Canvas,Figma", GithubUrl = "", LiveUrl = "", ImageUrl = "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=300", CreatedAt = DateTime.UtcNow.AddDays(-600) }
                );
                context.Certifications.AddRange(
                    new Certification { Id = Guid.NewGuid(), StudentId = al4.Id, Name = "Certified Scrum Product Owner (CSPO)", IssuingOrganization = "Scrum Alliance", IssueDate = new DateTime(2023, 1, 10, 0, 0, 0, DateTimeKind.Utc), CredentialId = "CSPO-2023-11293", CredentialUrl = "https://scrumalliance.org/verify" },
                    new Certification { Id = Guid.NewGuid(), StudentId = al4.Id, Name = "AWS Cloud Practitioner", IssuingOrganization = "Amazon Web Services", IssueDate = new DateTime(2022, 9, 5, 0, 0, 0, DateTimeKind.Utc), CredentialId = "AWS-CLP-30021", CredentialUrl = "https://aws.amazon.com/verification" }
                );
                context.Achievements.Add(new Achievement { Id = Guid.NewGuid(), StudentId = al4.Id, Title = "CII Young Leader Award 2024", Description = "Recognised by the Confederation of Indian Industry Tamil Nadu as a Young Leader for contributions to fintech product innovation.", DateEarned = new DateTime(2024, 3, 15, 0, 0, 0, DateTimeKind.Utc), Category = "Extracurricular" });
                context.CommunityServices.Add(new CommunityService { Id = Guid.NewGuid(), StudentId = al4.Id, Organization = "MCC Alumni Mentorship Programme", Role = "Mentor", Description = "Voluntarily mentors 10 current MCA and MBA students on product management career paths through monthly 1:1 sessions.", StartDate = new DateTime(2023, 6, 1, 0, 0, 0, DateTimeKind.Utc), EndDate = null });
                context.SaveChanges();
            }

            // ─────────────────────────────────────────────────────────────
            // ALUMNI 5 — Nivetha Pillai  (MSc CS 2021-2023 | Security Researcher @ HCL)
            // ─────────────────────────────────────────────────────────────
            if (!context.Users.Any(u => u.Email == "alumni05@mcc.edu.in"))
            {
                var aUser5 = new User
                {
                    Id = Guid.NewGuid(), Email = "alumni05@mcc.edu.in",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                    Role = "Student", FirstName = "Nivetha", LastName = "Pillai",
                    Department = "Computer Science (MSc)",
                    CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
                };
                context.Users.Add(aUser5); context.SaveChanges();

                var al5 = new Student
                {
                    Id = Guid.NewGuid(), UserId = aUser5.Id,
                    RollNumber = "21-MSC-005", FirstName = "Nivetha", LastName = "Pillai",
                    Department = "Computer Science (MSc)", BatchYear = "2021-2023",
                    Bio = "Application Security Researcher at HCL Technologies. CEH and OSCP certified. Contributes to open-source vulnerability disclosure programmes.",
                    AvatarUrl = "https://images.unsplash.com/photo-1489424731084-a5d8b2c0a085?auto=format&fit=crop&q=80&w=150",
                    Cgpa = 8.90, GithubUsername = "nivetha-sec", BehanceUsername = "",
                    IsAlumni = true, CurrentCompany = "HCL Technologies", CurrentRole = "Application Security Researcher"
                };
                context.Students.Add(al5); context.SaveChanges();

                context.Portfolios.Add(new MCC.Portfolio.API.Models.Portfolio
                {
                    Id = Guid.NewGuid(), StudentId = al5.Id, Slug = "nivetha-pillai", IsPublic = true, IsApproved = true,
                    LayoutSettingsJson = "{\"theme\":\"startup\",\"visibleSections\":[\"about\",\"projects\",\"publications\",\"certifications\",\"achievements\"]}",
                    StatementOfPurpose = "I protect digital infrastructure by hunting vulnerabilities before malicious actors do. Responsible disclosure and open-source security tooling are my passions.",
                    StoryTitle = "Hunting Bugs for Good",
                    StoryContent = "My first CVE submission was during my MSc at MCC. That rush of finding a real vulnerability in production software never left me. Now I do it professionally at HCL."
                });
                context.Projects.AddRange(
                    new Project { Id = Guid.NewGuid(), StudentId = al5.Id, Title = "SecureScan – SAST Pipeline Integrator", Description = "An open-source GitHub Actions workflow integrating OWASP ZAP, Bandit, and Semgrep into CI/CD pipelines with unified reporting dashboards.", TechnologiesUsed = "Python,GitHub Actions,Docker,OWASP ZAP,Semgrep", GithubUrl = "https://github.com/nivetha-sec/securescan", LiveUrl = "", ImageUrl = "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=300", CreatedAt = DateTime.UtcNow.AddDays(-160) },
                    new Project { Id = Guid.NewGuid(), StudentId = al5.Id, Title = "IoT Firmware Vulnerability Scanner", Description = "Static analysis tool for embedded Linux firmware images, identifying hardcoded credentials, insecure boot configs, and CVE-mapped vulnerabilities.", TechnologiesUsed = "Python,Binwalk,Strings,CVE DB,Bash", GithubUrl = "https://github.com/nivetha-sec/iot-fwscan", LiveUrl = "", ImageUrl = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=300", CreatedAt = DateTime.UtcNow.AddDays(-380) }
                );
                context.Certifications.AddRange(
                    new Certification { Id = Guid.NewGuid(), StudentId = al5.Id, Name = "Offensive Security Certified Professional (OSCP)", IssuingOrganization = "Offensive Security", IssueDate = new DateTime(2024, 1, 22, 0, 0, 0, DateTimeKind.Utc), CredentialId = "OSCP-OS-77201", CredentialUrl = "https://offensive-security.com/verify" },
                    new Certification { Id = Guid.NewGuid(), StudentId = al5.Id, Name = "Certified Ethical Hacker (CEH) v12", IssuingOrganization = "EC-Council", IssueDate = new DateTime(2023, 8, 10, 0, 0, 0, DateTimeKind.Utc), CredentialId = "CEH-V12-88110", CredentialUrl = "https://eccouncil.org/verify" }
                );
                context.Publications.Add(new Publication { Id = Guid.NewGuid(), StudentId = al5.Id, Title = "Automated IoT Firmware Vulnerability Discovery Using Static and Dynamic Taint Analysis", JournalOrConference = "IEEE Security & Privacy Symposium", PublishDate = new DateTime(2024, 5, 8, 0, 0, 0, DateTimeKind.Utc), PaperUrl = "https://ieeexplore.ieee.org/iot-firmware-2024", Abstract = "We present a hybrid static-dynamic taint analysis framework for IoT firmware security evaluation, discovering 23 previously undisclosed CVEs across 15 consumer devices.", Authors = "Nivetha Pillai, Dr. Sudharsana K." });
                context.Achievements.AddRange(
                    new Achievement { Id = Guid.NewGuid(), StudentId = al5.Id, Title = "CVE-2024-3812 – HCL Discovered Vulnerability", Description = "Discovered and responsibly disclosed a critical RCE vulnerability in a widely-deployed enterprise CMS platform, acknowledged in the National Vulnerability Database.", DateEarned = new DateTime(2024, 4, 10, 0, 0, 0, DateTimeKind.Utc), Category = "Extracurricular" },
                    new Achievement { Id = Guid.NewGuid(), StudentId = al5.Id, Title = "HackerOne Hall of Fame 2024", Description = "Recognised in HackerOne's Hall of Fame for responsible disclosure of 8 high/critical severity vulnerabilities in bug bounty programmes.", DateEarned = new DateTime(2024, 12, 1, 0, 0, 0, DateTimeKind.Utc), Category = "Hackathon" }
                );
                context.SaveChanges();
            }
        }
    }
}
