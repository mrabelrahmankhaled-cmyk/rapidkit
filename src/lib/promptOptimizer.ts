import { diffWords } from "diff";
import type { Change } from "diff";

export type OptimizationCategory =
    | "role"
    | "task"
    | "context"
    | "format"
    | "specificity"
    | "constraint";

export type SuggestionType = "recommended" | "optional";

export interface ImprovementSuggestion {
    id: string;
    category: OptimizationCategory;
    title: string;
    explanation: string;
    proposedAddition: string;
    type: SuggestionType;
    appliedByDefault: boolean;
    targetField: "role" | "task" | "context" | "format" | "constraint";
}

export interface RtcfScore {
    overall: number; // 0 to 100
    role: number; // 0 or 25
    task: number; // 0 or 25
    context: number; // 0 or 25
    format: number; // 0 or 25
    missingElements: string[];
}

export type InferredDomain = "code" | "marketing" | "seo" | "sales" | "writing" | "general";

export interface DetectedComponents {
    hasRole: boolean;
    detectedRoleText?: string;
    hasTask: boolean;
    taskClarityIssues: string[];
    hasContext: boolean;
    detectedContextText?: string;
    hasFormat: boolean;
    detectedFormatText?: string;
    hasSpecificity: boolean;
    hasConstraints: boolean;
    inferredDomain: InferredDomain;
}

export interface DiffPart {
    type: "unchanged" | "added" | "removed";
    value: string;
    explanation?: string;
}

export interface DecomposedPrompt {
    role: string;
    task: string;
    context: string;
    outputFormat: string;
    language?: string;
    guidelines?: string;
}

export interface OptimizationResult {
    rawPrompt: string;
    normalizedPrompt: string;
    score: RtcfScore;
    detected: DetectedComponents;
    suggestions: ImprovementSuggestion[];
    buildOptimizedPrompt: (acceptedSuggestionIds: Set<string> | string[]) => string;
    decomposePrompt: (acceptedSuggestionIds: Set<string> | string[]) => DecomposedPrompt;
    getDiff: (acceptedSuggestionIds: Set<string> | string[]) => DiffPart[];
}

/**
 * Domain inference helper based on keyword analysis.
 * Deterministic and rule-based.
 */
export function inferDomain(text: string): InferredDomain {
    const lower = text.toLowerCase();

    // Code & Dev
    if (
        /\b(code|function|debug|refactor|typescript|javascript|react|next\.?js|python|html|css|api|sql|database|component|frontend|backend|algorithm|git|bug|regex|auth|authentication|oauth|jwt|endpoint)\b/i.test(
            lower
        ) ||
        /(كود|برمجة|بايثون|جافاسكريبت|رياكت|دالة|خطأ برمجي|توثيق|مصادقة)/.test(text)
    ) {
        return "code";
    }

    // SEO
    if (
        /\b(seo|keyword|serp|ranking|backlink|meta tag|organic search|search intent|google search)\b/i.test(
            lower
        ) ||
        /(سيو|كلمات مفتاحية|تصدر نتائج البحث|روابط خلفية)/.test(text)
    ) {
        return "seo";
    }

    // Sales & Outreach
    if (
        /\b(cold email|outreach|sales pitch|prospect|lead gen|b2b sales|discovery call|objection handling)\b/i.test(
            lower
        ) ||
        /(مبيعات|بريد بارد|عملاء محتملين|عرض بيعي)/.test(text)
    ) {
        return "sales";
    }

    // Marketing
    if (
        /\b(landing page|conversion rate|ad copy|cta|campaign|social media|newsletter|funnel|marketing)\b/i.test(
            lower
        ) ||
        /(تسويق|صفحة هبوط|إعلان|حملة تسويقية|معدل التحويل)/.test(text)
    ) {
        return "marketing";
    }

    // Writing & Copywriting
    if (
        /\b(article|blog post|essay|proofread|story|narrative|tone of voice|copywriter|summarize)\b/i.test(
            lower
        ) ||
        /(مقال|قصة|كتابة محتوى|تدقيق لغوي|صياغة|تلخيص)/.test(text)
    ) {
        return "writing";
    }

    return "general";
}

export const KNOWN_TECH_ITEMS = [
    { key: "react", label: "React" },
    { key: "next.js", label: "Next.js" },
    { key: "nextjs", label: "Next.js" },
    { key: "vue", label: "Vue" },
    { key: "angular", label: "Angular" },
    { key: "svelte", label: "Svelte" },
    { key: "node", label: "Node.js" },
    { key: "nodejs", label: "Node.js" },
    { key: "python", label: "Python" },
    { key: "django", label: "Django" },
    { key: "fastapi", label: "FastAPI" },
    { key: "flask", label: "Flask" },
    { key: "typescript", label: "TypeScript" },
    { key: "javascript", label: "JavaScript" },
    { key: "postgresql", label: "PostgreSQL" },
    { key: "postgres", label: "PostgreSQL" },
    { key: "mysql", label: "MySQL" },
    { key: "mongodb", label: "MongoDB" },
    { key: "sqlite", label: "SQLite" },
    { key: "docker", label: "Docker" },
    { key: "kubernetes", label: "Kubernetes" },
    { key: "aws", label: "AWS" },
    { key: "tailwind", label: "Tailwind CSS" },
];

/**
 * Detect technologies already explicitly named in the prompt.
 * Avoids redundant requests for {{Technical_Stack}} when user already stated tech.
 */
export function detectAlreadyMentionedTech(text: string): string[] {
    const lower = text.toLowerCase();
    const found: string[] = [];

    for (const item of KNOWN_TECH_ITEMS) {
        const escaped = item.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`\\b${escaped}\\b`, "i");
        if (regex.test(lower)) {
            if (!found.includes(item.label)) {
                found.push(item.label);
            }
        }
    }

    // Contextual Go detection (avoids false positives on English verb "go")
    if (
        /\b(?:golang|goroutines?|go\s+(?:api|server|service|backend|microservice|runtime|module|package|sdk|cli|handler|struct|interface|channel|concurrency|code|app|application|program|version|\d+\.\d+))\b/i.test(
            text
        ) ||
        /\bin\s+Go\b/.test(text)
    ) {
        if (!found.includes("Go")) {
            found.push("Go");
        }
    }

    return found;
}

/**
 * Analyze Role / Persona in the prompt.
 * Rule A: Detect meaningful role regex. If missing, suggest generic role based on domain or placeholder.
 * Never invent credentials or personal facts.
 */
export function detectRole(text: string): { hasRole: boolean; detectedRoleText?: string } {
    // Strip unresolved {{...}} placeholders so bare role placeholders do not earn Role points
    const cleaned = text.replace(/\{\{[^}]+\}\}/g, " ");

    const roleRegexes = [
        /(?:^|\n|[.!?]\s+)(?:#+\s*)?(?:role(?:\s*&|\s+and)?\s*persona|role|persona|الدور(?:\s*والشخصية)?|الشخصية)(?::|\s*\n)\s*(?:act\s+as(?:\s+an?)?\s+|تصرف\s+ك(?:ـ)?\s*)?([a-zA-Z\u0600-\u06FF][^\n.!?]{2,})/i,
        /(?:^|\n|[.!?]\s+)(?:act\s+as(?:\s+an?)?|you\s+are(?:\s+an?)?|assume\s+the\s+role\s+of|take\s+on\s+the\s+role\s+of|role:\s*|persona:\s*|الدور:\s*|الشخصية:\s*)\s*([a-zA-Z\u0600-\u06FF][^\n.!?]{2,})/i,
        /(?:^|\n|[.!?]\s+)(?:as\s+an?\s+(?:senior|lead|principal|staff|expert|specialist|architect|engineer|developer|copywriter|marketer|designer)[^\n.!?]*)/i,
        /(?:تصرف\s+ك(?:ـ)?|أنت\s+خبير|بصفتك|العب\s+دور|قم\s+بدور|دورك:\s*)\s*([\u0600-\u06FFa-zA-Z][^\n.!?]{2,})/i,
    ];

    for (const reg of roleRegexes) {
        const match = cleaned.match(reg);
        if (match) {
            const roleBody = (match[1] || match[0]).trim();
            if (/[a-zA-Z\u0600-\u06FF]{3,}/.test(roleBody)) {
                return {
                    hasRole: true,
                    detectedRoleText: match[0].trim(),
                };
            }
        }
    }

    return { hasRole: false };
}

/**
 * Analyze Task clarity in the prompt.
 * Rule B: Detect whether requested action is clear.
 * Check for missing objective, vague verbs, and conflicting instructions.
 * Never replace user's original objective.
 */
export function detectTask(text: string): {
    hasTask: boolean;
    issues: string[];
} {
    const trimmed = text.trim();
    const issues: string[] = [];

    if (!trimmed) {
        return { hasTask: false, issues: ["Missing task: No objective provided."] };
    }

    // Check for extremely vague or non-instructional input
    const isVeryShort = trimmed.length < 15 && !trimmed.includes(" ");
    const isVagueAction = /^(?:do something|help me|stuff|fix this|make it good|make it better|write something)$/i.test(
        trimmed
    );

    if (isVeryShort) {
        issues.push("Vague task: Input appears to be just a keyword rather than a clear action directive.");
    } else if (isVagueAction) {
        issues.push("Vague verb: The requested action lacks a measurable deliverable or clear scope.");
    }

    // Check for conflicting or multiple disconnected goals (e.g. 3+ "and also then also")
    const multiGoals = (trimmed.match(/\b(and also|then also|and then write|plus also)\b/gi) || []).length;
    if (multiGoals >= 2) {
        issues.push("Multiple objectives: Prompt chains multiple disconnected goals which may dilute focus.");
    }

    return {
        hasTask: trimmed.length >= 8 && !isVagueAction,
        issues,
    };
}

export const GENERIC_OPTIMIZER_PHRASES = [
    /follow\s+production-grade\s+standards,\s*strict\s+typing,\s*and\s+maintainable\s+modular\s+architecture\.?/gi,
    /avoid\s+pleasantries,\s*conversational\s+filler,\s*or\s+self-evident\s+introductions\.?\s*deliver\s+direct,\s*high-density\s+actionable\s+content\.?/gi,
    /do\s+not\s+invent\s+facts\s+or\s+unverified\s+assertions\.?\s*if\s+required\s+information\s+is\s+missing,\s*explicitly\s+ask\s+or\s+state\s+the\s+assumed\s+baseline\.?/gi,
    /do\s+not\s+include\s+speculative\s+claims\s+or\s+unverified\s+assumptions;?\s*if\s+information\s+is\s+missing,\s*state\s+it\s+explicitly\.?/gi,
    /avoid\s+conversational\s+filler\s+and\s+pleasantries;?\s*jump\s+straight\s+into\s+the\s+solution\s+with\s+high\s+information\s+density\.?/gi,
    /specifically,\s*provide\s+a\s+step-by-step\s+resolution\s+that\s+directly\s+fulfills?\s+this\s+objective\.?/gi,
    /اتبع\s+أفضل\s+ممارسات\s+كتابة\s+الكود\s+المنظم\s+ومعالجة\s+الأخطاء\s+بوضوح،?\s*ولا\s+تفترض\s+وجود\s+مكتبات\s+أو\s+واجهات\s+غير\s+موثقة\.?/gi,
    /ركز\s+على\s+توافق\s+المحتوى\s+مع\s+نية\s+الباحث\s+والتسلسل\s+المنطقي\s+للعناوين\s+وتجنب\s+حشو\s+الكلمات\s+المفتاحية\.?/gi,
    /حافظ\s+على\s+الإيجاز\s+والوضوح،?\s*وتجنب\s+المقدمات\s+الإنشائية\s+الطويلة،?\s*وركز\s+مباشرة\s+على\s+حل\s+مشكلة\s+العميل\s+المحتمل\.?/gi,
    /ركز\s+على\s+الفوائد\s+الملموسة\s+للعميل\s+بدلاً\s+من\s+العبارات\s+العامة،?\s*ولا\s+تختلق\s+إحصائيات\s+أو\s+شهادات\s+غير\s+حقيقية\.?/gi,
    /تجنب\s+الحشو\s+والتكرار\s+والمقدمات\s+البديهية،?\s*وحافظ\s+على\s+سلاسة\s+الأسلوب\s+ودقة\s+المعلومات\.?/gi,
    /لا\s+تختلق\s+معلومات\s+أو\s+افتراضات\s+غير\s+مؤكدة\.?\s*إذا\s+كانت\s+هناك\s+تفاصيل\s+ناقصة،?\s*وضح\s+الافتراضات\s+بشكل\s+صريح\.?/gi,
];

/**
 * Analyze Context & Constraints in the prompt.
 * Rule C: Check for target audience, tech stack, business context.
 * Evaluates substantive user-provided context. Generic optimizer phrases and
 * unresolved placeholders do NOT count as substantive context and do NOT
 * artificially increase the score.
 */
export function detectContext(text: string): {
    hasContext: boolean;
    detectedContextText?: string;
} {
    const cleanCandidate = (raw: string): string => {
        let c = raw;
        for (const phrase of GENERIC_OPTIMIZER_PHRASES) {
            c = c.replace(phrase, " ");
        }
        c = c.replace(/\{\{[^}]+\}\}/g, " ");
        c = c.replace(/(?:^|\n)[ \t]*[-*•][ \t]*[^\n]*\((?:already\s+specified|محددة?\s+مسبقاً)\)[ \t]*$/gim, " ");
        c = c.replace(
            /(?:^|\n)[ \t]*[-*•][ \t]*(?:framework|technical\s+stack|runtime\s+environment|key\s+features[^\n:]*|target\s+audience|product\s*\/\s*offer|business\s+goal|primary\s+keyword|key\s+constraints|error\s+message[^\n:]*|unexpected\s+behavior[^\n:]*|relevant\s+component[^\n:]*|التقنيات\s+المستخدمة|التقنيات\s+المحددة|الجمهور\s+المستهدف|الفئة\s+المستهدفة|المنتج\s+أو\s+القيمة\s+المقترحة|الكلمة\s+المفتاحية\s+المستهدفة|السياق\s+الأساسي|رسالة\s+الخطأ[^\n:]*|القيود\s+والمتطلبات[^\n:]*)?(?::[ \t]*)?(?:\([^)]*\))?[ \t]*$/gim,
            " "
        );
        c = c.replace(
            /(?:^|\n)[ \t]*(?:context(?:\s*&|\s+and)?\s*(?:requirements?|bug\s*details|tech\s*stack|audience|constraints?)?|السياق(?:\s*والقيود)?|القيود(?:\s*والمتطلبات)?|الخلفية)[ \t]*:?[ \t]*$/gim,
            " "
        );
        return c.trim();
    };

    const substantiveContextPatterns = [
        // Target audience / context with real entity
        /\b(?:target\s+audience|audience|context|background)[ \t]*:[ \t]*[a-zA-Z0-9][a-zA-Z0-9 \t,.-]{3,}/i,
        /\bfor\s+(?:[a-zA-Z]+\s+)?(?:beginners|seniors?|juniors?|developers?|engineers?|executives?|enterprises?|b2b|b2c|students?|admins?|administrators?|clients?|customers?|teams?|users?)\b/i,
        /(?:الجمهور\s+المستهدف|الفئة\s+المستهدفة|المستهدفين|المنتج\s+أو\s+القيمة\s+المقترحة|الكلمة\s+المفتاحية\s+المستهدفة|السياق\s+الأساسي)[ \t]*[:\-][ \t]*[\u0600-\u06FFa-zA-Z0-9][\u0600-\u06FFa-zA-Z0-9 \t،,.-]{2,}/i,
        /(?:للمبتدئين|للشركات|للمطورين|لرواد\s+الأعمال|للعملاء|لأصحاب\s+[\u0600-\u06FF\s]{3,})/i,
        // Tech stack with concrete details, versions, or environments
        /\b(?:tech(?:nical)?\s+stack|framework|database|runtime(?:\s+environment)?|environment|key\s+features(?:\s*&|\s+and)?\s*scope|key\s+constraints|product(?:\s*\/\s*offer)?|business\s+goal|primary\s+keyword|using|with)[ \t]*:[ \t]*[a-zA-Z0-9][a-zA-Z0-9 \t,.-]{2,}/i,
        /\b(?:react\s+\d+|next\.?js\s+\d+|node\s+\d+|python\s+\d+|postgres(?:ql)?\s+\d+|aws\s+[a-z0-9.]+|db\.[a-z0-9.]+|\d+\s*gb\s*ram|\d+\s*qps|\d+\s*queries\s+per\s+second)\b/i,
        // Workloads, SLAs, or limits
        /\b(?:workload|zero\s+downtime|under\s+\d+\s*(?:ms|seconds|minutes)|budget\s+(?:under|of)?\s*\$?\d+|traffic\s+of\s+\d+)\b/i,
        // Error messages, stack traces, or code blocks
        /\b(?:error(?:\s*message)?|exception|trace|stack\s*trace|typeerror|referenceerror|unexpected\s+behavior)[ \t]*:[ \t]*[a-zA-Z0-9_][a-zA-Z0-9 \t_.-]{2,}/i,
        /```[\s\S]{10,}```/,
        // Context statements
        /\bin\s+the\s+context\s+of\s+[a-zA-Z0-9][a-zA-Z0-9\s]{3,}/i,
        /\bbackground[ \t]*:[ \t]*[a-zA-Z0-9][a-zA-Z0-9 \t,.-]{3,}/i,
        /(?:الخلفية|بيئة\s+العمل|التقنيات\s+المستخدمة|التقنيات\s+المحددة|القيود(?:\s+والمتطلبات)?|رسالة\s+الخطأ)[ \t]*[:\-][ \t]*[\u0600-\u06FF\w][\u0600-\u06FF\w \t،,.-]{3,}/i,
    ];

    const architecturalPatterns = [
        /\b(?:production-grade|strict\s+typing|type-safe|type\s+safety|modular\s+architecture|clean\s+architecture|microservices?|monorepo|responsive(?:\s+design)?|mobile-friendly|offline-first|pwa|authentication|auth|jwt|oauth|session|state\s+management)\b/i,
        /(?:معايير\s+الإنتاج|بنية\s+معمارية|كود\s+نظيف|تصميم\s+متجاوب|أمان\s+الأنواع|توثيق\s+صارم)/i,
    ];

    // 1. Check if there is an explicit Context section or label in the prompt
    // Handles markdown headings (### Context & Constraints, ### السياق), labeled lines (Context: ..., السياق: ...),
    // and terminates at the next recognized section boundary or end of text.
    const contextSectionMatch = text.match(
        /(?:^|\n)(?:#+\s*)?(?:context(?:\s*&|\s+and)?\s*(?:constraints?|tech\s*stack|scope|audience|bug\s*details|requirements)?|constraints?|technical\s+stack|tech\s*stack|background|السياق(?:\s*والقيود)?|القيود(?:\s*والمتطلبات)?|الخلفية|بيئة\s+العمل)[ \t]*:?[ \t]*\n?([\s\S]*?)(?=(?:\n#+|\n(?:Output\s+Format|Desired\s+Output\s+Format|Format|Task|Objective|Role|Persona|Guidelines|Negative\s+Constraints|Response\s+Language|التنسيق|المخرجات|صيغة\s+المخرجات|المهمة|الهدف|الدور|الشخصية|الإرشادات|لغة\s+الرد)[ \t]*:|$))/i
    );

    if (contextSectionMatch) {
        const cleanedSection = cleanCandidate(contextSectionMatch[1]);
        if (cleanedSection.length >= 3) {
            const tech = detectAlreadyMentionedTech(cleanedSection);
            if (tech.length > 0) {
                return {
                    hasContext: true,
                    detectedContextText: `Technical stack: ${tech.join(", ")}`,
                };
            }
            for (const pat of architecturalPatterns) {
                if (pat.test(cleanedSection)) {
                    return { hasContext: true, detectedContextText: "Architecture / constraints specified" };
                }
            }
            for (const pattern of substantiveContextPatterns) {
                if (pattern.test(cleanedSection)) {
                    return { hasContext: true, detectedContextText: "Substantive context in Context section" };
                }
            }
            if (cleanedSection.length >= 15) {
                return { hasContext: true, detectedContextText: "User-provided context section" };
            }
        }
        return { hasContext: false };
    }

    // 2. Non-sectioned text
    let fullCleaned = cleanCandidate(text);
    const roleAnalysis = detectRole(text);
    if (roleAnalysis.hasRole && roleAnalysis.detectedRoleText) {
        fullCleaned = fullCleaned.replace(roleAnalysis.detectedRoleText, " ");
    }

    for (const pattern of substantiveContextPatterns) {
        if (pattern.test(fullCleaned)) {
            return { hasContext: true, detectedContextText: "Substantive context found" };
        }
    }

    return { hasContext: false };
}

/**
 * Analyze Output Format in the prompt.
 * Rule D: Detect explicit output instructions (Markdown, table, JSON, bullet list, code, step-by-step).
 */
export function detectFormat(text: string): {
    hasFormat: boolean;
    detectedFormatText?: string;
} {
    const formatPatterns = [
        /(?:^|\n)(?:#+\s*)?(?:desired\s+output\s+format|output\s+format|output|format)(?::|\s*\n)/i,
        /\b(format|output format|in markdown|as json|table|bullet points?|numbered list|step-by-step|code block|diff|csv|yaml|json schema|deliverable:)\b/i,
        /(جدول|نقاط|ماركداون|كود|خطوة بخطوة|صيغة المخرجات|تنسيق|قائمة مرقمة)/i,
    ];

    for (const pattern of formatPatterns) {
        if (pattern.test(text)) {
            return { hasFormat: true, detectedFormatText: "Format found" };
        }
    }

    return { hasFormat: false };
}

/**
 * Check if the prompt already has specificity guidance (length, depth, scope).
 */
export function detectSpecificity(text: string): boolean {
    return /\b(concise|under \d+ words|within \d+ lines|detailed|in-depth|step-by-step|comprehensive|executive summary|high-level|short|exhaustive)\b/i.test(
        text
    );
}

/**
 * Check if the prompt already has negative constraints / guardrails.
 */
export function detectConstraints(text: string): boolean {
    return /\b(do not|don't|avoid|never|without|exclude|strictly|no conversational|no pleasantries)\b/i.test(
        text
    );
}

/**
 * Pure optimization engine.
 * Generates an OptimizationResult including RTCF scoring, rule-based suggestions,
 * diff computation, and prompt reconstruction.
 */
export function optimizePrompt(rawText: string): OptimizationResult {
    const normalizedPrompt = rawText.trim();
    const missingElements: string[] = [];

    // Empty prompt handling
    if (!normalizedPrompt) {
        const emptyScore: RtcfScore = {
            overall: 0,
            role: 0,
            task: 0,
            context: 0,
            format: 0,
            missingElements: ["Role", "Task", "Context", "Format"],
        };

        const emptyDetected: DetectedComponents = {
            hasRole: false,
            hasTask: false,
            taskClarityIssues: ["Empty prompt provided."],
            hasContext: false,
            hasFormat: false,
            hasSpecificity: false,
            hasConstraints: false,
            inferredDomain: "general",
        };

        return {
            rawPrompt: rawText,
            normalizedPrompt: "",
            score: emptyScore,
            detected: emptyDetected,
            suggestions: [],
            buildOptimizedPrompt: () => "",
            decomposePrompt: () => ({ role: "", task: "", context: "", outputFormat: "" }),
            getDiff: () => [],
        };
    }

    // Run component detectors
    const domain = inferDomain(normalizedPrompt);
    const roleAnalysis = detectRole(normalizedPrompt);
    const taskAnalysis = detectTask(normalizedPrompt);
    const contextAnalysis = detectContext(normalizedPrompt);
    const formatAnalysis = detectFormat(normalizedPrompt);
    const hasSpecificity = detectSpecificity(normalizedPrompt);
    const hasConstraints = detectConstraints(normalizedPrompt);

    // Calculate RTCF Completeness Score (each component = 25 pts)
    let roleScore = 0;
    if (roleAnalysis.hasRole) {
        roleScore = 25;
    } else {
        missingElements.push("Role: Define who the AI acts as");
    }

    let taskScore = 0;
    if (taskAnalysis.hasTask && taskAnalysis.issues.length === 0) {
        taskScore = 25;
    } else if (taskAnalysis.hasTask) {
        taskScore = 15; // minor clarity issues
        missingElements.push("Task: Clarify objective & deliverables");
    } else {
        missingElements.push("Task: State clear objective");
    }

    let contextScore = 0;
    if (contextAnalysis.hasContext) {
        contextScore = 25;
    } else {
        missingElements.push("Context: Provide target audience or tech stack");
    }

    let formatScore = 0;
    if (formatAnalysis.hasFormat) {
        formatScore = 25;
    } else {
        missingElements.push("Format: Specify desired output structure");
    }

    const overallScore = roleScore + taskScore + contextScore + formatScore;

    const score: RtcfScore = {
        overall: overallScore,
        role: roleScore,
        task: taskScore,
        context: contextScore,
        format: formatScore,
        missingElements,
    };

    const detected: DetectedComponents = {
        hasRole: roleAnalysis.hasRole,
        detectedRoleText: roleAnalysis.detectedRoleText,
        hasTask: taskAnalysis.hasTask,
        taskClarityIssues: taskAnalysis.issues,
        hasContext: contextAnalysis.hasContext,
        detectedContextText: contextAnalysis.detectedContextText,
        hasFormat: formatAnalysis.hasFormat,
        detectedFormatText: formatAnalysis.detectedFormatText,
        hasSpecificity,
        hasConstraints,
        inferredDomain: domain,
    };

    // ─── Build Improvement Suggestions ─────────────────────────────
    const suggestions: ImprovementSuggestion[] = [];

    // 1. Role Suggestion (Rule A)
    if (!roleAnalysis.hasRole) {
        let proposedRole = "Act as an expert in {{Expert_Role}}.";
        if (domain === "code") {
            proposedRole = "Act as a Senior Software Engineer and Code Reviewer.";
        } else if (domain === "seo") {
            proposedRole = "Act as a Technical SEO and Content Strategist.";
        } else if (domain === "sales") {
            proposedRole = "Act as an Enterprise B2B Sales and Outbound Specialist.";
        } else if (domain === "marketing") {
            proposedRole = "Act as a Performance Marketing and Conversion Strategist.";
        } else if (domain === "writing") {
            proposedRole = "Act as a Professional Technical Editor and Copywriter.";
        }

        suggestions.push({
            id: "role-definition",
            category: "role",
            title: "Define Expert Persona",
            explanation:
                "Establishing an expert persona anchors the model's tone, vocabulary depth, and domain instincts without hallucinating credentials.",
            proposedAddition: proposedRole,
            type: "recommended",
            appliedByDefault: true,
            targetField: "role",
        });
    }

    // 2. Task Clarity (Rule B)
    if (taskAnalysis.issues.length > 0) {
        suggestions.push({
            id: "task-clarification",
            category: "task",
            title: "Clarify Scope & Concrete Deliverable",
            explanation:
                "Vague instructions lead to superficial answers. Setting explicit expectations keeps the model on target.",
            proposedAddition: "Specifically, provide a step-by-step resolution that directly fulfills this objective.",
            type: "recommended",
            appliedByDefault: true,
            targetField: "task",
        });
    }

    // 3. Context & Constraints (Rule C)
    if (!contextAnalysis.hasContext) {
        const existingPlaceholders = (normalizedPrompt.match(/\{\{([^}]+)\}\}/g) || []).map((p) =>
            p.replace(/[{}]/g, "").trim().toLowerCase()
        );

        const hasRuntimeOrRequirementsPlaceholder = existingPlaceholders.some(
            (p) =>
                (p.includes("runtime") || p.includes("environment") || p.includes("بيئة")) &&
                (p.includes("requirement") || p.includes("متطلب"))
        );
        const hasRuntimePlaceholder = existingPlaceholders.some(
            (p) => p.includes("runtime") || p.includes("environment") || p.includes("بيئة")
        );
        const hasFeatureRequirementsPlaceholder = existingPlaceholders.some(
            (p) => p.includes("feature") || p.includes("scope") || p.includes("نطاق") || p.includes("خاصية")
        );
        const hasTechStackPlaceholder = existingPlaceholders.some(
            (p) => p.includes("tech") || p.includes("stack") || p.includes("تقني")
        );
        const hasAudiencePlaceholder = existingPlaceholders.some(
            (p) => p.includes("audience") || p.includes("جمهور") || p.includes("مستهدف")
        );
        const hasConstraintsPlaceholder = existingPlaceholders.some(
            (p) => p.includes("constraint") || p.includes("قيد") || p.includes("شروط")
        );

        let proposedContext = "Context & Constraints:\n- Target Audience: {{Target_Audience}}\n- Key Constraints: {{Key_Constraints}}";
        let shouldAddContextSuggestion = true;

        if (domain === "code") {
            const alreadyMentioned = detectAlreadyMentionedTech(normalizedPrompt);
            const isBugFix = /\b(bug|fix|error|issue|crash|leak|exception|re-render|re-renders|problem)\b/i.test(
                normalizedPrompt
            );

            if (alreadyMentioned.length > 0) {
                const techList = alreadyMentioned.join(", ");
                if (isBugFix) {
                    const bugLines = [`- Framework: ${techList} (already specified)`];
                    if (!normalizedPrompt.includes("{{Error_Message") && !normalizedPrompt.includes("{{Unexpected_Behavior")) {
                        bugLines.push("- Unexpected Behavior / Error Message: {{Error_Message_Or_Unexpected_Behavior}}");
                    }
                    if (!normalizedPrompt.includes("{{Component_Code") && !normalizedPrompt.includes("{{Code")) {
                        bugLines.push("- Relevant Component Code: {{Component_Code}}");
                    }
                    proposedContext = `Context & Bug Details:\n${bugLines.join("\n")}`;
                } else {
                    const reqLines = [`- Framework: ${techList} (already specified)`];
                    if (!hasFeatureRequirementsPlaceholder && !hasRuntimeOrRequirementsPlaceholder) {
                        reqLines.push("- Key Features & Scope: {{Feature_Requirements}}");
                    }
                    if (!hasRuntimePlaceholder && !hasRuntimeOrRequirementsPlaceholder) {
                        reqLines.push("- Runtime Environment: {{Runtime_Environment}}");
                    }
                    if (reqLines.length === 1) {
                        shouldAddContextSuggestion = false;
                    } else {
                        proposedContext = `Context & Requirements:\n${reqLines.join("\n")}`;
                    }
                }
            } else {
                const stackLines: string[] = [];
                if (!hasTechStackPlaceholder) {
                    stackLines.push("- Technical Stack: {{Technical_Stack}}");
                }
                if (!hasRuntimePlaceholder && !hasRuntimeOrRequirementsPlaceholder) {
                    stackLines.push("- Runtime Environment: {{Runtime_Environment}}");
                }
                if (stackLines.length === 0) {
                    shouldAddContextSuggestion = false;
                } else {
                    proposedContext = `Context & Tech Stack:\n${stackLines.join("\n")}`;
                }
            }
        } else if (domain === "seo" || domain === "marketing" || domain === "sales") {
            const genLines: string[] = [];
            if (!hasAudiencePlaceholder) {
                genLines.push("- Target Audience: {{Target_Audience}}");
            }
            if (!existingPlaceholders.some((p) => p.includes("product") || p.includes("offer") || p.includes("منتج"))) {
                genLines.push("- Product / Offer: {{Product_Name}}");
            }
            if (!existingPlaceholders.some((p) => p.includes("goal") || p.includes("هدف"))) {
                genLines.push("- Business Goal: {{Business_Goal}}");
            }
            if (genLines.length === 0) {
                shouldAddContextSuggestion = false;
            } else {
                proposedContext = `Context & Audience:\n${genLines.join("\n")}`;
            }
        } else {
            const genLines: string[] = [];
            if (!hasAudiencePlaceholder) {
                genLines.push("- Target Audience: {{Target_Audience}}");
            }
            if (!hasConstraintsPlaceholder) {
                genLines.push("- Key Constraints: {{Key_Constraints}}");
            }
            if (genLines.length === 0) {
                shouldAddContextSuggestion = false;
            } else {
                proposedContext = `Context & Constraints:\n${genLines.join("\n")}`;
            }
        }

        if (shouldAddContextSuggestion) {
            suggestions.push({
                id: "context-addition",
                category: "context",
                title: "Add Operational Context & Audience",
                explanation:
                    "Without explicit context, the model makes generic assumptions. Adding clear variables narrows down the scope.",
                proposedAddition: proposedContext,
                type: "recommended",
                appliedByDefault: true,
                targetField: "context",
            });
        }
    }

    // 4. Output Format (Rule D)
    if (!formatAnalysis.hasFormat) {
        let proposedFormat =
            "Desired Output Format:\n- Clear Markdown headings\n- Bulleted key points\n- Summary of actionable next steps";
        if (domain === "code") {
            proposedFormat =
                "Desired Output Format:\n1. Root-cause technical explanation\n2. Complete, idiomatic code solution with inline comments\n3. Verification test snippet and edge-case caveats";
        } else if (domain === "seo") {
            proposedFormat =
                "Desired Output Format:\n- Structured Markdown with H2/H3 headers\n- Keyword integration checklist\n- Recommended word counts per section";
        } else if (domain === "sales") {
            proposedFormat =
                "Desired Output Format:\n- 3-part sequential email sequence (Subject Line, Preview Text, Body Copy under 90 words, single low-friction CTA)";
        }

        suggestions.push({
            id: "format-specification",
            category: "format",
            title: "Specify Structured Output Format",
            explanation:
                "Explicit format instructions save you time by preventing unstructured conversational prose and repetitive back-and-forth.",
            proposedAddition: proposedFormat,
            type: "recommended",
            appliedByDefault: true,
            targetField: "format",
        });
    }

    // 5. Specificity & Tone (Rule E)
    if (!hasSpecificity) {
        suggestions.push({
            id: "spec-conciseness",
            category: "specificity",
            title: "Enforce High Information Density",
            explanation:
                "Instructs the AI to omit conversational filler ('Sure, here is your solution') and deliver pure actionable value.",
            proposedAddition:
                "Avoid pleasantries, conversational filler, or self-evident introductions. Deliver direct, high-density actionable content.",
            type: "optional",
            appliedByDefault: false,
            targetField: "constraint",
        });
    }

    // 6. Defensive Constraints & Hallucination Guard (Rule F)
    if (!hasConstraints) {
        suggestions.push({
            id: "constraint-guard",
            category: "constraint",
            title: "Add Defensive Guardrails",
            explanation:
                "Prevents hallucinated facts or unverified assumptions by demanding explicit statements when parameters are missing.",
            proposedAddition:
                "Do not invent facts or unverified assertions. If required information is missing, explicitly ask or state the assumed baseline.",
            type: "optional",
            appliedByDefault: false,
            targetField: "constraint",
        });
    }

    // ─── Builder / Constructor Functions ───────────────────────────
    const buildOptimizedPrompt = (acceptedSuggestionIds: Set<string> | string[]): string => {
        const acceptedSet = acceptedSuggestionIds instanceof Set ? acceptedSuggestionIds : new Set(acceptedSuggestionIds);

        const acceptedSuggestions = suggestions.filter((s) => acceptedSet.has(s.id));

        // If no suggestions were accepted, return original prompt verbatim
        if (acceptedSuggestions.length === 0) {
            return normalizedPrompt;
        }

        const roleSug = acceptedSuggestions.find((s) => s.targetField === "role");
        const taskSug = acceptedSuggestions.find((s) => s.targetField === "task");
        const contextSug = acceptedSuggestions.find((s) => s.targetField === "context");
        const formatSug = acceptedSuggestions.find((s) => s.targetField === "format");
        const constraintSugs = acceptedSuggestions.filter((s) => s.targetField === "constraint");

        // If the prompt already has top-level markdown headings or structured colon-labeled sections
        const hasExistingHeadings =
            /^###\s+/m.test(normalizedPrompt) ||
            (/(?:^|\n)(?:Task|Objective|Goal|المهمة|الهدف)[ \t]*:/i.test(normalizedPrompt) &&
                /(?:^|\n)(?:Context|Output|Format|Role|السياق|التنسيق|الدور)[ \t]*:/i.test(normalizedPrompt));

        if (hasExistingHeadings) {
            let resultText = normalizedPrompt;

            if (roleSug) {
                const roleRegex = /(###\s+(?:Role(?:\s*&|\s+and)?\s*Persona|Role|Persona|الدور(?:\s*والشخصية)?|الدور|الشخصية)[^\n]*\n)([\s\S]*?)(?=\n###|\n*$)/i;
                if (roleRegex.test(resultText)) {
                    resultText = resultText.replace(roleRegex, (m, header, body) => {
                        const trimmedBody = body.trim();
                        if (!trimmedBody) return `${header}${roleSug.proposedAddition}\n`;
                        if (trimmedBody.includes(roleSug.proposedAddition)) return m;
                        return `${header}${trimmedBody ? trimmedBody + "\n\n" : ""}${roleSug.proposedAddition}\n`;
                    });
                } else {
                    resultText = `### Role & Persona\n${roleSug.proposedAddition}\n\n${resultText}`;
                }
            }

            if (taskSug) {
                const taskRegex = /(###\s+(?:Task(?:\s*&|\s+and)?\s*Objective|Task|Objective|الهدف|المهمة)[^\n]*\n)([\s\S]*?)(?=\n###|\n*$)/i;
                if (taskRegex.test(resultText)) {
                    resultText = resultText.replace(taskRegex, (m, header, body) => {
                        const trimmedBody = body.trim();
                        if (trimmedBody.includes(taskSug.proposedAddition)) return m;
                        return `${header}${trimmedBody ? trimmedBody + "\n\n" : ""}${taskSug.proposedAddition}\n`;
                    });
                } else if (!resultText.includes(taskSug.proposedAddition)) {
                    resultText = `${resultText}\n\n### Task & Objective\n${taskSug.proposedAddition}`;
                }
            }

            if (contextSug) {
                const contextRegex = /(###\s+(?:Context(?:\s*&|\s+and)?\s*Constraints?|Context|Constraints?|السياق(?:\s*والقيود)?|السياق|الخلفية)[^\n]*\n)([\s\S]*?)(?=\n###|\n*$)/i;
                if (contextRegex.test(resultText)) {
                    resultText = resultText.replace(contextRegex, (m, header, body) => {
                        const trimmedBody = body.trim();
                        if (trimmedBody.includes(contextSug.proposedAddition)) return m;
                        return `${header}${trimmedBody ? trimmedBody + "\n\n" : ""}${contextSug.proposedAddition}\n`;
                    });
                } else {
                    resultText = `${resultText}\n\n### Context & Constraints\n${contextSug.proposedAddition}`;
                }
            }

            if (formatSug) {
                const formatRegex = /(###\s+(?:Desired\s+Output\s+Format|Output\s+Format|Format|التنسيق|تنسيق|المخرجات|صيغة\s+المخرجات)[^\n]*\n)([\s\S]*?)(?=\n###|\n*$)/i;
                if (formatRegex.test(resultText)) {
                    resultText = resultText.replace(formatRegex, (m, header, body) => {
                        const trimmedBody = body.trim();
                        if (trimmedBody.includes(formatSug.proposedAddition)) return m;
                        return `${header}${trimmedBody ? trimmedBody + "\n\n" : ""}${formatSug.proposedAddition}\n`;
                    });
                } else {
                    resultText = `${resultText}\n\n### Desired Output Format\n${formatSug.proposedAddition}`;
                }
            }

            if (constraintSugs.length > 0) {
                const guideRegex = /(###\s+(?:Guidelines(?:\s*&|\s+and)?\s*Negative\s*Constraints|Guidelines|Negative\s*Constraints|الإرشادات[^\n]*)\n)([\s\S]*?)(?=\n###|\n*$)/i;
                const newBullets = constraintSugs
                    .map((c) => `- ${c.proposedAddition}`)
                    .filter((b) => !resultText.includes(b))
                    .join("\n");

                if (newBullets) {
                    if (guideRegex.test(resultText)) {
                        resultText = resultText.replace(guideRegex, (m, header, body) => {
                            const trimmedBody = body.trim();
                            return `${header}${trimmedBody ? trimmedBody + "\n" : ""}${newBullets}\n`;
                        });
                    } else {
                        resultText = `${resultText}\n\n### Guidelines & Negative Constraints\n${newBullets}`;
                    }
                }
            }

            return resultText;
        }

        const sections: string[] = [];

        // Role Section
        if (roleSug) {
            sections.push(`### Role & Persona\n${roleSug.proposedAddition}`);
        }

        // Task Section (preserves original text verbatim!)
        let finalTaskText = normalizedPrompt;
        if (taskSug) {
            finalTaskText = `${finalTaskText}\n\n${taskSug.proposedAddition}`;
        }
        sections.push(`### Task & Objective\n${finalTaskText}`);

        // Context Section
        if (contextSug) {
            sections.push(`### Context & Constraints\n${contextSug.proposedAddition}`);
        }

        // Format Section
        if (formatSug) {
            sections.push(`### Desired Output Format\n${formatSug.proposedAddition}`);
        }

        // Constraints Section (optional specificity & negative guardrails)
        if (constraintSugs.length > 0) {
            const combinedConstraints = constraintSugs.map((c) => `- ${c.proposedAddition}`).join("\n");
            sections.push(`### Guidelines & Negative Constraints\n${combinedConstraints}`);
        }

        return sections.join("\n\n");
    };

    const decomposePrompt = (acceptedSuggestionIds: Set<string> | string[]): DecomposedPrompt => {
        const optimized = buildOptimizedPrompt(acceptedSuggestionIds);

        const nextSectionLookahead =
            "(?=(?:\\n#+|\\n(?:Role|Persona|Task|Objective|Goal|Context|Constraints?|Desired\\s+Output\\s+Format|Output\\s+Format|Output|Format|Response\\s+Language|Output\\s+Language|Language|Guidelines|Negative\\s+Constraints|الدور|الشخصية|المهمة|الهدف|السياق|الخلفية|التنسيق|المخرجات|صيغة\\s+المخرجات|الإرشادات|لغة\\s+الرد|اللغة)[ \\t]*:|$))";

        // 1. Role
        const mdRoleMatch = optimized.match(
            /(?:^|\n)###\s+(?:Role(?:\s*&|\s+and)?\s*Persona|Role|Persona|الدور(?:\s*والشخصية)?|الدور|الشخصية)[^\n]*\n([\s\S]*?)(?=\n###|\n*$)/i
        );
        const explicitRoleMatch = optimized.match(
            new RegExp(
                "(?:^|\\n)(?:Role(?:\\s*&|\\s+and)?\\s*Persona|Role|Persona|الدور(?:\\s*والشخصية)?|الدور|الشخصية)[ \\t]*:[ \\t]*\\n?([\\s\\S]*?)" +
                    nextSectionLookahead,
                "i"
            )
        );
        let role = "";
        if (mdRoleMatch && mdRoleMatch[1].trim()) {
            role = mdRoleMatch[1].trim();
        } else if (explicitRoleMatch && explicitRoleMatch[1].trim()) {
            role = explicitRoleMatch[1].trim();
        } else if (roleAnalysis.detectedRoleText) {
            role = roleAnalysis.detectedRoleText;
        }
        role = role
            .replace(/^Act as\s+/i, "")
            .replace(/^(?:Role|Persona|الدور|الشخصية)\s*:\s*/i, "")
            .replace(/\.$/, "")
            .trim();

        // 2. Task
        const explicitTaskMatch = optimized.match(
            new RegExp(
                "(?:^|\\n)(?:Task(?:\\s*&|\\s+and)?\\s*Objective|Task|Objective|Goal|المهمة|الهدف)[ \\t]*:[ \\t]*\\n?([\\s\\S]*?)" +
                    nextSectionLookahead,
                "i"
            )
        );
        const mdTaskMatch = optimized.match(
            /(?:^|\n)###\s+(?:Task(?:\s*&|\s+and)?\s*Objective|Task|Objective|الهدف|المهمة)[^\n]*\n([\s\S]*?)(?=\n###|\n*$)/i
        );
        let task = "";
        if (explicitTaskMatch && explicitTaskMatch[1].trim()) {
            task = explicitTaskMatch[1].trim();
        } else if (mdTaskMatch && mdTaskMatch[1].trim()) {
            // If mdTaskMatch body is a wrapper containing nested section labels, cut before the first nested section
            const innerCut = mdTaskMatch[1].search(
                new RegExp(
                    "\\n(?:Role|Persona|Context|Constraints?|Output|Format|Response\\s+Language|الدور|السياق|المخرجات|التنسيق)[ \\t]*:",
                    "i"
                )
            );
            task = innerCut !== -1 ? mdTaskMatch[1].slice(0, innerCut).trim() : mdTaskMatch[1].trim();
        } else {
            task = normalizedPrompt;
        }

        // 3. Context
        const mdContextMatch = optimized.match(
            /(?:^|\n)###\s+(?:Context(?:\s*&|\s+and)?\s*Constraints?|Context|Constraints?|السياق(?:\s*والقيود)?|السياق|الخلفية)[^\n]*\n([\s\S]*?)(?=\n###|\n*$)/i
        );
        const explicitContextMatch = optimized.match(
            new RegExp(
                "(?:^|\\n)(?:Context(?:\\s*&|\\s+and)?\\s*Constraints?|Context|Constraints?|Technical\\s+Stack|Tech\\s*Stack|Background|السياق(?:\\s*والقيود)?|القيود(?:\\s*والمتطلبات)?|السياق|الخلفية)[ \\t]*:[ \\t]*\\n?([\\s\\S]*?)" +
                    nextSectionLookahead,
                "i"
            )
        );
        let context = "";
        if (mdContextMatch && mdContextMatch[1].trim()) {
            context = mdContextMatch[1].trim();
        } else if (explicitContextMatch && explicitContextMatch[1].trim()) {
            context = explicitContextMatch[1].trim();
        }

        // 4. Output Format
        const mdFormatMatch = optimized.match(
            /(?:^|\n)###\s+(?:Desired\s+Output\s+Format|Output\s+Format|Format|التنسيق|تنسيق|المخرجات|صيغة\s+المخرجات)[^\n]*\n([\s\S]*?)(?=\n###|\n*$)/i
        );
        const explicitFormatMatch = optimized.match(
            new RegExp(
                "(?:^|\\n)(?:Desired\\s+Output\\s+Format|Output\\s+Format|Output|Format|التنسيق|تنسيق|المخرجات|صيغة\\s+المخرجات)[ \\t]*:[ \\t]*\\n?([\\s\\S]*?)" +
                    nextSectionLookahead,
                "i"
            )
        );
        let outputFormat = "";
        if (mdFormatMatch && mdFormatMatch[1].trim()) {
            outputFormat = mdFormatMatch[1].trim();
        } else if (explicitFormatMatch && explicitFormatMatch[1].trim()) {
            outputFormat = explicitFormatMatch[1].trim();
        }

        // 5. Language
        const mdLangMatch = optimized.match(
            /(?:^|\n)###\s+(?:Response\s+Language|Output\s+Language|Language|لغة\s+الرد|اللغة)[^\n]*\n(?:Please provide the final response in\s+)?([^\n.]*)/i
        );
        const explicitLangMatch = optimized.match(
            new RegExp(
                "(?:^|\\n)(?:Response\\s+Language|Output\\s+Language|Language|لغة\\s+الرد|اللغة)[ \\t]*:[ \\t]*\\n?([\\s\\S]*?)" +
                    nextSectionLookahead,
                "i"
            )
        );
        let language = "";
        if (mdLangMatch && mdLangMatch[1].trim()) {
            language = mdLangMatch[1].trim();
        } else if (explicitLangMatch && explicitLangMatch[1].trim()) {
            language = explicitLangMatch[1].trim().replace(/\.$/, "").trim();
        }
        if (language) {
            if (/arabic|عربي/i.test(language)) language = "Arabic";
            else if (/english|إنجليز/i.test(language)) language = "English";
            else if (/spanish|إسبان/i.test(language)) language = "Spanish";
            else if (/french|فرنس/i.test(language)) language = "French";
            else if (/german|ألمان/i.test(language)) language = "German";
        }

        // 6. Guidelines (kept separate so they are not wrongly injected into Context)
        const mdGuideMatch = optimized.match(
            /(?:^|\n)###\s+(?:Guidelines(?:\s*&|\s+and)?\s*Negative\s*Constraints|Guidelines|Negative\s*Constraints|الإرشادات[^\n]*)\n([\s\S]*?)(?=\n###|\n*$)/i
        );
        const explicitGuideMatch = optimized.match(
            new RegExp(
                "(?:^|\\n)(?:Guidelines(?:\\s*&|\\s+and)?\\s*Negative\\s*Constraints|Guidelines|Negative\\s*Constraints|الإرشادات)[ \\t]*:[ \\t]*\\n?([\\s\\S]*?)" +
                    nextSectionLookahead,
                "i"
            )
        );
        let guidelines = "";
        if (mdGuideMatch && mdGuideMatch[1].trim()) {
            guidelines = mdGuideMatch[1].trim();
        } else if (explicitGuideMatch && explicitGuideMatch[1].trim()) {
            guidelines = explicitGuideMatch[1].trim();
        }

        return {
            role,
            task,
            context,
            outputFormat,
            language: language || undefined,
            guidelines: guidelines || undefined,
        };
    };

    const getDiff = (acceptedSuggestionIds: Set<string> | string[]): DiffPart[] => {
        const optimized = buildOptimizedPrompt(acceptedSuggestionIds);
        const changes: Change[] = diffWords(normalizedPrompt, optimized);

        return changes.map((c) => {
            if (c.added) {
                return { type: "added", value: c.value };
            }
            if (c.removed) {
                return { type: "removed", value: c.value };
            }
            return { type: "unchanged", value: c.value };
        });
    };

    return {
        rawPrompt: rawText,
        normalizedPrompt,
        score,
        detected,
        suggestions,
        buildOptimizedPrompt,
        decomposePrompt,
        getDiff,
    };
}
