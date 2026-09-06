import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ExternalLink, Globe, Server, UserPlus, LogIn } from 'lucide-react';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      
      {/* Background Glowing Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20 relative z-10">

        {/* Hero Section */}
        <div className="text-center max-w-5xl mx-auto pt-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, type: "spring" }}
            className="inline-flex items-center px-5 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold mb-8 shadow-xl text-xs"
          >
            <span>AI-Powered Resume Builder Workspace</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-[1.1]"
          >
            Build ATS-Ready <br />
            Resumes with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-emerald-400 to-teal-300">AI Precision</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 mb-10 max-w-3xl mx-auto font-medium leading-relaxed"
          >
            Create professional resumes, customize modern templates, format ATS-friendly sections, and export high-resolution PDFs instantly.
          </motion.p>
          
          {/* Main Action CTAs: Create Account on LEFT, Login on RIGHT */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link to="/register">
              <button className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-base font-bold rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105 cursor-pointer">
                <UserPlus size={18} />
                <span>Create Account</span>
              </button>
            </Link>
            <Link to="/login">
              <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-base font-bold rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105 cursor-pointer">
                <LogIn size={18} />
                <span>Sign In / Login</span>
              </button>
            </Link>
          </motion.div>

        </div>

        {/* Feature Cards Showcase Grid */}

        {/* Feature Cards Showcase Grid */}
        <motion.div 
          id="features"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-20 relative z-10"
        >
          <div className="text-center mb-16 space-y-2">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">Professional Resume Features</h2>
            <p className="text-slate-400 text-base font-medium">Everything you need to stand out and get hired fast.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              title="ATS-Friendly Formatting"
              description="Optimized layout structures recognized seamlessly by top corporate ATS software."
            />
            <FeatureCard 
              title="Modern Resume Templates"
              description="Choose from classic, modern, minimalist, and creative executive layouts."
            />
            <FeatureCard 
              title="Instant PDF Export"
              description="Print or download high-quality vector PDFs ready for job applications."
            />
            <FeatureCard 
              title="Custom Themes & Colors"
              description="Tailor color palettes, font weights, and accent highlights in real-time."
            />
            <FeatureCard 
              title="AI Content Assistance"
              description="Generate impactful bullet points and summary statements tailored to your role."
            />
            <FeatureCard 
              title="Live Real-Time Preview"
              description="See changes immediately on an interactive side-by-side resume sheet preview."
            />
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-900 text-center text-xs text-slate-500 space-y-2">
        <div>ResumeAI Builder • Professional AI Resume Workspace</div>
        <div className="flex justify-center gap-4 text-[11px] text-slate-400">
          <span>Client-Side Local Storage &bull; Fast &bull; Secure</span>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, description }) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100 } }
      }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="p-6 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-3xl group shadow-xl transition-all"
    >
      <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{title}</h3>
      <p className="text-slate-400 text-xs leading-relaxed font-medium">{description}</p>
    </motion.div>
  );
}

