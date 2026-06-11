namespace MCCPortfolioAPI.DTOs
{
    public class CreateProfileDto
    {
        public string Bio { get; set; } = string.Empty;

        public string LinkedInUrl { get; set; } = string.Empty;

        public string GitHubUrl { get; set; } = string.Empty;

        public string BehanceUrl { get; set; } = string.Empty;

        public string GitHubUsername { get; set; } = string.Empty;

        public string TargetCareer { get; set; } = string.Empty;

        public double CGPA { get; set; } = 0.0;

        public string ProfileImageUrl { get; set; } = string.Empty;

        public string SelectedTheme { get; set; } = "Academic";

        public string PersonalStory { get; set; } = string.Empty;

        public string SOP { get; set; } = string.Empty;

        public bool IsAlumni { get; set; }

        public int? GraduationYear { get; set; }

        public string CurrentCompany { get; set; } = string.Empty;

        public string CurrentJobTitle { get; set; } = string.Empty;

        public string HigherStudyUniversity { get; set; } = string.Empty;

        public string HigherStudyProgram { get; set; } = string.Empty;
    }
}