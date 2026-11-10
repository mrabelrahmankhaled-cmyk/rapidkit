import test from "node:test";
import assert from "node:assert";
import {
    optimizePrompt,
    inferDomain,
    detectContext,
    detectSpecificity,
    detectConstraints
} from "../src/lib/promptOptimizer.ts";

test("Rule 1: Empty prompt handling", () => {
    const result = optimizePrompt("");
    assert.strictEqual(result.normalizedPrompt, "");
    assert.strictEqual(result.score.overall, 0);
    assert.strictEqual(result.suggestions.length, 0);
    assert.strictEqual(result.buildOptimizedPrompt([]), "");
    assert.deepStrictEqual(result.decomposePrompt([]), {
        role: "",
        task: "",
        context: "",
        outputFormat: "",
    });

    const spacesResult = optimizePrompt("    \n\t  ");
    assert.strictEqual(spacesResult.score.overall, 0);
});

test("Rule 2: Short and vague prompt detection", () => {
    const shortResult = optimizePrompt("debug");
    assert.strictEqual(shortResult.detected.inferredDomain, "code");
    assert.strictEqual(shortResult.detected.hasTask, false);
    assert.ok(shortResult.detected.taskClarityIssues.length > 0);
    assert.strictEqual(shortResult.score.task, 0);

    const vagueResult = optimizePrompt("do something");
    assert.strictEqual(vagueResult.detected.hasTask, false);
});

test("Rule 3: Prompt with and without role (Rule A)", () => {
    const withoutRole = optimizePrompt("Write an image compression utility in TypeScript.");
    assert.strictEqual(withoutRole.detected.hasRole, false);
    assert.strictEqual(withoutRole.score.role, 0);
    const roleSug = withoutRole.suggestions.find((s) => s.category === "role");
    assert.ok(roleSug, "Should suggest a role when missing");
    assert.strictEqual(roleSug.proposedAddition, "Act as a Senior Software Engineer and Code Reviewer.");

    // With explicit role
    const withRole = optimizePrompt("Act as a Senior React Engineer. Refactor this hook.");
    assert.strictEqual(withRole.detected.hasRole, true);
    assert.strictEqual(withRole.score.role, 25);
    const noRoleSug = withRole.suggestions.find((s) => s.category === "role");
    assert.strictEqual(noRoleSug, undefined, "Should not suggest a role when already present");
});

test("Rule 4: Prompt with and without context (Rule C)", () => {
    const withoutContext = optimizePrompt("Create a marketing landing page outline.");
    assert.strictEqual(withoutContext.detected.hasContext, false);
    assert.strictEqual(withoutContext.score.context, 0);
    const contextSug = withoutContext.suggestions.find((s) => s.category === "context");
    assert.ok(contextSug, "Should suggest context when missing");
    assert.ok(contextSug.proposedAddition.includes("{{Target_Audience}}"));

    const withContext = optimizePrompt("Create a landing page outline. Target audience: B2B DevOps leaders.");
    assert.strictEqual(withContext.detected.hasContext, true);
    assert.strictEqual(withContext.score.context, 25);
});

test("Rule 5: Prompt with and without format (Rule D)", () => {
    const withoutFormat = optimizePrompt("Explain how vector databases work.");
    assert.strictEqual(withoutFormat.detected.hasFormat, false);
    assert.strictEqual(withoutFormat.score.format, 0);
    const formatSug = withoutFormat.suggestions.find((s) => s.category === "format");
    assert.ok(formatSug, "Should suggest output format when missing");

    const withFormat = optimizePrompt("Explain how vector databases work. Desired Output Format: Step-by-step markdown list.");
    assert.strictEqual(withFormat.detected.hasFormat, true);
    assert.strictEqual(withFormat.score.format, 25);
});

test("Rule 6: Arabic and Unicode input handling", () => {
    const arabicPrompt = "أنت خبير سيو محترف. اكتب خطة تحسين محركات البحث لموقع تجارة إلكترونية. التنسيق: جدول مقارنة.";
    const result = optimizePrompt(arabicPrompt);

    assert.strictEqual(result.detected.hasRole, true);
    assert.strictEqual(result.detected.hasFormat, true);
    assert.strictEqual(result.detected.inferredDomain, "seo");
    assert.ok(result.normalizedPrompt.includes("أنت خبير سيو"));

    // Verify Arabic text preservation in optimized prompt
    const optimized = result.buildOptimizedPrompt(result.suggestions.map((s) => s.id));
    assert.ok(optimized.includes(arabicPrompt));
});

test("Rule 7: Special characters safety ($, \\, quotes, Unicode)", () => {
    const specialPrompt = 'Fix the regex for "$100" and `\\$VAR` in "user_data" with £ and € symbols.';
    const result = optimizePrompt(specialPrompt);

    const acceptedIds = result.suggestions.map((s) => s.id);
    const optimized = result.buildOptimizedPrompt(acceptedIds);

    // Verify verbatim preservation without dollar-replacement or escaping bugs
    assert.ok(optimized.includes('Fix the regex for "$100" and `\\$VAR` in "user_data" with £ and € symbols.'));
});

test("Rule 8: Existing placeholders and repeated variables", () => {
    const templatePrompt = "Build a component for {{Product_Name}} using {{Framework}}. Repeat {{Product_Name}}.";
    const result = optimizePrompt(templatePrompt);

    assert.ok(result.normalizedPrompt.includes("{{Product_Name}}"));
    assert.ok(result.normalizedPrompt.includes("{{Framework}}"));

    const optimized = result.buildOptimizedPrompt(result.suggestions.map((s) => s.id));
    assert.ok(optimized.includes("{{Product_Name}}"));
    assert.ok(optimized.includes("{{Framework}}"));
});

test("Rule 9: Accepting and rejecting individual suggestions", () => {
    const prompt = "Explain database indexing in PostgreSQL.";
    const result = optimizePrompt(prompt);

    assert.ok(result.suggestions.length >= 3);
    const roleSug = result.suggestions.find((s) => s.category === "role")!;
    const formatSug = result.suggestions.find((s) => s.category === "format")!;

    // 1. Accept ONLY role
    const onlyRole = result.buildOptimizedPrompt([roleSug.id]);
    assert.ok(onlyRole.includes("Role & Persona"));
    assert.ok(!onlyRole.includes("Desired Output Format"));

    // 2. Accept ONLY format
    const onlyFormat = result.buildOptimizedPrompt([formatSug.id]);
    assert.ok(!onlyFormat.includes("Role & Persona"));
    assert.ok(onlyFormat.includes("Desired Output Format"));

    // 3. Reject all (empty set) returns original prompt verbatim
    const noneAccepted = result.buildOptimizedPrompt([]);
    assert.strictEqual(noneAccepted.trim(), prompt);
});

test("Rule 10: Accept all suggestions", () => {
    const prompt = "Build an authentication flow.";
    const result = optimizePrompt(prompt);

    const allIds = result.suggestions.map((s) => s.id);
    const fullyOptimized = result.buildOptimizedPrompt(allIds);

    assert.ok(fullyOptimized.includes("Role & Persona"));
    assert.ok(fullyOptimized.includes("Task & Objective"));
    assert.ok(fullyOptimized.includes("Context & Tech Stack"));
    assert.ok(fullyOptimized.includes("Desired Output Format"));
    assert.ok(fullyOptimized.includes(prompt));
});

test("Rule 11: Repeated optimization idempotency", () => {
    const prompt = "Explain Docker containers. Context: For junior DevOps engineers deploying Linux microservices.";
    const result1 = optimizePrompt(prompt);
    const optimizedText = result1.buildOptimizedPrompt(result1.suggestions.map((s) => s.id));

    // Re-optimize the already-optimized text
    const result2 = optimizePrompt(optimizedText);

    // It should detect Role, Context, Format from the structured prompt
    assert.strictEqual(result2.detected.hasRole, true);
    assert.strictEqual(result2.detected.hasContext, true);
    assert.strictEqual(result2.detected.hasFormat, true);
    assert.strictEqual(result2.score.overall, 100);
});

test("Rule 12: Before / After diff accuracy", () => {
    const original = "Write a Python script to scrape a webpage.";
    const result = optimizePrompt(original);

    const diff = result.getDiff(result.suggestions.map((s) => s.id));

    // Unchanged part must contain original text
    const unchangedParts = diff.filter((d) => d.type === "unchanged").map((d) => d.value).join("");
    assert.ok(unchangedParts.includes(original));

    // Added parts must contain new sections
    const addedParts = diff.filter((d) => d.type === "added").map((d) => d.value).join("");
    assert.ok(addedParts.includes("Role & Persona") || addedParts.includes("Desired Output Format"));
});

test("Rule 13: Decompose prompt for Builder integration", () => {
    const prompt = "Write unit tests for checkout flow.";
    const result = optimizePrompt(prompt);
    const decomposed = result.decomposePrompt(result.suggestions.map((s) => s.id));

    assert.ok(decomposed.role.length > 0);
    assert.ok(decomposed.task.includes("Write unit tests for checkout flow."));
    assert.ok(decomposed.context.length > 0);
    assert.ok(decomposed.outputFormat.length > 0);
});

test("Rule 14: Domain detection accuracy", () => {
    assert.strictEqual(inferDomain("Fix React useState infinite loop in TypeScript"), "code");
    assert.strictEqual(inferDomain("Find low-competition keywords for Google ranking"), "seo");
    assert.strictEqual(inferDomain("Draft a cold email sequence to book discovery calls with CTOs"), "sales");
    assert.strictEqual(inferDomain("Create high-converting landing page ad copy"), "marketing");
    assert.strictEqual(inferDomain("Write a short story about exploration"), "writing");
    assert.strictEqual(inferDomain("Tell me about astronomy and planets"), "general");
});

test("Rule 15: Constraint and Specificity suggestions (Rules E & F)", () => {
    const unconstrained = optimizePrompt("Explain quantum computing.");
    assert.strictEqual(detectSpecificity(unconstrained.normalizedPrompt), false);
    assert.strictEqual(detectConstraints(unconstrained.normalizedPrompt), false);

    const specSug = unconstrained.suggestions.find((s) => s.category === "specificity");
    const constraintSug = unconstrained.suggestions.find((s) => s.category === "constraint");

    assert.ok(specSug, "Should offer specificity suggestion");
    assert.strictEqual(specSug.type, "optional");
    assert.strictEqual(specSug.appliedByDefault, false);

    assert.ok(constraintSug, "Should offer constraint guardrail suggestion");
    assert.strictEqual(constraintSug.type, "optional");
    assert.strictEqual(constraintSug.appliedByDefault, false);
});

test("Rule 16: Emojis, multiline markdown, and code blocks preservation", () => {
    const complexPrompt = `### Existing Context 🚀
Here is some sample code:
\`\`\`ts
const x: number = 42;
console.log(x);
\`\`\`
Please review it for memory leaks & security flaws.`;

    const result = optimizePrompt(complexPrompt);
    const optimized = result.buildOptimizedPrompt(result.suggestions.map((s) => s.id));

    assert.ok(optimized.includes("const x: number = 42;"));
    assert.ok(optimized.includes("🚀"));
    assert.ok(optimized.includes("```ts"));
});

test("Rule 17: Phase 1-4 regression & idempotency with RTCF templates", () => {
    const rtcfPrompt = `### Role & Persona
Senior React Specialist

### Task & Objective
Refactor component lifecycle

### Context & Constraints
Targeting Next.js 15 and TypeScript. Target Audience: Senior Frontend Engineers.

### Desired Output Format
Step-by-step diff with verification tests.`;

    const result = optimizePrompt(rtcfPrompt);
    assert.strictEqual(result.detected.hasRole, true);
    assert.strictEqual(result.detected.hasTask, true);
    assert.strictEqual(result.detected.hasContext, true);
    assert.strictEqual(result.detected.hasFormat, true);
    assert.strictEqual(result.score.overall, 100);
});

// ─────────────────────────────────────────────────────────────────────────────
// Phase 6.6: Live Prompt Optimizer Regression Tests
// ─────────────────────────────────────────────────────────────────────────────

test("Phase 6.6 Scenario 1: React + TypeScript recognized as technical context in Context section", () => {
    // Structured Markdown heading format
    const markdownStructured = `### Role & Persona
Senior Software Engineer and System Architect

### Task & Objective
Build a responsive SaaS dashboard using React and TypeScript

### Context & Constraints
React, TypeScript

### Desired Output Format
Technical approach, implementation code, edge cases and verification steps`;

    const mdRes = optimizePrompt(markdownStructured);
    assert.strictEqual(detectContext(markdownStructured).hasContext, true);
    assert.strictEqual(mdRes.detected.hasContext, true);
    assert.strictEqual(mdRes.score.context, 25);
    assert.ok(!mdRes.score.missingElements.some((e) => e.toLowerCase().includes("context")));

    // Labeled key-value format
    const labeledPrompt = `Role: Senior Software Engineer and System Architect
Task: Build a responsive SaaS dashboard using React and TypeScript
Context: React, TypeScript
Output Format: Technical approach, implementation code, edge cases and verification steps`;

    const labeledRes = optimizePrompt(labeledPrompt);
    assert.strictEqual(detectContext(labeledPrompt).hasContext, true);
    assert.strictEqual(labeledRes.detected.hasContext, true);
    assert.strictEqual(labeledRes.score.context, 25);
    assert.ok(!labeledRes.score.missingElements.some((e) => e.toLowerCase().includes("context")));
});

test("Phase 6.6 Scenario 2: Existing production constraints recognized and not ignored", () => {
    // Real user architectural constraints in Context section
    const promptWithConstraints = `### Role & Persona
System Architect

### Task & Objective
Design the frontend state architecture

### Context & Constraints
Production-grade standards, strict typing, maintainable modular architecture

### Desired Output Format
Architecture diagram and component hierarchy`;

    const res = optimizePrompt(promptWithConstraints);
    assert.strictEqual(res.detected.hasContext, true);
    assert.strictEqual(res.score.context, 25);
    assert.ok(!res.score.missingElements.some((e) => e.toLowerCase().includes("context")));

    // Live prompt containing both technologies and production constraints
    const livePrompt = `### Role & Persona
Senior Software Engineer and System Architect

### Task & Objective
Build a responsive SaaS dashboard using React and TypeScript

### Context & Constraints
React, TypeScript, production-grade standards, strict typing, maintainable modular architecture

### Desired Output Format
Technical approach, implementation code, edge cases and verification steps`;

    const liveRes = optimizePrompt(livePrompt);
    assert.strictEqual(liveRes.score.overall, 100);
    assert.strictEqual(liveRes.score.context, 25);
    assert.strictEqual(liveRes.score.missingElements.length, 0);
});

test("Phase 6.6 Scenario 3: Existing placeholders do not produce semantically duplicate placeholders", () => {
    // Prompt with {{Runtime_Environment_Or_Requirements}} already present
    const promptWithPlaceholder = `### Role & Persona
Senior Software Engineer

### Task & Objective
Build a dashboard component

### Context & Constraints
- Framework: React (already specified)
- Key Constraints: {{Runtime_Environment_Or_Requirements}}

### Desired Output Format
Clean implementation code`;

    const res = optimizePrompt(promptWithPlaceholder);
    const contextSug = res.suggestions.find((s) => s.category === "context");

    // Must NOT suggest duplicate {{Feature_Requirements}} or {{Runtime_Environment}}
    if (contextSug) {
        assert.ok(!contextSug.proposedAddition.includes("{{Runtime_Environment}}"));
        assert.ok(!contextSug.proposedAddition.includes("{{Feature_Requirements}}"));
    }
});

test("Phase 6.6 Scenario 4: Accepting a suggestion visibly modifies the optimized prompt in buildOptimizedPrompt()", () => {
    const promptMissingContext = `### Role & Persona
Senior Software Engineer

### Task & Objective
Build a dashboard component

### Context & Constraints
React

### Desired Output Format
Clean implementation code`;

    const res = optimizePrompt(promptMissingContext);
    const specSug = res.suggestions.find((s) => s.category === "specificity")!;
    assert.ok(specSug, "Should have specificity suggestion");

    // Before accepting: specificity text not present
    const promptBefore = res.buildOptimizedPrompt([]);
    assert.ok(!promptBefore.includes(specSug.proposedAddition));

    // After accepting: specificity text visibly inserted in Guidelines
    const promptAfter = res.buildOptimizedPrompt([specSug.id]);
    assert.ok(promptAfter.includes(specSug.proposedAddition));
    assert.ok(promptAfter.includes("### Guidelines & Negative Constraints"));
});

test("Phase 6.6 Scenario 5: Rejecting a suggestion removes its contribution and preserves original prompt", () => {
    const rawPrompt = "Build a responsive dashboard using React.";
    const res = optimizePrompt(rawPrompt);
    assert.ok(res.suggestions.length > 0);

    // Reject all (empty set of accepted IDs)
    const rejectedAll = res.buildOptimizedPrompt([]);
    assert.strictEqual(rejectedAll.trim(), rawPrompt.trim());

    // Accept only role, reject all others
    const roleSug = res.suggestions.find((s) => s.category === "role")!;
    const onlyRole = res.buildOptimizedPrompt([roleSug.id]);
    assert.ok(onlyRole.includes(roleSug.proposedAddition));
    assert.ok(!onlyRole.includes("Desired Output Format"));
});

test("Phase 6.6 Scenario 6: Accept All applies all eligible suggestions exactly once", () => {
    const rawPrompt = "Build a responsive SaaS dashboard.";
    const res = optimizePrompt(rawPrompt);
    const allIds = res.suggestions.map((s) => s.id);
    const acceptedAll = res.buildOptimizedPrompt(allIds);

    // Every accepted suggestion's addition must appear
    for (const sug of res.suggestions) {
        assert.ok(acceptedAll.includes(sug.proposedAddition), `Missing suggestion: ${sug.id}`);
    }

    // Verify no duplicated headings
    const roleHeaders = acceptedAll.match(/### Role & Persona/g) || [];
    assert.strictEqual(roleHeaders.length, 1);

    const taskHeaders = acceptedAll.match(/### Task & Objective/g) || [];
    assert.strictEqual(taskHeaders.length, 1);
});

test("Phase 6.6 Scenario 7: Reset restores the default recommended state", () => {
    const rawPrompt = "Explain database indexing in PostgreSQL.";
    const res = optimizePrompt(rawPrompt);

    const defaultRecommendedIds = res.suggestions
        .filter((s) => s.appliedByDefault)
        .map((s) => s.id);

    // Verify recommended baseline
    const baselinePrompt = res.buildOptimizedPrompt(defaultRecommendedIds);
    assert.ok(baselinePrompt.includes("Role & Persona"));
    assert.ok(baselinePrompt.includes("Desired Output Format"));

    // User accepts an optional constraint
    const optionalSug = res.suggestions.find((s) => !s.appliedByDefault);
    if (optionalSug) {
        const withOptional = res.buildOptimizedPrompt([...defaultRecommendedIds, optionalSug.id]);
        assert.ok(withOptional.includes(optionalSug.proposedAddition));

        // Reset back to defaultRecommendedIds
        const resetPrompt = res.buildOptimizedPrompt(defaultRecommendedIds);
        assert.ok(!resetPrompt.includes(optionalSug.proposedAddition));
        assert.strictEqual(resetPrompt, baselinePrompt);
    }
});

test("Phase 6.6 Scenario 8: Copy output uses the currently accepted optimized prompt and decomposes correctly", () => {
    const prompt = `### Role & Persona
Full-Stack Engineer

### Task & Objective
Create an API endpoint

### Context & Constraints
Express and TypeScript

### Desired Output Format
Code snippet and test case`;

    const res = optimizePrompt(prompt);
    const specSug = res.suggestions.find((s) => s.category === "specificity");
    const acceptedIds = specSug ? [specSug.id] : [];

    const currentOutput = res.buildOptimizedPrompt(acceptedIds);
    const decomposed = res.decomposePrompt(acceptedIds);

    assert.strictEqual(decomposed.role.trim(), "Full-Stack Engineer");
    assert.strictEqual(decomposed.task.trim(), "Create an API endpoint");
    assert.ok(decomposed.context.includes("Express and TypeScript"));
    assert.ok(decomposed.outputFormat.includes("Code snippet and test case"));

    if (specSug) {
        assert.ok(currentOutput.includes(specSug.proposedAddition));
    }
});

test("Phase 6.6 Scenario 9: Repeated optimization does not duplicate sections or placeholders (idempotency)", () => {
    const initialPrompt = `### Role & Persona
Senior Software Engineer and System Architect

### Task & Objective
Build a responsive SaaS dashboard using React and TypeScript

### Context & Constraints
React, TypeScript, production-grade standards, strict typing, maintainable modular architecture

### Desired Output Format
Technical approach, implementation code, edge cases and verification steps`;

    // First optimization pass
    const pass1 = optimizePrompt(initialPrompt);
    const allIdsPass1 = pass1.suggestions.map((s) => s.id);
    const opt1 = pass1.buildOptimizedPrompt(allIdsPass1);

    // Second optimization pass on the output of pass 1
    const pass2 = optimizePrompt(opt1);
    const allIdsPass2 = pass2.suggestions.map((s) => s.id);
    const opt2 = pass2.buildOptimizedPrompt(allIdsPass2);

    // Must be completely idempotent
    assert.strictEqual(opt2, opt1);
    assert.strictEqual(pass2.score.overall, 100);
});

test("Phase 6.6 Scenario 10: Existing Arabic and English optimizer tests continue passing", () => {
    const arabicPrompt = `### الدور
خبير معماري برمجيات أول

### الهدف
بناء لوحة تحكم سحابية متجاوبة باستخدام React و TypeScript

### السياق والقيود
React، TypeScript، معايير الإنتاج، أمان الأنواع، بنية معمارية نظيفة

### المخرجات
النهج التقني، كود التنفيذ، حالات الحافة واختبارات التحقق`;

    const arabicRes = optimizePrompt(arabicPrompt);
    assert.strictEqual(arabicRes.detected.hasRole, true);
    assert.strictEqual(arabicRes.detected.hasTask, true);
    assert.strictEqual(arabicRes.detected.hasContext, true);
    assert.strictEqual(arabicRes.detected.hasFormat, true);
    assert.strictEqual(arabicRes.score.overall, 100);

    const arabicOpt = arabicRes.buildOptimizedPrompt(arabicRes.suggestions.map((s) => s.id));
    assert.ok(arabicOpt.includes("خبير معماري برمجيات أول"));
    assert.ok(arabicOpt.includes("React، TypeScript"));
});

test("Phase 6.6 Scenario 11: Arabic Markdown role and context heading variants", () => {
    // Test ### الدور والشخصية and ### السياق
    const arabicVariant1 = `### الدور والشخصية
مهندس حلول سحابية أول

### الهدف
تصميم بنية تحتية سحابية قابلة للتوسع

### السياق
AWS، Kubernetes، Terraform، بنية معمارية موزعة

### صيغة المخرجات
مخطط معماري وكود إعداد البنية التحتية`;

    const res1 = optimizePrompt(arabicVariant1);
    assert.strictEqual(res1.detected.hasRole, true);
    assert.strictEqual(res1.detected.hasContext, true);
    assert.strictEqual(res1.score.context, 25);
    assert.strictEqual(res1.score.overall, 100);

    // Test ### الخلفية
    const arabicVariant2 = `### الدور
مطور برمجيات خبير

### المهمة
إصلاح مشكلة استهلاك الذاكرة

### الخلفية
Node.js، Express، أمان الأنواع

### التنسيق
خطوات الإصلاح وكود التحقق`;

    const res2 = optimizePrompt(arabicVariant2);
    assert.strictEqual(res2.detected.hasRole, true);
    assert.strictEqual(res2.detected.hasContext, true);
    assert.strictEqual(res2.score.context, 25);
});

test("Phase 6.6 Scenario 12: Colon-based role and context labels with same-line and multiline content", () => {
    // English multiline labeled prompt with multiple subsequent fields
    const englishLabeledMultiline = `Role: Senior Software Engineer and System Architect
Task: Build a responsive SaaS dashboard using React and TypeScript
Context: React, TypeScript
Target audience: B2B enterprise users
Production-grade standards, strict typing, maintainable modular architecture
Output Format: Technical approach, implementation code, edge cases and verification steps`;

    const resEn = optimizePrompt(englishLabeledMultiline);
    assert.strictEqual(resEn.detected.hasRole, true);
    assert.strictEqual(resEn.detected.hasContext, true);
    assert.strictEqual(resEn.detected.hasFormat, true);
    assert.strictEqual(resEn.score.context, 25);
    assert.strictEqual(resEn.score.overall, 100);

    // Arabic colon-based labeled prompt with same-line and subsequent fields
    const arabicLabeledSameLine = `الدور: خبير سيو محترف
المهمة: تحسين الترتيب في محركات البحث
السياق: موقع تجارة إلكترونية، ميزانية إعلانية محدودة، التركيز على الكلمات المفتاحية
التنسيق: جدول مقارنة وخطة تنفيذ`;

    const resAr = optimizePrompt(arabicLabeledSameLine);
    assert.strictEqual(resAr.detected.hasRole, true);
    assert.strictEqual(resAr.detected.hasContext, true);
    assert.strictEqual(resAr.detected.hasFormat, true);
    assert.strictEqual(resAr.score.context, 25);
    assert.strictEqual(resAr.score.overall, 100);
});

test("Phase 6.6 Scenario 13: Section boundary protection prevents consuming subsequent labeled fields", () => {
    const prompt = `Role: Principal Architect
Task: Build payment microservice
Context: Go, Docker, Kubernetes
Output Format: Clean code with unit tests`;

    const res = optimizePrompt(prompt);
    assert.strictEqual(res.detected.hasContext, true);
    // Ensure "Output Format" was not swallowed into context
    assert.strictEqual(res.detected.hasFormat, true);
    assert.strictEqual(res.score.format, 25);

    // Decompose must extract each field separately without leakage
    const decomposed = res.decomposePrompt([]);
    assert.strictEqual(decomposed.outputFormat, ""); // was not accepted yet
    assert.ok(!decomposed.context.includes("Output Format"));
});

test("Phase 6.6 Scenario 14: No false positives from generic boilerplate or unresolved placeholders", () => {
    // Context section containing only unresolved placeholder
    const placeholderOnlyPrompt = `### Role & Persona
Senior Engineer

### Task & Objective
Build a dashboard

### Context & Constraints
{{Runtime_Environment_Or_Requirements}}

### Desired Output Format
Code snippet`;

    const resPlaceholder = optimizePrompt(placeholderOnlyPrompt);
    assert.strictEqual(resPlaceholder.detected.hasContext, false);
    assert.strictEqual(resPlaceholder.score.context, 0);

    // Context section containing only generic optimizer boilerplate
    const boilerplateOnlyPrompt = `### Role & Persona
Senior Engineer

### Task & Objective
Build a dashboard

### Context & Constraints
Follow production-grade standards, strict typing, and maintainable modular architecture.

### Desired Output Format
Code snippet`;

    const resBoilerplate = optimizePrompt(boilerplateOnlyPrompt);
    assert.strictEqual(resBoilerplate.detected.hasContext, false);
    assert.strictEqual(resBoilerplate.score.context, 0);

    // Same test for Arabic generic boilerplate
    const arabicBoilerplatePrompt = `### الدور
خبير برمجيات

### الهدف
بناء نظام دفع

### السياق والقيود
اتبع أفضل ممارسات كتابة الكود المنظم ومعالجة الأخطاء بوضوح، ولا تفترض وجود مكتبات أو واجهات غير موثقة.

### المخرجات
كود`;

    const resArBoilerplate = optimizePrompt(arabicBoilerplatePrompt);
    assert.strictEqual(resArBoilerplate.detected.hasContext, false);
    assert.strictEqual(resArBoilerplate.score.context, 0);
});

test("Phase 6.6 Scenario 15: Existing Role content preservation, empty role, idempotency, and section protection", () => {
    // 1. Existing Role content survives accepting a role suggestion
    const promptWithRoleContent = `### Role & Persona
Senior Software Engineer and System Architect

### Task & Objective
Build a responsive SaaS dashboard

### Context & Constraints
React, TypeScript

### Desired Output Format
Technical approach and implementation code`;

    const res1 = optimizePrompt(promptWithRoleContent);
    // Inject a role suggestion into res1 to test buildOptimizedPrompt role insertion
    res1.suggestions.push({
        id: "role-definition",
        category: "role",
        title: "Define Expert Persona",
        explanation: "Test role suggestion",
        proposedAddition: "Act as a Lead Systems Architect.",
        type: "recommended",
        appliedByDefault: true,
        targetField: "role",
    });

    const optWithRole = res1.buildOptimizedPrompt(["role-definition"]);
    // Original description preserved
    assert.ok(optWithRole.includes("Senior Software Engineer and System Architect"));
    // Accepted suggestion appended
    assert.ok(optWithRole.includes("Act as a Lead Systems Architect."));
    // Heading preserved
    assert.ok(optWithRole.includes("### Role & Persona"));
    // Unrelated sections unchanged
    assert.ok(optWithRole.includes("Build a responsive SaaS dashboard"));
    assert.ok(optWithRole.includes("React, TypeScript"));

    // 2. Empty Role section receives the suggestion
    const promptEmptyRole = `### Role & Persona

### Task & Objective
Build a dashboard

### Context & Constraints
React, TypeScript

### Desired Output Format
Code`;

    const resEmpty = optimizePrompt(promptEmptyRole);
    const roleSug = resEmpty.suggestions.find((s) => s.category === "role");
    assert.ok(roleSug, "Should suggest role for empty role section");
    const optEmpty = resEmpty.buildOptimizedPrompt([roleSug.id]);
    assert.ok(optEmpty.includes(roleSug.proposedAddition));
    assert.ok(optEmpty.includes("### Role & Persona\n" + roleSug.proposedAddition));

    // 3. Already-present suggestions are not duplicated
    const optAgain = resEmpty.buildOptimizedPrompt([roleSug.id]);
    const matches = optAgain.match(new RegExp(roleSug.proposedAddition.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || [];
    assert.strictEqual(matches.length, 1);

    // 4. Repeated optimization does not duplicate role content
    const reOptResult = optimizePrompt(optWithRole);
    const reOpt = reOptResult.buildOptimizedPrompt(reOptResult.suggestions.map((s) => s.id));
    assert.ok(reOpt.includes("Senior Software Engineer and System Architect"));
    assert.ok(reOpt.includes("Act as a Lead Systems Architect."));
    const repeatedRoleMatches = reOpt.match(/Act as a Lead Systems Architect\./g) || [];
    assert.strictEqual(repeatedRoleMatches.length, 1);
});

test("Phase 6.6 Scenario 16: decomposePrompt unstructured fallback, Arabic headings, and role preservation", () => {
    // 1. Unstructured English prompt containing `Act as a Senior Software Engineer` — decomposePrompt([]).role must not become empty
    const unstructuredEnglish = "Act as a Senior Software Engineer. Build a responsive SaaS dashboard using React and TypeScript.";
    const resEn = optimizePrompt(unstructuredEnglish);
    const decomposedEn = resEn.decomposePrompt([]);
    assert.ok(decomposedEn.role.length > 0, "decomposePrompt([]).role must not be empty for unstructured English prompt");
    assert.ok(decomposedEn.role.includes("Senior Software Engineer"), "Must contain the detected role text");
    assert.strictEqual(decomposedEn.task, unstructuredEnglish, "Original task text must be preserved");

    // Also verify when suggestions are accepted on unstructured prompt, role fallback is still preserved if no role suggestion exists
    const allEnSugIds = resEn.suggestions.map((s) => s.id);
    const decomposedEnWithSugs = resEn.decomposePrompt(allEnSugIds);
    assert.ok(decomposedEnWithSugs.role.length > 0, "Role must still be preserved when other suggestions are accepted");
    assert.ok(decomposedEnWithSugs.role.includes("Senior Software Engineer"));

    // 2. Unstructured Arabic prompt containing a recognizable role description — preserve the detected role
    const unstructuredArabic = "أنت خبير سيو محترف. اكتب خطة تحسين محركات البحث لموقع تجارة إلكترونية.";
    const resAr = optimizePrompt(unstructuredArabic);
    const decomposedAr = resAr.decomposePrompt([]);
    assert.ok(decomposedAr.role.length > 0, "decomposePrompt([]).role must not be empty for unstructured Arabic prompt");
    assert.ok(decomposedAr.role.includes("خبير سيو"), "Must preserve detected Arabic role");
    assert.strictEqual(decomposedAr.task, unstructuredArabic, "Arabic task text must be preserved");

    // 3. Markdown prompt using `### المهمة` and `### التنسيق` — correctly extract task and outputFormat
    const arabicMarkdownTaskFormat = `### الدور
مهندس برمجيات متقدم

### المهمة
بناء لوحة تحكم متجاوبة باستخدام رياكت

### السياق والقيود
React 19, TypeScript, Tailwind CSS

### التنسيق
كود نظيف مع شرح تفصيلي وخطوات التحقق`;

    const resArTaskFormat = optimizePrompt(arabicMarkdownTaskFormat);
    const decomposedArTaskFormat = resArTaskFormat.decomposePrompt([]);
    assert.strictEqual(decomposedArTaskFormat.role, "مهندس برمجيات متقدم");
    assert.strictEqual(decomposedArTaskFormat.task, "بناء لوحة تحكم متجاوبة باستخدام رياكت");
    assert.strictEqual(decomposedArTaskFormat.context, "React 19, TypeScript, Tailwind CSS");
    assert.strictEqual(decomposedArTaskFormat.outputFormat, "كود نظيف مع شرح تفصيلي وخطوات التحقق");

    // 4. Markdown prompt using `### الشخصية` — correctly extract role
    const arabicMarkdownPersona = `### الشخصية
خبير أمان سيبراني ومراجع كود

### الهدف
فحص نقاط الضعف في نقطة نهاية المصادقة

### الخلفية
Node.js, Express, JWT

### صيغة المخرجات
تقرير أمني مفصل مع توصيات للمعالجة`;

    const resArPersona = optimizePrompt(arabicMarkdownPersona);
    const decomposedArPersona = resArPersona.decomposePrompt([]);
    assert.strictEqual(decomposedArPersona.role, "خبير أمان سيبراني ومراجع كود");
    assert.strictEqual(decomposedArPersona.task, "فحص نقاط الضعف في نقطة نهاية المصادقة");
    assert.strictEqual(decomposedArPersona.context, "Node.js, Express, JWT");
    assert.strictEqual(decomposedArPersona.outputFormat, "تقرير أمني مفصل مع توصيات للمعالجة");

    // 5. Existing English and Arabic structured prompts continue passing
    const englishStructured = `### Role & Persona
Principal Distributed Systems Architect

### Task & Objective
Design an event-driven payment ledger

### Context & Constraints
Go, Kafka, PostgreSQL, high-throughput financial workload

### Desired Output Format
Technical architecture document with data flow diagrams`;

    const resEnStruct = optimizePrompt(englishStructured);
    const decomposedEnStruct = resEnStruct.decomposePrompt([]);
    assert.strictEqual(decomposedEnStruct.role, "Principal Distributed Systems Architect");
    assert.strictEqual(decomposedEnStruct.task, "Design an event-driven payment ledger");
    assert.strictEqual(decomposedEnStruct.context, "Go, Kafka, PostgreSQL, high-throughput financial workload");
    assert.strictEqual(decomposedEnStruct.outputFormat, "Technical architecture document with data flow diagrams");

    // Arabic structured prompt with combined headers
    const arabicStructuredCombined = `### الدور والشخصية
خبير تجربة مستخدم ومصمم واجهات

### الهدف
إعادة تصميم مسار الدفع في المتجر

### السياق والقيود
Next.js, Tailwind CSS, تصميم متجاوب للهواتف

### المخرجات
قائمة بالتحسينات ونماذج برمجية`;

    const resArStruct = optimizePrompt(arabicStructuredCombined);
    const decomposedArStruct = resArStruct.decomposePrompt([]);
    assert.strictEqual(decomposedArStruct.role, "خبير تجربة مستخدم ومصمم واجهات");
    assert.strictEqual(decomposedArStruct.task, "إعادة تصميم مسار الدفع في المتجر");
    assert.strictEqual(decomposedArStruct.context, "Next.js, Tailwind CSS, تصميم متجاوب للهواتف");
    assert.strictEqual(decomposedArStruct.outputFormat, "قائمة بالتحسينات ونماذج برمجية");

    // 6. Previously fixed Role content-preservation behavior remains intact
    const promptRolePreserve = `### Role & Persona
Senior Software Engineer and System Architect

### Task & Objective
Build a responsive SaaS dashboard

### Context & Constraints
React, TypeScript

### Desired Output Format
Technical approach and implementation code`;

    const resRolePreserve = optimizePrompt(promptRolePreserve);
    resRolePreserve.suggestions.push({
        id: "role-definition-test",
        category: "role",
        title: "Define Expert Persona",
        explanation: "Test suggestion",
        proposedAddition: "Act as a Lead Systems Architect.",
        type: "recommended",
        appliedByDefault: true,
        targetField: "role",
    });

    const optWithRole = resRolePreserve.buildOptimizedPrompt(["role-definition-test"]);
    assert.ok(optWithRole.includes("Senior Software Engineer and System Architect"), "Original role preserved in optimized prompt");
    assert.ok(optWithRole.includes("Act as a Lead Systems Architect."), "New role addition appended");

    const decomposedWithRole = resRolePreserve.decomposePrompt(["role-definition-test"]);
    assert.ok(decomposedWithRole.role.includes("Senior Software Engineer and System Architect"), "Original role preserved in decomposePrompt");
    assert.ok(decomposedWithRole.role.includes("Lead Systems Architect"), "New role addition present in decomposePrompt");
});
