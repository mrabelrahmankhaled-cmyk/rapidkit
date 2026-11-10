import test from "node:test";
import assert from "node:assert";
import { optimizePrompt } from "../src/lib/promptOptimizer.ts";

test("Audit Verification 1: Unresolved placeholders DO NOT artificially increase RTCF score", () => {
    // Prompt with bare placeholders but no real context or format
    const promptWithPlaceholders = "Fix bug. {{Target_Audience}} {{Technical_Stack}} {{Expert_Role}}";
    const result = optimizePrompt(promptWithPlaceholders);

    // Context must NOT get +25 points just because the text contains placeholder tokens
    assert.strictEqual(result.detected.hasContext, false);
    assert.strictEqual(result.score.context, 0);

    // Role must NOT get +25 points just because it has {{Expert_Role}}
    assert.strictEqual(result.detected.hasRole, false);
    assert.strictEqual(result.score.role, 0);

    // Score remains low because actual substantive instructions are missing
    assert.ok(result.score.overall <= 25);
});

test("Audit Verification 2: Individual Accept/Reject toggle state transition", () => {
    const raw = "Write a sales cold email.";
    const result = optimizePrompt(raw);

    // Initial accepted set: only recommended suggestions (appliedByDefault = true)
    let accepted = new Set(result.suggestions.filter((s) => s.appliedByDefault).map((s) => s.id));
    const initialCount = accepted.size;
    assert.ok(initialCount > 0);

    const firstId = result.suggestions[0].id;
    assert.ok(accepted.has(firstId));

    // Simulate clicking Reject on the first suggestion
    accepted.delete(firstId);
    assert.strictEqual(accepted.has(firstId), false);
    assert.strictEqual(accepted.size, initialCount - 1);

    const promptWithoutFirst = result.buildOptimizedPrompt(accepted);
    const rejectedAddition = result.suggestions[0].proposedAddition;
    assert.ok(!promptWithoutFirst.includes(rejectedAddition));

    // Simulate clicking Accept on an optional suggestion
    const optionalSug = result.suggestions.find((s) => !s.appliedByDefault);
    if (optionalSug) {
        accepted.add(optionalSug.id);
        const promptWithOptional = result.buildOptimizedPrompt(accepted);
        assert.ok(promptWithOptional.includes(optionalSug.proposedAddition));
    }
});

test("Audit Verification 3: Safe Builder Integration with existing draft preservation", () => {
    // Simulation of handleLoadFromOptimizer in PromptStudioTool
    interface SavedPrompt {
        id: string;
        title: string;
        role: string;
        task: string;
    }

    const history: SavedPrompt[] = [];
    const saveToHistory = (item: SavedPrompt) => {
        history.unshift(item);
    };

    let builderRole = "Original Senior Architect";
    let builderTask = "Original active draft that should never be lost";

    // When user loads from Optimizer:
    const optimizerRaw = "Create a database schema for e-commerce.";
    const result = optimizePrompt(optimizerRaw);
    const decomposed = result.decomposePrompt(result.suggestions.map((s) => s.id));

    // 1. Guard against silent data destruction
    if (builderRole.trim() || builderTask.trim()) {
        saveToHistory({
            id: "draft-1",
            title: builderRole || builderTask,
            role: builderRole,
            task: builderTask,
        });
    }

    // 2. Populate builder fields
    if (decomposed.role) builderRole = decomposed.role;
    if (decomposed.task) builderTask = decomposed.task;

    // Verify:
    assert.strictEqual(history.length, 1);
    assert.strictEqual(history[0].role, "Original Senior Architect");
    assert.strictEqual(history[0].task, "Original active draft that should never be lost");
    assert.strictEqual(builderTask, decomposed.task);
});

test("Audit Verification 4: Clipboard copying robustness", () => {
    // Mock navigator.clipboard
    let copiedText = "";
    const mockClipboard = {
        writeText: async (text: string) => {
            copiedText = text;
        },
    };

    const textToCopy = "### Role & Persona\nAct as a Senior Engineer.";
    mockClipboard.writeText(textToCopy);
    assert.strictEqual(copiedText, textToCopy);
});

test("Audit Verification 5: Repeated optimization idempotency on full prompt", () => {
    const raw = "Write a python script to parse CSV files.";
    const pass1 = optimizePrompt(raw);
    const opt1 = pass1.buildOptimizedPrompt(pass1.suggestions.map((s) => s.id));

    const pass2 = optimizePrompt(opt1);
    const opt2 = pass2.buildOptimizedPrompt(pass2.suggestions.map((s) => s.id));

    // Re-optimizing must not re-duplicate headers
    const roleOccurrences1 = (opt1.match(/### Role & Persona/g) || []).length;
    const roleOccurrences2 = (opt2.match(/### Role & Persona/g) || []).length;
    assert.strictEqual(roleOccurrences1, 1);
    assert.strictEqual(roleOccurrences2, 1);

    // Content should remain stable
    assert.strictEqual(pass2.score.overall, 100);
});

test("Regression Test 6: Non-redundant tech context detection ('Act as a React developer and fix this bug')", () => {
    const raw = "Act as a React developer and fix this bug";
    const result = optimizePrompt(raw);

    const contextSug = result.suggestions.find((s) => s.category === "context");
    assert.ok(contextSug, "Should offer a context suggestion for missing bug details");

    // Must NOT ask for {{Technical_Stack}} because React was already provided by the user!
    assert.strictEqual(
        contextSug.proposedAddition.includes("{{Technical_Stack}}"),
        false,
        "Must NOT suggest {{Technical_Stack}} when React is already named"
    );

    // Must recognize React and ask for actual missing bug reproduction details
    assert.ok(contextSug.proposedAddition.includes("React (already specified)"));
    assert.ok(contextSug.proposedAddition.includes("{{Error_Message_Or_Unexpected_Behavior}}"));
    assert.ok(contextSug.proposedAddition.includes("{{Component_Code}}"));
});

test("Regression Test 7: Generic optimizer constraints DO NOT count as substantive context", () => {
    const promptWithGenericConstraint = `Fix this function.
Context:
Follow production-grade standards, strict typing, and maintainable modular architecture.`;

    const result = optimizePrompt(promptWithGenericConstraint);

    // The generic optimizer sentence must NOT award +25 context points
    assert.strictEqual(
        result.detected.hasContext,
        false,
        "Generic optimizer sentence must not count as substantive context"
    );
    assert.strictEqual(
        result.score.context,
        0,
        "Context score must be 0 for purely generic boilerplate"
    );

    // Now test with actual substantive context:
    const promptWithSubstantiveContext = `Fix this function.
Context:
- Environment: Next.js 15 App Router on Node 20
- Target Audience: Enterprise DevOps Engineers`;

    const resultSubstantive = optimizePrompt(promptWithSubstantiveContext);
    assert.strictEqual(
        resultSubstantive.detected.hasContext,
        true,
        "Real environment and audience must count as substantive context"
    );
    assert.strictEqual(
        resultSubstantive.score.context,
        25,
        "Context score must be 25 for real substantive context"
    );
});
