import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Sparkles,
  Check,
  Users,
  Calendar,
  Receipt,
  Building2,
  Lock,
  ChevronRight,
  Play,
  Twitter,
  Linkedin,
  Facebook
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans antialiased selection:bg-blue-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              Mediczen<span className="text-blue-600 text-xs font-normal align-top ml-0.5">™</span>
            </span>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <button onClick={() => scrollToSection('features')} className="hover:text-blue-600 transition-colors">
              Features
            </button>
            <button onClick={() => scrollToSection('solutions')} className="hover:text-blue-600 transition-colors">
              Solutions
            </button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-blue-600 transition-colors">
              Pricing
            </button>
            <button onClick={() => scrollToSection('integrations')} className="hover:text-blue-600 transition-colors">
              About Us
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-bold text-slate-700 hover:text-blue-600 px-4 py-2 rounded-xl transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-blue-50/40 via-white to-white">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
          {/* Announcement Pill */}
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 text-xs font-bold text-blue-700 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>New: Real-time Supabase Clinical Workflows v2.0</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>

          {/* Headline & Subtitle */}
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Streamline patient care with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">intelligent workflows</span>
            </h1>
            <p className="text-base sm:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Empower your hospital practice with real-time patient analytics, smart clinical schedule timelines, and automated AI diagnostic decision support.
            </p>
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-8 py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm px-8 py-4 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-slate-700" />
              <span>Watch Demonstration</span>
            </button>
          </div>

          {/* Product Screenshot Mockup Frame */}
          <div className="mt-12 relative max-w-5xl mx-auto rounded-3xl p-3 bg-slate-900/5 ring-1 ring-slate-900/10 shadow-2xl overflow-hidden">
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 p-6 space-y-6 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    M
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Good Morning, Dr. Andreas!</h3>
                    <p className="text-xs text-slate-400">4 patients currently waiting in queue</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-400"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100">
                  <span className="text-[10px] font-bold uppercase text-blue-600">Beds</span>
                  <p className="text-xl font-extrabold text-slate-900 mt-1">86</p>
                </div>
                <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-bold uppercase text-emerald-600">Doctors</span>
                  <p className="text-xl font-extrabold text-slate-900 mt-1">126</p>
                </div>
                <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100">
                  <span className="text-[10px] font-bold uppercase text-indigo-600">Ambulances</span>
                  <p className="text-xl font-extrabold text-slate-900 mt-1">32</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 space-y-12 text-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Everything you need to run a modern practice
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-medium mt-2">
              Integrated clinical tools tailored for modern hospital wards and specialized medical departments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Patient Management</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Centralized hospital ward registry with priority badges, symptoms history, and real-time status tracking.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Real-Time Scheduling</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Gantt-style timeline manager for surgeon checkups, surgery blocks, evaluation slots, and lunch breaks.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Billing & Invoicing</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Instant patient invoice generation with itemized fee breakdown and payment status monitoring.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions / Connected Ecosystem */}
      <section id="solutions" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Connect doctors, staff, and patients in one loop
            </h2>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Mediczen replaces disconnected paperwork with a unified clinical portal that synchronizes patient records instantly across every department.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-800">
                <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <span>Secure doctor authentication & avatar profile management</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-800">
                <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <span>Help Center hospital resource request workflow</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-800">
                <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <span>Real-time Supabase database synchronizations</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-2xl space-y-6">
            <h3 className="text-xl font-bold tracking-tight">Real-time Operational Visibility</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Monitor active ward occupancy, doctor shifts, and urgent clinical requests with live websocket database notifications.
            </p>
            <div className="h-40 bg-slate-800/80 rounded-2xl p-4 flex items-end justify-between">
              {[40, 65, 80, 50, 90, 75, 100].map((h, i) => (
                <div key={i} style={{ height: `${h}%` }} className="w-8 bg-blue-500 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 space-y-12 text-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-2">
              Choose the plan tailored for your clinic or hospital network.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 text-left">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Clinical</h3>
                <div className="text-3xl font-extrabold text-slate-900 mt-2">$199<span className="text-xs text-slate-400 font-normal"> / mo</span></div>
              </div>
              <button onClick={() => navigate('/login')} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 rounded-xl transition-colors">
                Start Free Trial
              </button>
            </div>

            <div className="bg-white p-8 rounded-3xl border-2 border-blue-600 shadow-xl space-y-6 text-left relative">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                Most Popular
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Professional</h3>
                <div className="text-3xl font-extrabold text-slate-900 mt-2">$499<span className="text-xs text-slate-400 font-normal"> / mo</span></div>
              </div>
              <button onClick={() => navigate('/login')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition-colors shadow-md shadow-blue-500/20">
                Get Started Now
              </button>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 text-left">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Enterprise</h3>
                <div className="text-3xl font-extrabold text-slate-900 mt-2">Custom</div>
              </div>
              <button onClick={() => navigate('/login')} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer (Matching Image Screenshot) */}
      <footer id="integrations" className="bg-slate-50 border-t border-slate-200/80 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-200/80">
            {/* Logo & Tagline */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <Activity className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Mediczen<span className="text-blue-600 text-xs font-normal align-top ml-0.5">™</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium max-w-sm leading-relaxed">
                Empowering healthcare providers with next-generation tools for better patient outcomes.
              </p>
            </div>

            {/* Product Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Product</h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-500">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-blue-600 transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('solutions')} className="hover:text-blue-600 transition-colors">Integrations</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-blue-600 transition-colors">Pricing</button></li>
                <li><a href="#changelog" className="hover:text-blue-600 transition-colors">Changelog</a></li>
              </ul>
            </div>

            {/* Company Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Company</h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-500">
                <li><a href="#about" className="hover:text-blue-600 transition-colors">About</a></li>
                <li><a href="#careers" className="hover:text-blue-600 transition-colors">Careers</a></li>
                <li><a href="#blog" className="hover:text-blue-600 transition-colors">Blog</a></li>
                <li><a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-500">
                <li><a href="#privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#terms" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
                <li><a href="#hipaa" className="hover:text-blue-600 transition-colors">HIPAA</a></li>
                <li><a href="#security" className="hover:text-blue-600 transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Social Icons */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
            <div>
              © 2026 Mediczen Inc. All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <a href="#twitter" className="hover:text-blue-600 transition-colors"><Twitter className="w-4 h-4" /></a>
              <a href="#linkedin" className="hover:text-blue-600 transition-colors"><Linkedin className="w-4 h-4" /></a>
              <a href="#facebook" className="hover:text-blue-600 transition-colors"><Facebook className="w-4 h-4" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
