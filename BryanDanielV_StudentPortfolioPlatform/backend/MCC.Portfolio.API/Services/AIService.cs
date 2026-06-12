using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using MCC.Portfolio.API.Models;

namespace MCC.Portfolio.API.Services
{
    public class AIService
    {
        public string GenerateSOP(Student student, string prompt)
        {
            var projectsList = student.Projects.Any()
                ? string.Join(", ", student.Projects.Select(p => p.Title))
                : "various class projects";
            var certsList = student.Certifications.Any()
                ? string.Join(", ", student.Certifications.Select(c => c.Name))
                : "industry-relevant certifications";
            var papersList = student.Publications.Any()
                ? string.Join(", ", student.Publications.Select(p => $"'{p.Title}'"))
                : "";

            var sb = new StringBuilder();
            sb.AppendLine($"STATEMENT OF PURPOSE");
            sb.AppendLine($"Applicant: {student.FirstName} {student.LastName}");
            sb.AppendLine($"Academic Department: {student.Department}, Madras Christian College");
            sb.AppendLine($"Batch Focus: {student.BatchYear}");
            sb.AppendLine($"Current CGPA: {student.Cgpa:F2}/10.00\n");

            string cleanPrompt = (prompt ?? "").Trim();
            string cleanPromptLower = cleanPrompt.ToLower();
            string[] prefixesToRemove = new string[] {
                "write a statement of purpose focusing on",
                "write a statement of purpose about",
                "write an sop focusing on",
                "write an sop about",
                "write a statement of purpose",
                "write an sop",
                "focus on",
                "focusing on",
                "about "
            };

            foreach (var prefix in prefixesToRemove)
            {
                if (cleanPromptLower.StartsWith(prefix))
                {
                    cleanPrompt = cleanPrompt.Substring(prefix.Length).Trim();
                    cleanPromptLower = cleanPrompt.ToLower();
                }
            }

            if (!string.IsNullOrEmpty(cleanPrompt))
            {
                cleanPrompt = char.ToUpper(cleanPrompt[0]) + cleanPrompt.Substring(1);
            }

            string introFocus = "software systems and technical innovation";
            string projectImpact = "gave me hands-on insights into full-lifecycle system design, database schemas, and modern web application frameworks";
            string futureFocus = "driving digital transformation and presenting myself as a highly skilled, career-ready professional";

            bool isCustomTheme = false;

            if (cleanPromptLower.Contains("distrib") || cleanPromptLower.Contains("cloud") || cleanPromptLower.Contains("network") || cleanPromptLower.Contains("system"))
            {
                introFocus = "high-performance computing, cloud architectures, and distributed systems";
                projectImpact = "strengthened my understanding of microservice orchestrations, scalability patterns, distributed database consistency, and resilient network architectures";
                futureFocus = "designing and scaling next-generation cloud infrastructure and backend systems at enterprise scale";
                isCustomTheme = true;
            }
            else if (cleanPromptLower.Contains("machine learning") || cleanPromptLower.Contains(" ml") || cleanPromptLower.Contains(" ai ") || cleanPromptLower.Contains("artificial") || cleanPromptLower.Contains("data") || cleanPromptLower.Contains("deep learning"))
            {
                introFocus = "artificial intelligence, machine learning pipelines, and data-driven systems";
                projectImpact = "allowed me to explore complex data engineering, model training algorithms, statistical evaluations, and deploying predictive pipelines";
                futureFocus = "pushing the boundaries of intelligent systems, contributing to AI research, and engineering smart software solutions";
                isCustomTheme = true;
            }
            else if (cleanPromptLower.Contains("security") || cleanPromptLower.Contains("cyber") || cleanPromptLower.Contains("crypt") || cleanPromptLower.Contains("hack"))
            {
                introFocus = "information security, cryptography, and securing digital environments";
                projectImpact = "focused on identifying threat vectors, implementing cryptographic protocols, analyzing security vulnerabilities, and hardening application servers";
                futureFocus = "securing critical cyber infrastructures, architectural auditing, and defending enterprise networks against advanced threat groups";
                isCustomTheme = true;
            }
            else if (cleanPromptLower.Contains("nss") || cleanPromptLower.Contains("community") || cleanPromptLower.Contains("social") || cleanPromptLower.Contains("volunteer") || cleanPromptLower.Contains("service"))
            {
                introFocus = "using technology to drive community impact, social transformation, and human-centric solutions";
                projectImpact = "was designed with digital accessibility and civic utility in mind, aiming to build systems that address real-world community challenges";
                futureFocus = "bridging the gap between technological capabilities and societal needs, applying volunteer leadership to build impactful open-source tools";
                isCustomTheme = true;
            }

            string formattedPrompt = cleanPrompt;
            if (!string.IsNullOrEmpty(cleanPrompt))
            {
                bool isAcronym = cleanPrompt.Length >= 2 && char.IsUpper(cleanPrompt[0]) && char.IsUpper(cleanPrompt[1]);
                if (!isAcronym)
                {
                    formattedPrompt = char.ToLower(cleanPrompt[0]) + cleanPrompt.Substring(1);
                }
            }

            string promptSentence = "";
            if (!string.IsNullOrEmpty(cleanPrompt))
            {
                if (isCustomTheme)
                {
                    promptSentence = $"Specifically, my immediate focus is on: {cleanPrompt}. ";
                }
                else
                {
                    promptSentence = $"Guided by my objective of {formattedPrompt}, ";
                }
            }

            if (!string.IsNullOrEmpty(cleanPrompt) && !isCustomTheme)
            {
                sb.AppendLine($"{promptSentence}my academic trajectory in the Department of {student.Department} at Madras Christian College has been defined by a deep curiosity for {introFocus}. Throughout my studies, I have maintained a competitive CGPA of {student.Cgpa:F2}/10.00, prioritizing both theoretical mathematical foundations and applied programming courses.");
            }
            else
            {
                sb.AppendLine($"My academic trajectory in the Department of {student.Department} at Madras Christian College has been defined by a deep curiosity for {introFocus}. {promptSentence}Throughout my studies, I have maintained a competitive CGPA of {student.Cgpa:F2}/10.00, prioritizing both theoretical mathematical foundations and applied programming courses.");
            }
            sb.AppendLine();

            sb.AppendLine($"On the practical engineering front, I have actively applied classroom concepts in real-world contexts. My portfolio showcases major projects including {projectsList}. Developing these solutions {projectImpact}. Additionally, to validate my expertise in these technologies, I pursued certifications such as {certsList}, which helped align my academic learning with global industry benchmarks.");
            
            if (!string.IsNullOrEmpty(papersList))
            {
                sb.AppendLine();
                sb.AppendLine($"Research and scholarly visibility have also been crucial pillars of my education. I have co-authored research works including {papersList}. This academic inquiry trained me to analyze complex research gaps, structure experimental methodologies, and present technical abstracts to academic peers.");
            }

            sb.AppendLine();
            if (!string.IsNullOrEmpty(cleanPrompt) && !isCustomTheme)
            {
                sb.AppendLine($"Looking ahead, I aspire to leverage this foundation for advanced opportunities. In line with my interest in {formattedPrompt}, I am committed to {futureFocus}.");
            }
            else
            {
                sb.AppendLine($"Looking ahead, I aspire to leverage this foundation for advanced opportunities. Whether contributing to research programs, launching entrepreneurship ideas, or joining world-class engineering teams, I am committed to {futureFocus}.");
            }

            return sb.ToString();
        }

        public object GetResumeCritique(Student student)
        {
            var suggestions = new List<string>();
            int score = 40; // Base score

            // Check details
            if (student.Projects.Count >= 3) { score += 20; }
            else { suggestions.Add("Critical: Add at least 3 software projects to demonstrate tech stack fluency."); }

            if (student.Certifications.Any()) { score += 15; }
            else { suggestions.Add("Suggestion: Add industry certifications (e.g. AWS, Google, Coursera) to validate academic skills."); }

            if (student.Publications.Any()) { score += 15; }
            else { suggestions.Add("Tip: No academic publications found. Co-authoring a paper with faculty will boost higher studies eligibility."); }

            if (!string.IsNullOrEmpty(student.GithubUsername)) { score += 10; }
            else { suggestions.Add("Important: Link your GitHub profile so recruiters can check your commit activity."); }

            if (student.CommunityServices.Any()) { score += 10; }
            else { suggestions.Add("Suggestion: Highlight community outreach or NSS activities to show leadership character."); }

            if (student.Cgpa < 8.0)
            {
                suggestions.Add("Academic Tip: Your CGPA is below 8.0. Highlight coding credentials and projects to offset corporate placement limits.");
            }
            else
            {
                score += 10;
            }

            // Cap score at 100
            score = Math.Min(score, 100);

            string rating = score switch
            {
                >= 85 => "Excellent / Placement Ready",
                >= 70 => "Good / Competent",
                >= 50 => "Average / Developing",
                _ => "Needs Improvement"
            };

            return new
            {
                Score = score,
                Rating = rating,
                Suggestions = suggestions
            };
        }

        public object GetCareerGuidance(Student student)
        {
            var matchedRoles = new List<object>();
            var skills = new List<string>();

            // Collect all tech words from projects
            var allTech = string.Join(",", student.Projects.Select(p => p.TechnologiesUsed)).ToLower();
            
            bool hasFrontend = allTech.Contains("react") || allTech.Contains("next") || allTech.Contains("javascript") || allTech.Contains("html") || allTech.Contains("tailwind");
            bool hasBackend = allTech.Contains("c#") || allTech.Contains("dotnet") || allTech.Contains("sql") || allTech.Contains("python") || allTech.Contains("fastapi") || allTech.Contains("java");
            bool hasAI = allTech.Contains("python") || allTech.Contains("scikit") || allTech.Contains("tensor") || allTech.Contains("ai") || allTech.Contains("ml");

            if (hasFrontend && hasBackend)
            {
                matchedRoles.Add(new { Role = "Full Stack Developer", Fit = "High Match", Desc = "Develop end-to-end features using modern client stacks and web API backends." });
            }
            if (hasFrontend)
            {
                matchedRoles.Add(new { Role = "Frontend Engineer", Fit = "Good Match", Desc = "Design premium, highly interactive client experiences with React & Next.js." });
            }
            if (hasBackend)
            {
                matchedRoles.Add(new { Role = "Backend Systems Developer", Fit = "Good Match", Desc = "Architect REST APIs, coordinate relational schemas, and secure server business logic." });
            }
            if (hasAI)
            {
                matchedRoles.Add(new { Role = "Machine Learning / Data Engineer", Fit = "Strong Match", Desc = "Train prediction algorithms, evaluate data pipelines, and design statistical models." });
            }

            if (!matchedRoles.Any())
            {
                matchedRoles.Add(new { Role = "Software Engineer Associate", Fit = "Base Match", Desc = "Join core development teams to learn software engineering paradigms." });
            }

            // Gaps
            var skillGaps = new List<string>();
            if (!allTech.Contains("docker")) skillGaps.Add("Containerization (Docker & Kubernetes)");
            if (!allTech.Contains("git")) skillGaps.Add("Advanced Version Control (Git workflow)");
            if (!allTech.Contains("aws") && !allTech.Contains("azure")) skillGaps.Add("Cloud Deployments (AWS/Azure)");

            return new
            {
                Roles = matchedRoles,
                SkillGaps = skillGaps,
                RecommendedCourses = new[] {
                    "Meta Back-End Developer Certificate (Coursera)",
                    "AWS Certified Solutions Architect Course",
                    "Architecting ASP.NET Core Enterprise Solutions"
                }
            };
        }

        public object GetUniversityRecommendations(Student student)
        {
            var colleges = new List<object>();

            if (student.Cgpa >= 9.0)
            {
                colleges.Add(new { University = "Stanford University, USA", Program = "MS in Computer Science", MatchChance = "High Target", Reason = "Strong CGPA and projects profile." });
                colleges.Add(new { University = "IIT Madras, India", Program = "M.Tech in CSE", MatchChance = "High Target", Reason = "Top-tier national CGPA rank." });
            }
            else if (student.Cgpa >= 8.0)
            {
                colleges.Add(new { University = "Carnegie Mellon University, USA", Program = "MS in Software Engineering", MatchChance = "Medium Target", Reason = "Excellent technical projects offset admission cutoffs." });
                colleges.Add(new { University = "Anna University (CEG), India", Program = "ME in Computer Science", MatchChance = "High Target", Reason = "Solid CGPA and academic record." });
            }
            else
            {
                colleges.Add(new { University = "San Jose State University, USA", Program = "MS in Software Engineering", MatchChance = "Target", Reason = "Favorable technical portfolio evaluations." });
            }

            // If they have research papers
            if (student.Publications.Any())
            {
                colleges.Insert(0, new { University = "National University of Singapore (NUS)", Program = "Ph.D / MS by Research", MatchChance = "High Target", Reason = "Academic paper publication validates research capability." });
            }

            return colleges;
        }

        public object GetCareerRoadmap(Student student, string targetRole)
        {
            var allTech = string.Join(",", student.Projects.Select(p => p.TechnologiesUsed ?? "")).ToLower();
            var allCerts = string.Join(",", student.Certifications.Select(c => c.Name ?? "")).ToLower();

            bool hasFrontend = allTech.Contains("react") || allTech.Contains("next") || allTech.Contains("javascript") || allTech.Contains("html") || allTech.Contains("tailwind") || allTech.Contains("vue");
            bool hasBackend = allTech.Contains("c#") || allTech.Contains(".net") || allTech.Contains("sql") || allTech.Contains("python") || allTech.Contains("fastapi") || allTech.Contains("java") || allTech.Contains("node") || allTech.Contains("express");
            bool hasAI = allTech.Contains("python") || allTech.Contains("scikit") || allTech.Contains("tensor") || allTech.Contains("ai") || allTech.Contains("ml") || allTech.Contains("pandas") || allTech.Contains("numpy");
            bool hasDatabase = allTech.Contains("sql") || allTech.Contains("mongo") || allTech.Contains("postgres") || allTech.Contains("mysql") || allTech.Contains("redis");
            bool hasCloud = allTech.Contains("aws") || allTech.Contains("azure") || allTech.Contains("gcp") || allTech.Contains("docker") || allTech.Contains("kubernetes");
            bool hasCloudCert = allCerts.Contains("aws") || allCerts.Contains("azure") || allCerts.Contains("cloud") || allCerts.Contains("gcp");
            bool hasAICert = allCerts.Contains("ml") || allCerts.Contains("ai") || allCerts.Contains("data") || allCerts.Contains("tensorflow") || allCerts.Contains("pytorch");
            bool hasCert = student.Certifications.Any();
            bool hasPub = student.Publications.Any();
            bool hasCommunity = student.CommunityServices.Any();
            bool hasAchievement = student.Achievements.Any();
            bool hasGithub = !string.IsNullOrEmpty(student.GithubUsername);
            bool hasBehance = !string.IsNullOrEmpty(student.BehanceUsername);
            bool hasSop = student.Portfolio != null && !string.IsNullOrEmpty(student.Portfolio.StatementOfPurpose);
            bool hasAvatar = !string.IsNullOrEmpty(student.AvatarUrl);
            bool hasBio = !string.IsNullOrEmpty(student.Bio);
            int projectCount = student.Projects.Count;
            int pubCount = student.Publications.Count;
            double cgpa = student.Cgpa;

            var milestones = new List<object>();
            string[] skillGaps;
            string[] recommendedCourses;

            switch (targetRole)
            {
                case "Full Stack Developer":
                    milestones.Add(new { Step = 1, Title = "Build 3+ full-stack projects", Description = "Add at least 3 projects with both frontend (React/Next.js) and backend (Node/C#/Python) technologies.", Category = "Projects", IsCompleted = projectCount >= 3 });
                    milestones.Add(new { Step = 2, Title = "Use both frontend & backend technologies", Description = "Your projects should demonstrate end-to-end development with UI frameworks and server-side APIs.", Category = "Skills", IsCompleted = hasFrontend && hasBackend });
                    milestones.Add(new { Step = 3, Title = "Integrate a database in your projects", Description = "Use SQL (PostgreSQL/MySQL) or NoSQL (MongoDB) in at least one project.", Category = "Skills", IsCompleted = hasDatabase });
                    milestones.Add(new { Step = 4, Title = "Link your GitHub profile", Description = "Connect your GitHub account to showcase your code repositories and commit history.", Category = "Profile", IsCompleted = hasGithub });
                    milestones.Add(new { Step = 5, Title = "Add at least 1 technical certification", Description = "Get certified in a relevant full-stack technology (React, Node, .NET, AWS, etc.).", Category = "Certifications", IsCompleted = hasCert });
                    milestones.Add(new { Step = 6, Title = "Write your Statement of Purpose", Description = "Draft a personalized SOP using the AI SOP Writer tool above.", Category = "Profile", IsCompleted = hasSop });
                    milestones.Add(new { Step = 7, Title = "Achieve CGPA ≥ 7.5", Description = "Maintain a competitive academic record alongside your technical portfolio.", Category = "Academic", IsCompleted = cgpa >= 7.5 });
                    skillGaps = new[] {
                        !hasCloud ? "Containerization (Docker & Kubernetes)" : null,
                        !allTech.Contains("typescript") ? "TypeScript for type-safe development" : null,
                        (!allTech.Contains("test") && !allTech.Contains("jest")) ? "Unit & Integration Testing (Jest, NUnit)" : null,
                        !hasCloud ? "CI/CD Pipeline (GitHub Actions / Azure DevOps)" : null
                    }.Where(g => g != null).Cast<string>().ToArray();
                    recommendedCourses = new[] {
                        "Meta Back-End Developer Certificate (Coursera)",
                        "Full Stack Open — University of Helsinki (Free)",
                        "Docker Mastery with Kubernetes (Udemy)"
                    };
                    break;

                case "Frontend Engineer":
                    milestones.Add(new { Step = 1, Title = "Build 3+ polished frontend projects", Description = "Create at least 3 projects using React, Next.js, or Vue with premium UI/UX designs.", Category = "Projects", IsCompleted = projectCount >= 3 && hasFrontend });
                    milestones.Add(new { Step = 2, Title = "Use React or Next.js in your projects", Description = "Demonstrate modern React proficiency including hooks, state management, and routing.", Category = "Skills", IsCompleted = allTech.Contains("react") || allTech.Contains("next") });
                    milestones.Add(new { Step = 3, Title = "Link your GitHub profile", Description = "Share your frontend repositories, component libraries, and live deployment links.", Category = "Profile", IsCompleted = hasGithub });
                    milestones.Add(new { Step = 4, Title = "Add a Behance or design portfolio", Description = "Link your Behance profile or visual design work to showcase UI design skills to recruiters.", Category = "Profile", IsCompleted = hasBehance });
                    milestones.Add(new { Step = 5, Title = "Get a React or UX/UI certification", Description = "Validate your skills with certifications from Coursera, Udemy, or Google's UX Design program.", Category = "Certifications", IsCompleted = hasCert && (allCerts.Contains("react") || allCerts.Contains("ux") || allCerts.Contains("ui") || allCerts.Contains("frontend") || allCerts.Contains("css")) });
                    milestones.Add(new { Step = 6, Title = "Complete profile bio and avatar", Description = "A complete profile with a professional headshot and bio creates a strong first impression.", Category = "Profile", IsCompleted = hasAvatar && hasBio });
                    milestones.Add(new { Step = 7, Title = "Write your Statement of Purpose", Description = "Write an SOP highlighting your design philosophy and frontend engineering goals.", Category = "Profile", IsCompleted = hasSop });
                    skillGaps = new[] {
                        !allTech.Contains("typescript") ? "TypeScript for type-safe React components" : null,
                        "Web Accessibility standards (WCAG 2.1 / a11y)",
                        (!allTech.Contains("test") && !allTech.Contains("jest")) ? "Frontend Testing (React Testing Library, Cypress)" : null,
                        "Performance Optimization (Lighthouse, Core Web Vitals)"
                    }.Where(g => g != null).Cast<string>().ToArray();
                    recommendedCourses = new[] {
                        "React — The Complete Guide 2024 (Udemy)",
                        "Google UX Design Professional Certificate (Coursera)",
                        "Advanced CSS and Sass: Flexbox, Grid (Udemy)"
                    };
                    break;

                case "Backend Systems Developer":
                    milestones.Add(new { Step = 1, Title = "Build 3+ backend API projects", Description = "Create REST APIs or microservices using ASP.NET Core, Python FastAPI, Java Spring, or Node.js.", Category = "Projects", IsCompleted = projectCount >= 3 && hasBackend });
                    milestones.Add(new { Step = 2, Title = "Integrate a SQL or NoSQL database", Description = "Demonstrate database design with relational (PostgreSQL/MySQL) or NoSQL (MongoDB) systems.", Category = "Skills", IsCompleted = hasDatabase });
                    milestones.Add(new { Step = 3, Title = "Achieve CGPA ≥ 7.5", Description = "Backend roles require strong algorithmic thinking — a good CGPA signals that foundation.", Category = "Academic", IsCompleted = cgpa >= 7.5 });
                    milestones.Add(new { Step = 4, Title = "Link your GitHub profile", Description = "Showcase your API repos, database schemas, and backend architecture documentation.", Category = "Profile", IsCompleted = hasGithub });
                    milestones.Add(new { Step = 5, Title = "Get a cloud or backend certification", Description = "Certifications like AWS Solutions Architect or Azure Developer validate cloud-backend expertise.", Category = "Certifications", IsCompleted = hasCloudCert || hasCert });
                    milestones.Add(new { Step = 6, Title = "Participate in hackathon or community event", Description = "Backend engineers who engage in open-source or hackathons gain engineering credibility.", Category = "Community", IsCompleted = hasCommunity || hasAchievement });
                    milestones.Add(new { Step = 7, Title = "Write your Statement of Purpose", Description = "Craft an SOP focused on distributed systems, API design, or system architecture.", Category = "Profile", IsCompleted = hasSop });
                    skillGaps = new[] {
                        !allTech.Contains("docker") ? "Containerization & Docker basics" : null,
                        !hasCloud ? "Cloud Deployments (AWS / Azure / GCP)" : null,
                        "System Design & Distributed Architecture concepts",
                        !allTech.Contains("redis") ? "Caching strategies with Redis" : null
                    }.Where(g => g != null).Cast<string>().ToArray();
                    recommendedCourses = new[] {
                        "AWS Certified Solutions Architect — Associate (AWS)",
                        "Designing Data-Intensive Applications (Kleppmann Book)",
                        "Architecting ASP.NET Core Enterprise Solutions (Udemy)"
                    };
                    break;

                case "Machine Learning / Data Engineer":
                    milestones.Add(new { Step = 1, Title = "Build 3+ ML or data science projects", Description = "Create projects using Python, scikit-learn, TensorFlow, or PyTorch demonstrating AI/ML skills.", Category = "Projects", IsCompleted = projectCount >= 3 && hasAI });
                    milestones.Add(new { Step = 2, Title = "Achieve CGPA ≥ 8.0", Description = "ML roles and graduate programs are highly competitive — a strong CGPA is critical.", Category = "Academic", IsCompleted = cgpa >= 8.0 });
                    milestones.Add(new { Step = 3, Title = "Publish at least 1 research paper", Description = "Academic publications in AI/ML topics demonstrate deep technical and research ability.", Category = "Research", IsCompleted = hasPub });
                    milestones.Add(new { Step = 4, Title = "Get an AI / ML certification", Description = "Complete programs like Google ML Engineer, AWS AI Practitioner, or Coursera ML Specialization.", Category = "Certifications", IsCompleted = hasAICert || (hasCert && (allCerts.Contains("ml") || allCerts.Contains("data") || allCerts.Contains("ai"))) });
                    milestones.Add(new { Step = 5, Title = "Link your GitHub profile", Description = "Share your Jupyter notebooks, trained ML models, and data pipeline code.", Category = "Profile", IsCompleted = hasGithub });
                    milestones.Add(new { Step = 6, Title = "Write a research-focused SOP", Description = "Draft an SOP emphasizing your data science research interests and career vision in AI.", Category = "Profile", IsCompleted = hasSop });
                    milestones.Add(new { Step = 7, Title = "Join a research or ML community", Description = "Participate in Kaggle competitions, AI club activities, or faculty-led research groups.", Category = "Community", IsCompleted = hasCommunity || hasAchievement });
                    skillGaps = new[] {
                        (!allTech.Contains("tensor") && !allTech.Contains("torch")) ? "Deep Learning frameworks (TensorFlow or PyTorch)" : null,
                        "MLOps & model deployment (FastAPI, Docker, MLflow)",
                        !allTech.Contains("spark") ? "Big Data processing (Apache Spark / Kafka)" : null,
                        "Statistical analysis & hypothesis testing (R / SPSS)"
                    }.Where(g => g != null).Cast<string>().ToArray();
                    recommendedCourses = new[] {
                        "Deep Learning Specialization — Andrew Ng (Coursera)",
                        "Google ML Engineer Professional Certificate",
                        "Data Engineering with Python (Coursera / DataCamp)"
                    };
                    break;

                case "Research Scholar / PhD":
                    milestones.Add(new { Step = 1, Title = "Achieve CGPA ≥ 8.5", Description = "Most PhD programs and research fellowships require a minimum CGPA of 8.5.", Category = "Academic", IsCompleted = cgpa >= 8.5 });
                    milestones.Add(new { Step = 2, Title = "Publish at least 2 research papers", Description = "Co-author journal or conference papers with faculty to demonstrate scholarly capability.", Category = "Research", IsCompleted = pubCount >= 2 });
                    milestones.Add(new { Step = 3, Title = "Build 3+ research-oriented projects", Description = "Projects that solve real research problems, prototype experiments, or implement novel algorithms.", Category = "Projects", IsCompleted = projectCount >= 3 });
                    milestones.Add(new { Step = 4, Title = "Get a research or domain certification", Description = "NPTEL, Swayam, or MOOC certifications in research methodology or your specialization domain.", Category = "Certifications", IsCompleted = hasCert });
                    milestones.Add(new { Step = 5, Title = "Write a research-focused Statement of Purpose", Description = "Detail your research interests, prior work, and specific problems you want to investigate.", Category = "Profile", IsCompleted = hasSop });
                    milestones.Add(new { Step = 6, Title = "Engage in academic community service", Description = "Join NSS, academic clubs, or serve as a teaching assistant to demonstrate scholarly leadership.", Category = "Community", IsCompleted = hasCommunity });
                    milestones.Add(new { Step = 7, Title = "Link GitHub for open-source research code", Description = "Share experiment notebooks, reproducible research code, and datasets on GitHub.", Category = "Profile", IsCompleted = hasGithub });
                    skillGaps = new[] {
                        "Academic paper writing (LaTeX & IEEE/ACM format)",
                        "Statistical analysis (R programming or SPSS / Stata)",
                        "Grant proposal and research funding applications",
                        "Systematic literature review methodology"
                    };
                    recommendedCourses = new[] {
                        "CSIR NET / GATE CS Preparation (NPTEL Free Courses)",
                        "Research Methodology — Swayam (MHRD Free Course)",
                        "Academic Writing & Publishing (Coursera)"
                    };
                    break;

                case "Entrepreneur / Startup Founder":
                default:
                    milestones.Add(new { Step = 1, Title = "Submit a startup pitch to the incubator", Description = "Register your startup concept or prototype via the Startup Incubator tab to be evaluated by the cell.", Category = "Startup", IsCompleted = hasAchievement });
                    milestones.Add(new { Step = 2, Title = "Build an MVP-stage project", Description = "Develop a minimum viable product that solves a real problem and can be demoed to stakeholders.", Category = "Projects", IsCompleted = projectCount >= 1 });
                    milestones.Add(new { Step = 3, Title = "Build a team (join community activities)", Description = "Entrepreneurship requires team leadership — join or form clubs, NSS groups, or hackathon teams.", Category = "Community", IsCompleted = hasCommunity });
                    milestones.Add(new { Step = 4, Title = "Complete your public profile", Description = "A professional bio, headshot, and portfolio links are essential for investor and partner outreach.", Category = "Profile", IsCompleted = hasAvatar && hasBio && hasGithub });
                    milestones.Add(new { Step = 5, Title = "Write a business-focused SOP", Description = "Draft a statement of purpose highlighting the problem you want to solve and your entrepreneurial vision.", Category = "Profile", IsCompleted = hasSop });
                    milestones.Add(new { Step = 6, Title = "Add entrepreneurship certifications", Description = "Startup School (Y Combinator), Google for Startups, or Product Management certifications.", Category = "Certifications", IsCompleted = hasCert });
                    milestones.Add(new { Step = 7, Title = "Link social and portfolio profiles", Description = "Connect GitHub and Behance/LinkedIn to give investors and mentors a full picture of your capabilities.", Category = "Profile", IsCompleted = hasGithub && hasBehance });
                    skillGaps = new[] {
                        "Business Model Canvas & Lean Startup methodology",
                        "Pitch deck creation (Canva / Figma / PowerPoint)",
                        "Market research & competitive landscape analysis",
                        "Legal basics: IP protection, equity structuring, incorporation"
                    };
                    recommendedCourses = new[] {
                        "Startup School — Y Combinator (Free Online)",
                        "Entrepreneurship Specialization — Wharton (Coursera)",
                        "Product Management Fundamentals (Coursera / LinkedIn Learning)"
                    };
                    break;
            }

            int completedCount = milestones.Cast<dynamic>().Count(m => m.IsCompleted);
            int totalCount = milestones.Count;
            int progressPercent = totalCount > 0 ? (int)Math.Round((double)completedCount / totalCount * 100) : 0;

            return new
            {
                TargetRole = targetRole,
                Milestones = milestones,
                CompletedCount = completedCount,
                TotalCount = totalCount,
                ProgressPercent = progressPercent,
                SkillGaps = skillGaps,
                RecommendedCourses = recommendedCourses
            };
        }

        public object GetInternshipRecommendations(Student student)
        {
            var internships = new List<object>();
            var allTech = string.Join(",", student.Projects.Select(p => p.TechnologiesUsed)).ToLower();
            
            bool hasFrontend = allTech.Contains("react") || allTech.Contains("next") || allTech.Contains("javascript") || allTech.Contains("html") || allTech.Contains("tailwind");
            bool hasBackend = allTech.Contains("c#") || allTech.Contains("dotnet") || allTech.Contains("sql") || allTech.Contains("python") || allTech.Contains("fastapi") || allTech.Contains("java");
            bool hasAI = allTech.Contains("python") || allTech.Contains("scikit") || allTech.Contains("tensor") || allTech.Contains("ai") || allTech.Contains("ml");

            if (hasAI)
            {
                internships.Add(new { InternshipRole = "Data Science Intern", Company = "Zoho Corporation", MatchChance = "High Match", Stipend = "₹25,000 / month", Description = "Work on training and evaluating ML models and designing analytics pipelines." });
            }
            if (hasBackend)
            {
                internships.Add(new { InternshipRole = "Backend Engineering Intern", Company = "Freshworks", MatchChance = "High Match", Stipend = "₹20,000 / month", Description = "Develop robust REST APIs and design relational schemas using ASP.NET Core." });
            }
            if (hasFrontend)
            {
                internships.Add(new { InternshipRole = "Frontend developer Intern", Company = "Cognizant India", MatchChance = "Good Match", Stipend = "₹15,000 / month", Description = "Design premium client experiences and integrate REST APIs using React & Tailwind." });
            }

            if (!internships.Any())
            {
                internships.Add(new { InternshipRole = "Software Engineering Intern", Company = "MCC Innovation Cell", MatchChance = "Target", Stipend = "₹8,000 / month", Description = "Gain exposure to full-cycle software development workflows in our local campus lab." });
            }

            return internships;
        }

        public object GetScholarshipRecommendations(Student student)
        {
            var scholarships = new List<object>();

            if (student.Cgpa >= 8.5)
            {
                scholarships.Add(new { ScholarshipName = "MCC Academic Merit Scholarship", AwardAmount = "₹25,000 / semester", MatchChance = "Highly Recommended", Reason = "Your CGPA of " + student.Cgpa.ToString("F2") + " qualifies for MCC's top academic brackets." });
            }

            if (student.Publications.Any())
            {
                scholarships.Add(new { ScholarshipName = "CSIR Research Grant", AwardAmount = "₹50,000 research stipend", MatchChance = "Eligible", Reason = "Your research publication validates academic innovation." });
            }

            scholarships.Add(new { ScholarshipName = "Central Sector Scholarship Scheme", AwardAmount = "₹20,000 / year", MatchChance = "Eligible", Reason = "Open to undergraduate/postgraduate students at Madras Christian College with good academic standing." });

            return scholarships;
        }

        public object GetPortfolioSuggestions(Student student)
        {
            var suggestions = new List<string>();
            int score = 30; // base score

            // Check if profile details exist
            if (!string.IsNullOrEmpty(student.AvatarUrl)) { score += 10; }
            else { suggestions.Add("Layout Suggestion: Upload a professional avatar/headshot image to complete your profile card."); }

            if (!string.IsNullOrEmpty(student.Bio)) { score += 10; }
            else { suggestions.Add("Bio Suggestion: Draft a compelling professional summary/bio (currently empty or placeholder)."); }

            if (student.Portfolio != null)
            {
                if (!string.IsNullOrEmpty(student.Portfolio.StatementOfPurpose)) { score += 15; }
                else { suggestions.Add("SOP Suggestion: Write your Statement of Purpose (SOP). Use the AI SOP Writer above to create a draft."); }

                if (!string.IsNullOrEmpty(student.Portfolio.StoryContent)) { score += 15; }
                else { suggestions.Add("Story Suggestion: Write your Personal Story to make your showcase unique for viewers."); }

                // Check layout settings
                if (!string.IsNullOrEmpty(student.Portfolio.LayoutSettingsJson))
                {
                    score += 10;
                    if (student.Portfolio.LayoutSettingsJson.Contains("\"theme\":\"default\""))
                    {
                        suggestions.Add("Styling Suggestion: Customize your profile with a premium layout theme (e.g. glass, dark, neo-brutalism) under Layout Settings.");
                    }
                }
                else
                {
                    suggestions.Add("Setup Suggestion: Configure your layout settings & theme to enable live preview.");
                }
            }
            else
            {
                suggestions.Add("Critical Suggestion: Initialize your portfolio configuration in your dashboard to generate a showcase link.");
            }

            // Check social profiles
            if (!string.IsNullOrEmpty(student.GithubUsername)) { score += 5; }
            else { suggestions.Add("Social Suggestion: Link your GitHub repository handler to let recruiters inspect code commits."); }

            if (!string.IsNullOrEmpty(student.BehanceUsername)) { score += 5; }
            else { suggestions.Add("Design Suggestion: If you have visual design projects, link your Behance profile to display design mockups."); }

            score = Math.Min(score, 100);

            string rating = score switch
            {
                >= 85 => "Showcase Ready (Outstanding)",
                >= 70 => "Competent Layout (Good)",
                >= 55 => "Incomplete Layout (Developing)",
                _ => "Draft State (Needs Setup)"
            };

            return new
            {
                Score = score,
                Rating = rating,
                Suggestions = suggestions
            };
        }
    }
}
