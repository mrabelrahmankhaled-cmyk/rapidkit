import test from "node:test";
import assert from "node:assert";
// @ts-ignore - Node 24 native ESM strip types requires explicit extension
import {
    optimizePrompt,
    inferDomain,
    detectRole,
    detectTask,
    detectContext,
    detectFormat,
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
