import Link from "next/link";
import {
  Zap, ArrowRight, ShieldCheck, Globe,
  Download, Braces, Minimize2, AlignLeft,
  ArrowLeftRight, Droplets, Palette, Tags, CaseSensitive,
  QrCode, Clock, Hash, Fingerprint, Link as LinkIcon,
  FileText, FileCode, MessageCircle, ShieldAlert,
  FileSearch, Search, Table, Shapes, Box,
  PenTool, Layers, Maximize, Monitor, Timer, Terminal, SlidersHorizontal,
} from "lucide-react";
import { CATEGORIES, getFeaturedTools, getNewTools, TOOLS } from "@/data/tools";
import { buildWebSiteJsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  Download,
  Braces,
  Minimize2,
  AlignLeft,
  ArrowLeftRight,
  Droplets,
  Palette,
  Tags,
  CaseSensitive,
  Zap,
  QrCode,
  Clock,
  Hash,
  Fingerprint,
  Link: LinkIcon,
  FileText,
  FileCode,
  MessageCircle,
  ShieldAlert,
  FileSearch,
  ShieldCheck,
  Search,
  Globe,
  Table,
  Shapes,
  Box,
  PenTool,
  Layers,
  Maximize,
  Monitor,
  Timer,
  Terminal,
  SlidersHorizontal,
};

function ToolCard({ tool, index }: { tool: ReturnType<typeof getFeaturedTools>[0]; index: number }) {
  const Icon = ICON_MAP[tool.icon] ?? Zap;
  const category = CATEGORIES.find((c) => c.id === tool.categoryId);

  return (
    <Link
      href={`/tools/${tool.categoryId}/${tool.slug}`}
      className="glass-card p-5 group block"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
          style={{ background: `linear-gradient(135deg, ${category?.color}20, ${category?.color}40)` }}
        >
          <Icon className="w-5 h-5" style={{ color: category?.color }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-sm font-semibold text-white truncate">{tool.name}</h3>
            {tool.isNew && <span className="pill pill-new">New</span>}
            {tool.isPopular && <span className="pill pill-hot">🔥 Hot</span>}
          </div>
          <p className="text-xs text-[rgb(80,80,120)] line-clamp-2 leading-relaxed">
            {tool.description}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center text-xs font-medium text-[rgb(148,148,186)] group-hover:text-violet-400 transition-colors">
        Use tool <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}

function StatCard({ value, label, icon }: { value: string; label: string; icon: React.ElementType }) {
  const Icon = icon;
  return (
    <div className="flex flex-col items-center gap-1 p-4">
      <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center mb-1">
        <Icon className="w-5 h-5 text-violet-400" />
      </div>
      <span className="text-2xl font-bold gradient-text">{value}</span>
      <span className="text-xs text-[rgb(80,80,120)] text-center">{label}</span>
    </div>
  );
}

export default function HomePage() {
  const featured = getFeaturedTools();
  const newTools = getNewTools();
  const allCategories = CATEGORIES;
  const websiteJsonLd = buildWebSiteJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      {/* ─── HERO ──────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 pt-20 pb-16 grid-pattern overflow-hidden">
        {/* Glow Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" fill="currentColor" />
            {TOOLS.length} Free Online Tools — No Sign-up Required
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-tight">
            The Ultimate{" "}
            <span className="gradient-text">Toolkit</span>
            <br />
            for Everyone
          </h1>

          <p className="text-lg sm:text-xl text-[rgb(148,148,186)] max-w-2xl mx-auto mb-10 leading-relaxed">
            Fast, free, and privacy-first online tools. YouTube tools, image optimization, developer utilities, text converters — all in one place.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/tools"
              className="btn-primary flex items-center gap-2 text-base px-8 py-3"
            >
              Explore All Tools <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#categories"
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[rgb(45,45,65)] text-[rgb(148,148,186)] hover:text-white hover:border-[rgba(139,92,246,0.4)] transition-all text-sm font-medium"
            >
              Browse Categories
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[rgb(80,80,120)]">
          <div className="w-5 h-8 rounded-full border border-[rgb(45,45,65)] flex items-start justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-violet-400 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ─── STATS ─────────────────────────────────────────── */}
      <section className="py-10 border-y border-[rgb(30,30,46)]">
        <div className="container-wide">
          <div className="grid grid-cols-3 divide-x divide-[rgb(30,30,46)]">
            <StatCard value={`${TOOLS.length}`} label="Free Browser Tools" icon={Zap} />
            <StatCard value="Browser-First" label="Most Tools Run Locally" icon={Globe} />
            <StatCard value="Zero" label="Sign-up Required" icon={ShieldCheck} />
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ────────────────────────────────────── */}
      <section id="categories" className="py-16 px-4">
        <div className="container-wide">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Browse by <span className="gradient-text">Category</span>
            </h2>
            <p className="text-[rgb(80,80,120)] max-w-lg mx-auto">
              Every tool organized neatly. Find what you need in seconds.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {allCategories.map((cat, i) => (
              <Link
                key={cat.id}
                href={`/tools/${cat.slug}`}
                className={cn(
                  "glass-card p-5 flex flex-col items-center text-center gap-3 group",
                  "hover:border-opacity-50"
                )}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-transform group-hover:scale-110"
                  style={{ background: `linear-gradient(135deg, ${cat.color}20, ${cat.color}40)` }}
                >
                  <span style={{ color: cat.color }}>{cat.symbol}</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{cat.name}</div>
                  <div className="text-xs text-[rgb(80,80,120)] mt-0.5">
                    {TOOLS.filter((t) => t.categoryId === cat.id).length} tools
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED TOOLS ────────────────────────────────── */}
      <section className="py-16 px-4 bg-[rgb(17,17,27)]">
        <div className="container-wide">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                ⚡ <span className="gradient-text">Featured</span> Tools
              </h2>
              <p className="text-[rgb(80,80,120)]">Our most powerful and popular tools</p>
            </div>
            <Link
              href="/tools"
              className="hidden sm:flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((tool, i) => (
              <ToolCard key={tool.id} tool={tool} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── NEW TOOLS ─────────────────────────────────────── */}
      {newTools.length > 0 && (
        <section className="py-16 px-4">
          <div className="container-wide">
            <div className="flex items-center gap-3 mb-8">
              <span className="pill pill-new text-sm">✨ New</span>
              <h2 className="text-2xl font-bold text-white">Just Launched</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {newTools.map((tool, i) => (
                <ToolCard key={tool.id} tool={tool} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── WHY RAPIDKIT ──────────────────────────────────── */}
      <section className="py-16 px-4 bg-[rgb(17,17,27)] overflow-hidden">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Why <span className="gradient-text">RapidKit Tools</span>?
            </h2>
            <p className="text-[rgb(80,80,120)] max-w-xl mx-auto">
              We built the tools we always wanted but couldn&apos;t find in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "🚀", title: "Lightning Fast", desc: "Most tools process directly in your browser with no file uploads to slow servers." },
              { icon: "🔒", title: "Privacy-First", desc: "Files, images, and text stay on your device for all local browser utilities." },
              { icon: "💸", title: "Always Free", desc: "Every tool is completely free. No hidden fees, no premium plan, no credit card needed." },
              { icon: "📱", title: "Works Everywhere", desc: "Optimized for desktop and mobile. Use RapidKit Tools from any device, any browser." },
              { icon: "🎯", title: "No Sign-up", desc: "Just open a tool and use it. No accounts, no emails, no friction." },
              { icon: "♾️", title: "Regular Updates", desc: "New tools added regularly based on user feedback and community requests." },
            ].map((item, i) => (
              <div key={i} className="glass-card p-6 flex gap-4 items-start">
                <span className="text-3xl">{item.icon}</span>
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-[rgb(80,80,120)] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ────────────────────────────────────── */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/20 to-cyan-900/20" />
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="relative z-10 container-narrow text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Ready to work <span className="gradient-text">smarter</span>?
          </h2>
          <p className="text-[rgb(148,148,186)] mb-8 max-w-md mx-auto">
            Use browser-native utilities from RapidKit Tools for development, design, and digital marketing.
          </p>
          <Link
            href="/tools"
            className="btn-primary inline-flex items-center gap-2 text-base px-10 py-3"
          >
            Explore All {TOOLS.length} Tools <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
