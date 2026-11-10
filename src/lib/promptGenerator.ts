import {
    inferDomain,
    detectAlreadyMentionedTech,
    detectRole,
    detectTask,
    detectContext,
    detectFormat,
    detectSpecificity,
    detectConstraints,
    GENERIC_OPTIMIZER_PHRASES,
    type InferredDomain,
    type DecomposedPrompt,
} from "./promptOptimizer.ts";

export type GeneratorTargetModel = "chatgpt" | "claude" | "gemini" | "midjourney";

export type GeneratorDomain = InferredDomain;

export type DetectedInputLanguage = "en" | "ar" | "mixed";

export interface MissingInformationItem {
    placeholder: string;
    reason: string;
    targetField: "role" | "task" | "context" | "format";
}

export interface UserProvidedMetadata {
    rawIntent: string;
    detectedTech: string[];
    detectedAudience: string | null;
    detectedProductOrOffer: string | null;
    detectedRole: string | null;
    detectedFormat: string | null;
    hasSubstantiveContext: boolean;
    hasExplicitSpecificity: boolean;
    hasExplicitConstraints: boolean;
    wasAlreadyStructured: boolean;
}

export interface InferredGenerationMetadata {
    domain: GeneratorDomain;
    domainSource: "user_selected" | "keyword_inferred" | "fallback_general";
    inputLanguage: DetectedInputLanguage;
    structuralLanguage: "en" | "ar";
    inferredRole: string | null;
    inferredFormat: string | null;
}

export interface GenerationMetadata {
    userProvided: UserProvidedMetadata;
    inferred: InferredGenerationMetadata;
    genericBestPractices: string[];
    missingInformation: MissingInformationItem[];
    engineNote: string;
}

export interface PromptGenerationOptions {
    targetModel?: GeneratorTargetModel;
    domain?: GeneratorDomain | "auto";
    responseLanguage?: string;
    includeBestPractices?: boolean;
}

export interface ParsedStructuredPrompt extends DecomposedPrompt {
    responseLanguage?: string;
}

export interface PromptGenerationResult {
    rawInput: string;
    normalizedInput: string;
    isEmpty: boolean;
    validationMessage?: string;
    targetModel: GeneratorTargetModel;
    fields: DecomposedPrompt;
    formattedPrompt: string;
    metadata: GenerationMetadata;
    formatForModel: (model: GeneratorTargetModel, responseLanguageOverride?: string) => string;
}

const ARABIC_TECH_SYNONYMS: Array<{ pattern: RegExp; label: string }> = [
    { pattern: /(?:رياكت|ريآكت)/i, label: "React" },
    { pattern: /(?:نكست|نيكست)/i, label: "Next.js" },
    { pattern: /(?:بايثون)/i, label: "Python" },
    { pattern: /(?:جافاسكريبت|جافا سكريبت)/i, label: "JavaScript" },
    { pattern: /(?:تايب سكريبت|تايبسكريبت)/i, label: "TypeScript" },
    { pattern: /(?:نود جي إس|نود)/i, label: "Node.js" },
    { pattern: /(?:بوستجريس|بوست غريس)/i, label: "PostgreSQL" },
    { pattern: /(?:ماي سيكوال|سيكوال)/i, label: "SQL" },
    { pattern: /(?:دوكر)/i, label: "Docker" },
    { pattern: /(?:تايلويند)/i, label: "Tailwind CSS" },
];

/**
 * Detects both English and Arabic technology mentions deterministically.
 */
export function detectAllMentionedTech(text: string): string[] {
    const englishTech = detectAlreadyMentionedTech(text);
    const combined = [...englishTech];

    for (const item of ARABIC_TECH_SYNONYMS) {
        if (item.pattern.test(text) && !combined.includes(item.label)) {
            combined.push(item.label);
        }
    }

    return combined;
}

/**
 * Deterministically detects whether the input is English, Arabic, or mixed-language,
 * and selects the appropriate structural instruction language without translating user text.
 */
export function detectLanguageProfile(text: string): {
    inputLanguage: DetectedInputLanguage;
    structuralLanguage: "en" | "ar";
} {
    const trimmed = text.trim();
    if (!trimmed) {
        return { inputLanguage: "en", structuralLanguage: "en" };
    }

    const arabicChars = (trimmed.match(/[\u0600-\u06FF]/g) || []).length;
    const latinChars = (trimmed.match(/[a-zA-Z]/g) || []).length;

    const hasArabic = arabicChars > 0;
    const hasLatin = latinChars >= 2;

    let inputLanguage: DetectedInputLanguage = "en";
    if (hasArabic && hasLatin) {
        inputLanguage = "mixed";
    } else if (hasArabic) {
        inputLanguage = "ar";
    }

    const startsWithArabic = /^[^\w\u0600-\u06FF]*[\u0600-\u06FF]/.test(trimmed);
    const totalAlpha = arabicChars + latinChars;
    const arabicRatio = totalAlpha > 0 ? arabicChars / totalAlpha : 0;

    const structuralLanguage: "en" | "ar" =
        hasArabic && (startsWithArabic || arabicRatio >= 0.25) ? "ar" : "en";

    return { inputLanguage, structuralLanguage };
}

/**
 * Extracts a clean persona statement when a user combines role and task in one clause
 * (e.g., "Act as a React developer and fix this bug" -> "Act as a React developer").
 */
export function extractCleanRoleClause(detectedRoleText: string): string {
    const cleaned = detectedRoleText
        .replace(
            /\s+(?:and|then|to)\s+(?:please\s+)?(?:fix|write|build|create|debug|refactor|explain|design|draft|generate|analyze|review|optimize|implement|solve|help|make|find|diagnose)\b[\s\S]*$/i,
            ""
        )
        .replace(
            /\s+(?:و\s*)?(?:اكتب|أكتب|انشئ|أنشئ|صمم|حل|أصلح|اصلح|اشرح|راجع|طور|ابني|ساعدني|قم\s+بـ?)\b[\s\S]*$/i,
            ""
        )
        .trim();

    return cleaned || detectedRoleText.trim();
}

/**
 * Checks if the user already specified a target audience in their prompt.
 */
export function detectAudienceMention(text: string): string | null {
    const englishPatterns = [
        /\b(?:target\s+audience|audience|aimed\s+at|targeting)\s*:\s*([^\n.!?,;]+)/i,
        /\b(?:for|targeting|to|with)\s+((?:[a-zA-Z0-9_-]+\s+){0,3}(?:beginners?|seniors?|juniors?|developers?|engineers?|executives?|enterprises?|founders?|ctos?|ceos?|vps?|vice\s+presidents?|managers?|directors?|marketers?|students?|children|kids|doctors?|lawyers?|small\s+businesses|smbs?|startups?|b2b|b2c|saas\s+teams?|clients?|customers?|users?|readers?|buyers?|prospects?|decision-makers?))\b/i,
        /\b((?:b2b|b2c|enterprise|saas)\s+(?:vp|cto|ceo|founders?|decision-makers?|buyers?|clients?|customers?|prospects?|leads?|engineers?|teams?))\b/i,
    ];

    for (const pattern of englishPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }

    const arabicPatterns = [
        /(?:الجمهور\s+المستهدف|الفئة\s+المستهدفة|المستهدفين)\s*[:\-]?\s*([^\n.،!؟]+)/,
        /(?:للمبتدئين|للشركات|للمطورين|لرواد\s+الأعمال|للعملاء|للأطفال|للطلاب|لمديري\s+[^\s.،]+|لأصحاب\s+[^\s.،]+)/,
    ];

    for (const pattern of arabicPatterns) {
        const match = text.match(pattern);
        if (match) {
            return (match[1] || match[0]).trim();
        }
    }

    return null;
}

/**
 * Checks if the user already named a specific product, service, or offer in sales/marketing requests.
 */
export function detectProductOrOfferMention(text: string): string | null {
    const englishPatterns = [
        /\b(?:product|service|offer|value\s+proposition|platform|tool|software|solution)\s*:\s*([^\n.!?,;]+)/i,
        /\b(?:to\s+sell|selling|promoting|promote|for\s+our|about\s+our|launching\s+our)\s+(?!new\s+product\b|our\s+product\b|a\s+product\b|the\s+product\b)([a-zA-Z0-9\s/-]{4,60}?)(?=\s+(?:to|for|aimed|targeting|with|that|in\s+order)\b|[.!?,;]|$)/i,
    ];

    for (const pattern of englishPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }

    const arabicPatterns = [
        /(?:المنتج|الخدمة|العرض|القيمة\s+المقترحة)\s*[:\-]\s*([^\n.،!؟]+)/,
        /(?:لبيع|لتسويق|لترويج|عن\s+منتج|لمنتج|لخدمة|لتطبيق|لمنصة|لشركة|لمتجر)\s+([^\n.،!؟]{4,40})/,
    ];

    for (const pattern of arabicPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }

    return null;
}

/**
 * Checks if the user already included a concrete topic, product, or subject beyond a bare command.
 */
function hasSpecificTopicOrSubject(text: string): boolean {
    const trimmed = text.trim();
    const stripped = trimmed
        .replace(
            /^(?:please\s+)?(?:can\s+you\s+|help\s+me\s+)?(?:write|create|build|generate|make|draft|design|develop|give\s+me|prepare)\s+(?:a|an|the|some|my)?\s*(?:cold\s+email|sales\s+email|email|seo\s+article|seo\s+brief|seo\s+outline|seo\s+plan|blog\s+post|article|essay|landing\s+page|ad\s+copy|marketing\s+copy|social\s+media\s+post|newsletter|script|code|function|app|website|story|summary|outline|prompt)\.?\s*$/i,
            ""
        )
        .replace(
            /^(?:من\s+فضلك\s+|أريد\s+|ساعدني\s+في\s+)?(?:اكتب|انشئ|أنشئ|صمم|اعمل|جهز|ابني)\s+(?:لي\s+)?(?:مقال\s+سيو|خطة\s+سيو|مقال|بريد\s+بارد|رسالة\s+مبيعات|إيميل\s+مبيعات|صفحة\s+هبوط|إعلان|حملة\s+تسويقية|قصة|ملخص|كود|برنامج|دالة)\.?\s*$/i,
            ""
        )
        .trim();

    return stripped.length >= 6;
}

/**
 * Checks if the user already provided code snippets, stack traces, or explicit error details.
 * Single inline identifiers in backticks (e.g., `useEffect` or `useState`) do NOT count as code snippets.
 */
export function hasCodeOrErrorDetails(text: string): boolean {
    // 1. Fenced multiline or inline code blocks
    if (/```[\s\S]+```/.test(text)) return true;

    // 2. Explicit error types, status codes, or stack traces
    if (
        /\b(?:typeerror|referenceerror|syntaxerror|rangeerror|urierror|exception|stack\s*trace|error\s*message|status\s+\d{3}|cannot\s+read\s+propert(?:y|ies)|undefined\s+is\s+not|null\s+is\s+not|unhandled\s+rejection)\b/i.test(
            text
        )
    ) {
        return true;
    }
    if (/(?:رسالة\s+الخطأ|كود\s+الخطأ|استثناء\s+برمجي)/.test(text)) return true;

    // 3. Meaningful inline code expressions inside single backticks (excluding bare identifiers like `useEffect`)
    const inlineMatches = text.match(/`([^`\n]+)`/g);
    if (inlineMatches) {
        for (const rawMatch of inlineMatches) {
            const inner = rawMatch.slice(1, -1).trim();
            if (inner.length >= 10) {
                const hasCodeSyntax = /[()=>{}[\];+=<>|&]/.test(inner);
                const hasMultipleTokens = /\S+\s+\S+\s+\S+/.test(inner);
                if (hasCodeSyntax || hasMultipleTokens) {
                    return true;
                }
            }
        }
    }

    return false;
}

function extractLanguageValue(rawSection: string): string | undefined {
    const trimmed = rawSection.trim();
    if (!trimmed) return undefined;
    const match = trimmed.match(/Please\s+provide\s+the\s+final\s+response\s+in\s+([^\n.]+)\.?/i);
    if (match && match[1]) {
        return match[1].trim();
    }
    return trimmed;
}

const RECOGNIZED_MD_HEADERS =
    "Role\\s*&\\s*Persona|Role\\s+and\\s+Persona|Role|Persona|Task\\s*&\\s*Objective|Task\\s+and\\s+Objective|Task|Objective|Context\\s*&\\s*Constraints|Context\\s+and\\s+Constraints|Context|Constraints|Guidelines\\s*&\\s*Negative\\s*Constraints|Desired\\s+Output\\s+Format|Output\\s+Format|Format|Response\\s+Language";

/**
 * Parses an already-structured prompt (ChatGPT Markdown, Claude XML, Gemini bold headers, or Midjourney)
 * so existing structured prompts are preserved and converted cleanly without header duplication.
 */
export function parseExistingStructuredPrompt(text: string): ParsedStructuredPrompt | null {
    const trimmed = text.trim();
    if (!trimmed) return null;

    // 1. Midjourney format
    if (/^\/imagine\s+prompt:\s*/i.test(trimmed)) {
        const body = trimmed.replace(/^\/imagine\s+prompt:\s*/i, "").trim();
        return {
            role: "",
            task: body,
            context: "",
            outputFormat: "",
        };
    }

    // 2. Claude XML format — requires valid, matched standalone block tags (ignores inline generics like Array<role>)
    const extractXml = (tag: string): string => {
        const match = trimmed.match(
            new RegExp(`(?:^|\\n)[ \\t]*<${tag}>[ \\t]*\\r?\\n?([\\s\\S]*?)\\r?\\n?[ \\t]*<\\/${tag}>`, "i")
        );
        return match ? match[1].trim() : "";
    };

    const xmlRole = extractXml("role");
    const xmlTask = extractXml("task");
    const xmlContext = extractXml("context_and_constraints");
    const xmlFormat = extractXml("output_format");
    const xmlLang = extractLanguageValue(extractXml("response_language"));

    const matchedXmlCount = [xmlRole, xmlTask, xmlContext, xmlFormat].filter(Boolean).length;
    if (matchedXmlCount >= 2 || (xmlTask && /^\s*<(?:role|task)>/i.test(trimmed))) {
        return {
            role: xmlRole,
            task: xmlTask || trimmed,
            context: xmlContext,
            outputFormat: xmlFormat,
            ...(xmlLang ? { responseLanguage: xmlLang } : {}),
        };
    }

    // 3. Gemini Bold Directive format
    if (
        /(?:^|\n)\*\*(?:Primary Directive & Persona|Task & Objectives|Contextual Guidelines & Constraints|Output Specification):\*\*/i.test(
            trimmed
        )
    ) {
        const extractGemini = (header: string): string => {
            const escaped = header.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(
                `(?:^|\\n)\\*\\*${escaped}:\\*\\*[ \\t]*\\r?\\n([\\s\\S]*?)(?=\\r?\\n\\r?\\n\\*\\*(?:Primary Directive & Persona|Task & Objectives|Contextual Guidelines & Constraints|Output Specification|Output Language):\\*\\*|$)`,
                "i"
            );
            const match = trimmed.match(regex);
            return match ? match[1].trim() : "";
        };

        const gRole = extractGemini("Primary Directive & Persona");
        const gTask = extractGemini("Task & Objectives");
        const gContext = extractGemini("Contextual Guidelines & Constraints");
        const gFormat = extractGemini("Output Specification");
        const gLang = extractLanguageValue(extractGemini("Output Language"));

        if ([gRole, gTask, gContext, gFormat].filter(Boolean).length >= 1) {
            return {
                role: gRole,
                task: gTask || trimmed,
                context: gContext,
                outputFormat: gFormat,
                ...(gLang ? { responseLanguage: gLang } : {}),
            };
        }
    }

    // 4. ChatGPT H3 Markdown format — only delimited by recognized RTCF headers so arbitrary H3 headings inside sections are preserved
    if (
        new RegExp(`(?:^|\\n)###[ \\t]+(?:${RECOGNIZED_MD_HEADERS})[ \\t]*(?:\\r?\\n|$)`, "i").test(trimmed)
    ) {
        const extractMd = (headerPattern: string): string => {
            const regex = new RegExp(
                `(?:^|\\n)###[ \\t]+(?:${headerPattern})[ \\t]*\\r?\\n([\\s\\S]*?)(?=\\r?\\n###[ \\t]+(?:${RECOGNIZED_MD_HEADERS})[ \\t]*(?:\\r?\\n|$)|$)`,
                "i"
            );
            const match = trimmed.match(regex);
            return match ? match[1].trim() : "";
        };

        const role = extractMd("Role\\s*&\\s*Persona|Role\\s+and\\s+Persona|Role|Persona");
        const task = extractMd("Task\\s*&\\s*Objective|Task\\s+and\\s+Objective|Task|Objective");
        const context = extractMd("Context\\s*&\\s*Constraints|Context\\s+and\\s+Constraints|Context|Constraints");
        const extraConstraints = extractMd("Guidelines\\s*&\\s*Negative\\s*Constraints");
        const outputFormat = extractMd("Desired\\s+Output\\s+Format|Output\\s+Format|Format");
        const mdLang = extractLanguageValue(extractMd("Response\\s+Language"));

        const combinedContext = [context, extraConstraints].filter(Boolean).join("\n\n");

        if ([role, task, combinedContext, outputFormat].filter(Boolean).length >= 1) {
            return {
                role,
                task: task || trimmed,
                context: combinedContext,
                outputFormat,
                ...(mdLang ? { responseLanguage: mdLang } : {}),
            };
        }
    }

    return null;
}

function isConversationalPersonaRole(roleText: string): boolean {
    if (!roleText) return false;
    return (
        /\b(act\s+as|you\s+are|senior|lead|principal|staff|specialist|engineer|developer|architect|strategist|copywriter|marketer|editor|writer|auditor|consultant|analyst|manager|expert|advisor)\b/i.test(
            roleText
        ) ||
        /(?:تصرف|مهندس|خبير|أخصائي|كاتب|محرر|مطور|مستشار)/.test(roleText) ||
        /\{\{[^}]+\}\}/.test(roleText)
    );
}

function isTextDeliverableFormat(formatText: string): boolean {
    if (!formatText) return false;
    return (
        /^(?:desired\s+output\s+format|\d+\.|[-*•]\s+)/i.test(formatText) ||
        /\b(markdown|json|code|block|table|bullet|list|section|summary|outline|heading|step-by-step|explanation|test|sql|query|brief|email|sequence|cta|schema|benchmark|diff|deliverable|follow\s+the\s+explicit\s+output\s+format)\b/i.test(
            formatText
        ) ||
        /(?:عناوين|نقاط|ملخص|جدول|كود|خطوات|مقترحات|التزم\s+بتنسيق)/.test(formatText)
    );
}

function cleanVisualTaskForMidjourney(taskText: string): string {
    return taskText
        .replace(/^\/imagine\s+prompt:\s*/i, "")
        .replace(
            /(?:^|\n+)(?:Specific Deliverable \/ Scope|الهدف التفصيلي المطلوب):\s*\{\{[^}]+\}\}[ \t]*$/gi,
            ""
        )
        .trim();
}

function cleanVisualContextForMidjourney(contextText: string): string {
    if (!contextText) return "";
    let cleaned = contextText;
    for (const phrase of GENERIC_OPTIMIZER_PHRASES) {
        cleaned = cleaned.replace(phrase, "");
    }
    cleaned = cleaned.replace(
        /(?:^|\n)[ \t]*[-*•][ \t]*(?:Framework|Technical Stack|Specified Audience|Target Audience|Specified Product \/ Offer|Product \/ Offer|Business Goal|Key Constraints|Error Message \/ Relevant Code|التقنيات المحددة|التقنيات المستخدمة|الجمهور المستهدف[^\n:]*|المنتج أو[^\n:]*|الكلمة المفتاحية[^\n:]*|السياق الأساسي|القيود والمتطلبات[^\n:]*|رسالة الخطأ[^\n:]*):[^\n]*/gi,
        ""
    );
    return cleaned
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .join(", ");
}

/**
 * Deterministically evaluates whether a task describes a visual subject/scene suitable
 * for Midjourney image generation rather than a non-visual software, sales, SEO, or text task.
 */
export function isSuitableForVisualGeneration(
    taskText: string,
    domain?: GeneratorDomain
): boolean {
    const cleaned = cleanVisualTaskForMidjourney(taskText);
    if (!cleaned) return false;

    const effectiveDomain = domain ?? inferDomain(cleaned);

    const hasExplicitVisualCue =
        /\b(image|photo|photograph|photography|picture|painting|watercolor|oil\s+painting|acrylic|gouache|charcoal|pastel|ink|illustration|drawing|sketch|portrait|landscape|cityscape|seascape|scene|render|3d\s+render|octane|unreal\s+engine|ray\s*tracing|isometric|cinematic|photorealistic|hyperrealistic|cyberpunk|steampunk|synthwave|vaporwave|anime|manga|pixel\s+art|vector\s+art|concept\s+art|digital\s+art|artwork|poster|wallpaper|logo|icon|mockup|wireframe|lighting|neon|golden\s+hour|volumetric|backlit|bokeh|depth\s+of\s+field|wide\s+angle|macro\s+lens|85mm|35mm|50mm|telephoto|aerial\s+view|close-up|silhouette|shadows|palette|glassmorphic|futuristic\s+city)\b/i.test(
            cleaned
        ) ||
        /(?:صورة|فوتوغرافي|تصوير|رسم|رسمة|لوحة|ألوان\s+مائية|زيتية|توضيحية|تصميم\s+شعار|شعار|أيقونة|بوستر|خلفية|مشهد|منظر\s+طبيعي|بورتريه|إضاءة|ظلال|نيون|سينمائي|واقعي|ثلاثي\s+الأبعاد|كرتوني|أنمي|بكسل)/.test(
            cleaned
        );

    const hasNonVisualDeliverable =
        /\b(react|next\.?js|vue|angular|svelte|typescript|javascript|python|golang|go\s+api|goroutines?|node\.?js|sql|postgres(?:ql)?|mysql|mongodb|sqlite|redis|docker|kubernetes|aws|tailwind|api|endpoint|rest\s+api|graphql|authentication|auth|jwt|oauth|login\s+flow|database|schema|query|migration|hook|useeffect|usestate|component|function|class|method|algorithm|regex|unit\s+test|integration\s+test|bug|error|exception|stack\s+trace|refactor|debug|optimize|compile|deploy|ci\/cd|microservice|backend|frontend|cli|sdk|library|package|cold\s+email|email\s+sequence|newsletter|blog\s+post|article|essay|seo\s+brief|content\s+brief|meta\s+description|keyword\s+research|sales\s+pitch|ad\s+copy|landing\s+page\s+copy|press\s+release|resume|cover\s+letter|whitepaper|case\s+study|documentation|readme|pull\s+request|code\s+review)\b/i.test(
            cleaned
        ) ||
        /(?:إيميل|بريد\s+إلكتروني|مقال|مدونة|سيو|كلمات\s+مفتاحية|كود|برمجة|دالة|قاعدة\s+بيانات|واجهة\s+برمجة|خوارزمية|تصحيح\s+خطأ|باج|تلخيص|ترجمة|شرح|تحليل|تقرير|سيرة\s+ذاتية|بيان\s+صحفي|حملة\s+إعلانية|رياكت|بايثون|جافاسكريبت|تايب\s*سكريبت)/.test(
            cleaned
        );

    const startsWithNonVisualImperative =
        /^(?:please\s+)?(?:write|draft|compose|explain|summarize|translate|proofread|edit|rewrite|analyze|compare|calculate|solve|fix|debug|refactor|optimize|implement|deploy|configure|install|migrate|audit|review|test|document|create\s+a\s+(?:react|next\.?js|vue|angular|node|python|go|sql|rest|graphql|api|backend|frontend|cli|function|script|hook|component|service|database|test|email|blog|article|report|brief|plan|strategy))\b/i.test(
            cleaned
        ) ||
        /^(?:من\s+فضلك\s+)?(?:اكتب|أكتب|اشرح|لخص|ترجم|دقق|راجع|حلل|قارن|احسب|أصلح|اصلح|طور|برمج|نفذ|وثق)/.test(
            cleaned
        );

    if (hasNonVisualDeliverable && !hasExplicitVisualCue) {
        return false;
    }
    if (startsWithNonVisualImperative && !hasExplicitVisualCue) {
        return false;
    }
    if (effectiveDomain !== "general" && !hasExplicitVisualCue) {
        return false;
    }

    return true;
}

/**
 * Pure, deterministic model formatter matching PromptStudioTool's exact output conventions.
 * Prevents duplicate headers or corrupted structures when switching models.
 */
export function formatPromptForModel(
    fields: DecomposedPrompt,
    targetModel: GeneratorTargetModel,
    responseLanguage?: string
): string {
    const r = fields.role.trim();
    const t = fields.task.trim();
    const c = fields.context.trim();
    const f = fields.outputFormat.trim();
    const lang = responseLanguage ? responseLanguage.trim() : "";

    if (!r && !t && !c && !f) {
        return "";
    }

    // 1. Midjourney: Visual prompt synthesis without conversational RTCF headers, persona titles, or hardcoded outdated flags
    if (targetModel === "midjourney") {
        const cleanTask = cleanVisualTaskForMidjourney(t);
        const cleanContext = cleanVisualContextForMidjourney(c);
        if (!isSuitableForVisualGeneration(cleanTask)) {
            return "";
        }
        const visualParts: string[] = [];
        if (r && !isConversationalPersonaRole(r)) {
            visualParts.push(r);
        }
        if (cleanTask) visualParts.push(cleanTask);
        if (cleanContext) visualParts.push(cleanContext);

        let base = visualParts.join(", ");
        if (f && !isTextDeliverableFormat(f)) {
            base = base ? `${base} ${f}` : f;
        }
        return base ? `/imagine prompt: ${base}` : "";
    }

    // 2. Claude: Semantic XML tags
    if (targetModel === "claude") {
        const sections: string[] = [];
        if (r) sections.push(`<role>\n${r}\n</role>`);
        if (t) sections.push(`<task>\n${t}\n</task>`);
        if (c) sections.push(`<context_and_constraints>\n${c}\n</context_and_constraints>`);
        if (f) sections.push(`<output_format>\n${f}\n</output_format>`);
        if (lang) sections.push(`<response_language>\nPlease provide the final response in ${lang}.\n</response_language>`);
        return sections.join("\n\n");
    }

    // 3. Gemini: Structured Directive Headings
    if (targetModel === "gemini") {
        const sections: string[] = [];
        if (r) sections.push(`**Primary Directive & Persona:**\n${r}`);
        if (t) sections.push(`**Task & Objectives:**\n${t}`);
        if (c) sections.push(`**Contextual Guidelines & Constraints:**\n${c}`);
        if (f) sections.push(`**Output Specification:**\n${f}`);
        if (lang) sections.push(`**Output Language:**\nPlease provide the final response in ${lang}.`);
        return sections.join("\n\n");
    }

    // 4. ChatGPT (Default): Clean Markdown Section Hierarchy
    const sections: string[] = [];
    if (r) sections.push(`### Role & Persona\n${r}`);
    if (t) sections.push(`### Task & Objective\n${t}`);
    if (c) sections.push(`### Context & Constraints\n${c}`);
    if (f) sections.push(`### Desired Output Format\n${f}`);
    if (lang) sections.push(`### Response Language\nPlease provide the final response in ${lang}.`);
    return sections.join("\n\n");
}

function collectUnresolvedPlaceholders(fields: DecomposedPrompt): MissingInformationItem[] {
    const items: MissingInformationItem[] = [];
    const seen = new Set<string>();
    const sources: Array<["role" | "task" | "context" | "outputFormat", MissingInformationItem["targetField"]]> = [
        ["role", "role"],
        ["task", "task"],
        ["context", "context"],
        ["outputFormat", "format"],
    ];
    for (const [key, targetField] of sources) {
        for (const match of fields[key].match(/\{\{[^{}\n]+\}\}/g) || []) {
            if (seen.has(match)) continue;
            seen.add(match);
            items.push({
                placeholder: match,
                reason: "Unresolved placeholder already present in your structured prompt; fill it in or remove it.",
                targetField,
            });
        }
    }
    return items;
}

interface DomainBlueprint {
    roleEn: string;
    roleAr: string;
    formatEn: string;
    formatAr: string;
    bestPracticeEn: string;
    bestPracticeAr: string;
}

const DOMAIN_BLUEPRINTS: Record<GeneratorDomain, DomainBlueprint> = {
    code: {
        roleEn: "Act as a Senior Software Engineer and System Architect.",
        roleAr: "تصرف كمهندس برمجيات أول ومصمم معمارية أنظمة.",
        formatEn:
            "1. Technical approach & root-cause summary\n2. Clean, modular implementation code\n3. Edge cases & verification steps",
        formatAr:
            "1. ملخص الحل التقني والسبب الجذري\n2. كود برمجي منظم وقابل للصيانة\n3. الحالات الحدية وخطوات التحقق",
        bestPracticeEn:
            "Follow production-grade standards, strict typing, and maintainable modular architecture.",
        bestPracticeAr:
            "اتبع أفضل ممارسات كتابة الكود المنظم ومعالجة الأخطاء بوضوح، ولا تفترض وجود مكتبات أو واجهات غير موثقة.",
    },
    seo: {
        roleEn: "Act as a Technical SEO and Content Strategy Specialist.",
        roleAr: "تصرف كأخصائي استراتيجيات تحسين محركات البحث (SEO) وهيكلة المحتوى.",
        formatEn:
            "1. Search intent & angle summary\n2. Structured H1/H2/H3 content outline\n3. On-page SEO & FAQ recommendations",
        formatAr:
            "1. تحليل نية البحث وزاوية المحتوى\n2. هيكل العناوين (H1/H2/H3) بالتفصيل\n3. توصيات السيو الداخلي والأسئلة الشائعة",
        bestPracticeEn:
            "Avoid pleasantries, conversational filler, or self-evident introductions. Deliver direct, high-density actionable content.",
        bestPracticeAr:
            "ركز على توافق المحتوى مع نية الباحث والتسلسل المنطقي للعناوين وتجنب حشو الكلمات المفتاحية.",
    },
    sales: {
        roleEn: "Act as a B2B Outbound Sales and Conversion Specialist.",
        roleAr: "تصرف كأخصائي مبيعات وتطوير أعمال (B2B) وصياغة رسائل تواصل.",
        formatEn:
            "1. Subject line options\n2. Concise, value-focused message body\n3. Single low-friction call to action (CTA)",
        formatAr:
            "1. مقترحات لعنوان الرسالة\n2. نص رسالة موجز يركز على القيمة المضافة\n3. دعوة واضحة ومباشرة لاتخاذ إجراء (CTA)",
        bestPracticeEn:
            "Avoid pleasantries, conversational filler, or self-evident introductions. Deliver direct, high-density actionable content.",
        bestPracticeAr:
            "حافظ على الإيجاز والوضوح، وتجنب المقدمات الإنشائية الطويلة، وركز مباشرة على حل مشكلة العميل المحتمل.",
    },
    marketing: {
        roleEn: "Act as a Direct-Response Copywriter and Marketing Strategist.",
        roleAr: "تصرف ككاتب نصوص تسويقية (Copywriter) وأخصائي استراتيجيات تسويق.",
        formatEn:
            "1. Core hook & value proposition\n2. Structured copy sections with key benefits\n3. Call-to-action (CTA) variations",
        formatAr:
            "1. العنوان الجذاب والقيمة الأساسية المقترحة\n2. أقسام المحتوى التسويقي وأهم الفوائد\n3. بدائل متعددة للدعوة إلى اتخاذ إجراء (CTA)",
        bestPracticeEn:
            "Do not invent facts or unverified assertions. If required information is missing, explicitly ask or state the assumed baseline.",
        bestPracticeAr:
            "ركز على الفوائد الملموسة للعميل بدلاً من العبارات العامة، ولا تختلق إحصائيات أو شهادات غير حقيقية.",
    },
    writing: {
        roleEn: "Act as a Professional Editor and Content Writer.",
        roleAr: "تصرف ككاتب ومحرر محتوى محترف.",
        formatEn:
            "- Clear title and structured subheadings\n- Cohesive, readable paragraphs\n- Key takeaways summary",
        formatAr:
            "- عنوان واضح وعناوين فرعية منظمة\n- فقرات مترابطة وسهلة القراءة\n- ملخص لأهم النقاط المستفادة",
        bestPracticeEn:
            "Avoid pleasantries, conversational filler, or self-evident introductions. Deliver direct, high-density actionable content.",
        bestPracticeAr:
            "تجنب الحشو والتكرار والمقدمات البديهية، وحافظ على سلاسة الأسلوب ودقة المعلومات.",
    },
    general: {
        roleEn: "Act as a {{Expert_Role}}.",
        roleAr: "تصرف كـ {{الدور_التخصصي}}.",
        formatEn:
            "- Structured Markdown headings\n- Clear, actionable bullet points\n- Concise summary of next steps",
        formatAr:
            "- عناوين منظمة وواضحة\n- نقاط عملية محددة\n- ملخص موجز للخطوات التالية",
        bestPracticeEn:
            "Do not invent facts or unverified assertions. If required information is missing, explicitly ask or state the assumed baseline.",
        bestPracticeAr:
            "لا تختلق معلومات أو افتراضات غير مؤكدة. إذا كانت هناك تفاصيل ناقصة، وضح الافتراضات بشكل صريح.",
    },
};

/**
 * Deterministic Natural Language Prompt Generation Engine.
 * Converts natural language user requests into structured RTCF prompts while
 * preserving original intent, avoiding redundant placeholders, and reporting
 * transparent metadata for user-provided, inferred, and missing elements.
 */
export function generatePrompt(
    rawInput: string,
    options: PromptGenerationOptions = {}
): PromptGenerationResult {
    const normalizedInput = rawInput.trim();
    const targetModel: GeneratorTargetModel = options.targetModel || "chatgpt";
    const includeBestPractices = options.includeBestPractices !== false;
    const responseLanguage = options.responseLanguage?.trim() || undefined;

    // 1. Empty / whitespace input handling
    if (!normalizedInput) {
        const emptyFields: DecomposedPrompt = {
            role: "",
            task: "",
            context: "",
            outputFormat: "",
        };

        return {
            rawInput,
            normalizedInput: "",
            isEmpty: true,
            validationMessage: "Please describe what you want the AI to do to generate a structured prompt.",
            targetModel,
            fields: emptyFields,
            formattedPrompt: "",
            metadata: {
                userProvided: {
                    rawIntent: "",
                    detectedTech: [],
                    detectedAudience: null,
                    detectedProductOrOffer: null,
                    detectedRole: null,
                    detectedFormat: null,
                    hasSubstantiveContext: false,
                    hasExplicitSpecificity: false,
                    hasExplicitConstraints: false,
                    wasAlreadyStructured: false,
                },
                inferred: {
                    domain: "general",
                    domainSource: "fallback_general",
                    inputLanguage: "en",
                    structuralLanguage: "en",
                    inferredRole: null,
                    inferredFormat: null,
                },
                genericBestPractices: [],
                missingInformation: [],
                engineNote:
                    "Deterministic rule-based generator: awaits non-empty user input.",
            },
            formatForModel: () => "",
        };
    }

    // 2. Language & Existing Structure Detection
    const { inputLanguage, structuralLanguage } = detectLanguageProfile(normalizedInput);
    const isAr = structuralLanguage === "ar";
    const existingStructured = parseExistingStructuredPrompt(normalizedInput);

    // 3. Domain Detection
    const keywordInferredDomain = inferDomain(normalizedInput);
    let activeDomain: GeneratorDomain;
    let domainSource: "user_selected" | "keyword_inferred" | "fallback_general";

    if (options.domain && options.domain !== "auto") {
        activeDomain = options.domain;
        domainSource = "user_selected";
    } else if (keywordInferredDomain !== "general") {
        activeDomain = keywordInferredDomain;
        domainSource = "keyword_inferred";
    } else {
        activeDomain = "general";
        domainSource = "fallback_general";
    }

    // 4. Fact & Signal Extraction (from user input only)
    const detectedTech = detectAllMentionedTech(normalizedInput);
    const detectedAudience = detectAudienceMention(normalizedInput);
    const detectedProductOrOffer = detectProductOrOfferMention(normalizedInput);
    const roleCheck = detectRole(normalizedInput);
    const taskCheck = detectTask(normalizedInput);
    const contextCheck = detectContext(normalizedInput);
    const formatCheck = detectFormat(normalizedInput);
    const hasExplicitSpecificity = detectSpecificity(normalizedInput);
    const hasExplicitConstraints = detectConstraints(normalizedInput);

    const missingInformation: MissingInformationItem[] = [];
    const genericBestPractices: string[] = [];

    // 5. If the input was already a structured prompt, preserve its components directly
    if (existingStructured) {
        const fields: DecomposedPrompt = {
            role: existingStructured.role,
            task: existingStructured.task,
            context: existingStructured.context,
            outputFormat: existingStructured.outputFormat,
        };

        const effectiveLanguage = responseLanguage ?? existingStructured.responseLanguage;
        const wasMidjourneyInput = /^\/imagine\s+prompt:\s*/i.test(normalizedInput);
        const cleanedStructuredTask = cleanVisualTaskForMidjourney(fields.task || normalizedInput);
        const structuredTaskDomain = inferDomain(cleanedStructuredTask);
        const isStructuredVisual = isSuitableForVisualGeneration(cleanedStructuredTask, structuredTaskDomain);

        const formatStructuredForModel = (
            model: GeneratorTargetModel,
            langOverride?: string
        ): string => {
            if (model === "midjourney") {
                if (!isStructuredVisual) {
                    return "";
                }
                if (wasMidjourneyInput) {
                    return formatPromptForModel(fields, "midjourney", langOverride ?? effectiveLanguage);
                }
                const cleanedVisualContext = cleanVisualContextForMidjourney(fields.context);
                const combinedVisualText = [cleanedStructuredTask, cleanedVisualContext].filter(Boolean).join(", ");
                return generatePrompt(combinedVisualText, {
                    ...options,
                    targetModel: "midjourney",
                    responseLanguage: langOverride ?? effectiveLanguage,
                }).formattedPrompt;
            }
            return formatPromptForModel(fields, model, langOverride ?? effectiveLanguage);
        };

        const formattedPrompt = formatStructuredForModel(targetModel);
        const isDeclinedMidjourney = targetModel === "midjourney" && !isStructuredVisual;
        const structuredValidationMessage = isDeclinedMidjourney
            ? isAr
                ? "نموذج Midjourney مخصص لتوليد الصور فقط. هذا الطلب يصف مهمة برمجية أو نصية غير بصرية ولا يمكن تحويله إلى أمر /imagine prompt دون اختلاق عناصر بصرية. يرجى اختيار ChatGPT أو Claude أو Gemini، أو وصف مشهد بصري."
                : `Midjourney is an image generation model. This request describes a non-visual ${structuredTaskDomain} task and cannot be converted into a '/imagine prompt:' without inventing visual concepts. Switch to ChatGPT, Claude, or Gemini, or describe a visual scene.`
            : undefined;

        return {
            rawInput,
            normalizedInput,
            isEmpty: false,
            ...(structuredValidationMessage ? { validationMessage: structuredValidationMessage } : {}),
            targetModel,
            fields,
            formattedPrompt,
            metadata: {
                userProvided: {
                    rawIntent: normalizedInput,
                    detectedTech,
                    detectedAudience,
                    detectedProductOrOffer,
                    detectedRole: existingStructured.role || roleCheck.detectedRoleText || null,
                    detectedFormat: existingStructured.outputFormat || formatCheck.detectedFormatText || null,
                    hasSubstantiveContext: Boolean(existingStructured.context) || contextCheck.hasContext,
                    hasExplicitSpecificity,
                    hasExplicitConstraints,
                    wasAlreadyStructured: true,
                },
                inferred: {
                    domain: activeDomain,
                    domainSource,
                    inputLanguage,
                    structuralLanguage,
                    inferredRole: null,
                    inferredFormat: null,
                },
                genericBestPractices: [],
                missingInformation: collectUnresolvedPlaceholders(fields),
                engineNote: isDeclinedMidjourney
                    ? "Non-visual structured task detected; Midjourney '/imagine prompt:' conversion was declined transparently to avoid injecting programming/text instructions or inventing visual subjects."
                    : "Input already contained structured prompt sections; preserved existing sections verbatim.",
            },
            formatForModel: formatStructuredForModel,
        };
    }

    // 6. Midjourney Visual Strategy (separate from text RTCF blueprints)
    if (targetModel === "midjourney") {
        const isVisualSuitable = isSuitableForVisualGeneration(normalizedInput, activeDomain);

        if (!isVisualSuitable) {
            const nonVisualFields: DecomposedPrompt = {
                role: "",
                task: normalizedInput,
                context: "",
                outputFormat: "",
            };
            const validationMessage = isAr
                ? "نموذج Midjourney مخصص لتوليد الصور فقط. هذا الطلب يصف مهمة برمجية أو نصية غير بصرية ولا يمكن تحويله إلى أمر /imagine prompt دون اختلاق عناصر بصرية. يرجى اختيار ChatGPT أو Claude أو Gemini، أو وصف مشهد بصري."
                : `Midjourney is an image generation model. This request describes a non-visual ${activeDomain} task and cannot be converted into a '/imagine prompt:' without inventing visual concepts. Switch to ChatGPT, Claude, or Gemini, or describe a visual scene.`;

            return {
                rawInput,
                normalizedInput,
                isEmpty: false,
                validationMessage,
                targetModel: "midjourney",
                fields: nonVisualFields,
                formattedPrompt: "",
                metadata: {
                    userProvided: {
                        rawIntent: normalizedInput,
                        detectedTech,
                        detectedAudience,
                        detectedProductOrOffer,
                        detectedRole: null,
                        detectedFormat: null,
                        hasSubstantiveContext: false,
                        hasExplicitSpecificity,
                        hasExplicitConstraints,
                        wasAlreadyStructured: false,
                    },
                    inferred: {
                        domain: activeDomain,
                        domainSource,
                        inputLanguage,
                        structuralLanguage,
                        inferredRole: null,
                        inferredFormat: null,
                    },
                    genericBestPractices: [],
                    missingInformation: [],
                    engineNote:
                        "Non-visual task detected; Midjourney '/imagine prompt:' conversion was declined transparently to avoid injecting programming/text instructions or inventing visual subjects.",
                },
                formatForModel: (model, langOverride) => {
                    if (model === "midjourney") {
                        return "";
                    }
                    const textResult = generatePrompt(rawInput, {
                        ...options,
                        targetModel: model,
                        responseLanguage: langOverride ?? responseLanguage,
                    });
                    return textResult.formattedPrompt;
                },
            };
        }

        const hasStyleMention =
            /\b(photorealistic|cinematic|watercolor|oil painting|3d render|isometric|cyberpunk|minimalist|anime|sketch|illustration|vector|octane render|unreal engine|studio photography)\b/i.test(
                normalizedInput
            ) || /(?:واقعي|سينمائي|ثلاثي الأبعاد|كرتوني|رسم|إضاءة)/.test(normalizedInput);

        const hasLightingMention =
            /\b(lighting|sunlight|neon|golden hour|dramatic shadows|soft light|volumetric|backlit|studio light|glowing)\b/i.test(
                normalizedInput
            ) || /(?:إضاءة|ظلال|ضوء)/.test(normalizedInput);

        const visualContextParts: string[] = [];
        if (!hasStyleMention) {
            const ph = isAr ? "{{النمط_الفني_أو_الوسيط}}" : "{{Art_Style_Or_Medium}}";
            visualContextParts.push(isAr ? `النمط الفني: ${ph}` : `style: ${ph}`);
            missingInformation.push({
                placeholder: ph,
                reason: "Visual generation benefits from specifying the artistic medium (e.g., studio photography, 3D isometric render, vector illustration).",
                targetField: "context",
            });
        }

        if (!hasLightingMention) {
            const ph = isAr ? "{{الإضاءة_والتكوين}}" : "{{Lighting_And_Composition}}";
            visualContextParts.push(isAr ? `الإضاءة والتكوين: ${ph}` : `lighting & composition: ${ph}`);
            missingInformation.push({
                placeholder: ph,
                reason: "Lighting and framing parameters guide visual mood and camera perspective.",
                targetField: "context",
            });
        }

        const mjFields: DecomposedPrompt = {
            role: "",
            task: normalizedInput,
            context: visualContextParts.join(", "),
            outputFormat: "",
        };

        const formattedPrompt = formatPromptForModel(mjFields, "midjourney", responseLanguage);

        return {
            rawInput,
            normalizedInput,
            isEmpty: false,
            targetModel: "midjourney",
            fields: mjFields,
            formattedPrompt,
            metadata: {
                userProvided: {
                    rawIntent: normalizedInput,
                    detectedTech,
                    detectedAudience,
                    detectedProductOrOffer,
                    detectedRole: null,
                    detectedFormat: null,
                    hasSubstantiveContext: hasStyleMention && hasLightingMention,
                    hasExplicitSpecificity,
                    hasExplicitConstraints,
                    wasAlreadyStructured: false,
                },
                inferred: {
                    domain: activeDomain,
                    domainSource,
                    inputLanguage,
                    structuralLanguage,
                    inferredRole: null,
                    inferredFormat: null,
                },
                genericBestPractices: [],
                missingInformation,
                engineNote:
                    "Formatted using Midjourney visual synthesis strategy without hardcoded model version flags.",
            },
            formatForModel: (model, langOverride) => {
                if (model === "midjourney") {
                    return formatPromptForModel(mjFields, "midjourney", langOverride ?? responseLanguage);
                }
                const textResult = generatePrompt(rawInput, {
                    ...options,
                    targetModel: model,
                    responseLanguage: langOverride ?? responseLanguage,
                });
                return textResult.formattedPrompt;
            },
        };
    }

    // 7. Standard Text LLM Generation (ChatGPT, Claude, Gemini)
    const blueprint = DOMAIN_BLUEPRINTS[activeDomain];

    // 7A. Role Determination
    let finalRole: string;
    let inferredRole: string | null = null;
    const cleanUserRole =
        roleCheck.hasRole && roleCheck.detectedRoleText
            ? extractCleanRoleClause(roleCheck.detectedRoleText)
            : null;

    if (cleanUserRole) {
        finalRole = cleanUserRole;
    } else {
        finalRole = isAr ? blueprint.roleAr : blueprint.roleEn;
        inferredRole = finalRole;

        if (activeDomain === "general") {
            const rolePh = isAr ? "{{الدور_التخصصي}}" : "{{Expert_Role}}";
            missingInformation.push({
                placeholder: rolePh,
                reason: "No specific domain keywords were detected; specify the desired specialist persona.",
                targetField: "role",
            });
        }
    }

    // 7B. Task Construction (Always preserves user's exact request intact)
    let finalTask = normalizedInput;
    const hasTopic = hasSpecificTopicOrSubject(normalizedInput);

    // Avoid redundant task placeholder when a bare SEO request already triggers {{Primary_Keyword}} in Context
    const isBareSeoWithClearAction =
        activeDomain === "seo" && taskCheck.hasTask && taskCheck.issues.length === 0 && !hasTopic;

    if ((!taskCheck.hasTask || taskCheck.issues.length > 0 || !hasTopic) && !isBareSeoWithClearAction) {
        const taskPh = isAr ? "{{الهدف_أو_الموضوع_المحدد}}" : "{{Specific_Objective_Or_Topic}}";
        const clarificationLine = isAr
            ? `الهدف التفصيلي المطلوب: ${taskPh}`
            : `Specific Deliverable / Scope: ${taskPh}`;
        finalTask = `${normalizedInput}\n\n${clarificationLine}`;
        missingInformation.push({
            placeholder: taskPh,
            reason: "The initial request is brief or broad; specifying the exact topic or deliverable prevents generic output.",
            targetField: "task",
        });
    }

    // 7C. Context & Intelligent Placeholders (Only ask for what is genuinely missing)
    const contextLines: string[] = [];

    if (activeDomain === "code") {
        const isBugOrError =
            /\b(bug|fix|error|issue|crash|leak|exception|broken|fail|failing|re-render|re-renders|debug)\b/i.test(
                normalizedInput
            ) || /(?:خطأ|مشكلة|عطل|إصلاح|تصحيح|باج)/.test(normalizedInput);

        if (detectedTech.length > 0) {
            const techJoined = detectedTech.join(", ");
            contextLines.push(
                isAr
                    ? `- التقنيات المحددة: ${techJoined} (محددة مسبقاً)`
                    : `- Framework: ${techJoined} (already specified)`
            );
        } else {
            const stackPh = isAr ? "{{التقنيات_أو_لغة_البرمجة}}" : "{{Technical_Stack}}";
            contextLines.push(isAr ? `- التقنيات المستخدمة: ${stackPh}` : `- Technical Stack: ${stackPh}`);
            missingInformation.push({
                placeholder: stackPh,
                reason: "No programming language or framework was mentioned in the request.",
                targetField: "context",
            });
        }

        if (isBugOrError) {
            if (!hasCodeOrErrorDetails(normalizedInput)) {
                const errPh = isAr
                    ? "{{رسالة_الخطأ_أو_مقتطف_الكود}}"
                    : "{{Error_Message_Or_Code_Snippet}}";
                contextLines.push(
                    isAr
                        ? `- رسالة الخطأ أو الكود المعني: ${errPh}`
                        : `- Error Message / Relevant Code: ${errPh}`
                );
                missingInformation.push({
                    placeholder: errPh,
                    reason: "Debugging a bug or error requires the error output, stack trace, or code snippet.",
                    targetField: "context",
                });
            }
        } else if (!contextCheck.hasContext) {
            const envPh = isAr
                ? "{{بيئة_التشغيل_أو_المتطلبات}}"
                : "{{Runtime_Environment_Or_Requirements}}";
            contextLines.push(
                isAr
                    ? `- القيود والمتطلبات التقنية: ${envPh}`
                    : `- Key Constraints: ${envPh}`
            );
            missingInformation.push({
                placeholder: envPh,
                reason: "Implementation details depend on target runtime environment or architectural constraints.",
                targetField: "context",
            });
        }
    } else if (activeDomain === "seo") {
        if (detectedAudience) {
            contextLines.push(
                isAr
                    ? `- الجمهور المستهدف المحدد: ${detectedAudience}`
                    : `- Specified Audience: ${detectedAudience}`
            );
        } else {
            const audPh = isAr ? "{{الجمهور_المستهدف}}" : "{{Target_Audience}}";
            contextLines.push(isAr ? `- الجمهور المستهدف: ${audPh}` : `- Target Audience: ${audPh}`);
            missingInformation.push({
                placeholder: audPh,
                reason: "SEO content structure and depth depend on the target reader segment.",
                targetField: "context",
            });
        }

        if (!hasTopic) {
            const kwPh = isAr ? "{{الكلمة_المفتاحية_الأساسية}}" : "{{Primary_Keyword}}";
            contextLines.push(isAr ? `- الكلمة المفتاحية المستهدفة: ${kwPh}` : `- Business Goal: ${kwPh}`);
            missingInformation.push({
                placeholder: kwPh,
                reason: "SEO planning requires a primary target keyword or search topic.",
                targetField: "context",
            });
        }
    } else if (activeDomain === "sales" || activeDomain === "marketing") {
        if (detectedAudience) {
            contextLines.push(
                isAr
                    ? `- الجمهور المستهدف المحدد: ${detectedAudience}`
                    : `- Specified Audience: ${detectedAudience}`
            );
        } else {
            const audPh = isAr ? "{{الجمهور_المستهدف}}" : "{{Target_Audience}}";
            contextLines.push(isAr ? `- الجمهور المستهدف: ${audPh}` : `- Target Audience: ${audPh}`);
            missingInformation.push({
                placeholder: audPh,
                reason: "Sales and marketing positioning requires knowing the target buyer or audience.",
                targetField: "context",
            });
        }

        if (detectedProductOrOffer) {
            contextLines.push(
                isAr
                    ? `- المنتج أو الخدمة المحددة: ${detectedProductOrOffer}`
                    : `- Specified Product / Offer: ${detectedProductOrOffer}`
            );
        } else if (!contextCheck.hasContext) {
            const offerPh = isAr ? "{{تفاصيل_المنتج_أو_القيمة_المقترحة}}" : "{{Product_Or_Value_Proposition}}";
            contextLines.push(
                isAr
                    ? `- المنتج أو القيمة المقترحة: ${offerPh}`
                    : `- Product / Offer: ${offerPh}`
            );
            missingInformation.push({
                placeholder: offerPh,
                reason: "Persuasive copy requires the specific product, offer, or key differentiation.",
                targetField: "context",
            });
        }
    } else if (activeDomain === "writing") {
        if (detectedAudience) {
            contextLines.push(
                isAr
                    ? `- الجمهور المستهدف المحدد: ${detectedAudience}`
                    : `- Specified Audience: ${detectedAudience}`
            );
        } else if (!contextCheck.hasContext) {
            const audPh = isAr ? "{{الجمهور_المستهدف}}" : "{{Target_Audience}}";
            contextLines.push(isAr ? `- الجمهور المستهدف: ${audPh}` : `- Target Audience: ${audPh}`);
            missingInformation.push({
                placeholder: audPh,
                reason: "Writing tone and vocabulary depend on the intended reader.",
                targetField: "context",
            });
        }
    } else {
        // General domain
        if (!contextCheck.hasContext && !detectedAudience) {
            const ctxPh = isAr ? "{{القيود_أو_السياق_الإضافي}}" : "{{Key_Constraints}}";
            contextLines.push(isAr ? `- السياق الأساسي: ${ctxPh}` : `- Key Constraints: ${ctxPh}`);
            missingInformation.push({
                placeholder: ctxPh,
                reason: "Providing relevant background context or constraints prevents generic assumptions.",
                targetField: "context",
            });
        }
    }

    // Add generic best-practice guidelines (transparently tracked in metadata)
    if (includeBestPractices && !hasExplicitConstraints) {
        const bpText = isAr ? blueprint.bestPracticeAr : blueprint.bestPracticeEn;
        genericBestPractices.push(bpText);
        contextLines.push(bpText);
    }

    const finalContext = contextLines.join("\n");

    // 7D. Output Format Determination
    let finalFormat: string;
    let inferredFormat: string | null = null;

    if (formatCheck.hasFormat) {
        finalFormat = isAr
            ? "التزم بتنسيق المخرجات المذكور في طلب المستخدم أعلاه بدقة."
            : "Follow the explicit output format specified in the task objective above.";
    } else {
        finalFormat = isAr ? blueprint.formatAr : blueprint.formatEn;
        inferredFormat = finalFormat;
    }

    const fields: DecomposedPrompt = {
        role: finalRole,
        task: finalTask,
        context: finalContext,
        outputFormat: finalFormat,
    };

    const formattedPrompt = formatPromptForModel(fields, targetModel, responseLanguage);

    return {
        rawInput,
        normalizedInput,
        isEmpty: false,
        targetModel,
        fields,
        formattedPrompt,
        metadata: {
            userProvided: {
                rawIntent: normalizedInput,
                detectedTech,
                detectedAudience,
                detectedProductOrOffer,
                detectedRole: cleanUserRole,
                detectedFormat: formatCheck.hasFormat ? formatCheck.detectedFormatText || null : null,
                hasSubstantiveContext: contextCheck.hasContext,
                hasExplicitSpecificity,
                hasExplicitConstraints,
                wasAlreadyStructured: false,
            },
            inferred: {
                domain: activeDomain,
                domainSource,
                inputLanguage,
                structuralLanguage,
                inferredRole,
                inferredFormat,
            },
            genericBestPractices,
            missingInformation,
            engineNote:
                "Generated deterministically using rule-based RTCF blueprints without external AI APIs or semantic inference.",
        },
        formatForModel: (model, langOverride) => {
            if (model === "midjourney") {
                return generatePrompt(rawInput, {
                    ...options,
                    targetModel: "midjourney",
                    responseLanguage: langOverride ?? responseLanguage,
                }).formattedPrompt;
            }
            return formatPromptForModel(fields, model, langOverride ?? responseLanguage);
        },
    };
}
