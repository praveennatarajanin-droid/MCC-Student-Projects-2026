using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace MccPortfolio.Api.Services
{
    public interface IAISuggestionService
    {
        string GenerateSop(string studentName, string department, string focusArea, string careerGoals, string skillsList, string projectTitles);
        List<string> GetResumeSuggestions(string bio, string skillsList, string projectTitles, string certificationsList);
        string GetCareerRecommendations(string department, string skillsList, string bio);
        List<string> GetPortfolioImprovements(string bio, string headline, string skillsList, int projectCount, int certCount, int hackathonCount, int researchCount, bool hasSop, bool hasResume);
        List<UniversityRecommendation> GetUniversityRecommendations(string department, string skillsList, string careerGoal, double cgpa);
        List<InternshipMatch> GetInternshipMatches(string department, string skillsList, string headline);
        List<ScholarshipSuggestion> GetScholarshipSuggestions(string department, string skillsList, double cgpa, string bio);
    }

    // ─── DTOs ───────────────────────────────────────────────────────────────────

    public class UniversityRecommendation
    {
        public string Name { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public string Program { get; set; } = string.Empty;
        public string Ranking { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public string MatchStrength { get; set; } = "Good"; // "Strong", "Good", "Reach"
    }

    public class InternshipMatch
    {
        public string Company { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Skills { get; set; } = string.Empty;
        public string Stipend { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string ApplyUrl { get; set; } = string.Empty;
        public int MatchPercent { get; set; } = 75;
    }

    public class ScholarshipSuggestion
    {
        public string Name { get; set; } = string.Empty;
        public string Provider { get; set; } = string.Empty;
        public string Amount { get; set; } = string.Empty;
        public string Eligibility { get; set; } = string.Empty;
        public string Deadline { get; set; } = string.Empty;
        public string ApplyUrl { get; set; } = string.Empty;
        public string Category { get; set; } = "Merit"; // "Merit", "Need-Based", "Research", "Sports"
    }

    // ─── Service ─────────────────────────────────────────────────────────────────

    public class AISuggestionService : IAISuggestionService
    {
        public string GenerateSop(string studentName, string department, string focusArea, string careerGoals, string skillsList, string projectTitles)
        {
            var skills = (skillsList ?? "").Split(new[] { ';', ',' }, StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim()).ToList();
            var projects = (projectTitles ?? "").Split(new[] { ';', ',' }, StringSplitOptions.RemoveEmptyEntries).Select(p => p.Trim()).ToList();

            var sb = new StringBuilder();
            sb.AppendLine("STATEMENT OF PURPOSE");
            sb.AppendLine($"Applicant: {studentName}  |  Department: {department}");
            sb.AppendLine(new string('─', 60));
            sb.AppendLine();

            sb.AppendLine($"Ever since my academic journey began at Madras Christian College, I have been driven by a deep curiosity to explore the frontiers of modern technology and apply them to real-world problems. The historic campus and the culture of intellectual pursuit at MCC have not only shaped my technical acumen but instilled in me a relentless desire to create meaningful impact through engineering and innovation.");
            sb.AppendLine();

            if (skills.Any())
            {
                var skillSample = string.Join(", ", skills.Take(5));
                sb.AppendLine($"Over the course of my undergraduate studies, I have cultivated strong technical proficiencies in {skillSample}. These competencies were not merely academic — they were forged through hands-on development, collaborative projects, and independent exploration of cutting-edge tools and architectures.");
            }
            sb.AppendLine();

            if (projects.Any())
            {
                sb.AppendLine($"My most significant practical contribution was the development of '{projects.First()}'. This project pushed me to bridge classroom theory with real-world system design, requiring me to make architectural decisions, optimize for performance, and prioritize user experience. It fundamentally transformed how I think about software engineering.");
                if (projects.Count > 1)
                    sb.AppendLine($"My parallel work on '{projects[1]}' further deepened my understanding of collaborative development, code quality practices, and scalable system integration.");
            }
            sb.AppendLine();

            sb.AppendLine($"My goal of pursuing {focusArea} stems from its extraordinary potential to reshape industries and human productivity. I aspire to {careerGoals}. I believe the rigor, research culture, and collaborative ecosystem of your institution/organization will provide the precise environment to catalyze this ambition into tangible outcomes.");
            sb.AppendLine();

            sb.AppendLine($"I am eager to contribute my technical foundations, creative problem-solving, and the disciplined work ethic shaped by MCC's academic tradition. I look forward to the opportunity to grow under your mentorship and to contribute meaningfully to your community. Thank you sincerely for your consideration.");

            return sb.ToString();
        }

        public List<string> GetResumeSuggestions(string bio, string skillsList, string projectTitles, string certificationsList)
        {
            var suggestions = new List<string>();
            var skills = (skillsList ?? "").Split(new[] { ';', ',' }, StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim()).ToList();
            var projects = (projectTitles ?? "").Split(new[] { ';', ',' }, StringSplitOptions.RemoveEmptyEntries).Select(p => p.Trim()).ToList();
            var certs = (certificationsList ?? "").Split(new[] { ';', ',' }, StringSplitOptions.RemoveEmptyEntries).Select(c => c.Trim()).ToList();

            if (skills.Count < 5)
                suggestions.Add("Expand your skills section — aim for 6–10 targeted skills. Add sub-skills like Git, Docker, REST APIs, or specific databases you have worked with.");
            else
                suggestions.Add("Strong skills matrix — categorize them into 'Languages', 'Frameworks', and 'Tools' sections so recruiter scanners and ATS systems can parse them effectively.");

            if (!projects.Any())
                suggestions.Add("No projects listed — this is critical. Add at least 2 projects showing a modern tech stack such as React, Next.js, ASP.NET Core, or PostgreSQL with GitHub links.");
            else if (projects.Count < 2)
                suggestions.Add("Add one more diverse project — ideally showing database design, API integration, or a full-stack solution to demonstrate depth.");
            else
                suggestions.Add("Good project presence — begin each bullet point with a strong action verb ('Engineered', 'Optimized', 'Architected') and include measurable outcomes where possible.");

            if (!certs.Any())
                suggestions.Add("Add at least one industry certification from AWS, Microsoft Azure, Google Cloud, or a credible MOOC platform (Coursera, Udemy) to demonstrate specialized knowledge.");
            else
                suggestions.Add("Link your certifications to verified digital badges (e.g., Credly, Coursera certificates) so employers can verify credentials in one click.");

            if (string.IsNullOrEmpty(bio) || bio.Length < 40)
                suggestions.Add("Your professional summary is too brief. Write a compelling 3-sentence summary: your current major, your strongest technical passion, and your primary career objective.");

            suggestions.Add("Quantify your impact — where possible, add numbers: 'Reduced API response time by 35%', 'Served 200+ users', or 'Processed 10,000 records daily'.");
            suggestions.Add("Add a LinkedIn and GitHub URL to the top of your resume contact block — 80% of tech hiring managers visit them before interviewing a candidate.");

            return suggestions;
        }

        public string GetCareerRecommendations(string department, string skillsList, string bio)
        {
            var skills = (skillsList ?? "").Split(new[] { ';', ',' }, StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim()).ToList();
            var dept = (department ?? "").ToLower();

            var sb = new StringBuilder();
            sb.AppendLine("CAREER PATH RECOMMENDATIONS");
            sb.AppendLine(new string('─', 60));
            sb.AppendLine();

            if (dept.Contains("computer") || dept.Contains("cs") || dept.Contains("it") || skills.Any(s => s.Contains("React") || s.Contains(".NET") || s.Contains("Python")))
            {
                sb.AppendLine("1. FULL STACK DEVELOPER  [High Match]");
                sb.AppendLine("   Your current skill set maps directly to the highest demand tech role in India.");
                sb.AppendLine("   → Next step: Build one end-to-end project (frontend + API + DB) and deploy it on Vercel/Railway.");
                sb.AppendLine("   → Expected salary range (Chennai): ₹8–22 LPA (3 years exp.)");
                sb.AppendLine();
                sb.AppendLine("2. CLOUD & DEVOPS ENGINEER  [Strong Potential]");
                sb.AppendLine("   Cloud adoption in enterprise India is accelerating rapidly.");
                sb.AppendLine("   → Next step: Pursue AWS Cloud Practitioner or Azure Fundamentals certification.");
                sb.AppendLine("   → Expected salary range: ₹10–28 LPA");
                sb.AppendLine();
                sb.AppendLine("3. AI/ML ENGINEER  [Emerging Opportunity]");
                sb.AppendLine("   AI transformation is creating massive demand for engineers who can implement models.");
                sb.AppendLine("   → Next step: Complete a course on Python ML libraries (scikit-learn, TensorFlow).");
                sb.AppendLine("   → Expected salary range: ₹12–35 LPA");
            }
            else if (dept.Contains("commerce") || dept.Contains("com") || dept.Contains("business"))
            {
                sb.AppendLine("1. FINTECH ANALYST  [High Match]");
                sb.AppendLine("   Your commerce foundation paired with basic data tools positions you for India's booming FinTech sector.");
                sb.AppendLine("   → Next step: Learn SQL and Power BI; start with a financial data dashboard project.");
                sb.AppendLine();
                sb.AppendLine("2. BUSINESS SYSTEMS ANALYST");
                sb.AppendLine("   Bridge the gap between business teams and software developers.");
                sb.AppendLine("   → Next step: Study agile/scrum methodologies and practice user story writing.");
                sb.AppendLine();
                sb.AppendLine("3. DATA ANALYST  [Immediate Opportunity]");
                sb.AppendLine("   Every company needs data storytellers.");
                sb.AppendLine("   → Next step: Learn Excel + Python (Pandas) + Power BI. Join Kaggle competitions.");
            }
            else
            {
                sb.AppendLine("1. SCIENTIFIC COMPUTING SPECIALIST");
                sb.AppendLine("   Your scientific background uniquely positions you for research-driven tech roles.");
                sb.AppendLine("   → Next step: Learn Python (NumPy, Pandas, Matplotlib) and a statistical modeling library.");
                sb.AppendLine();
                sb.AppendLine("2. RESEARCH & DEVELOPMENT ENGINEER");
                sb.AppendLine("   ISRO, DRDO, CSIR, and tech companies seek multi-disciplinary researchers.");
                sb.AppendLine("   → Next step: Identify a research gap in your field and co-author a paper with a faculty member.");
            }

            sb.AppendLine();
            sb.AppendLine("RECOMMENDED SKILL GAPS TO CLOSE:");
            sb.AppendLine("  → Cloud fundamentals (AWS / GCP / Azure)");
            sb.AppendLine("  → System design & scalability thinking");
            sb.AppendLine("  → Communication & technical presentation skills");

            return sb.ToString();
        }

        public List<string> GetPortfolioImprovements(string bio, string headline, string skillsList, int projectCount, int certCount, int hackathonCount, int researchCount, bool hasSop, bool hasResume)
        {
            var improvements = new List<string>();
            var skills = (skillsList ?? "").Split(new[] { ';', ',' }, StringSplitOptions.RemoveEmptyEntries).ToList();

            if (string.IsNullOrEmpty(headline) || headline.Length < 15)
                improvements.Add("Write a strong professional headline — it's the first thing visitors see. Try: 'Full-Stack Developer | AI Researcher | President, MCC Computer Club'.");

            if (string.IsNullOrEmpty(bio) || bio.Length < 80)
                improvements.Add("Your biography is too short. Write at least 100 words that tell your academic story, what drives you, and your key achievements at MCC.");

            if (!hasSop)
                improvements.Add("Your Statement of Purpose is missing. Use the AI SOP Generator to create one and link your academic narrative to your career vision.");

            if (skills.Count < 6)
                improvements.Add("Add more skills. Recruiters and search algorithms rely on your skills list. Aim for 8–12 relevant technical and soft skills.");

            if (projectCount == 0)
                improvements.Add("Add at least 2–3 coding projects with GitHub links. Projects are the #1 factor in technical hiring decisions.");
            else if (projectCount < 2)
                improvements.Add("Add one more project — ideally one that shows a different domain (e.g., if you have a web app, add a data analysis or mobile project).");

            if (certCount == 0)
                improvements.Add("Add industry certifications to strengthen recruiter confidence. Consider free certifications from Google, AWS, or Microsoft.");

            if (!hasResume)
                improvements.Add("Upload your PDF resume. Recruiters and admin reviewers require a downloadable document for placement records.");

            if (hackathonCount == 0)
                improvements.Add("Participate in and log at least one hackathon. Even 'Participant' status shows initiative and team collaboration skills.");

            if (researchCount == 0)
                improvements.Add("Consider logging a research paper, innovation project, or startup pitch. It dramatically differentiates your profile for graduate admissions.");

            if (improvements.Count == 0)
                improvements.Add("Your portfolio is comprehensive. Consider adding external links (published articles, open-source contributions, or an award citation) to reach 100% profile completeness.");

            return improvements;
        }

        public List<UniversityRecommendation> GetUniversityRecommendations(string department, string skillsList, string careerGoal, double cgpa)
        {
            var skills = (skillsList ?? "").Split(new[] { ';', ',' }, StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim()).ToList();
            var dept = (department ?? "").ToLower();
            var goal = (careerGoal ?? "").ToLower();
            var recommendations = new List<UniversityRecommendation>();

            bool isCS = dept.Contains("computer") || dept.Contains("cs") || dept.Contains("it");
            bool isAI = goal.Contains("ai") || goal.Contains("machine") || goal.Contains("data");

            if (isCS || isAI)
            {
                recommendations.Add(new UniversityRecommendation
                {
                    Name = "Carnegie Mellon University",
                    Country = "USA 🇺🇸",
                    Program = "M.S. in Computational Data Science",
                    Ranking = "#1 CS Program in the world",
                    Reason = "World-renowned CS and AI research ecosystem with exceptional industry placement at Google, Meta, and DeepMind.",
                    Url = "https://csd.cmu.edu",
                    MatchStrength = cgpa >= 8.5 ? "Strong" : "Reach"
                });
                recommendations.Add(new UniversityRecommendation
                {
                    Name = "National University of Singapore",
                    Country = "Singapore 🇸🇬",
                    Program = "M.Sc. in Computer Science",
                    Ranking = "Top 15 Globally | #1 in Asia",
                    Reason = "Strong ties with Southeast Asia's tech ecosystem. Excellent for full-stack and systems engineering careers. High scholarship availability for Indian students.",
                    Url = "https://www.nus.edu.sg",
                    MatchStrength = cgpa >= 8.0 ? "Strong" : "Good"
                });
                recommendations.Add(new UniversityRecommendation
                {
                    Name = "IIT Madras (M.Tech/M.S. Research)",
                    Country = "India 🇮🇳",
                    Program = "M.Tech. Computer Science & Engineering",
                    Ranking = "#1 Technical Institute in India (NIRF)",
                    Reason = "Accessible via GATE exam. India's premier research institution with strong placement record. Subsidized fees and scholarships available.",
                    Url = "https://www.iitm.ac.in",
                    MatchStrength = cgpa >= 8.0 ? "Strong" : "Good"
                });
                recommendations.Add(new UniversityRecommendation
                {
                    Name = "University of Edinburgh",
                    Country = "UK 🇬🇧",
                    Program = "M.Sc. Artificial Intelligence",
                    Ranking = "Top 20 Globally for AI",
                    Reason = "One of Europe's top AI research hubs. Strong alumni network in UK and global tech companies.",
                    Url = "https://www.ed.ac.uk",
                    MatchStrength = cgpa >= 7.5 ? "Good" : "Reach"
                });
            }
            else
            {
                recommendations.Add(new UniversityRecommendation
                {
                    Name = "XLRI Jamshedpur",
                    Country = "India 🇮🇳",
                    Program = "PGDM Business Management",
                    Ranking = "#1 HR/Business School India (NIRF)",
                    Reason = "Premier management institution. Excellent for transitioning into business analytics, consulting, or FinTech roles.",
                    Url = "https://www.xlri.ac.in",
                    MatchStrength = "Strong"
                });
                recommendations.Add(new UniversityRecommendation
                {
                    Name = "University of Melbourne",
                    Country = "Australia 🇦🇺",
                    Program = "Master of Commerce",
                    Ranking = "Top 40 Globally",
                    Reason = "Strong post-study work visa opportunities in Australia. Renowned for commerce and finance research.",
                    Url = "https://www.unimelb.edu.au",
                    MatchStrength = "Good"
                });
            }

            return recommendations;
        }

        public List<InternshipMatch> GetInternshipMatches(string department, string skillsList, string headline)
        {
            var skills = (skillsList ?? "").Split(new[] { ';', ',' }, StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim().ToLower()).ToList();
            var dept = (department ?? "").ToLower();

            var matches = new List<InternshipMatch>();

            bool hasReact = skills.Any(s => s.Contains("react") || s.Contains("next"));
            bool hasDotNet = skills.Any(s => s.Contains(".net") || s.Contains("asp") || s.Contains("c#"));
            bool hasPython = skills.Any(s => s.Contains("python"));
            bool hasData = skills.Any(s => s.Contains("sql") || s.Contains("data") || s.Contains("pandas"));

            if (hasReact || hasDotNet || dept.Contains("computer"))
            {
                matches.Add(new InternshipMatch { Company = "Zoho Corporation", Role = "Software Development Intern (Full Stack)", Skills = "React, .NET, PostgreSQL", Stipend = "₹25,000/month", Location = "Chennai, India (Hybrid)", ApplyUrl = "https://www.zoho.com/careers", MatchPercent = 92 });
                matches.Add(new InternshipMatch { Company = "Freshworks", Role = "Frontend Engineering Intern", Skills = "React.js, TypeScript, Tailwind CSS", Stipend = "₹30,000/month", Location = "Chennai, India", ApplyUrl = "https://www.freshworks.com/company/careers/", MatchPercent = 88 });
                matches.Add(new InternshipMatch { Company = "Tata Consultancy Services (TCS)", Role = "Digital Trainee – Full Stack", Skills = "Java/.NET, Angular/React, SQL", Stipend = "₹20,000/month", Location = "Pan India", ApplyUrl = "https://www.tcs.com/careers", MatchPercent = 82 });
            }

            if (hasPython || hasData)
            {
                matches.Add(new InternshipMatch { Company = "Mu Sigma", Role = "Data Science Analyst Intern", Skills = "Python, SQL, Machine Learning basics", Stipend = "₹22,000/month", Location = "Bengaluru (Remote OK)", ApplyUrl = "https://www.mu-sigma.com/careers", MatchPercent = 86 });
                matches.Add(new InternshipMatch { Company = "Intellect Design Arena", Role = "Data Engineering Intern", Skills = "Python, Pandas, PostgreSQL, APIs", Stipend = "₹18,000/month", Location = "Chennai, India", ApplyUrl = "https://www.intellectdesign.com/careers/", MatchPercent = 78 });
            }

            if (!matches.Any())
            {
                matches.Add(new InternshipMatch { Company = "Infosys", Role = "Business Technology Analyst Intern", Skills = "Excel, SQL, PowerPoint, Business Analysis", Stipend = "₹18,000/month", Location = "Chennai / Mysore", ApplyUrl = "https://www.infosys.com/careers/", MatchPercent = 72 });
                matches.Add(new InternshipMatch { Company = "ICICI Bank", Role = "FinTech Business Analyst Intern", Skills = "Excel, SQL, Financial Modeling", Stipend = "₹20,000/month", Location = "Chennai, India", ApplyUrl = "https://www.icicibank.com/careers", MatchPercent = 68 });
            }

            return matches.Take(4).ToList();
        }

        public List<ScholarshipSuggestion> GetScholarshipSuggestions(string department, string skillsList, double cgpa, string bio)
        {
            var scholarships = new List<ScholarshipSuggestion>();

            // Always suggest these
            scholarships.Add(new ScholarshipSuggestion
            {
                Name = "National Scholarship Portal (NSP) – Central Sector Scheme",
                Provider = "Ministry of Education, Government of India",
                Amount = "₹12,000 – ₹20,000 per year",
                Eligibility = "12th pass with >80% marks, family income < ₹8 LPA, enrolled in recognized college.",
                Deadline = "October 31 (annual)",
                ApplyUrl = "https://scholarships.gov.in",
                Category = "Need-Based"
            });

            scholarships.Add(new ScholarshipSuggestion
            {
                Name = "INSPIRE Scholarship (SHE Programme)",
                Provider = "Department of Science & Technology, Govt. of India",
                Amount = "₹80,000 per year + ₹20,000 summer research attachment",
                Eligibility = "Top 1% in 12th board exams OR entrance to IIT/NIT. Science stream students.",
                Deadline = "November 30 (annual)",
                ApplyUrl = "https://online-inspire.gov.in",
                Category = "Merit"
            });

            if (cgpa >= 8.0)
            {
                scholarships.Add(new ScholarshipSuggestion
                {
                    Name = "Aditya Birla Scholarship",
                    Provider = "Aditya Birla Group Foundation",
                    Amount = "₹65,000 per year",
                    Eligibility = "Top 20 rank in CAT/IIT-JEE/CLAT. Strong academic record with CGPA ≥ 8.0.",
                    Deadline = "August (varies by year)",
                    ApplyUrl = "https://adityabirlascholars.net",
                    Category = "Merit"
                });
            }

            if (department.ToLower().Contains("computer") || department.ToLower().Contains("cs"))
            {
                scholarships.Add(new ScholarshipSuggestion
                {
                    Name = "Google Generation India Scholarship",
                    Provider = "Google India",
                    Amount = "₹75,000 (one-time) + mentorship & internship opportunity",
                    Eligibility = "Currently enrolled CS/IT/ECE student. Strong academics & community service record required.",
                    Deadline = "December (annual)",
                    ApplyUrl = "https://buildyourfuture.withgoogle.com/scholarships",
                    Category = "Merit"
                });

                scholarships.Add(new ScholarshipSuggestion
                {
                    Name = "Microsoft TEALS Scholarship",
                    Provider = "Microsoft India",
                    Amount = "₹50,000 + cloud computing credits",
                    Eligibility = "Undergraduate CS/IT/ECE student with leadership/volunteering activities in tech education.",
                    Deadline = "September (annual)",
                    ApplyUrl = "https://microsoft.com/en-in/teals",
                    Category = "Merit"
                });
            }

            scholarships.Add(new ScholarshipSuggestion
            {
                Name = "Tata Trust Scholarship (iScholar Portal)",
                Provider = "Tata Trusts",
                Amount = "Up to ₹50,000 per year",
                Eligibility = "Students from underprivileged sections, family income < ₹6 LPA, enrolled in accredited college.",
                Deadline = "September 30 (annual)",
                ApplyUrl = "https://tatatrusts.org/our-work/education",
                Category = "Need-Based"
            });

            return scholarships;
        }
    }
}
