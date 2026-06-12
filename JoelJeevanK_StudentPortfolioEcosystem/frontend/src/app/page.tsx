"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  Layers,
  ArrowRight,
  UserCheck,
  BarChart3,
  Sun,
  Moon,
  ChevronDown,
  Sparkles,
  ExternalLink,
  HelpCircle
} from "lucide-react";
import { MccLogo } from "@/components/MccLogo";
import { motion, AnimatePresence } from "framer-motion";

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
      if (!savedTheme) {
        localStorage.setItem("theme", "light");
      }
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // FAQs Data
  const faqs = [
    {
      question: "How does the portfolio verification process work?",
      answer: "Once you build your profile, add academic records, projects, and certifications, you can submit them for review. The Madras Christian College administrative staff or placement officers will verify the credentials against official records. Once verified, a gold 'Verified' badge is affixed to your public portfolio, making it visible to potential recruiters."
    },
    {
      question: "Can I customize the visual layout or theme of my profile?",
      answer: "Yes! The platform provides several hand-crafted, premium themes tailored to different industries—such as 'Academic' (classic ruled serif style), 'Corporate' (modern exec resume format), 'Startup' (vibrant, minimalist tech), 'Creative' (daring visual portfolios), and 'AI Futuristic' (glowing dark themes)."
    },
    {
      question: "Is it possible to download my verified portfolio as a PDF?",
      answer: "Absolutely. Each theme is built with high-fidelity, print-compliant styles. When viewing your public profile, you can click the 'Download PDF' button in the toolbar to save a clean, professional, and beautifully typeset resume copy."
    },
    {
      question: "How do recruiters access my public showcase?",
      answer: "Once approved, your profile becomes searchable in the institutional candidate registry accessible to partnering recruiters. Additionally, you are provided a unique public URL (e.g., /student/username) and an auto-generated QR code to place on physical resumes, business cards, or LinkedIn profiles."
    }
  ];

  return (
    <div 
      style={{ backgroundColor: darkMode ? undefined : '#ffffff' }} 
      className="flex flex-col min-h-screen bg-white dark:bg-background text-foreground transition-colors duration-300 antialiased selection:bg-mcc-crimson/25 dark:selection:bg-mcc-gold/25"
    >
      
      {/* Premium Grid Pattern and Glow Effects Background */}
      <div className="absolute top-0 left-0 w-full overflow-hidden pointer-events-none -z-10 min-h-screen hidden dark:block">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-[-10%] left-[-10%] h-[50vw] w-[50vw] rounded-full bg-mcc-crimson/8 blur-[120px] dark:bg-mcc-crimson/5"></div>
        <div className="absolute top-[30%] right-[-10%] h-[40vw] w-[40vw] rounded-full bg-mcc-gold/8 blur-[120px] dark:bg-mcc-gold/5"></div>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-card-border/40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MccLogo className="h-9 w-9 text-mcc-crimson dark:text-mcc-gold transition-all duration-300 hover:rotate-12" />
          <div>
            <h1 className="font-extrabold text-lg leading-tight tracking-wider text-mcc-crimson dark:text-mcc-gold">
              MADRAS CHRISTIAN COLLEGE
            </h1>
            <p className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400 font-medium">
              Student Portfolio Hub
            </p>
          </div>
        </div>

        {/* Desktop Navigation Link items */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <a href="#features" className="hover:text-mcc-crimson dark:hover:text-mcc-gold transition-colors">Features</a>
          <a href="#workflow" className="hover:text-mcc-crimson dark:hover:text-mcc-gold transition-colors">How It Works</a>
          <a href="#faq" className="hover:text-mcc-crimson dark:hover:text-mcc-gold transition-colors">FAQs</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl border border-card-border/40 bg-card-bg/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            title="Toggle theme"
          >
            {darkMode ? (
              <Sun className="h-[18px] w-[18px] text-mcc-gold animate-pulse" />
            ) : (
              <Moon className="h-[18px] w-[18px] text-mcc-crimson" />
            )}
          </button>
          
          <Link
            href="/login"
            className="hidden sm:inline-block px-4.5 py-2 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 text-sm font-bold rounded-xl btn-premium shadow-md"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow">
        
        {/* Centered Hero Section */}
        <section className="max-w-4xl mx-auto px-6 pt-16 pb-20 md:py-28 text-center flex flex-col items-center space-y-8 relative">
          
          {/* Hero Content */}
          <div className="flex flex-col items-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-mcc-crimson/10 text-mcc-crimson dark:bg-mcc-gold/10 dark:text-mcc-gold border border-mcc-crimson/20 dark:border-mcc-gold/20"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>MCC Candidate Directory & Registry</span>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight"
            >
              Elevate Your Academic <span className="text-gradient">Story</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed mx-auto font-medium"
            >
              Create a premium digital dossier showcasing your verified academics, media portfolios, volunteer services, and certifications. Standardized and endorsed by Madras Christian College.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link 
                href="/register" 
                className="px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 btn-premium text-base group shadow-lg shadow-mcc-crimson/20 dark:shadow-mcc-gold/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Build Your Dossier
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/login" 
                className="px-8 py-4 rounded-xl font-bold flex items-center justify-center border border-slate-200 dark:border-slate-800 bg-card-bg/65 backdrop-blur hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all text-base hover:scale-[1.02] active:scale-[0.98]"
              >
                Student Dashboard
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section 
          id="features" 
          style={{ backgroundColor: darkMode ? undefined : '#ffffff' }} 
          className="py-20 border-t border-card-border/20 bg-white dark:bg-slate-900/20"
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-mcc-crimson dark:text-mcc-gold bg-mcc-crimson/10 dark:bg-mcc-gold/10 px-3 py-1 rounded-full">
                Core System Modules
              </span>
              <h3 className="text-3xl md:text-4xl font-extrabold mt-3">
                Features Engineered For Student Success
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-3 font-medium">
                Everything you need to capture, organize, and verify your credentials under official administrative oversight.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="glass-card rounded-2xl p-6 text-left hover:scale-[1.02] hover:shadow-md transition-all">
                <div className="p-3 bg-mcc-crimson/10 text-mcc-crimson dark:bg-mcc-gold/10 dark:text-mcc-gold rounded-xl w-fit mb-5">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-bold mb-2">Academic Ledger</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                  Add, update, and manage your college courses, semester marks, overall GPA benchmarks, and historical academic transcripts.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="glass-card rounded-2xl p-6 text-left hover:scale-[1.02] hover:shadow-md transition-all">
                <div className="p-3 bg-purple-500/10 text-purple-600 rounded-xl w-fit mb-5">
                  <Layers className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-bold mb-2">Projects & Media</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                  Connect code repositories, upload project thumbnails, link live deployments, and curate a professional media gallery.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="glass-card rounded-2xl p-6 text-left hover:scale-[1.02] hover:shadow-md transition-all">
                <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl w-fit mb-5">
                  <Award className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-bold mb-2">Certificates & NGO</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                  Log certified hours, upload NGO participation, track sports honors, and attach authorized digital certificates.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="glass-card rounded-2xl p-6 text-left hover:scale-[1.02] hover:shadow-md transition-all">
                <div className="p-3 bg-green-500/10 text-green-600 rounded-xl w-fit mb-5">
                  <UserCheck className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-bold mb-2">Placement Review</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                  Secure official endorsement by the MCC placement cell. Only validated student portfolios publish to the corporate registry.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works (Timeline Onboarding) Section */}
        <section id="workflow" className="py-20 border-t border-card-border/20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-mcc-crimson dark:text-mcc-gold bg-mcc-crimson/10 dark:bg-mcc-gold/10 px-3 py-1 rounded-full">
                Verification Steps
              </span>
              <h3 className="text-3xl md:text-4xl font-extrabold mt-3">
                How to Get Your Verified Showcase
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-3 font-medium">
                A streamlined workflow designed to transition your college accomplishments into verified professional assets.
              </p>
            </div>

            {/* Timeline Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {/* Desktop connector line */}
              <div className="hidden md:block absolute top-[40px] left-[10%] right-[10%] h-[1px] border-t border-dashed border-card-border/70 -z-10"></div>

              {/* Step 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-card-bg border-2 border-mcc-crimson dark:border-mcc-gold flex items-center justify-center font-extrabold text-lg shadow-md mb-4 text-mcc-crimson dark:text-mcc-gold">
                  1
                </div>
                <h5 className="font-bold text-base mb-1">Create Profile</h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-[200px] leading-relaxed font-medium">
                  Sign up with your MCC roll number and populate your digital resume database.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-card-bg border border-card-border/80 flex items-center justify-center font-extrabold text-lg shadow-sm mb-4">
                  2
                </div>
                <h5 className="font-bold text-base mb-1">Add Showcase</h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-[200px] leading-relaxed font-medium">
                  Input academic milestones, upload creative media, and link repository sources.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-card-bg border border-card-border/80 flex items-center justify-center font-extrabold text-lg shadow-sm mb-4">
                  3
                </div>
                <h5 className="font-bold text-base mb-1">Official Review</h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-[200px] leading-relaxed font-medium">
                  College administrators and placement staff review and endorse your achievements.
                </p>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-card-bg border-2 border-emerald-500 flex items-center justify-center font-extrabold text-lg shadow-md mb-4 text-emerald-500">
                  4
                </div>
                <h5 className="font-bold text-base mb-1">Share & Place</h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-[200px] leading-relaxed font-medium">
                  Go live with a verified digital registry badge and export beautiful PDFs for recruiters.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs Accordion Section */}
        <section 
          id="faq" 
          style={{ backgroundColor: darkMode ? undefined : '#ffffff' }} 
          className="py-20 border-t border-card-border/20 bg-white dark:bg-slate-900/20"
        >
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-mcc-crimson dark:text-mcc-gold bg-mcc-crimson/10 dark:bg-mcc-gold/10 px-3 py-1 rounded-full">
                Common Inquiries
              </span>
              <h3 className="text-3xl font-extrabold mt-3">
                Frequently Asked Questions
              </h3>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div 
                    key={index}
                    className="glass-card rounded-2xl overflow-hidden border border-card-border/50 shadow-sm"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-sm md:text-base cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/20 transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        <HelpCircle className="h-5 w-5 text-mcc-crimson dark:text-mcc-gold shrink-0" />
                        {faq.question}
                      </span>
                      <ChevronDown 
                        className={`h-5 w-5 text-slate-650 dark:text-slate-400 transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                        >
                          <div className="px-6 pb-5 pt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-card-border/20 font-medium">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Premium CTA Section */}
        <section className="py-16 max-w-7xl mx-auto px-6">
          <div style={{ background: 'linear-gradient(135deg, #7a1c1c 0%, #1e293b 100%)' }} className="relative rounded-3xl p-8 md:p-16 overflow-hidden border border-white/10 text-center animate-glow">
            {/* Glowing lights */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-mcc-gold/10 blur-[100px] pointer-events-none"></div>
            
            <div style={{ color: '#ffffff' }} className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h3 style={{ color: '#ffffff' }} className="text-3xl md:text-4xl font-extrabold">
                Ready to Author Your Professional Dossier?
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.9)' }} className="text-sm md:text-base max-w-lg mx-auto leading-relaxed font-medium">
                Unlock official credential endorsements, gain visibility among placement cell partners, and present a premium verified CV directly to recruiters.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Link
                  href="/register"
                  className="px-8 py-3.5 rounded-xl font-bold bg-white text-mcc-crimson hover:bg-slate-100 transition-colors shadow-lg text-sm"
                >
                  Create Your Account
                </Link>
                <Link
                  href="/login"
                  style={{ color: '#ffffff', borderColor: '#ffffff' }}
                  className="px-8 py-3.5 rounded-xl font-bold border-2 hover:bg-white/15 transition-colors text-sm"
                >
                  Explore Dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Redesigned Footer */}
      <footer 
        style={{ backgroundColor: darkMode ? undefined : '#ffffff' }} 
        className="glass-panel border-t border-card-border/40 bg-white dark:bg-slate-900/40"
      >
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
          
          {/* Footer Logo Column */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <MccLogo className="h-7 w-7 text-mcc-crimson dark:text-mcc-gold" />
              <span className="font-extrabold text-sm tracking-widest text-mcc-crimson dark:text-mcc-gold">
                MCC PORTFOLIO
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
              Madras Christian College (Autonomous) Student Portfolio Registry. Helping candidates present standard, verified profiles.
            </p>
          </div>

          {/* Directory Links */}
          <div className="space-y-3">
            <h6 className="font-bold text-xs uppercase tracking-wider text-mcc-crimson dark:text-mcc-gold">Candidate Portals</h6>
            <ul className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <li><Link href="/login" className="hover:text-foreground transition-colors">Sign In Portal</Link></li>
              <li><Link href="/register" className="hover:text-foreground transition-colors">Dossier Builder</Link></li>
              <li><Link href="/admin" className="hover:text-foreground transition-colors">Admin Dashboard</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h6 className="font-bold text-xs uppercase tracking-wider text-mcc-crimson dark:text-mcc-gold">Resources</h6>
            <ul className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <li><a href="#features" className="hover:text-foreground transition-colors">System Features</a></li>
              <li><a href="#workflow" className="hover:text-foreground transition-colors">Validation Model</a></li>
              <li><a href="#faq" className="hover:text-foreground transition-colors">Frequently Asked Questions</a></li>
            </ul>
          </div>

          {/* Contact and Official links */}
          <div className="space-y-3">
            <h6 className="font-bold text-xs uppercase tracking-wider text-mcc-crimson dark:text-mcc-gold">Placement Cell</h6>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
              Madras Christian College<br />
              Tambaram, Chennai - 600059<br />
              Tamil Nadu, India
            </p>
            <div className="pt-1">
              <a 
                href="mailto:placement@mcc.edu.in"
                className="text-xs font-bold text-mcc-crimson dark:text-mcc-gold hover:underline"
              >
                placement@mcc.edu.in
              </a>
            </div>
          </div>
        </div>

        {/* Sub-Footer License info */}
        <div className="border-t border-card-border/30 py-6 text-center text-[11px] font-semibold text-slate-600 dark:text-slate-400 px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} Madras Christian College (Autonomous). All Rights Reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="https://mcc.edu.in" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors flex items-center gap-0.5">
                MCC Website <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
