import type { Metadata } from "next";
import Link from "next/link";
import {
    Code2,
    Rocket,
    Layers,
    Database,
    Server,
    Mail,
    Github,
    Linkedin,
    ArrowRight,
    Sparkles,
    Clock,
    ShieldCheck,
    Briefcase,
    ChevronRight,
    Cpu,
    Smartphone,
    Globe,
    FileCode,
    ExternalLink,
} from "lucide-react";
import { canonicalUrl, buildBreadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Hire Abdelkhalek Elsaeed | Full-Stack Web Developer",
    description:
        "Available for freelance web development, SaaS building, and custom web apps using Next.js, React, and Node.js.",
    alternates: {
        canonical: canonicalUrl("/hire-me"),
    },
    openGraph: {
        title: "Hire Abdelkhalek Elsaeed | Full-Stack Web Developer",
        description:
            "Available for freelance web development, SaaS building, and custom web apps using Next.js, React, and Node.js.",
        url: canonicalUrl("/hire-me"),
        type: "profile",
    },
    twitter: {
        card: "summary_large_image",
        title: "Hire Abdelkhalek Elsaeed | Full-Stack Web Developer",
        description:
            "Available for freelance web development, SaaS building, and custom web apps using Next.js, React, and Node.js.",
    },
};

export default function HireMePage() {
    const breadcrumbJsonLd = buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Hire Me", path: "/hire-me" },
    ]);

    const coreSkills = [
        { name: "Next.js", category: "Frontend / Full-Stack", icon: Globe, highlight: "App Router, SSR, SSG" },
        { name: "React", category: "Frontend", icon: Code2, highlight: "Hooks, Concurrent, Architecture" },
        { name: "TypeScript", category: "Language", icon: FileCode, highlight: "Strict Typings, High Reliability" },
        { name: "Node.js", category: "Backend Runtime", icon: Server, highlight: "High Concurrency, REST APIs" },
        { name: "NestJS", category: "Backend Framework", icon: Cpu, highlight: "Enterprise Architecture, Scalable" },
        { name: "Tailwind CSS", category: "Styling & UI", icon: Sparkles, highlight: "Responsive, Modern Design" },
        { name: "PostgreSQL", category: "Relational DB", icon: Database, highlight: "Complex Queries, Schema Design" },
        { name: "Supabase", category: "Backend-as-a-Service", icon: Layers, highlight: "Auth, Realtime, Storage" },
        { name: "Prisma", category: "Database ORM", icon: Database, highlight: "Type-safe Data Modeling" },
        { name: "Docker", category: "DevOps & Containers", icon: Server, highlight: "Containerization, Reproducible" },
    ];

    const portfolioProjects = [
        {
            title: "Classora",
            tagline: "Educational Center SaaS Platform",
            badge: "B2B SaaS",
            highlight: "Multi-Tenant Architecture",
            description:
                "B2B educational management platform handling multi-tenant scheduling, automated student and teacher workflows, attendance tracking, and student billing operations.",
            stack: ["React.js", "Next.js", "Supabase", "PostgreSQL", "Tailwind CSS"],
            liveDemo: "https://classora-center.vercel.app",
        },
        {
            title: "RapidKit",
            tagline: "Developer & Marketer Toolkit",
            badge: "Live Production SaaS",
            highlight: "35+ Browser-Native Tools",
            description:
                "Full-featured suite of developer and marketing utilities running 100% client-side. Architected programmatic SEO comparisons, dynamic sitemaps, JSON-LD schemas, and affiliate engine.",
            stack: ["React.js", "Next.js", "TypeScript", "Tailwind CSS", "Programmatic SEO"],
            liveDemo: "https://rapidkit-nine.vercel.app",
        },
        {
            title: "Invest CRM",
            tagline: "Real Estate & Lead Management Dashboard",
            badge: "CRM Platform",
            highlight: "WhatsApp Cloud API + AI",
            description:
                "Responsive CRM dashboard integrated with WhatsApp Cloud API and an intelligent AI chatbot to qualify incoming leads, manage customer communication, and track sales pipelines.",
            stack: ["Next.js", "React", "Tailwind CSS", "Node.js", "Supabase"],
            liveDemo: "https://invest-crm.vercel.app",
        },
        {
            title: "Vertex Media",
            tagline: "Social Media Agency Showcase",
            badge: "Agency Website",
            highlight: "Scroll-Driven Animations",
            description:
                "High-impact marketing website for a modern social media agency, featuring advanced scroll-driven animations, interactive typography, and smooth transitions built for maximum engagement.",
            stack: ["Next.js", "GSAP", "Framer Motion", "Tailwind CSS"],
            liveDemo: "https://vertex-2-inky.vercel.app",
        },
        {
            title: "ZEUS",
            tagline: "Bilingual Streetwear E-Commerce",
            badge: "E-Commerce",
            highlight: "Multi-Variant & next-intl",
            description:
                "Bilingual streetwear storefront with multi-variant inventory management, Cloudinary media optimization, dynamic catalog filtering, and a streamlined mobile checkout flow.",
            stack: ["Next.js", "React", "next-intl", "Cloudinary", "Tailwind CSS"],
            liveDemo: "https://zeus-flax.vercel.app",
        },
        {
            title: "Movies Hub",
            tagline: "Movie Discovery & Entertainment Catalog",
            badge: "Web App",
            highlight: "TMDB API Integration",
            description:
                "Responsive movie discovery platform consuming the TMDB REST API. Includes instant multi-parameter search, genre filtering, rich detail views, and localized favorites.",
            stack: ["React", "Vite", "Tailwind CSS", "Context API", "TMDB API"],
            liveDemo: "https://graduation-project-iti-three.vercel.app",
        },
        {
            title: "Rayanco",
            tagline: "Logistics & Supply Management System",
            badge: "Enterprise Logistics",
            highlight: "Order & Fleet Management",
            description:
                "Comprehensive web system built for a shipping and supply corporation to coordinate end-to-end logistics, process client consignments, and monitor delivery timelines.",
            stack: ["Next.js", "React", "Node.js", "PostgreSQL", "Tailwind CSS"],
            liveDemo: "https://rayanco.vercel.app",
        },
        {
            title: "LMS Platform",
            tagline: "Learning Management & Student Tracking",
            badge: "EdTech Platform",
            highlight: "Course Delivery Engine",
            description:
                "Dedicated online education platform engineered for structured video course delivery, student progress analytics, interactive assessments, and teacher administration.",
            stack: ["Next.js", "React", "Tailwind CSS", "Node.js", "PostgreSQL"],
            liveDemo: "https://mrabdelrahman-eight.vercel.app",
        },
    ];

    const services = [
        {
            icon: Rocket,
            title: "Full-Stack SaaS & MVP Development",
            description:
                "Turn your napkin sketch or Figma design into a scalable, production-ready web application with authentication, database architecture, payment flows, and clean code.",
        },
        {
            icon: Code2,
            title: "Modern Next.js & React Frontend",
            description:
                "Build blazingly fast, accessible, and responsive user interfaces using Next.js App Router, React 19, TypeScript, and Tailwind CSS. Clean component structure guaranteed.",
        },
        {
            icon: Server,
            title: "Scalable Backends & API Engineering",
            description:
                "Design and implement secure RESTful APIs, background jobs, webhooks, and microservices with Node.js, NestJS, Prisma, and PostgreSQL.",
        },
        {
            icon: Sparkles,
            title: "Programmatic SEO & Web Performance",
            description:
                "Scale organic acquisition with programmatic landing pages, high Core Web Vitals scores, dynamic sitemaps, OpenGraph cards, and schema.org JSON-LD.",
        },
    ];

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />

            <div className="pt-20 pb-20 px-4">
                <div className="container-wide max-w-5xl">
                    {/* Breadcrumb */}
                    <nav aria-label="breadcrumb" className="flex items-center gap-1 text-xs text-[rgb(80,80,120)] mb-8">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-[rgb(148,148,186)]">Hire Me</span>
                    </nav>

                    {/* ─── Hero Section ───────────────────────────── */}
                    <header className="relative mb-16 sm:mb-20">
                        {/* Glow ambient background */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-64 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-start gap-5">
                            {/* Status badge */}
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                Available for Freelance &amp; Contract Projects
                            </div>

                            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                                Build Your Next <span className="gradient-text">Big Idea</span>
                            </h1>

                            <p className="text-base sm:text-xl text-[rgb(148,148,186)] max-w-3xl leading-relaxed">
                                Hi, I&apos;m <strong className="text-white font-semibold">Abdelkhalek Elsaeed</strong> — a Full-Stack Web Developer specializing in high-performance SaaS platforms, custom web applications, and developer tools with Next.js, React, Node.js, and PostgreSQL.
                            </p>

                            {/* Direct Action Buttons */}
                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                <a
                                    href="mailto:mohamedboody730@gmail.com"
                                    className="btn-primary inline-flex items-center gap-2 text-sm sm:text-base px-6 py-3 shadow-lg shadow-violet-500/25"
                                >
                                    <Mail className="w-4 h-4" />
                                    <span>Get in Touch</span>
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </a>

                                <a
                                    href="#portfolio"
                                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[rgb(20,20,32)] border border-[rgb(45,45,65)] hover:border-violet-500/40 text-sm font-semibold text-white transition-all hover:bg-[rgb(25,25,40)]"
                                >
                                    <Briefcase className="w-4 h-4 text-violet-400" />
                                    <span>View Portfolio ({portfolioProjects.length})</span>
                                </a>

                                <a
                                    href="https://mostaql.com/u/Abdulkhalek2"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[rgb(20,20,32)] border border-[rgb(45,45,65)] hover:border-emerald-500/40 text-sm font-medium text-[rgb(148,148,186)] hover:text-white transition-all"
                                >
                                    <ExternalLink className="w-4 h-4 text-emerald-400" />
                                    <span>Mostaql (مستقل)</span>
                                </a>

                                <a
                                    href="https://github.com/Abdelkhalek2"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[rgb(20,20,32)] border border-[rgb(45,45,65)] hover:border-[rgb(80,80,120)] text-sm font-medium text-[rgb(148,148,186)] hover:text-white transition-all"
                                >
                                    <Github className="w-4 h-4" />
                                    <span>GitHub</span>
                                </a>

                                <a
                                    href="https://www.linkedin.com/in/abdulkhaleq-mohamed-021407232"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[rgb(20,20,32)] border border-[rgb(45,45,65)] hover:border-[rgb(80,80,120)] text-sm font-medium text-[rgb(148,148,186)] hover:text-white transition-all"
                                >
                                    <Linkedin className="w-4 h-4 text-cyan-400" />
                                    <span>LinkedIn</span>
                                </a>
                            </div>

                            {/* Trust badges row */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 w-full border-t border-[rgb(30,30,46)] mt-4">
                                <div className="flex items-center gap-2 text-xs text-[rgb(130,130,170)]">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span>Clean, Maintainable Code</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-[rgb(130,130,170)]">
                                    <Rocket className="w-4 h-4 text-violet-400 shrink-0" />
                                    <span>Fast MVP Turnaround</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-[rgb(130,130,170)]">
                                    <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                                    <span>&lt; 24h Response Time</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-[rgb(130,130,170)]">
                                    <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
                                    <span>100% Mobile Responsive</span>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* ─── Core Tech Stack ────────────────────────── */}
                    <section className="mb-16 sm:mb-20">
                        <div className="flex items-center gap-2 mb-3">
                            <Cpu className="w-4 h-4 text-violet-400" />
                            <h2 className="text-xs font-bold uppercase tracking-wider text-violet-300">
                                Skills &amp; Tech Stack
                            </h2>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                            Modern Tools for Production-Grade Applications
                        </h3>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {coreSkills.map((skill) => {
                                const IconComponent = skill.icon;
                                return (
                                    <div
                                        key={skill.name}
                                        className="glass-card p-4 flex flex-col justify-between gap-3 hover:border-violet-500/40 transition-all group"
                                    >
                                        <div className="flex items-center justify-between">
                                             <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-105 group-hover:text-white transition-all">
                                                <IconComponent className="w-4 h-4" />
                                            </div>
                                            <span className="text-[10px] font-medium text-[rgb(100,100,140)]">
                                                {skill.category.split(" ")[0]}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">
                                                {skill.name}
                                            </h4>
                                            <p className="text-xs text-[rgb(110,110,150)] mt-0.5 leading-snug">
                                                {skill.highlight}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* ─── Portfolio Highlights ───────────────────── */}
                    <section id="portfolio" className="mb-16 sm:mb-20 scroll-mt-24">
                        <div className="flex items-center gap-2 mb-3">
                            <Briefcase className="w-4 h-4 text-cyan-400" />
                            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                                Featured Projects
                            </h2>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                            Proven Work Built for Real Users
                        </h3>
                        <p className="text-sm text-[rgb(130,130,170)] max-w-2xl mb-8 leading-relaxed">
                            A showcase of production SaaS platforms, B2B applications, agency websites, and web applications I have built and delivered.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {portfolioProjects.map((project) => (
                                <article
                                    key={project.title}
                                    className="glass-card p-6 sm:p-7 flex flex-col justify-between gap-6 hover:border-cyan-500/40 transition-all group"
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
                                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                                                {project.badge}
                                            </span>
                                            {project.highlight && (
                                                <span className="text-xs text-[rgb(110,110,150)] font-medium">
                                                    {project.highlight}
                                                </span>
                                            )}
                                        </div>

                                        <h4 className="text-xl sm:text-2xl font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                                            {project.title}
                                        </h4>
                                        <p className="text-xs font-medium text-violet-400 mb-3">
                                            {project.tagline}
                                        </p>

                                        <p className="text-sm text-[rgb(130,130,170)] leading-relaxed mb-5">
                                            {project.description}
                                        </p>

                                        {/* Tech Stack Tags */}
                                        <div className="flex flex-wrap gap-1.5">
                                            {project.stack.map((tech) => (
                                                <span
                                                    key={tech}
                                                    className="px-2 py-0.5 rounded-md bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] text-[11px] font-medium text-[rgb(150,150,190)]"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-[rgb(30,30,46)] flex items-center justify-between">
                                        <a
                                            href={project.liveDemo}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500/50 hover:text-white transition-all group/btn"
                                        >
                                            <span>Live Demo</span>
                                            <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                        </a>

                                        <span className="text-[11px] text-[rgb(90,90,130)]">
                                            Production / Live
                                        </span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    {/* ─── Services ───────────────────────────────── */}
                    <section className="mb-16 sm:mb-20">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-violet-400" />
                            <h2 className="text-xs font-bold uppercase tracking-wider text-violet-300">
                                What I Do
                            </h2>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-8">
                            How I Can Help Your Business
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {services.map((service) => {
                                const IconComponent = service.icon;
                                return (
                                    <div
                                        key={service.title}
                                        className="glass-card p-6 flex items-start gap-4 hover:border-violet-500/40 transition-all"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300 shrink-0 mt-1">
                                            <IconComponent className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-white mb-1.5">
                                                {service.title}
                                            </h4>
                                            <p className="text-xs sm:text-sm text-[rgb(130,130,170)] leading-relaxed">
                                                {service.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* ─── Working Together / Process ─────────────── */}
                    <section className="glass-card p-6 sm:p-8 mb-16 sm:mb-20">
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                            The Freelance Process: Transparent &amp; Predictable
                        </h3>
                        <p className="text-xs sm:text-sm text-[rgb(130,130,170)] mb-6 max-w-2xl leading-relaxed">
                            No endless meetings or opaque development cycles. You get working, verifiable code on staging environments from day one.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { step: "01", title: "Scope & Architecture", desc: "We define core user flows, technical constraints, database model, and delivery timeline." },
                                { step: "02", title: "Iterative Build", desc: "Fast sprint milestones with regular live preview links so you can test as features are created." },
                                { step: "03", title: "QA & Optimization", desc: "Rigorous responsiveness testing, edge-case validation, SEO setup, and performance tuning." },
                                { step: "04", title: "Deployment & Handoff", desc: "Production launch on Vercel/Docker, environment setup, and clean code documentation." },
                            ].map((phase) => (
                                <div key={phase.step} className="p-4 rounded-xl bg-[rgb(14,14,22)] border border-[rgb(35,35,52)]">
                                    <span className="text-xs font-black text-violet-400 font-mono block mb-1">
                                        {phase.step}
                                    </span>
                                    <h4 className="text-sm font-bold text-white mb-1">{phase.title}</h4>
                                    <p className="text-xs text-[rgb(110,110,150)] leading-relaxed">{phase.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ─── Contact & CTA Section ───────────────────── */}
                    <section className="relative rounded-3xl bg-gradient-to-br from-violet-600/20 via-[rgb(17,17,27)] to-cyan-600/20 border border-violet-500/30 p-8 sm:p-12 text-center overflow-hidden">
                        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-5">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-semibold">
                                <Sparkles className="w-3.5 h-3.5" /> Let&apos;s Build Together
                            </div>

                            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                                Have a Project in Mind?
                            </h2>

                            <p className="text-sm sm:text-base text-[rgb(148,148,186)] leading-relaxed">
                                Whether you need a full SaaS built from scratch, an MVP delivered quickly, or dedicated full-stack development, let&apos;s discuss how to bring it to life.
                            </p>

                            {/* Main Email CTA Button */}
                            <a
                                href="mailto:mohamedboody730@gmail.com"
                                className="btn-primary inline-flex items-center gap-2.5 text-base sm:text-lg px-8 py-3.5 shadow-xl shadow-violet-500/30 my-2"
                            >
                                <Mail className="w-5 h-5" />
                                <span>mohamedboody730@gmail.com</span>
                            </a>

                            {/* Direct Freelance Platforms & Channels */}
                            <div className="pt-5 border-t border-[rgb(45,45,65)]/60 w-full flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-[rgb(130,130,170)]">
                                <span>Find me on:</span>
                                <div className="flex flex-wrap items-center justify-center gap-3">
                                    <a
                                        href="https://mostaql.com/u/Abdulkhalek2"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3.5 py-1.5 rounded-lg bg-[rgb(24,24,37)] border border-[rgb(45,45,65)] hover:border-emerald-500/50 text-white hover:text-emerald-300 font-semibold transition-all inline-flex items-center gap-1.5"
                                    >
                                        <span>Mostaql (مستقل)</span>
                                        <ExternalLink className="w-3 h-3 text-emerald-400" />
                                    </a>
                                    <a
                                        href="https://github.com/Abdelkhalek2"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3.5 py-1.5 rounded-lg bg-[rgb(24,24,37)] border border-[rgb(45,45,65)] hover:border-violet-500/50 text-[rgb(148,148,186)] hover:text-white font-medium transition-all inline-flex items-center gap-1.5"
                                    >
                                        <Github className="w-3.5 h-3.5 text-violet-400" />
                                        <span>GitHub</span>
                                    </a>
                                    <a
                                        href="https://www.linkedin.com/in/abdulkhaleq-mohamed-021407232"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3.5 py-1.5 rounded-lg bg-[rgb(24,24,37)] border border-[rgb(45,45,65)] hover:border-cyan-500/50 text-[rgb(148,148,186)] hover:text-white font-medium transition-all inline-flex items-center gap-1.5"
                                    >
                                        <Linkedin className="w-3.5 h-3.5 text-cyan-400" />
                                        <span>LinkedIn</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
