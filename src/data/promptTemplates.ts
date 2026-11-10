export type TemplateCategory =
    | "Frontend Development"
    | "Backend Development"
    | "SEO"
    | "Sales"
    | "Copywriting";

export interface PromptTemplate {
    id: string;
    title: string;
    description: string;
    category: TemplateCategory;
    tags: string[];
    recommendedModel?: "chatgpt" | "claude" | "gemini" | "midjourney";
    role: string;
    task: string;
    context: string;
    outputFormat: string;
    variables: string[];
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
    "Frontend Development",
    "Backend Development",
    "SEO",
    "Sales",
    "Copywriting",
];

export const PROMPT_TEMPLATES: PromptTemplate[] = [
    // ─── Frontend Development ──────────────────────────────────────────
    {
        id: "fe-accessible-component",
        title: "WCAG-Compliant Accessible Component",
        description: "Generate keyboard-navigable and screen-reader accessible UI primitives meeting strict WCAG criteria.",
        category: "Frontend Development",
        tags: ["React", "TypeScript", "Accessibility", "Tailwind CSS", "ARIA"],
        recommendedModel: "claude",
        role: "Staff Frontend Accessibility & Design Systems Engineer with deep expertise in WAI-ARIA 1.2 authoring practices.",
        task: "Develop a production-grade, keyboard-navigable, and screen-reader accessible {{Component_Name}} component using {{Framework}} and {{Styling_Solution}} complying strictly with {{WCAG_Level}} standards.",
        context: "The component must support complete keyboard interaction (Tab, Shift+Tab, Arrow keys, Escape, Enter, Space), manage ARIA live regions and state attributes (aria-expanded, aria-controls, aria-describedby, aria-haspopup), and enforce a minimum 4.5:1 color contrast ratio. Avoid third-party headless UI libraries; implement accessible primitives natively with clean TypeScript types.",
        outputFormat: "1. Complete TypeScript Component Code (.tsx) with inline ARIA comments\n2. Accessibility & Keyboard Interaction Matrix Table\n3. Screen Reader Testing Checklist (NVDA / VoiceOver)",
        variables: ["{{Component_Name}}", "{{Framework}}", "{{Styling_Solution}}", "{{WCAG_Level}}"],
    },
    {
        id: "fe-state-refactor",
        title: "Complex State & Custom Hook Refactoring",
        description: "Decompose entangled component state into modular, high-performance custom hooks with zero wasted re-renders.",
        category: "Frontend Development",
        tags: ["React", "Hooks", "State Management", "Performance", "Clean Code"],
        recommendedModel: "chatgpt",
        role: "Principal Frontend Performance Architect specializing in React render-cycle optimization and state isolation.",
        task: "Refactor complex, entangled state logic inside {{Component_Scope}} by decomposing it into isolated custom hooks using {{State_Library}} to eliminate {{Performance_Bottleneck}}.",
        context: "Eliminate cascading re-renders by isolating state transitions and memoizing selectors. Decouple network side-effects from UI rendering. Ensure strict TypeScript typing for all actions, state slices, and return signatures. Implement defensive abort signals for async requests.",
        outputFormat: "1. Architectural State Flow Diagram (ASCII/Mermaid)\n2. Decoupled Custom Hook Implementation Code with TypeScript Generics\n3. Refactored Lightweight Consumer Component Code",
        variables: ["{{Component_Scope}}", "{{State_Library}}", "{{Performance_Bottleneck}}"],
    },
    {
        id: "fe-responsive-landing-hero",
        title: "High-Converting Responsive Hero Section",
        description: "Craft a modern, mobile-first hero section with responsive typography and fluid micro-interactions.",
        category: "Frontend Development",
        tags: ["Tailwind CSS", "Responsive Design", "UI/UX", "Next.js", "Conversion"],
        recommendedModel: "claude",
        role: "Lead UI/UX Design Technologist & Conversion Rate Optimization Specialist.",
        task: "Build a modern, high-converting responsive hero section for a {{Brand_Theme}} platform using {{Framework}} and Tailwind CSS centered on: '{{Value_Proposition}}' with primary CTA: '{{CTA_Goal}}'.",
        context: "Mobile-first responsive layout (supporting 320px up to 4K displays). Include dark mode support, fluid typography scaling, skeleton loading/fallback states, and strict Cumulative Layout Shift (CLS) prevention. Add subtle hover micro-interactions.",
        outputFormat: "1. Clean Responsive Component Code with Tailwind CSS classes\n2. Design Hierarchy & Micro-copy Placement Rationale\n3. Mobile vs Desktop Breakpoint Specifications",
        variables: ["{{Framework}}", "{{Brand_Theme}}", "{{Value_Proposition}}", "{{CTA_Goal}}"],
    },
    {
        id: "fe-web-vitals-audit",
        title: "Core Web Vitals Frontend Audit & Remediation",
        description: "Analyze critical rendering paths and optimize LCP, INP, and CLS scores for production web applications.",
        category: "Frontend Development",
        tags: ["Web Vitals", "LCP", "INP", "Performance", "Optimization"],
        recommendedModel: "gemini",
        role: "Web Performance Engineer & Lighthouse Performance Auditor.",
        task: "Analyze and formulate a step-by-step remediation plan for a {{Page_Type}} page suffering from degraded LCP (target: {{LCP_Target}}) and heavy script execution from {{Third_Party_Scripts}}.",
        context: "Address critical rendering path bottlenecks, resource hints (dns-prefetch, preconnect, preload), non-blocking third-party script loading strategies, font-display optimization to avoid FOIT, and next/image configuration.",
        outputFormat: "1. Prioritized Remediation Checklist (ranked by millisecond impact)\n2. Concrete Code Snippets for Resource Loading & Script Optimization\n3. Projected Metric Improvement Benchmarks",
        variables: ["{{Page_Type}}", "{{LCP_Target}}", "{{Third_Party_Scripts}}"],
    },

    // ─── Backend Development ───────────────────────────────────────────
    {
        id: "be-rest-api-architecture",
        title: "Enterprise RESTful Resource Architecture",
        description: "Design idempotent, secure REST API controllers with database migrations, validation, and error standards.",
        category: "Backend Development",
        tags: ["Node.js", "REST API", "Database", "Security", "Validation"],
        recommendedModel: "chatgpt",
        role: "Principal Backend Systems Architect with deep enterprise API security and scalability background.",
        task: "Design and implement a production-grade CRUD RESTful controller and service layer for {{Resource_Name}} using {{Database}}, protected by {{Auth_Mechanism}} and validated with {{Validation_Library}}.",
        context: "Must enforce idempotent operations (PUT/DELETE), rate limiting headers, RFC 7807 Problem Details error responses, cursor-based pagination, database transaction rollbacks on failure, and audit timestamping.",
        outputFormat: "1. OpenAPI 3.1 Spec Endpoint Definitions\n2. Controller & Service Implementation Code\n3. Database Schema Migration Script & Recommended Indexes",
        variables: ["{{Resource_Name}}", "{{Database}}", "{{Auth_Mechanism}}", "{{Validation_Library}}"],
    },
    {
        id: "be-sql-query-optimizer",
        title: "SQL Query & Index Optimization Engine",
        description: "Diagnose slow queries, eliminate sequential scans, and design covering composite indexes for large tables.",
        category: "Backend Development",
        tags: ["SQL", "PostgreSQL", "Database", "Indexing", "Performance"],
        recommendedModel: "claude",
        role: "Senior Database Administrator (DBA) & Query Optimization Specialist.",
        task: "Analyze and rewrite a slow SQL query on {{Table_Name}} (containing ~{{Row_Count}} rows) running on {{Database_Engine}}. Current query: {{Current_Slow_Query}}.",
        context: "Target is a >80% reduction in query execution time. Identify sequential table scans, missing composite/covering indexes, lock contention risks, and redundant subqueries. Provide EXPLAIN ANALYZE guidance.",
        outputFormat: "1. Query Execution Plan Breakdown & Bottleneck Diagnosis\n2. Optimized SQL Query\n3. Exact CREATE INDEX DDL Statements with Partial Indexing Recommendations",
        variables: ["{{Database_Engine}}", "{{Table_Name}}", "{{Current_Slow_Query}}", "{{Row_Count}}"],
    },
    {
        id: "be-microservice-jwt-auth",
        title: "Microservice JWT & Token Verification Guard",
        description: "Hardened authentication middleware with RS256 key rotation, JWKS caching, and scope validation.",
        category: "Backend Development",
        tags: ["JWT", "OAuth2", "Security", "Microservices", "Auth"],
        recommendedModel: "claude",
        role: "Cybersecurity & Backend Identity Engineer specializing in zero-trust microservice architectures.",
        task: "Implement a hardened token verification middleware for {{Backend_Runtime}} that validates RS256 JWT tokens issued by {{Identity_Provider}} with a {{Token_Expiry}} lifecycle.",
        context: "Include in-memory public key caching with automatic JWKS rotation, Redis-backed token revocation check, 60-second clock skew tolerance, RBAC scope validation, and explicit defense against algorithm 'none' substitution attacks.",
        outputFormat: "1. Security Protocol & Attack Vector Checklist\n2. Production Middleware Implementation Code\n3. Key Rotation & Revocation Strategy Documentation",
        variables: ["{{Backend_Runtime}}", "{{Identity_Provider}}", "{{Token_Expiry}}"],
    },
    {
        id: "be-resilient-worker-queue",
        title: "Resilient Background Job Queue & Worker",
        description: "Construct scalable asynchronous queue pipelines with exponential backoff, jitter, and dead letter routing.",
        category: "Backend Development",
        tags: ["Queue", "Redis", "Background Jobs", "Worker", "Reliability"],
        recommendedModel: "chatgpt",
        role: "Distributed Systems Reliability Engineer specializing in asynchronous task pipelines.",
        task: "Construct an asynchronous background worker pipeline for {{Job_Type}} utilizing {{Queue_System}} with {{Max_Retries}} retries and a concurrency limit of {{Concurrency_Limit}}.",
        context: "Must feature exponential backoff with randomized jitter, dead letter queue (DLQ) routing, graceful process termination on SIGTERM, job deduplication keys, and structured logging of job duration and error states.",
        outputFormat: "1. Queue & Worker Configuration Code with Concurrency Control\n2. Dead Letter Queue & Failure Recovery Policy\n3. Key Metrics to Monitor in Production",
        variables: ["{{Queue_System}}", "{{Job_Type}}", "{{Max_Retries}}", "{{Concurrency_Limit}}"],
    },

    // ─── SEO ───────────────────────────────────────────────────────────
    {
        id: "seo-topical-pillar-cluster",
        title: "Topical Authority Pillar & Cluster Architecture",
        description: "Map out complete semantic topic clusters with search intent, keyword hierarchy, and internal linking silos.",
        category: "SEO",
        tags: ["SEO Strategy", "Pillar Page", "Keyword Clustering", "Information Architecture"],
        recommendedModel: "gemini",
        role: "Head of Technical SEO & Semantic Search Strategist with proven track record in building topical authority.",
        task: "Formulate a comprehensive topical authority cluster map for '{{Core_Topic}}' targeted at {{Target_Audience}} with primary intent '{{Search_Intent}}' designed to outrank {{Competitor_URL}}.",
        context: "Map out 1 central comprehensive Pillar page and 8–10 supporting Sub-Cluster articles. Detail exact semantic keyword clusters, estimated search intent (informational/commercial/transactional), internal linking anchor text silo structure, and recommended word counts.",
        outputFormat: "1. Pillar Page Hierarchy & H1/H2 Outline\n2. Markdown Table of Supporting Cluster Articles with Targeted Keywords & Intent\n3. Internal Linking Silo Architecture Rules",
        variables: ["{{Core_Topic}}", "{{Target_Audience}}", "{{Search_Intent}}", "{{Competitor_URL}}"],
    },
    {
        id: "seo-programmatic-brief",
        title: "Programmatic SEO Landing Page Blueprint",
        description: "Scalable landing page architecture dynamically populated with database variables, unique utilities, and schema.",
        category: "SEO",
        tags: ["Programmatic SEO", "Landing Pages", "Data-Driven", "Indexing"],
        recommendedModel: "chatgpt",
        role: "Growth & Programmatic SEO Lead specializing in high-indexation programmatic directory and comparison sites.",
        task: "Create a scalable programmatic landing page template for {{Template_Theme}} dynamically parameterized by {{Dynamic_Variables}} sourced from {{Database_Source}}.",
        context: "Prevent Google helpful content penalties for thin or duplicate content. Every generated page must contain unique data computations, user-first utility, dynamic schema markup, and distinct FAQs. Include canonicalization and indexation guardrails.",
        outputFormat: "1. URL Structure & Slug Formatting Convention\n2. Dynamic Page Layout Wireframe with Merge Tags\n3. Dynamic Schema.org JSON-LD Template Snippet",
        variables: ["{{Template_Theme}}", "{{Dynamic_Variables}}", "{{Database_Source}}"],
    },
    {
        id: "seo-content-decay-audit",
        title: "Decaying Content Refresh & Intent Optimization",
        description: "Revitalize declining articles by closing information gain gaps and aligning with updated SERP features.",
        category: "SEO",
        tags: ["Content Refresh", "Google Updates", "On-Page SEO", "CTR"],
        recommendedModel: "claude",
        role: "Content Refresh & On-Page SEO Auditor specializing in Google Helpful Content update recoveries.",
        task: "Perform a content revitalization audit for {{Target_URL}} which dropped from rank #{{Historical_Rank}} to #{{Current_Rank}} for '{{Primary_Keyword}}'.",
        context: "Identify information gain gaps, outdated references, stale search intent mismatches (SERP feature shifts), buried answers affecting Quick Answers / Google SGE, and missing media or comparison tables.",
        outputFormat: "1. Content Gap Analysis vs Current Top 3 SERP Competitors\n2. Specific H2/H3 Section Rewrite Proposals\n3. 3 High-CTR Title Tag & Meta Description Variants",
        variables: ["{{Target_URL}}", "{{Historical_Rank}}", "{{Current_Rank}}", "{{Primary_Keyword}}"],
    },
    {
        id: "seo-schema-markup-jsonld",
        title: "Enterprise JSON-LD Structured Data Schema",
        description: "Construct nested, error-free Schema.org graphs for Organizations, Services, and Rich Results.",
        category: "SEO",
        tags: ["Schema.org", "JSON-LD", "Rich Snippets", "Technical SEO"],
        recommendedModel: "chatgpt",
        role: "Semantic Web Engineer & Schema.org Structured Data Specialist.",
        task: "Construct a nested, valid JSON-LD schema for a {{Entity_Type}} named '{{Brand_Name}}' offering '{{Primary_Service}}' hosted at {{Official_URL}}.",
        context: "Integrate @graph structure combining Organization, WebSite, Service, ItemList, and FAQPage. Reference authoritative Wikidata and Wikipedia URIs using sameAs. Ensure zero schema validation errors against Google Rich Results test.",
        outputFormat: "1. Complete Valid JSON-LD <script> Code Block\n2. Google Rich Results Feature Eligibility Breakdown\n3. Testing & Implementation Guide",
        variables: ["{{Entity_Type}}", "{{Brand_Name}}", "{{Primary_Service}}", "{{Official_URL}}"],
    },

    // ─── Sales ─────────────────────────────────────────────────────────
    {
        id: "sales-enterprise-cold-outreach",
        title: "B2B Enterprise Multi-Touch Cold Outreach",
        description: "Engage decision-makers with a 3-touch personalized cold outreach sequence focused on high-pain problems.",
        category: "Sales",
        tags: ["Cold Email", "Outreach", "Enterprise Sales", "B2B", "Copywriting"],
        recommendedModel: "claude",
        role: "Enterprise Sales Development Representative (SDR) & B2B Messaging Strategist.",
        task: "Draft a high-converting 3-touch cold outreach email campaign targeting {{Prospect_Title}} at {{Prospect_Company}} experiencing {{Specific_Pain_Point}}, positioning {{Unique_Value_Proposition}}.",
        context: "Touch 1: Relevant observation + specific problem + low-friction CTA (under 90 words). Touch 2: Social proof / case study metrics (under 80 words). Touch 3: Value-first breakup/permission-based closing (under 60 words). No cheesy sales jargon.",
        outputFormat: "1. 5 High-Open Subject Line Variations\n2. Touch 1, 2, and 3 Email Copies with Merge Tags\n3. Recommended Follow-Up Schedule (Days 1, 4, 8)",
        variables: ["{{Prospect_Title}}", "{{Prospect_Company}}", "{{Specific_Pain_Point}}", "{{Unique_Value_Proposition}}"],
    },
    {
        id: "sales-discovery-call-matrix",
        title: "Strategic Discovery Call & Qualification Matrix",
        description: "Diagnostic discovery questions structured around the MEDDPICC framework to qualify enterprise opportunities.",
        category: "Sales",
        tags: ["Discovery Call", "MEDDPICC", "Qualification", "Closing"],
        recommendedModel: "claude",
        role: "VP of Enterprise Sales & Sales Enablement Coach.",
        task: "Develop a consultative discovery call question flow for {{Product_Category}} sold to {{Target_Industry}} with average deal size around {{Average_Contract_Value}}.",
        context: "Frame questions around the MEDDPICC framework (Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion, Competition). Questions must feel conversational and diagnostic rather than like an interrogation.",
        outputFormat: "1. 15 Structured Discovery Questions Categorized by Stage\n2. Red Flag / Early Disqualification Indicators\n3. Transition Script from Pain Identification to Demo Scheduling",
        variables: ["{{Target_Industry}}", "{{Product_Category}}", "{{Average_Contract_Value}}"],
    },
    {
        id: "sales-pricing-objection-handler",
        title: "Executive Pricing & Competition Objection Playbook",
        description: "Reframe price resistance and competitive bake-offs by anchoring conversation on TCO and risk mitigation.",
        category: "Sales",
        tags: ["Objection Handling", "Negotiation", "Pricing", "Closing"],
        recommendedModel: "chatgpt",
        role: "Strategic Account Executive & Negotiation Consultant.",
        task: "Create an executive objection-handling playbook responding to: '{{Common_Objection}}' when compared against {{Main_Competitor}}, anchoring around {{Key_Differentiator}}.",
        context: "Do not badmouth the competitor. Acknowledge and reframe (Feel-Felt-Found, Deflect-Deepen-Deliver). Anchor conversation on Total Cost of Ownership (TCO), risk mitigation, and the hidden cost of delayed implementation.",
        outputFormat: "1. 3 Response Scripts (Direct Executive, Consultative, and Contrast-Based)\n2. Probing Counter-Questions to Uncover Hidden Blockers\n3. Value Justification One-Pager Formula",
        variables: ["{{Common_Objection}}", "{{Main_Competitor}}", "{{Key_Differentiator}}"],
    },
    {
        id: "sales-post-demo-followup",
        title: "Post-Demo Stakeholder Consensus Recap",
        description: "A forwardable executive recap email for your internal champion to secure budget approval from the CFO.",
        category: "Sales",
        tags: ["Follow Up", "Demo", "Consensus Building", "Sales Pipeline"],
        recommendedModel: "claude",
        role: "Senior Account Executive & Enterprise Deal Closer.",
        task: "Write a high-impact post-demo recap email to {{Champion_Name}} summarizing the {{Demo_Key_Takeaway}} to achieve {{Quantified_Goal}} before {{Next_Milestone_Date}}.",
        context: "Designed to be forwarded directly by the champion to the CFO and executive sponsor. Must contain a bulleted business case, mutually agreed next steps, and access to an interactive prototype or sandbox.",
        outputFormat: "1. Forwardable Executive Recap Email with Clear ROI Bullets\n2. Mutual Action Plan (MAP) Table\n3. Follow-up Cadence Reminders",
        variables: ["{{Champion_Name}}", "{{Demo_Key_Takeaway}}", "{{Quantified_Goal}}", "{{Next_Milestone_Date}}"],
    },

    // ─── Copywriting ───────────────────────────────────────────────────
    {
        id: "copy-saas-hero-section",
        title: "High-Converting SaaS Landing Page Copy",
        description: "Generate above-the-fold hero messaging with 3 contrasting psychological angles and sticky CTAs.",
        category: "Copywriting",
        tags: ["Landing Page", "SaaS", "Conversion Copy", "Value Proposition"],
        recommendedModel: "claude",
        role: "Conversion Copywriter & Direct-Response Brand Strategist.",
        task: "Write high-converting above-the-fold copy for a SaaS product named '{{Product_Name}}' built for {{Target_Audience}} that delivers {{Primary_Benefit}} without the pain of {{Main_Alternative}}.",
        context: "Deliver 3 contrasting hook angles (Direct/Clarity-First, Pain-Agitation, and Contrarian). Include H1 Headline, H2 Subheadline, Primary CTA button text, Social Proof Microcopy, and a 3-bullet feature-to-benefit bridge.",
        outputFormat: "1. 3 Complete Angle Variations (H1, H2, Primary CTA, Trust Badge)\n2. 3-Bullet Feature-Benefit Matrix\n3. Readability & Emotional Trigger Analysis",
        variables: ["{{Product_Name}}", "{{Target_Audience}}", "{{Primary_Benefit}}", "{{Main_Alternative}}"],
    },
    {
        id: "copy-email-product-launch",
        title: "5-Part Product Launch Email Sequence",
        description: "A psychological 5-email launch series driving anticipation, social proof, and cart-closing urgency.",
        category: "Copywriting",
        tags: ["Email Marketing", "Product Launch", "Nurture Sequence", "Storytelling"],
        recommendedModel: "claude",
        role: "Direct-Response Email Marketing Master.",
        task: "Craft a 5-email launch campaign for {{Product_Name}} promising {{Core_Transformation}} ending on {{Launch_Deadline}} with bonus {{Bonus_Incentive}}.",
        context: "Email 1: The Teaser / Paradigm Shift. Email 2: The Origin Story & Flawed Alternatives. Email 3: The Big Reveal & Product Demo. Email 4: FAQ, Overcoming Doubts & Case Study. Email 5: Urgent Final Call (Cart Closing). Use conversational tone with open loops.",
        outputFormat: "1. 5 Full Emails with Subject Lines and Preview Texts\n2. Hook, Story, and Offer Breakdown for Each Email\n3. Strategic Sending Cadence Recommendations",
        variables: ["{{Product_Name}}", "{{Core_Transformation}}", "{{Launch_Deadline}}", "{{Bonus_Incentive}}"],
    },
    {
        id: "copy-founder-linkedin-post",
        title: "Founder Thought Leadership LinkedIn Post",
        description: "Write authentic, high-engagement personal brand stories that stop the scroll without humblebragging.",
        category: "Copywriting",
        tags: ["LinkedIn", "Personal Brand", "Thought Leadership", "Founder"],
        recommendedModel: "chatgpt",
        role: "Executive Ghostwriter & B2B Content Strategist.",
        task: "Write an authentic, highly engaging viral LinkedIn post for a founder in {{Target_Industry}} about '{{Counterintuitive_Lesson}}' derived from {{Failed_Attempt}}, revealing {{Actionable_Framework}}.",
        context: "Hook must stop the scroll in first 2 lines (before '...see more'). Use short paragraphs, high rhythm variation, vulnerable story, zero superficial humblebragging, and an interactive closing question that drives meaningful comments.",
        outputFormat: "1. 3 Alternative Scroll-Stopping Hooks\n2. Full Post Body with Formatting & Whitespace\n3. First Comment Strategy & Follow-up Prompt",
        variables: ["{{Counterintuitive_Lesson}}", "{{Failed_Attempt}}", "{{Actionable_Framework}}", "{{Target_Industry}}"],
    },
    {
        id: "copy-paid-ad-framework-matrix",
        title: "Multi-Angle Paid Ad Copy Matrix (PAS, AIDA, BAB)",
        description: "Develop paid ad creatives tested across Problem-Agitate-Solution, AIDA, and Before-After-Bridge formats.",
        category: "Copywriting",
        tags: ["Paid Ads", "Meta Ads", "Google Ads", "Direct Response"],
        recommendedModel: "claude",
        role: "Performance Marketing Creative Strategist.",
        task: "Write 3 high-ROI paid ad copy variations for {{Offer_Name}} targeting {{Audience_Pain}} to achieve {{Desired_Outcome}} backed by {{Social_Proof_Metric}}.",
        context: "Angle 1: PAS (Problem-Agitate-Solution). Angle 2: AIDA (Attention-Interest-Desire-Action). Angle 3: BAB (Before-After-Bridge). Provide ad headlines (under 40 chars), primary text (short, medium, long), and visual direction suggestions.",
        outputFormat: "1. Variation 1 (PAS) with Visual Concept & Primary Text\n2. Variation 2 (AIDA) with Visual Concept & Primary Text\n3. Variation 3 (BAB) with Visual Concept & Primary Text",
        variables: ["{{Offer_Name}}", "{{Audience_Pain}}", "{{Desired_Outcome}}", "{{Social_Proof_Metric}}"],
    },
];

// ─── Query Helpers ───────────────────────────────────────────────────

export function getAllTemplates(): PromptTemplate[] {
    return PROMPT_TEMPLATES;
}

export function getTemplatesByCategory(category: TemplateCategory): PromptTemplate[] {
    return PROMPT_TEMPLATES.filter((t) => t.category === category);
}

export function searchTemplates(
    query: string,
    category?: TemplateCategory | "All",
    selectedTag?: string | null
): PromptTemplate[] {
    const q = query.trim().toLowerCase();

    return PROMPT_TEMPLATES.filter((tpl) => {
        // Category filter
        if (category && category !== "All" && tpl.category !== category) {
            return false;
        }

        // Tag filter
        if (selectedTag && !tpl.tags.includes(selectedTag)) {
            return false;
        }

        // Text query match
        if (!q) return true;

        const inTitle = tpl.title.toLowerCase().includes(q);
        const inDesc = tpl.description.toLowerCase().includes(q);
        const inRole = tpl.role.toLowerCase().includes(q);
        const inTags = tpl.tags.some((tag) => tag.toLowerCase().includes(q));
        const inVars = tpl.variables.some((v) => v.toLowerCase().includes(q));

        return inTitle || inDesc || inRole || inTags || inVars;
    });
}

export function getAllTags(): string[] {
    const tagSet = new Set<string>();
    PROMPT_TEMPLATES.forEach((tpl) => {
        tpl.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
}
