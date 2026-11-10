import test from "node:test";
import assert from "node:assert";
import {
    generatePrompt,
    formatPromptForModel,
    detectLanguageProfile,
    detectAllMentionedTech,
    detectAudienceMention,
    detectProductOrOfferMention,
    extractCleanRoleClause,
    hasCodeOrErrorDetails,
    parseExistingStructuredPrompt,
    isSuitableForVisualGeneration,
    type GeneratorDomain,
    type GeneratorTargetModel,
} from "../src/lib/promptGenerator.ts";
import { optimizePrompt } from "../src/lib/promptOptimizer.ts";

test("Generator 1: Empty and whitespace-only inputs", () => {
    const emptyRes = generatePrompt("");
    assert.strictEqual(emptyRes.isEmpty, true);
    assert.ok(emptyRes.validationMessage);
    assert.strictEqual(emptyRes.formattedPrompt, "");
    assert.deepStrictEqual(emptyRes.fields, {
        role: "",
        task: "",
        context: "",
        outputFormat: "",
    });
    assert.strictEqual(emptyRes.metadata.missingInformation.length, 0);
    assert.strictEqual(emptyRes.formatForModel("claude"), "");

    const wsRes = generatePrompt("   \n\t  ");
    assert.strictEqual(wsRes.isEmpty, true);
    assert.strictEqual(wsRes.formattedPrompt, "");
});

test("Generator 2: All supported domains (code, seo, sales, marketing, writing, general) & domain override", () => {
    const cases: Array<{ input: string; expectedDomain: GeneratorDomain }> = [
        {
            input: "Build a REST API endpoint in Node.js with rate limiting",
            expectedDomain: "code",
        },
        {
            input: "Create a keyword cluster and SERP ranking strategy for an e-commerce store",
            expectedDomain: "seo",
        },
        {
            input: "Draft a cold email outreach sequence for enterprise prospects",
            expectedDomain: "sales",
        },
        {
            input: "Design a high-converting landing page hero and ad copy for a product launch",
            expectedDomain: "marketing",
        },
        {
            input: "Proofread and restructure this blog post narrative for better flow",
            expectedDomain: "writing",
        },
        {
            input: "Organize a weekly study schedule for university finals",
            expectedDomain: "general",
        },
    ];

    for (const c of cases) {
        const res = generatePrompt(c.input);
        assert.strictEqual(res.isEmpty, false);
        assert.strictEqual(
            res.metadata.inferred.domain,
            c.expectedDomain,
            `Expected domain ${c.expectedDomain} for input: "${c.input}"`
        );
        assert.ok(res.fields.task.includes(c.input), "Original user input must remain intact in task");
        assert.ok(res.formattedPrompt.includes(c.input), "Formatted prompt must preserve original input");
    }

    // Explicit domain override on ambiguous input
    const ambiguous = "Write a Python script to analyze SEO keywords for a marketing campaign";
    const autoRes = generatePrompt(ambiguous);
    assert.strictEqual(autoRes.metadata.inferred.domain, "code");
    assert.strictEqual(autoRes.metadata.inferred.domainSource, "keyword_inferred");

    const overrideRes = generatePrompt(ambiguous, { domain: "seo" });
    assert.strictEqual(overrideRes.metadata.inferred.domain, "seo");
    assert.strictEqual(overrideRes.metadata.inferred.domainSource, "user_selected");
    assert.ok(overrideRes.fields.role.includes("SEO"));
});

test("Generator 3: Arabic, English, and mixed-language inputs without translating user intent", () => {
    // 1. Pure English
    const enRes = generatePrompt("Refactor my authentication middleware in TypeScript.");
    assert.strictEqual(enRes.metadata.inferred.inputLanguage, "en");
    assert.strictEqual(enRes.metadata.inferred.structuralLanguage, "en");
    assert.ok(enRes.fields.role.startsWith("Act as"));

    // 2. Pure Arabic
    const arInput = "اكتب خطة سيو شاملة لموقع عيادة أسنان لزيادة الزيارات العضوية";
    const arRes = generatePrompt(arInput);
    assert.strictEqual(arRes.metadata.inferred.inputLanguage, "ar");
    assert.strictEqual(arRes.metadata.inferred.structuralLanguage, "ar");
    assert.strictEqual(arRes.metadata.inferred.domain, "seo");
    assert.ok(arRes.fields.role.includes("تصرف كأخصائي"));
    assert.ok(arRes.fields.task.includes(arInput), "Arabic input must be preserved verbatim");

    // 3. Mixed Arabic sentence with English technical terms
    const mixedArInput = "اكتب كود React مع TypeScript لحل مشكلة re-render في صفحة المنتجات";
    const mixedArRes = generatePrompt(mixedArInput);
    assert.strictEqual(mixedArRes.metadata.inferred.inputLanguage, "mixed");
    assert.strictEqual(mixedArRes.metadata.inferred.structuralLanguage, "ar");
    assert.ok(mixedArRes.fields.task.includes(mixedArInput), "Mixed input must not be translated or altered");
    assert.deepStrictEqual(mixedArRes.metadata.userProvided.detectedTech, ["React", "TypeScript"]);

    // 4. English sentence quoting an Arabic word
    const mixedEnInput = 'Explain the grammatical root of the word "برمجة" for beginner linguistics students.';
    const mixedEnRes = generatePrompt(mixedEnInput);
    assert.strictEqual(mixedEnRes.metadata.inferred.inputLanguage, "mixed");
    assert.strictEqual(mixedEnRes.metadata.inferred.structuralLanguage, "en");
    assert.ok(mixedEnRes.fields.task.includes(mixedEnInput));
});

test("Generator 4: Known technology detection and backtick / error detail accuracy (Remediation 4)", () => {
    // Case A: Tech mentioned ("React"), bug mentioned, no error/code snippet provided
    const reactBug = "Act as a React developer and fix this bug";
    const resA = generatePrompt(reactBug);
    assert.deepStrictEqual(resA.metadata.userProvided.detectedTech, ["React"]);
    assert.strictEqual(resA.fields.role, "Act as a React developer");
    assert.ok(resA.fields.task.includes(reactBug));
    assert.strictEqual(
        resA.formattedPrompt.includes("{{Technical_Stack}}"),
        false,
        "Must NOT request {{Technical_Stack}} when React is already specified"
    );
    assert.ok(
        resA.formattedPrompt.includes("{{Error_Message_Or_Code_Snippet}}"),
        "Should request error/code snippet when debugging without code provided"
    );

    // Case B (Remediation 4): Single inline identifier in backticks (`useEffect`) is NOT a code snippet
    const singleBacktickId = "Fix a bug in `useEffect` inside my React component";
    assert.strictEqual(hasCodeOrErrorDetails(singleBacktickId), false);
    const resSingleBacktick = generatePrompt(singleBacktickId);
    assert.ok(
        resSingleBacktick.formattedPrompt.includes("{{Error_Message_Or_Code_Snippet}}"),
        "Single backtick identifier like `useEffect` must NOT suppress {{Error_Message_Or_Code_Snippet}}"
    );

    // Case C (Remediation 4): Real fenced code block suppresses {{Error_Message_Or_Code_Snippet}}
    const fencedCodeBug = "Fix a bug in React:\n```tsx\nconst [count, setCount] = useState(0);\n```";
    assert.strictEqual(hasCodeOrErrorDetails(fencedCodeBug), true);
    const resFenced = generatePrompt(fencedCodeBug);
    assert.strictEqual(
        resFenced.formattedPrompt.includes("{{Error_Message_Or_Code_Snippet}}"),
        false,
        "Fenced code block must suppress {{Error_Message_Or_Code_Snippet}}"
    );

    // Case D (Remediation 4): Meaningful inline code expression suppresses {{Error_Message_Or_Code_Snippet}}
    const meaningfulInlineBug =
        "Fix a bug in React where `useEffect(() => { fetchUserData(userId); }, [userId])` runs twice";
    assert.strictEqual(hasCodeOrErrorDetails(meaningfulInlineBug), true);
    const resInlineExpr = generatePrompt(meaningfulInlineBug);
    assert.strictEqual(
        resInlineExpr.formattedPrompt.includes("{{Error_Message_Or_Code_Snippet}}"),
        false,
        "Meaningful inline code expression must suppress {{Error_Message_Or_Code_Snippet}}"
    );

    // Case E (Remediation 4): Explicit TypeError message without backticks suppresses {{Error_Message_Or_Code_Snippet}}
    const explicitTypeErrorBug =
        "Fix a bug in Next.js and TypeScript where rendering throws TypeError: Cannot read properties of null";
    assert.strictEqual(hasCodeOrErrorDetails(explicitTypeErrorBug), true);
    const resTypeError = generatePrompt(explicitTypeErrorBug);
    assert.strictEqual(
        resTypeError.formattedPrompt.includes("{{Error_Message_Or_Code_Snippet}}"),
        false,
        "Explicit TypeError message must suppress {{Error_Message_Or_Code_Snippet}}"
    );

    // Case F: Code request without any tech mentioned
    const noTechCode = "Write a function to validate credit card numbers using the Luhn algorithm";
    const resNoTech = generatePrompt(noTechCode);
    assert.strictEqual(resNoTech.metadata.userProvided.detectedTech.length, 0);
    assert.ok(
        resNoTech.formattedPrompt.includes("{{Technical_Stack}}"),
        "Should request {{Technical_Stack}} when no language/framework was mentioned"
    );

    // Case G: Arabic tech mention ("بايثون")
    const arTech = "اكتب سكريبت بايثون لاستخراج البيانات من ملفات النص";
    const resArTech = generatePrompt(arTech);
    assert.ok(resArTech.metadata.userProvided.detectedTech.includes("Python"));
    assert.strictEqual(
        resArTech.formattedPrompt.includes("{{التقنيات_أو_لغة_البرمجة}}"),
        false,
        "Must NOT ask for tech stack placeholder when بايثون is already stated"
    );
});

test("Generator 5: Audience, Product & non-redundant SEO placeholders (Remediation 5)", () => {
    // Both Audience AND Product/Offer already provided
    const withAudAndOffer =
        "Write a cold email sequence for B2B SaaS CTOs to sell our automated CI/CD regression testing tool";
    const resFullSales = generatePrompt(withAudAndOffer);
    assert.ok(resFullSales.metadata.userProvided.detectedAudience);
    assert.ok(resFullSales.metadata.userProvided.detectedProductOrOffer);
    assert.strictEqual(
        resFullSales.formattedPrompt.includes("{{Target_Audience}}"),
        false,
        "Must NOT inject {{Target_Audience}} when B2B SaaS CTOs is already specified"
    );
    assert.strictEqual(
        resFullSales.formattedPrompt.includes("{{Product_Or_Value_Proposition}}"),
        false,
        "Must NOT inject {{Product_Or_Value_Proposition}} when product is already specified"
    );

    // Audience & Offer missing
    const withoutAudience = "Write a cold email sequence to book a demo call";
    const resNoAud = generatePrompt(withoutAudience);
    assert.strictEqual(resNoAud.metadata.userProvided.detectedAudience, null);
    assert.ok(resNoAud.formattedPrompt.includes("{{Target_Audience}}"));
    assert.ok(resNoAud.formattedPrompt.includes("{{Product_Or_Value_Proposition}}"));

    // Remediation 5: SEO with clearly specified topic requests neither {{Primary_Keyword}} nor {{Specific_Objective_Or_Topic}}
    const seoWithTopic = "Create an SEO content brief for PostgreSQL indexing strategies";
    const resSeoTopic = generatePrompt(seoWithTopic, { domain: "seo" });
    assert.strictEqual(
        resSeoTopic.formattedPrompt.includes("{{Primary_Keyword}}"),
        false,
        "Must NOT inject {{Primary_Keyword}} when topic is already specified"
    );
    assert.strictEqual(
        resSeoTopic.formattedPrompt.includes("{{Specific_Objective_Or_Topic}}"),
        false,
        "Must NOT inject {{Specific_Objective_Or_Topic}} when topic is already specified"
    );

    // Remediation 5: Bare SEO request ("Create an SEO brief") requests {{Primary_Keyword}} WITHOUT redundant {{Specific_Objective_Or_Topic}}
    const bareSeo = "Create an SEO brief";
    const resBareSeo = generatePrompt(bareSeo);
    assert.ok(
        resBareSeo.formattedPrompt.includes("{{Primary_Keyword}}"),
        "Should inject {{Primary_Keyword}} when user only asks for a bare SEO brief"
    );
    assert.strictEqual(
        resBareSeo.formattedPrompt.includes("{{Specific_Objective_Or_Topic}}"),
        false,
        "Must NOT simultaneously inject {{Specific_Objective_Or_Topic}} alongside {{Primary_Keyword}} on a bare SEO request"
    );

    // Arabic bare SEO request ("اكتب خطة سيو")
    const bareArSeo = "اكتب خطة سيو";
    const resBareArSeo = generatePrompt(bareArSeo);
    assert.ok(resBareArSeo.formattedPrompt.includes("{{الكلمة_المفتاحية_الأساسية}}"));
    assert.strictEqual(
        resBareArSeo.formattedPrompt.includes("{{الهدف_أو_الموضوع_المحدد}}"),
        false,
        "Must NOT simultaneously inject {{الهدف_أو_الموضوع_المحدد}} alongside {{الكلمة_المفتاحية_الأساسية}}"
    );
});

test("Generator 6: Optimizer score neutrality & positive controls (Remediation 3A, 3B, 3C)", () => {
    // Case 3A: Unresolved {{Expert_Role}} must NOT earn Role points in optimizePrompt
    const vagueHelp = generatePrompt("help");
    assert.ok(vagueHelp.fields.role.includes("{{Expert_Role}}"));
    const optVague = optimizePrompt(vagueHelp.formattedPrompt);
    assert.strictEqual(
        optVague.score.role,
        0,
        "Unresolved {{Expert_Role}} must NOT earn Role points in Optimizer"
    );
    assert.strictEqual(
        optVague.score.context,
        0,
        "Unresolved {{Key_Constraints}} must NOT earn Context points in Optimizer"
    );

    // Case 3B: Arabic unresolved placeholders ({{الجمهور_المستهدف}}) must NOT earn Context points
    const bareArSales = generatePrompt("اكتب بريد بارد");
    assert.ok(bareArSales.formattedPrompt.includes("{{الجمهور_المستهدف}}"));
    const optArSales = optimizePrompt(bareArSales.formattedPrompt);
    assert.strictEqual(
        optArSales.score.context,
        0,
        "Unresolved Arabic placeholder {{الجمهور_المستهدف}} must NOT earn Context points"
    );

    // Case 3C: Generator annotation "- Framework: React (already specified)" must NOT count as substantive Context
    const reactBug = generatePrompt("Act as a React developer and fix this bug");
    assert.ok(reactBug.formattedPrompt.includes("- Framework: React (already specified)"));
    const optReactBug = optimizePrompt(reactBug.formattedPrompt);
    assert.strictEqual(
        optReactBug.score.context,
        0,
        "Generator annotation 'Framework: React (already specified)' must NOT inflate Optimizer Context score"
    );

    // Positive Control 1: Genuine English user-provided context still receives 25 Context points
    const genuineEnContext =
        "Write a cold email sequence. Target audience: Enterprise DevOps VPs managing Kubernetes clusters.";
    const optGenuineEn = optimizePrompt(genuineEnContext);
    assert.strictEqual(
        optGenuineEn.score.context,
        25,
        "Genuine English user-provided context must still earn 25 Context points"
    );

    // Positive Control 2: Genuine Arabic user-provided context still receives 25 Context points
    const genuineArContext =
        "اكتب خطة تسويق. الجمهور المستهدف: أصحاب المتاجر الإلكترونية الناشئة في الخليج.";
    const optGenuineAr = optimizePrompt(genuineArContext);
    assert.strictEqual(
        optGenuineAr.score.context,
        25,
        "Genuine Arabic user-provided context must still earn 25 Context points"
    );
});

test("Generator 7: XML false-positive prevention, arbitrary Markdown H3 preservation & response language (Remediations 1, 2, 6)", () => {
    // Remediation 1: Code containing Array<role>, Array<task>, <Component />, or unmatched <role> must NOT be parsed as Claude XML
    const codeWithGenerics =
        "### Custom Heading\nExplain `Array<role>`, `Array<task>`, and `<Component prop=\"val\" />` in TypeScript.";
    assert.strictEqual(parseExistingStructuredPrompt(codeWithGenerics), null);
    const resGenerics = generatePrompt(codeWithGenerics);
    assert.strictEqual(
        resGenerics.metadata.userProvided.wasAlreadyStructured,
        false,
        "Code with Array<role>, Array<task>, and <Component /> must NOT be misclassified as Claude XML"
    );
    assert.ok(resGenerics.fields.task.includes(codeWithGenerics));

    const unmatchedOpeningRole = "<role>\nExplain closures in JavaScript with examples.";
    assert.strictEqual(
        parseExistingStructuredPrompt(unmatchedOpeningRole),
        null,
        "Unmatched opening <role> tag must NOT be parsed as structured Claude XML"
    );
    const resUnmatched = generatePrompt(unmatchedOpeningRole);
    assert.strictEqual(resUnmatched.metadata.userProvided.wasAlreadyStructured, false);
    assert.ok(resUnmatched.fields.task.includes(unmatchedOpeningRole));

    // Remediation 1 & 6: Valid Claude XML prompt with <response_language>
    const validClaudeXml = `<role>
Act as a Staff Database Engineer.
</role>

<task>
Optimize this slow PostgreSQL query.
</task>

<context_and_constraints>
Table has 50M rows.
</context_and_constraints>

<output_format>
SQL query with EXPLAIN ANALYZE breakdown.
</output_format>

<response_language>
Please provide the final response in Spanish.
</response_language>`;

    const parsedClaude = parseExistingStructuredPrompt(validClaudeXml);
    assert.ok(parsedClaude);
    assert.strictEqual(parsedClaude.role, "Act as a Staff Database Engineer.");
    assert.strictEqual(parsedClaude.task, "Optimize this slow PostgreSQL query.");
    assert.strictEqual(parsedClaude.responseLanguage, "Spanish");

    const resClaude = generatePrompt(validClaudeXml);
    assert.strictEqual(resClaude.metadata.userProvided.wasAlreadyStructured, true);
    assert.ok(
        resClaude.formattedPrompt.includes("Please provide the final response in Spanish."),
        "Structured Claude prompt must preserve response language when caller does not override it"
    );
    // Explicit caller override takes precedence
    const resClaudeOverride = generatePrompt(validClaudeXml, { responseLanguage: "French" });
    assert.ok(
        resClaudeOverride.formattedPrompt.includes("Please provide the final response in French."),
        "Explicit caller responseLanguage must override structured prompt language"
    );

    // Remediation 2 & 6: ChatGPT Markdown with multiple arbitrary H3 headings and code blocks inside ### Task & Objective
    const complexMarkdownPrompt = `### Role & Persona
Act as a Principal Backend Architect.

### Task & Objective
Design a multi-tenant webhook delivery pipeline.

### Step 1: Ingestion & Queueing
Accept incoming events and validate HMAC signatures:
\`\`\`ts
const verify = (sig: string) => Boolean(sig);
\`\`\`

### Step 2: Retry & Dead-Letter Policy
Implement exponential backoff with jitter.

### Context & Constraints
Zero message loss under 10k RPS.

### Desired Output Format
Architecture diagram and TypeScript worker implementation.

### Response Language
Please provide the final response in Arabic.`;

    const resComplexMd = generatePrompt(complexMarkdownPrompt);
    assert.strictEqual(resComplexMd.metadata.userProvided.wasAlreadyStructured, true);
    assert.ok(
        resComplexMd.fields.task.includes("### Step 1: Ingestion & Queueing"),
        "Arbitrary H3 heading 1 inside Task must be preserved"
    );
    assert.ok(
        resComplexMd.fields.task.includes("### Step 2: Retry & Dead-Letter Policy"),
        "Arbitrary H3 heading 2 inside Task must be preserved"
    );
    assert.ok(
        resComplexMd.fields.task.includes("const verify = (sig: string) => Boolean(sig);"),
        "Fenced code block inside Task must be preserved"
    );
    assert.strictEqual(resComplexMd.fields.context, "Zero message loss under 10k RPS.");
    assert.ok(
        resComplexMd.formattedPrompt.includes("Please provide the final response in Arabic."),
        "ChatGPT structured response language must be preserved"
    );

    // Remediation 6: Gemini structured prompt with Output Language preservation and caller override
    const geminiStructured = `**Primary Directive & Persona:**
Senior Go Engineer

**Task & Objectives:**
Optimize goroutine worker pool

**Contextual Guidelines & Constraints:**
Go 1.22, zero allocations

**Output Specification:**
Code and benchmark comparison

**Output Language:**
Please provide the final response in German.`;

    const resGemini = generatePrompt(geminiStructured, { targetModel: "gemini" });
    assert.strictEqual(resGemini.metadata.userProvided.wasAlreadyStructured, true);
    assert.ok(resGemini.formattedPrompt.includes("Please provide the final response in German."));
    assert.ok(
        resGemini.formatForModel("claude", "Japanese").includes("Please provide the final response in Japanese.")
    );
});

test("Generator 8: Special characters, regex tokens ($100, $$, $&, \\), quotes, and Unicode", () => {
    const trickyInput =
        'Fix regex `/^\\$[0-9]+(?:\\.[0-9]{2})?$/` matching "$100.00", "$$", "$&", "$1" and `C:\\Users\\Admin` with 🚀 emoji.';
    const res = generatePrompt(trickyInput);

    assert.ok(
        res.fields.task.includes(trickyInput),
        "Task field must preserve $, $$, $&, $1, backslashes, quotes, and emojis verbatim"
    );
    assert.ok(
        res.formattedPrompt.includes(trickyInput),
        "Formatted prompt must preserve all special characters verbatim"
    );

    const claudeOut = res.formatForModel("claude");
    assert.ok(claudeOut.includes(trickyInput));
});

test("Generator 9: All supported model formats & Midjourney switching from structured Builder prompts (Remediation 7)", () => {
    const input = "Build a responsive pricing table in React and Tailwind CSS";
    const res = generatePrompt(input, { targetModel: "chatgpt", responseLanguage: "English" });

    // 1. ChatGPT
    assert.ok(res.formattedPrompt.includes("### Role & Persona"));
    assert.ok(res.formattedPrompt.includes("### Task & Objective"));
    assert.ok(res.formattedPrompt.includes("### Context & Constraints"));
    assert.ok(res.formattedPrompt.includes("### Desired Output Format"));
    assert.ok(res.formattedPrompt.includes("### Response Language"));

    // 2. Claude
    const claudeOut = res.formatForModel("claude");
    assert.ok(claudeOut.includes("<role>"));
    assert.ok(claudeOut.includes("<task>"));
    assert.ok(claudeOut.includes("<context_and_constraints>"));
    assert.ok(claudeOut.includes("<output_format>"));
    assert.ok(claudeOut.includes("<response_language>"));
    assert.ok(!claudeOut.includes("### Role & Persona"));

    // 3. Gemini
    const geminiOut = res.formatForModel("gemini");
    assert.ok(geminiOut.includes("**Primary Directive & Persona:**"));
    assert.ok(geminiOut.includes("**Task & Objectives:**"));
    assert.ok(geminiOut.includes("**Contextual Guidelines & Constraints:**"));
    assert.ok(geminiOut.includes("**Output Specification:**"));
    assert.ok(geminiOut.includes("**Output Language:**"));
    assert.ok(!geminiOut.includes("<role>"));

    // 4. Non-visual code/sales inputs must NOT pretend Midjourney conversion succeeded
    const mjFromCode = res.formatForModel("midjourney");
    assert.strictEqual(mjFromCode, "", "Non-visual code prompt must not emit a bogus /imagine prompt");

    const nonVisualInputs = [
        { text: "Create a React dashboard with authentication", expectedDomain: "code", expectedTech: ["React"] },
        { text: "Optimize a Go API and improve goroutine performance", expectedDomain: "code", expectedTech: ["Go"] },
        { text: "Write a cold email for a SaaS product", expectedDomain: "sales", expectedTech: [] },
    ];

    for (const item of nonVisualInputs) {
        // Mode A: Automatic domain detection
        const autoRes = generatePrompt(item.text);
        assert.strictEqual(autoRes.metadata.inferred.domain, item.expectedDomain);
        assert.deepStrictEqual(autoRes.metadata.userProvided.detectedTech, item.expectedTech);

        // Mode B: Explicit Midjourney target model
        const mjDirect = generatePrompt(item.text, { targetModel: "midjourney" });
        assert.strictEqual(mjDirect.formattedPrompt, "");
        assert.ok(mjDirect.validationMessage, `Expected validationMessage for non-visual input: ${item.text}`);
        assert.ok(mjDirect.metadata.engineNote.includes("Non-visual task detected"));
        // Switching back to ChatGPT preserves the user's original intent
        assert.ok(mjDirect.formatForModel("chatgpt").includes(item.text));

        // Mode C: Switching from existing structured Builder prompt to Midjourney
        assert.strictEqual(autoRes.formatForModel("midjourney"), "");
        assert.strictEqual(formatPromptForModel(autoRes.fields, "midjourney"), "");
        const mjFromStructured = generatePrompt(autoRes.formattedPrompt, { targetModel: "midjourney" });
        assert.strictEqual(mjFromStructured.formattedPrompt, "");
        assert.ok(mjFromStructured.validationMessage);
    }

    // 5. True visual prompts (Midjourney direct & switching from structured Builder prompts)
    const cityInput = "A cinematic futuristic city at night, neon lights, rainy streets";
    const cityAuto = generatePrompt(cityInput);
    const cityMjDirect = generatePrompt(cityInput, { targetModel: "midjourney" });
    assert.strictEqual(
        cityMjDirect.formattedPrompt,
        "/imagine prompt: A cinematic futuristic city at night, neon lights, rainy streets"
    );
    assert.strictEqual(cityMjDirect.validationMessage, undefined);
    assert.strictEqual(cityMjDirect.metadata.missingInformation.length, 0);
    assert.strictEqual(
        cityAuto.formatForModel("midjourney"),
        "/imagine prompt: A cinematic futuristic city at night, neon lights, rainy streets"
    );
    assert.strictEqual(
        generatePrompt(cityAuto.formattedPrompt, { targetModel: "midjourney" }).formattedPrompt,
        "/imagine prompt: A cinematic futuristic city at night, neon lights, rainy streets"
    );
    assert.strictEqual(
        formatPromptForModel(cityAuto.fields, "midjourney"),
        "/imagine prompt: A cinematic futuristic city at night, neon lights, rainy streets"
    );

    const foxInput = "A watercolor painting of a red fox in a forest";
    const foxAuto = generatePrompt(foxInput);
    const foxMjDirect = generatePrompt(foxInput, { targetModel: "midjourney" });
    assert.strictEqual(
        foxMjDirect.formattedPrompt,
        "/imagine prompt: A watercolor painting of a red fox in a forest, lighting & composition: {{Lighting_And_Composition}}"
    );
    assert.strictEqual(foxMjDirect.validationMessage, undefined);
    assert.ok(!foxMjDirect.formattedPrompt.includes("{{Art_Style_Or_Medium}}"));
    assert.strictEqual(
        foxAuto.formatForModel("midjourney"),
        "/imagine prompt: A watercolor painting of a red fox in a forest, lighting & composition: {{Lighting_And_Composition}}"
    );
    assert.strictEqual(
        generatePrompt(foxAuto.formattedPrompt, { targetModel: "midjourney" }).formattedPrompt,
        "/imagine prompt: A watercolor painting of a red fox in a forest, lighting & composition: {{Lighting_And_Composition}}"
    );
    assert.strictEqual(
        formatPromptForModel(foxAuto.fields, "midjourney"),
        "/imagine prompt: A watercolor painting of a red fox in a forest"
    );

    // Remediation 7: Switching from a structured Builder prompt to Midjourney must NOT convert persona role or text outputFormat into visual tokens, while preserving visual context
    const builderPresetPrompt = `### Role & Persona
Senior React & Frontend Performance Specialist

### Task & Objective
Modern SaaS dashboard hero illustration with glowing glassmorphic cards

### Context & Constraints
Dark violet and cyan palette

### Desired Output Format
Refactored TypeScript code block with detailed JSDoc comments`;

    const resBuilder = generatePrompt(builderPresetPrompt);
    const mjFromBuilder = resBuilder.formatForModel("midjourney");
    assert.strictEqual(
        mjFromBuilder,
        "/imagine prompt: Modern SaaS dashboard hero illustration with glowing glassmorphic cards, Dark violet and cyan palette"
    );
    assert.strictEqual(
        mjFromBuilder.includes("Senior React & Frontend Performance Specialist"),
        false,
        "Must NOT leak structured Builder persona role into Midjourney visual tokens"
    );
    assert.strictEqual(
        mjFromBuilder.includes("Refactored TypeScript code block"),
        false,
        "Must NOT leak structured Builder text output format into Midjourney visual tokens"
    );

    // Switching back and forth across all models must be idempotent
    const models: GeneratorTargetModel[] = ["chatgpt", "claude", "gemini", "midjourney", "chatgpt"];
    let lastChatGpt = "";
    for (const m of models) {
        const formatted = res.formatForModel(m);
        if (m === "chatgpt") {
            if (lastChatGpt) {
                assert.strictEqual(formatted, lastChatGpt, "Model switching must be strictly idempotent");
            }
            lastChatGpt = formatted;
        }
    }
});

test("Generator 10: Short, vague, and ambiguous inputs", () => {
    // Single vague word
    const vague = generatePrompt("help");
    assert.strictEqual(vague.isEmpty, false);
    assert.strictEqual(vague.metadata.inferred.domain, "general");
    assert.strictEqual(vague.metadata.inferred.domainSource, "fallback_general");
    assert.ok(vague.fields.role.includes("{{Expert_Role}}"));
    assert.ok(vague.fields.task.includes("{{Specific_Objective_Or_Topic}}"));

    // Short code keyword
    const shortCode = generatePrompt("debug");
    assert.strictEqual(shortCode.metadata.inferred.domain, "code");
    assert.ok(shortCode.fields.task.includes("debug"));
    assert.ok(shortCode.fields.task.includes("{{Specific_Objective_Or_Topic}}"));
    assert.ok(shortCode.fields.context.includes("{{Technical_Stack}}"));
    assert.ok(shortCode.fields.context.includes("{{Error_Message_Or_Code_Snippet}}"));
});

test("Generator 11: Exported helper utilities direct verification", () => {
    assert.deepStrictEqual(detectLanguageProfile("مرحبا بالعالم"), {
        inputLanguage: "ar",
        structuralLanguage: "ar",
    });
    assert.deepStrictEqual(detectAllMentionedTech("استخدم رياكت مع PostgreSQL"), [
        "PostgreSQL",
        "React",
    ]);
    assert.strictEqual(detectAudienceMention("Target audience: Senior DevOps Engineers"), "Senior DevOps Engineers");
    assert.strictEqual(
        detectProductOrOfferMention("Write ad copy to sell our cloud cost optimization platform to CTOs"),
        "our cloud cost optimization platform"
    );
    assert.strictEqual(
        extractCleanRoleClause("Act as a Senior DBA and optimize this slow query"),
        "Act as a Senior DBA"
    );
    assert.strictEqual(
        formatPromptForModel({ role: "", task: "", context: "", outputFormat: "" }, "chatgpt"),
        ""
    );
    assert.strictEqual(isSuitableForVisualGeneration("Create a React dashboard with authentication"), false);
    assert.strictEqual(
        isSuitableForVisualGeneration("A cinematic futuristic city at night, neon lights, rainy streets"),
        true
    );
});

test("Generator 12: Already-structured prompts still report their unresolved placeholders (Phase 6 audit)", () => {
    const first = generatePrompt("Create a React dashboard with authentication");
    const reparsed = generatePrompt(first.formattedPrompt);
    assert.strictEqual(reparsed.metadata.userProvided.wasAlreadyStructured, true);
    assert.deepStrictEqual(
        reparsed.metadata.missingInformation.map((m) => m.placeholder),
        ["{{Runtime_Environment_Or_Requirements}}"]
    );
    assert.strictEqual(reparsed.metadata.missingInformation[0].targetField, "context");

    // Fully resolved structured prompt reports nothing and is not altered
    const resolved = first.formattedPrompt.replace(
        "{{Runtime_Environment_Or_Requirements}}",
        "Node 20, PostgreSQL 16"
    );
    const resolvedRes = generatePrompt(resolved);
    assert.strictEqual(resolvedRes.metadata.missingInformation.length, 0);
    assert.strictEqual(resolvedRes.fields.context.includes("Node 20, PostgreSQL 16"), true);

    // Repeated placeholders are reported once
    const dup = generatePrompt(
        "### Role & Persona\nAct as {{Role_X}}.\n\n### Task & Objective\nDo {{Role_X}} and {{Other}}"
    );
    assert.deepStrictEqual(
        dup.metadata.missingInformation.map((m) => m.placeholder),
        ["{{Role_X}}", "{{Other}}"]
    );
});

test("Generator 13: Arabic Markdown structured prompt parsing and non-nesting (Phase 6.9A)", () => {
    const arabicMd = `### الدور
خبير في تطوير واجهات المستخدم وتجربة المستخدم

### المهمة
بناء لوحة تحكم متجاوبة وتفاعلية باستخدام React وTypeScript

### السياق والقيود
- التقنيات: Next.js 14, Tailwind CSS, TypeScript
- الالتزام بأعلى معايير إمكانية الوصول والتوافق مع الجوال
- دعم الوضع المظلم والفاتح

### صيغة المخرجات
- هيكل المكونات والأنواع
- كود نظيف ومعياري مع توثيق الدوال

### لغة الرد
العربية

### الإرشادات
- تجنب الحشو والترحيبات الإنشائية واطرح الحلول مباشرة`;

    const parsed = parseExistingStructuredPrompt(arabicMd);
    assert.ok(parsed, "parseExistingStructuredPrompt must recognize Arabic Markdown headings");
    assert.strictEqual(parsed.role, "خبير في تطوير واجهات المستخدم وتجربة المستخدم");
    assert.strictEqual(parsed.task, "بناء لوحة تحكم متجاوبة وتفاعلية باستخدام React وTypeScript");
    assert.ok(parsed.context.includes("Next.js 14, Tailwind CSS, TypeScript"));
    assert.ok(parsed.context.includes("دعم الوضع المظلم والفاتح"));
    assert.ok(parsed.outputFormat.includes("هيكل المكونات والأنواع"));
    assert.strictEqual(parsed.language, "Arabic");
    assert.strictEqual(parsed.guidelines, "- تجنب الحشو والترحيبات الإنشائية واطرح الحلول مباشرة");

    // Must not nest into task or duplicate inferred context
    const gen = generatePrompt(arabicMd);
    assert.strictEqual(gen.metadata.userProvided.wasAlreadyStructured, true);
    assert.strictEqual(gen.fields.task, "بناء لوحة تحكم متجاوبة وتفاعلية باستخدام React وTypeScript");
    assert.strictEqual(gen.fields.role, "خبير في تطوير واجهات المستخدم وتجربة المستخدم");
    assert.strictEqual(gen.metadata.genericBestPractices.length, 0);
    assert.strictEqual(gen.metadata.inferred.inferredRole, null);
    assert.strictEqual(gen.metadata.inferred.inferredFormat, null);

    // Also support alternative Arabic labels: الشخصية, الهدف, السياق, التنسيق, المخرجات, اللغة
    const arabicAltMd = `## الشخصية
مهندس ذكاء اصطناعي

## الهدف
تحليل ومعالجة البيانات الضخمة

## السياق
Python, Pandas, PySpark

## التنسيق
سكريبت بايثون مع أمثلة

## اللغة
العربية`;

    const parsedAlt = parseExistingStructuredPrompt(arabicAltMd);
    assert.ok(parsedAlt);
    assert.strictEqual(parsedAlt.role, "مهندس ذكاء اصطناعي");
    assert.strictEqual(parsedAlt.task, "تحليل ومعالجة البيانات الضخمة");
    assert.strictEqual(parsedAlt.context, "Python, Pandas, PySpark");
    assert.strictEqual(parsedAlt.outputFormat, "سكريبت بايثون مع أمثلة");
    assert.strictEqual(parsedAlt.language, "Arabic");
});

test("Generator 14: Colon-labeled structured prompt parsing (English, Arabic, mixed) (Phase 6.9A)", () => {
    // English colon-labeled with multiline bodies
    const englishColon = `Role: Senior Software Engineer and System Architect

Task: Build a secure RESTful API in Go

Context:
- Use Go 1.22 and standard library routing
- Follow clean architecture and hexagonal boundaries
- Enforce strict authentication with JWT

Output:
1. Complete project directory structure
2. Implementation of router and handlers
3. Unit test coverage for core business logic

Response Language: English

Guidelines:
- Never return sensitive credentials or stack traces in error responses`;

    const parsedEn = parseExistingStructuredPrompt(englishColon);
    assert.ok(parsedEn, "parseExistingStructuredPrompt must parse English colon-labeled prompts");
    assert.strictEqual(parsedEn.role, "Senior Software Engineer and System Architect");
    assert.strictEqual(parsedEn.task, "Build a secure RESTful API in Go");
    assert.ok(parsedEn.context.includes("Use Go 1.22 and standard library routing"));
    assert.ok(parsedEn.context.includes("Enforce strict authentication with JWT"));
    assert.ok(parsedEn.outputFormat.includes("Complete project directory structure"));
    assert.strictEqual(parsedEn.language, "English");
    assert.strictEqual(parsedEn.guidelines, "- Never return sensitive credentials or stack traces in error responses");

    const genEn = generatePrompt(englishColon);
    assert.strictEqual(genEn.metadata.userProvided.wasAlreadyStructured, true);
    assert.strictEqual(genEn.fields.task, "Build a secure RESTful API in Go");

    // Arabic colon-labeled with multiline bodies
    const arabicColon = `الدور: مهندس DevOps وبنية تحتية
المهمة: إعداد مسار نشر مستمر باستخدام GitHub Actions
السياق:
- الحاويات: Docker, Kubernetes
- الأمان: فحص الثغرات باستخدام Trivy
المخرجات:
- ملف workflow متكامل بصيغة YAML
- شرح تفصيلي لمتغيرات البيئة
لغة الرد: العربية
الإرشادات:
- تأكد من تشفير كافة الأسرار`;

    const parsedAr = parseExistingStructuredPrompt(arabicColon);
    assert.ok(parsedAr, "parseExistingStructuredPrompt must parse Arabic colon-labeled prompts");
    assert.strictEqual(parsedAr.role, "مهندس DevOps وبنية تحتية");
    assert.strictEqual(parsedAr.task, "إعداد مسار نشر مستمر باستخدام GitHub Actions");
    assert.ok(parsedAr.context.includes("الحاويات: Docker, Kubernetes"));
    assert.ok(parsedAr.outputFormat.includes("ملف workflow متكامل بصيغة YAML"));
    assert.strictEqual(parsedAr.language, "Arabic");
    assert.ok(parsedAr.guidelines?.includes("تأكد من تشفير كافة الأسرار"));

    // Mixed English / Arabic colon-labeled prompt
    const mixedColon = `Role: خبير أمان سيبراني
Task: Review smart contract vulnerabilities
Context:
- Solidity 0.8.20
- OpenZeppelin contracts
Output:
- قائمة الثغرات المصنفة حسب الخطورة
Guidelines:
- Provide PoC exploit scenario for critical findings`;

    const parsedMixed = parseExistingStructuredPrompt(mixedColon);
    assert.ok(parsedMixed, "parseExistingStructuredPrompt must parse mixed English/Arabic colon prompts");
    assert.strictEqual(parsedMixed.role, "خبير أمان سيبراني");
    assert.strictEqual(parsedMixed.task, "Review smart contract vulnerabilities");
    assert.ok(parsedMixed.context.includes("Solidity 0.8.20"));
    assert.ok(parsedMixed.outputFormat.includes("قائمة الثغرات المصنفة حسب الخطورة"));
    assert.ok(parsedMixed.guidelines?.includes("Provide PoC exploit scenario for critical findings"));
});

test("Generator 15: Incomplete and malformed structured prompts resilience (Phase 6.9A)", () => {
    // 1. Single unlabeled line is treated as unstructured, NOT structured
    const singleLine = "Write a python script to scrape news headlines.";
    assert.strictEqual(parseExistingStructuredPrompt(singleLine), null);
    const genSingle = generatePrompt(singleLine);
    assert.strictEqual(genSingle.metadata.userProvided.wasAlreadyStructured, false);

    // 2. Structured prompt missing Role section (Role is empty, not falling over)
    const noRole = `Task: Create an interactive SVG chart
Context: D3.js and TypeScript
Output: Clean standalone component`;
    const parsedNoRole = parseExistingStructuredPrompt(noRole);
    assert.ok(parsedNoRole);
    assert.strictEqual(parsedNoRole.role, "");
    assert.strictEqual(parsedNoRole.task, "Create an interactive SVG chart");
    assert.strictEqual(parsedNoRole.context, "D3.js and TypeScript");
    assert.strictEqual(parsedNoRole.outputFormat, "Clean standalone component");

    // 3. Structured prompt missing Task section (does not consume other sections into Task)
    const noTask = `Role: Senior SRE
Context: AWS EKS with Prometheus
Output: Terraform and Helm configuration`;
    const parsedNoTask = parseExistingStructuredPrompt(noTask);
    assert.ok(parsedNoTask);
    assert.strictEqual(parsedNoTask.role, "Senior SRE");
    assert.strictEqual(parsedNoTask.task, "");
    assert.strictEqual(parsedNoTask.context, "AWS EKS with Prometheus");
    assert.strictEqual(parsedNoTask.outputFormat, "Terraform and Helm configuration");
});

test("Generator 16: Exact preservation of fenced code blocks through end-to-end generatePrompt() (Phase 6.9A)", () => {
    const rawStructuredWithCode = `### Role & Persona
Staff Software Engineer

### Task & Objective
Build a microservice matching this spec:
\`\`\`markdown
### Task & Objective
Nested spec in task
### Context & Constraints
Nested spec context
\`\`\`

### Context & Constraints
- Docker 24, Kubernetes 1.28
- Zero downtime deployments

### Desired Output Format
- Helm values.yaml
- Deployment manifest

### Guidelines & Negative Constraints
- Do not use deprecated APIs`;

    const parsed = parseExistingStructuredPrompt(rawStructuredWithCode);
    assert.ok(parsed);
    assert.ok(parsed.task.includes("Nested spec in task"));
    assert.ok(parsed.task.includes("Nested spec context"));
    assert.ok(parsed.context.includes("Docker 24, Kubernetes 1.28"));
    assert.strictEqual(parsed.guidelines, "- Do not use deprecated APIs");

    const result = generatePrompt(rawStructuredWithCode);
    assert.strictEqual(result.metadata.userProvided.wasAlreadyStructured, true);
    assert.ok(result.fields.task.includes("```markdown\n### Task & Objective\nNested spec in task"));
    assert.ok(result.formattedPrompt.includes("```markdown\n### Task & Objective\nNested spec in task"));
    assert.ok(result.formattedPrompt.includes("### Context & Constraints\n- Docker 24, Kubernetes 1.28"));
    assert.ok(result.formattedPrompt.includes("### Guidelines & Negative Constraints\n- Do not use deprecated APIs"));
});
