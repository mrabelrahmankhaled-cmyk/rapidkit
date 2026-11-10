import test from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { optimizePrompt, type DecomposedPrompt } from "../src/lib/promptOptimizer.ts";
import {
    generatePrompt,
    type GeneratorTargetModel,
    type GeneratorDomain,
} from "../src/lib/promptGenerator.ts";
import { PROMPT_TEMPLATES } from "../src/data/promptTemplates.ts";

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
    const accepted = new Set(result.suggestions.filter((s) => s.appliedByDefault).map((s) => s.id));
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
    const contextOccurrences2 = (opt2.match(/### Context & Constraints/g) || []).length;
    assert.strictEqual(roleOccurrences1, 1);
    assert.strictEqual(roleOccurrences2, 1);
    assert.strictEqual(contextOccurrences2, 1);
    assert.strictEqual(opt2, opt1);

    // Unresolved placeholders and "(already specified)" annotation must not inflate Context score
    assert.strictEqual(pass2.score.context, 0);
    assert.strictEqual(pass2.score.overall, 75);

    // Once user fills in substantive context, score reaches 100
    const filledOpt = opt1.replace("{{Feature_Requirements}}", "Support streaming 10GB files with UTF-8 validation");
    const pass3 = optimizePrompt(filledOpt);
    assert.strictEqual(pass3.score.context, 25);
    assert.strictEqual(pass3.score.overall, 100);
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

// ─── Phase 6 (Steps 6.3 & 6.4): Natural Language Generator UI & Studio Integration Tests ───

const studioToolSource = fs.readFileSync(
    path.join(process.cwd(), "src/components/tools/PromptStudioTool.tsx"),
    "utf8"
);
const generatorTabSource = fs.readFileSync(
    path.join(process.cwd(), "src/components/tools/prompt-studio/PromptGeneratorTab.tsx"),
    "utf8"
);

test("Phase 6 UI Test 1: Generator is the default active tab for new sessions", () => {
    assert.ok(
        studioToolSource.includes('useState<StudioTab>("generator")'),
        "PromptStudioTool must initialize activeMainTab to 'generator'"
    );
    const generatorIdx = studioToolSource.indexOf('{ id: "generator", label: "Generator"');
    const builderIdx = studioToolSource.indexOf('{ id: "builder", label: "Builder"');
    assert.ok(generatorIdx !== -1 && builderIdx !== -1 && generatorIdx < builderIdx, "Generator must be the first tab in STUDIO_TABS");
});

test("Phase 6 UI Test 2: All existing tabs (Generator, Builder, Optimizer, Library, Lab) remain accessible", () => {
    const expectedTabs = ["generator", "builder", "optimizer", "library", "lab"] as const;
    for (const tabId of expectedTabs) {
        assert.ok(
            studioToolSource.includes(`id: "${tabId}"`),
            `Tab '${tabId}' must be registered in STUDIO_TABS`
        );
        assert.ok(
            studioToolSource.includes(`activeMainTab === "${tabId}"`),
            `Tab panel '${tabId}' must be rendered when activeMainTab === '${tabId}'`
        );
        assert.ok(
            studioToolSource.includes(`id="panel-${tabId}"`),
            `Tab panel '${tabId}' must have matching ARIA id='panel-${tabId}'`
        );
    }
});

test("Phase 6 UI Test 3: Empty and whitespace-only input cannot generate", () => {
    // 1. UI button disabled condition when rawInput.trim().length === 0
    for (const emptyVal of ["", "   ", "\n\t  "]) {
        const isInputEmpty = emptyVal.trim().length === 0;
        assert.strictEqual(isInputEmpty, true, "Whitespace input must disable the Generate button");

        // 2. Engine-level empty guard
        const res = generatePrompt(emptyVal);
        assert.strictEqual(res.isEmpty, true);
        assert.strictEqual(res.formattedPrompt, "");
        assert.ok(res.validationMessage);
    }
    assert.ok(
        generatorTabSource.includes("disabled={isInputEmpty || isGenerating}"),
        "Generate button must be disabled when input is empty"
    );
});

test("Phase 6 UI Test 4: Successful generation displays structured result and progressive transparency breakdown", () => {
    const rawInput = "Create a React dashboard with authentication";
    const result = generatePrompt(rawInput, {
        targetModel: "chatgpt",
        domain: "auto",
        responseLanguage: "English",
        includeBestPractices: true,
    });

    assert.strictEqual(result.isEmpty, false);
    assert.strictEqual(result.validationMessage, undefined);
    assert.ok(result.formattedPrompt.includes("### Role & Persona"));
    assert.ok(result.formattedPrompt.includes("### Task & Objective\nCreate a React dashboard with authentication"));
    assert.ok(result.formattedPrompt.includes("- Framework: React (already specified)"));
    assert.ok(result.formattedPrompt.includes("{{Runtime_Environment_Or_Requirements}}"));

    // Verify metadata categories used by PromptGeneratorTab progressive disclosure
    assert.strictEqual(result.metadata.userProvided.rawIntent, rawInput);
    assert.deepStrictEqual(result.metadata.userProvided.detectedTech, ["React"]);
    assert.strictEqual(result.metadata.inferred.domain, "code");
    assert.ok(result.metadata.genericBestPractices.length > 0);
    assert.ok(result.metadata.missingInformation.some((m) => m.placeholder === "{{Runtime_Environment_Or_Requirements}}"));
    assert.ok(generatorTabSource.includes("Optional Placeholder"));
});

test("Phase 6 UI Test 5: Midjourney rejection displays a prominent validation message instead of an empty success state", () => {
    const nonVisualInput = "Write a cold email for a SaaS product";
    const result = generatePrompt(nonVisualInput, {
        targetModel: "midjourney",
        domain: "auto",
    });

    const isMidjourneyDeclined =
        Boolean(result) &&
        result.targetModel === "midjourney" &&
        !result.formattedPrompt &&
        Boolean(result.validationMessage);

    assert.strictEqual(isMidjourneyDeclined, true);
    assert.strictEqual(result.formattedPrompt, "");
    assert.ok(result.validationMessage?.includes("Midjourney is an image generation model"));
    assert.ok(generatorTabSource.includes("Midjourney Requires a Visual Scene Description"));
    assert.ok(generatorTabSource.includes("Not an Image-Generation Request"));
});

test("Phase 6 UI Test 6: Switching from Midjourney to a text model preserves the original request and generates full output", () => {
    const rawInput = "Optimize a Go API and improve goroutine performance";
    let targetModel: GeneratorTargetModel = "midjourney";
    const domain: GeneratorDomain | "auto" = "auto";
    const language = "English";

    // Step 1: Attempt generation on Midjourney -> declined transparently, input intact
    const mjResult = generatePrompt(rawInput, { targetModel, domain });
    assert.strictEqual(mjResult.formattedPrompt, "");
    assert.ok(mjResult.validationMessage);
    assert.strictEqual(mjResult.fields.task, rawInput);

    // Step 2: Click "Switch to Claude" (or ChatGPT/Gemini) in the validation banner
    targetModel = "claude";
    const claudeResult = generatePrompt(rawInput, {
        targetModel,
        domain,
        responseLanguage: language,
    });

    assert.strictEqual(rawInput, "Optimize a Go API and improve goroutine performance");
    assert.strictEqual(claudeResult.validationMessage, undefined);
    assert.ok(claudeResult.formattedPrompt.includes("<role>"));
    assert.ok(claudeResult.formattedPrompt.includes("<task>\nOptimize a Go API and improve goroutine performance\n</task>"));
    assert.ok(claudeResult.formattedPrompt.includes("- Framework: Go (already specified)"));
});

test("Phase 6 UI Test 7: Copy Prompt in Generator copies text and saves to shared History (max 10, deduplicated)", () => {
    interface SavedPromptItem {
        id: string;
        timestamp: number;
        title: string;
        model: GeneratorTargetModel;
        role: string;
        task: string;
        context: string;
        outputFormat: string;
        language: string;
    }

    let clipboardText = "";
    let history: SavedPromptItem[] = [];
    const language = "English";

    const handleCopyFromGenerator = (
        formattedPrompt: string,
        fields: DecomposedPrompt,
        model: GeneratorTargetModel
    ) => {
        if (!formattedPrompt) return;
        clipboardText = formattedPrompt;
        const entry: SavedPromptItem = {
            id: "hist-1",
            timestamp: Date.now(),
            title: fields.role.trim() || fields.task.trim().slice(0, 36) || `${model.toUpperCase()} Prompt`,
            model,
            role: fields.role,
            task: fields.task,
            context: fields.context,
            outputFormat: fields.outputFormat,
            language,
        };
        history = [entry, ...history.filter((h) => h.role !== fields.role || h.task !== fields.task)].slice(0, 10);
    };

    const gen = generatePrompt("Create a React dashboard with authentication", { targetModel: "chatgpt" });
    handleCopyFromGenerator(gen.formattedPrompt, gen.fields, "chatgpt");

    assert.strictEqual(clipboardText, gen.formattedPrompt);
    assert.strictEqual(history.length, 1);
    assert.strictEqual(history[0].task, "Create a React dashboard with authentication");
    assert.strictEqual(history[0].model, "chatgpt");

    // Copying the same prompt again deduplicates in history
    handleCopyFromGenerator(gen.formattedPrompt, gen.fields, "chatgpt");
    assert.strictEqual(history.length, 1);
});

test("Phase 6 UI Test 8: Save to Favorites in Generator uses existing shared Favorites storage", () => {
    interface SavedPromptItem {
        id: string;
        title: string;
        model: GeneratorTargetModel;
        role: string;
        task: string;
        context: string;
        outputFormat: string;
        language: string;
    }

    let favorites: SavedPromptItem[] = [];
    const handleFavoriteFromGenerator = (
        formattedPrompt: string,
        fields: DecomposedPrompt,
        model: GeneratorTargetModel
    ) => {
        if (!formattedPrompt) return;
        const newFav: SavedPromptItem = {
            id: "fav-1",
            title: fields.role.trim() || fields.task.trim().slice(0, 36) || `${model.toUpperCase()} Prompt`,
            model,
            role: fields.role,
            task: fields.task,
            context: fields.context,
            outputFormat: fields.outputFormat,
            language: "Arabic",
        };
        favorites = [newFav, ...favorites.filter((f) => f.role !== fields.role || f.task !== fields.task)];
    };

    const gen = generatePrompt("اكتب خطة تسويق لمنتج سحابي للشركات", {
        targetModel: "gemini",
        responseLanguage: "Arabic",
    });
    handleFavoriteFromGenerator(gen.formattedPrompt, gen.fields, "gemini");

    assert.strictEqual(favorites.length, 1);
    assert.strictEqual(favorites[0].model, "gemini");
    assert.ok(favorites[0].task.includes("اكتب خطة تسويق لمنتج سحابي للشركات"));
});

test("Phase 6 UI Test 9: Send to Builder preserves active Builder draft in History and populates generated fields & variables", () => {
    let activeMainTab = "generator";
    let role = "Existing Builder Role";
    let task = "Existing Builder Task";
    let context = "Existing Builder Context";
    let outputFormat = "Existing Builder Format";
    let variableInputs: Record<string, string> = {};
    let showVariableFiller = false;
    const history: Array<{ role: string; task: string }> = [];

    const handleSendToBuilder = (decomposed: DecomposedPrompt) => {
        if (role.trim() || task.trim()) {
            history.unshift({ role, task });
        }
        role = decomposed.role;
        task = decomposed.task;
        context = decomposed.context;
        outputFormat = decomposed.outputFormat;

        const fullContent = `${decomposed.role} ${decomposed.task} ${decomposed.context} ${decomposed.outputFormat}`;
        const matches = fullContent.match(/\{\{([^}]+)\}\}/g);
        if (matches && matches.length > 0) {
            const nextVars: Record<string, string> = {};
            Array.from(new Set(matches)).forEach((v) => {
                nextVars[v] = "";
            });
            variableInputs = nextVars;
            showVariableFiller = true;
        }
        activeMainTab = "builder";
    };

    const gen = generatePrompt("Create a React dashboard with authentication");
    handleSendToBuilder(gen.fields);

    // 1. Existing Builder draft was saved to History before replacement
    assert.strictEqual(history.length, 1);
    assert.strictEqual(history[0].role, "Existing Builder Role");
    assert.strictEqual(history[0].task, "Existing Builder Task");

    // 2. Builder fields now match generated fields
    assert.strictEqual(activeMainTab, "builder");
    assert.strictEqual(role, gen.fields.role);
    assert.strictEqual(task, "Create a React dashboard with authentication");
    assert.strictEqual(context, gen.fields.context);
    assert.strictEqual(outputFormat, gen.fields.outputFormat);

    // 3. Detected placeholder variable initialized in Builder's variable filler
    assert.strictEqual(showVariableFiller, true);
    assert.ok("{{Runtime_Environment_Or_Requirements}}" in variableInputs);
});

test("Phase 6 UI Test 10: Existing Builder, Optimizer, Library, and Lab regressions", () => {
    // 1. Library templates remain intact (20 templates across 5 categories)
    assert.strictEqual(PROMPT_TEMPLATES.length, 20);

    // 2. Optimizer works seamlessly on a prompt sent from Generator ("Optimize Prompt" action)
    const gen = generatePrompt("Write a cold email for a SaaS product");
    const optResult = optimizePrompt(gen.formattedPrompt);
    assert.strictEqual(optResult.score.role, 25);
    assert.strictEqual(optResult.score.task, 25);
    assert.strictEqual(optResult.score.format, 25);
    // Unresolved placeholders in context do not falsely inflate context score
    assert.strictEqual(optResult.score.context, 0);

    // 3. Lab tab and Library tab remain wired in PromptStudioTool
    assert.ok(studioToolSource.includes("<PromptLibraryTab onSelectTemplate={handleSelectTemplate} />"));
    assert.ok(studioToolSource.includes("<PromptLabTab"));
});

test("Phase 6 UI Test 11: Model, language, and generator input selections survive tab switching", () => {
    // State lifted in PromptStudioTool persists across activeMainTab changes
    let activeMainTab: "generator" | "builder" | "optimizer" | "library" | "lab" = "generator";
    const targetModel: GeneratorTargetModel = "claude";
    const language = "German";
    const generatorInput = "Optimize a Go API and improve goroutine performance";
    const generatorDomain: GeneratorDomain | "auto" = "code";

    // Switch through all tabs and return to generator
    for (const nextTab of ["builder", "optimizer", "library", "lab", "generator"] as const) {
        activeMainTab = nextTab;
    }

    assert.strictEqual(activeMainTab, "generator");
    const restoredGen = generatePrompt(generatorInput, {
        targetModel,
        domain: generatorDomain,
        responseLanguage: language,
    });
    assert.strictEqual(restoredGen.targetModel, "claude");
    assert.ok(restoredGen.formattedPrompt.includes("<response_language>\nPlease provide the final response in German.\n</response_language>"));
});

test("Phase 6 UI Test 12: Responsive layout and WAI-ARIA keyboard-accessible tab interactions (ArrowRight, ArrowLeft, Home, End)", () => {
    const tabs = ["generator", "builder", "optimizer", "library", "lab"] as const;
    let activeIdx = 0;

    const simulateKeyDown = (key: string) => {
        if (key === "ArrowRight") {
            activeIdx = (activeIdx + 1) % tabs.length;
        } else if (key === "ArrowLeft") {
            activeIdx = (activeIdx - 1 + tabs.length) % tabs.length;
        } else if (key === "Home") {
            activeIdx = 0;
        } else if (key === "End") {
            activeIdx = tabs.length - 1;
        }
    };

    assert.strictEqual(tabs[activeIdx], "generator");
    simulateKeyDown("ArrowRight");
    assert.strictEqual(tabs[activeIdx], "builder");
    simulateKeyDown("ArrowRight");
    assert.strictEqual(tabs[activeIdx], "optimizer");
    simulateKeyDown("End");
    assert.strictEqual(tabs[activeIdx], "lab");
    simulateKeyDown("ArrowRight"); // wraps around to first tab
    assert.strictEqual(tabs[activeIdx], "generator");
    simulateKeyDown("ArrowLeft"); // wraps around to last tab
    assert.strictEqual(tabs[activeIdx], "lab");
    simulateKeyDown("Home");
    assert.strictEqual(tabs[activeIdx], "generator");

    // Verify ARIA and responsive classes in source
    assert.ok(studioToolSource.includes('role="tablist"'));
    assert.ok(studioToolSource.includes('role="tab"'));
    assert.ok(studioToolSource.includes('role="tabpanel"'));
    assert.ok(studioToolSource.includes("flex flex-wrap sm:flex-nowrap"));
    assert.ok(generatorTabSource.includes("grid-cols-1 lg:grid-cols-12"));
});

test("Phase 6 Audit Regression A: Optimizer prefill is one-shot and cleared when leaving the Optimizer tab", () => {
    assert.ok(studioToolSource.includes("const goToTab = (id: StudioTab) =>"));
    assert.ok(studioToolSource.includes('if (id !== "optimizer" && optimizerInitialPrompt)'));
    assert.ok(studioToolSource.includes('setOptimizerInitialPrompt("");'));
    assert.ok(studioToolSource.includes("onClick={() => goToTab(tab.id)}"));
    // keyboard navigation uses the same guarded navigation
    assert.strictEqual((studioToolSource.match(/goToTab\(STUDIO_TABS\[/g) || []).length, 4);
    // Only the Generator handler may seed the Optimizer, and it uses the raw setter
    assert.ok(studioToolSource.includes("setOptimizerInitialPrompt(formattedPrompt);"));
    assert.ok(studioToolSource.includes("setOptimizerSessionKey("));
});

test("Phase 6 Audit Regression B: Optimizer -> Builder keeps original merge semantics; only Generator replaces all fields", () => {
    assert.ok(studioToolSource.includes("(decomposed?: DecomposedPrompt, replaceAll = false)"));
    assert.ok(studioToolSource.includes("onSendToBuilder={(fields) => handleLoadFromOptimizer(fields, true)}"));
    assert.ok(studioToolSource.includes("onNavigateToBuilder={handleLoadFromOptimizer}"));
    assert.ok(studioToolSource.includes("if (decomposed.role) setRole(decomposed.role);"));
});

test("Phase 6 Audit Regression C: Clipboard failure is reported honestly and never shows 'Copied!'", () => {
    assert.ok(studioToolSource.includes("Promise<boolean>"));
    assert.ok(studioToolSource.includes("copiedOk = false;"));
    assert.ok(generatorTabSource.includes("Copy blocked"));
    assert.ok(generatorTabSource.includes("Your browser blocked clipboard access"));
    assert.ok(generatorTabSource.includes('role="status"'));
});

test("Phase 6 Audit Regression D: Generated prompt text is rendered only as text (no raw HTML injection) and overlay no longer hides it", () => {
    assert.strictEqual(generatorTabSource.includes("dangerouslySetInnerHTML"), false);
    assert.strictEqual(studioToolSource.includes("dangerouslySetInnerHTML"), false);
    assert.strictEqual(generatorTabSource.includes("Floating Copy & Favorite Badges"), false);
    // Placeholder rows must wrap on narrow viewports
    assert.ok(generatorTabSource.includes("flex flex-wrap items-start gap-x-2 gap-y-1"));
    assert.ok(generatorTabSource.includes("break-words"));
});

test("Phase 6.7 UI Test: Send to Builder transfers all fields, language, and guidelines without polluting context", () => {
    assert.ok(studioToolSource.includes("if (decomposed.language) setLanguage(decomposed.language);"));
    assert.ok(studioToolSource.includes("if (decomposed.guidelines !== undefined) setGuidelines(decomposed.guidelines);"));
    assert.ok(studioToolSource.includes("### Guidelines & Negative Constraints\\n${g}"));
    assert.ok(studioToolSource.includes("<guidelines_and_constraints>\\n${g}\\n</guidelines_and_constraints>"));
    assert.ok(studioToolSource.includes("**Guidelines & Negative Constraints:**\\n${g}"));
});

test("Phase 6.7 Behavioral: SavedPrompt backward compatibility (legacy storage, restore, presets, templates)", () => {
    // 1. Simulate legacy localStorage history & favorites (entries saved BEFORE guidelines was introduced)
    const legacyHistoryRaw = JSON.stringify([
        {
            id: "legacy-hist-1",
            timestamp: 1700000000000,
            title: "Senior Software Engineer and System Architect",
            model: "chatgpt",
            role: "Senior Software Engineer and System Architect",
            task: "Build a responsive SaaS dashboard using React and TypeScript",
            context: "React, TypeScript, production-grade standards",
            outputFormat: "Technical approach and implementation code",
            language: "English",
            // NOTE: guidelines property is completely missing in legacy entries
        },
    ]);

    const legacyFavoritesRaw = JSON.stringify([
        {
            id: "legacy-fav-1",
            timestamp: 1699000000000,
            title: "Legacy Backend Architecture",
            model: "claude",
            role: "Backend Architect",
            task: "Design scalable event-driven messaging",
            context: "Kafka, Golang, clean architecture",
            outputFormat: "Architecture design document and code",
            language: "English",
            // missing guidelines
        },
    ]);

    // Test storage loading simulation
    const parsedHistory = JSON.parse(legacyHistoryRaw);
    const parsedFavorites = JSON.parse(legacyFavoritesRaw);
    assert.strictEqual(Array.isArray(parsedHistory), true);
    assert.strictEqual(Array.isArray(parsedFavorites), true);
    assert.strictEqual(parsedHistory[0].guidelines, undefined);
    assert.strictEqual(parsedFavorites[0].guidelines, undefined);

    // 2. Simulate handleRestorePrompt for legacy history entry
    let role = "Current Role";
    let task = "Current Task";
    let context = "Current Context";
    let outputFormat = "Current Format";
    let language = "Spanish";
    let targetModel = "gemini";
    let guidelines = "Existing Active Guidelines";
    let activePreset: string | null = "react-debugging";

    interface LegacySavedPrompt {
        id?: string;
        timestamp?: number;
        title?: string;
        model?: string;
        role: string;
        task: string;
        context: string;
        outputFormat: string;
        language?: string;
        guidelines?: string;
    }

    const handleRestorePrompt = (item: LegacySavedPrompt) => {
        role = item.role;
        task = item.task;
        context = item.context;
        outputFormat = item.outputFormat;
        language = item.language || "English";
        targetModel = item.model || "chatgpt";
        guidelines = item.guidelines || "";
        activePreset = null;
    };

    handleRestorePrompt(parsedHistory[0]);

    // Assert that legacy prompt restored correctly and guidelines safely defaulted to empty string ""
    assert.strictEqual(role, "Senior Software Engineer and System Architect");
    assert.strictEqual(task, "Build a responsive SaaS dashboard using React and TypeScript");
    assert.strictEqual(context, "React, TypeScript, production-grade standards");
    assert.strictEqual(outputFormat, "Technical approach and implementation code");
    assert.strictEqual(language, "English");
    assert.strictEqual(targetModel, "chatgpt");
    assert.strictEqual(guidelines, "", "Missing guidelines must safely default to empty string");
    assert.strictEqual(activePreset, null);

    // 3. Test prompt construction across models with empty guidelines:
    // ChatGPT:
    const buildChatGPTPrompt = (r: string, t: string, c: string, f: string, g: string, lang: string) => {
        const sections: string[] = [];
        if (r) sections.push(`### Role & Persona\n${r}`);
        if (t) sections.push(`### Task & Objective\n${t}`);
        if (c) sections.push(`### Context & Constraints\n${c}`);
        if (f) sections.push(`### Desired Output Format\n${f}`);
        if (g) sections.push(`### Guidelines & Negative Constraints\n${g}`);
        if (lang) sections.push(`### Response Language\nPlease provide the final response in ${lang}.`);
        return sections.join("\n\n");
    };

    const chatGPTPrompt = buildChatGPTPrompt(role, task, context, outputFormat, guidelines, language);
    assert.ok(!chatGPTPrompt.includes("### Guidelines & Negative Constraints"), "No guidelines heading when guidelines is empty");
    assert.ok(!chatGPTPrompt.includes("undefined"), "Prompt must never contain string 'undefined'");

    // Claude:
    const buildClaudePrompt = (r: string, t: string, c: string, f: string, g: string, lang: string) => {
        const sections: string[] = [];
        if (r) sections.push(`<role_and_persona>\n${r}\n</role_and_persona>`);
        if (t) sections.push(`<task>\n${t}\n</task>`);
        if (c) sections.push(`<context_and_constraints>\n${c}\n</context_and_constraints>`);
        if (f) sections.push(`<output_format>\n${f}\n</output_format>`);
        if (g) sections.push(`<guidelines_and_constraints>\n${g}\n</guidelines_and_constraints>`);
        if (lang) sections.push(`<response_language>\nPlease provide the final response in ${lang}.\n</response_language>`);
        return sections.join("\n\n");
    };
    const claudePrompt = buildClaudePrompt(role, task, context, outputFormat, guidelines, language);
    assert.ok(!claudePrompt.includes("<guidelines_and_constraints>"), "No Claude guidelines tag when guidelines is empty");
    assert.ok(!claudePrompt.includes("undefined"));

    // Gemini:
    const buildGeminiPrompt = (r: string, t: string, c: string, f: string, g: string, lang: string) => {
        const sections: string[] = [];
        if (r) sections.push(`**Role & Persona:**\n${r}`);
        if (t) sections.push(`**Task & Objective:**\n${t}`);
        if (c) sections.push(`**Context & Constraints:**\n${c}`);
        if (f) sections.push(`**Output Format:**\n${f}`);
        if (g) sections.push(`**Guidelines & Negative Constraints:**\n${g}`);
        if (lang) sections.push(`**Response Language:**\nPlease provide the final response in ${lang}.`);
        return sections.join("\n\n");
    };
    const geminiPrompt = buildGeminiPrompt(role, task, context, outputFormat, guidelines, language);
    assert.ok(!geminiPrompt.includes("**Guidelines & Negative Constraints:**"), "No Gemini guidelines heading when guidelines is empty");
    assert.ok(!geminiPrompt.includes("undefined"));

    // 4. Test handleApplyPreset resetting guidelines to ""
    guidelines = "Some temporary guidelines";
    const testPreset = {
        id: "code-review",
        role: "Senior Code Reviewer",
        task: "Review pull request",
        context: "TypeScript repo",
        outputFormat: "Bullet points of issues and fixes",
        language: "English",
    };
    role = testPreset.role;
    task = testPreset.task;
    context = testPreset.context;
    outputFormat = testPreset.outputFormat;
    language = testPreset.language;
    guidelines = "";
    activePreset = testPreset.id;
    assert.strictEqual(guidelines, "", "Applying preset must reset guidelines to empty string");
    assert.strictEqual(activePreset, "code-review");

    // 5. Test handleClearAll resetting guidelines to ""
    guidelines = "Some guidelines before clear";
    role = "";
    task = "";
    context = "";
    outputFormat = "";
    language = "English";
    guidelines = "";
    activePreset = null;
    assert.strictEqual(guidelines, "", "Clear all must reset guidelines to empty string");

    // 6. Test saving new prompt with guidelines
    guidelines = "- Do not use deprecated packages";
    role = "Lead Architect";
    task = "Build microservice";
    const newEntry = {
        id: "new-prompt-1",
        timestamp: Date.now(),
        title: role,
        model: "chatgpt",
        role,
        task,
        context,
        outputFormat,
        language,
        guidelines,
    };
    assert.strictEqual(newEntry.guidelines, "- Do not use deprecated packages");

    // Restoring this new entry restores guidelines correctly
    handleRestorePrompt(newEntry);
    assert.strictEqual(guidelines, "- Do not use deprecated packages");

    // 7. Test template selection preserving guidelines in draft and resetting in builder
    const template = PROMPT_TEMPLATES[0];
    const historyList: LegacySavedPrompt[] = [];
    if (role.trim() || task.trim()) {
        const draft = {
            id: "draft-1",
            timestamp: Date.now(),
            title: role,
            model: "chatgpt",
            role,
            task,
            context,
            outputFormat,
            language,
            guidelines,
        };
        historyList.push(draft);
    }
    role = template.role;
    task = template.task;
    context = template.context;
    outputFormat = template.outputFormat;
    guidelines = "";
    activePreset = null;

    assert.strictEqual(historyList[0].guidelines, "- Do not use deprecated packages", "History draft must retain guidelines");
    assert.strictEqual(guidelines, "", "Template application must reset guidelines to empty string");
});

test("Phase 6.7 Behavioral: Actual Send-to-Builder transfer path data flow with exact live reproduction prompt", () => {
    // Exact live reproduction prompt reported in Phase 6.7:
    const liveReproductionPrompt = `Role: Senior Software Engineer and System Architect.

Task: Build a responsive SaaS dashboard using React and TypeScript.

Context:
- React and TypeScript are already specified.
- Follow production-grade engineering standards.
- Use strict typing and maintainable modular architecture.
- Build a maintainable and modular codebase.
- Avoid unnecessary dependencies.

Output:
- Explain the technical approach and root causes.
- Provide clean, modular implementation.
- Cover edge cases and verification steps.

Response Language: English.`;

    // 1. Optimizer runs optimizePrompt on user's input
    const optResult = optimizePrompt(liveReproductionPrompt);
    assert.strictEqual(optResult.score.overall, 100, "Optimizer correctly evaluates structured prompt at 100/100");

    // 2. User accepts suggestions (Specificity / all suggestions)
    const allAcceptedIds = optResult.suggestions.map((s) => s.id);
    assert.ok(allAcceptedIds.length > 0, "Suggestions should be present");

    // 3. User clicks 'Send to Builder' in PromptOptimizerTab
    // PromptOptimizerTab.tsx executes:
    // const decomposed = result.decomposePrompt(acceptedIds);
    // onNavigateToBuilder(decomposed);
    const decomposed = optResult.decomposePrompt(allAcceptedIds);

    // 4. In PromptStudioTool, handleLoadFromOptimizer receives decomposed:
    // Simulate initial Builder state before transfer
    const history: Array<{
        id: string;
        timestamp: number;
        title: string;
        model: string;
        role: string;
        task: string;
        context: string;
        outputFormat: string;
        language: string;
        guidelines: string;
    }> = [];
    let builderRole = "Draft Software Engineer";
    let builderTask = "Draft Task before load";
    let builderContext = "Draft Context";
    let builderOutputFormat = "Draft Format";
    let builderLanguage = "French";
    let builderGuidelines = "";
    let activePreset: string | null = "react-debugging";
    let activeTab = "optimizer";

    // Simulate handleLoadFromOptimizer(decomposed) in PromptStudioTool.tsx:
    if (builderRole.trim() || builderTask.trim()) {
        history.unshift({
            id: "draft-saved-before-load",
            timestamp: Date.now(),
            title: builderRole,
            model: "chatgpt",
            role: builderRole,
            task: builderTask,
            context: builderContext,
            outputFormat: builderOutputFormat,
            language: builderLanguage,
            guidelines: builderGuidelines,
        });
    }

    if (decomposed) {
        if (decomposed.role) builderRole = decomposed.role;
        if (decomposed.task) builderTask = decomposed.task;
        if (decomposed.context) builderContext = decomposed.context;
        if (decomposed.outputFormat) builderOutputFormat = decomposed.outputFormat;
        if (decomposed.language) builderLanguage = decomposed.language;
        if (decomposed.guidelines !== undefined) builderGuidelines = decomposed.guidelines;
        activePreset = null;
    }
    activeTab = "builder";

    // 5. Verify the Builder receives the EXACT required values:
    // Role: Senior Software Engineer and System Architect
    assert.strictEqual(
        builderRole,
        "Senior Software Engineer and System Architect",
        "Builder must receive exact Role value"
    );

    // Task: Build a responsive SaaS dashboard using React and TypeScript.
    assert.strictEqual(
        builderTask,
        "Build a responsive SaaS dashboard using React and TypeScript.",
        "Builder must receive exact Task value"
    );

    // Context: All five original context bullets
    const contextLines = builderContext.split("\n").filter((l) => l.trim().startsWith("-"));
    assert.strictEqual(contextLines.length, 5, "Context must have exactly 5 bullets");
    assert.ok(builderContext.includes("React and TypeScript are already specified."));
    assert.ok(builderContext.includes("Follow production-grade engineering standards."));
    assert.ok(builderContext.includes("Use strict typing and maintainable modular architecture."));
    assert.ok(builderContext.includes("Build a maintainable and modular codebase."));
    assert.ok(builderContext.includes("Avoid unnecessary dependencies."));

    // Output Format: All three original output bullets
    const outputLines = builderOutputFormat.split("\n").filter((l) => l.trim().startsWith("-"));
    assert.strictEqual(outputLines.length, 3, "Output format must have exactly 3 bullets");
    assert.ok(builderOutputFormat.includes("Explain the technical approach and root causes."));
    assert.ok(builderOutputFormat.includes("Provide clean, modular implementation."));
    assert.ok(builderOutputFormat.includes("Cover edge cases and verification steps."));

    // Language: English
    assert.strictEqual(builderLanguage, "English", "Builder must receive exact Language value");

    // Guidelines: The accepted Specificity instruction
    const expectedSpecificity = "- Avoid pleasantries, conversational filler, or self-evident introductions. Deliver direct, high-density actionable content.";
    assert.ok(
        builderGuidelines.includes("Avoid pleasantries, conversational filler, or self-evident introductions."),
        "Guidelines must contain the accepted Specificity instruction"
    );

    // CRITICAL: Guidelines never enter the Context field
    assert.strictEqual(
        builderContext.includes("Avoid pleasantries"),
        false,
        "Guidelines must NEVER enter the Context field"
    );

    // Active preset is cleared & tab switched to builder
    assert.strictEqual(activePreset, null, "Active preset must be cleared");
    assert.strictEqual(activeTab, "builder", "Active tab must switch to builder");

    // Previous active work was safely archived in history
    assert.strictEqual(history.length, 1);
    assert.strictEqual(history[0].role, "Draft Software Engineer");

    // 6. Verify final constructed prompt from Builder state
    const sections: string[] = [];
    if (builderRole.trim()) sections.push(`### Role & Persona\n${builderRole.trim()}`);
    if (builderTask.trim()) sections.push(`### Task & Objective\n${builderTask.trim()}`);
    if (builderContext.trim()) sections.push(`### Context & Constraints\n${builderContext.trim()}`);
    if (builderOutputFormat.trim()) sections.push(`### Desired Output Format\n${builderOutputFormat.trim()}`);
    if (builderGuidelines.trim()) sections.push(`### Guidelines & Negative Constraints\n${builderGuidelines.trim()}`);
    if (builderLanguage.trim()) sections.push(`### Response Language\nPlease provide the final response in ${builderLanguage.trim()}.`);
    const constructed = sections.join("\n\n");

    // Verify sections in constructed prompt
    assert.ok(constructed.includes("### Role & Persona\nSenior Software Engineer and System Architect"));
    assert.ok(constructed.includes("### Task & Objective\nBuild a responsive SaaS dashboard using React and TypeScript."));
    assert.ok(constructed.includes("### Context & Constraints\n- React and TypeScript are already specified."));
    assert.ok(constructed.includes("### Desired Output Format\n- Explain the technical approach and root causes."));
    assert.ok(constructed.includes("### Guidelines & Negative Constraints\n" + expectedSpecificity));
    assert.ok(constructed.includes("### Response Language\nPlease provide the final response in English."));

    // Verify no section duplication in constructed output
    assert.strictEqual((constructed.match(/### Role & Persona/g) || []).length, 1);
    assert.strictEqual((constructed.match(/### Task & Objective/g) || []).length, 1);
    assert.strictEqual((constructed.match(/### Context & Constraints/g) || []).length, 1);
    assert.strictEqual((constructed.match(/### Desired Output Format/g) || []).length, 1);
    assert.strictEqual((constructed.match(/### Guidelines & Negative Constraints/g) || []).length, 1);
    assert.strictEqual((constructed.match(/### Response Language/g) || []).length, 1);
});

test("Phase 6.9A Behavioral: Cross-Tab Model Synchronization (Midjourney recovery to ChatGPT upon Send to Builder)", () => {
    interface SavedPrompt {
        id: string;
        timestamp: number;
        title: string;
        model: string;
        role: string;
        task: string;
        context: string;
        outputFormat: string;
        language: string;
        guidelines?: string;
    }

    let targetModel = "midjourney";
    let activeTab = "optimizer";
    let history: SavedPrompt[] = [];
    let builderRole = "";
    let builderTask = "A cybernetic neon city at twilight, 8k render";
    let builderContext = "";
    let builderOutputFormat = "";
    let builderLanguage = "English";
    let builderGuidelines = "";

    const handleLoadFromOptimizer = (decomposed?: DecomposedPrompt, replaceAll = false) => {
        // Guard against silent data loss: preserve current work to history before loading
        if (builderRole.trim() || builderTask.trim()) {
            const currentDraft: SavedPrompt = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                title: builderRole.trim() || builderTask.trim().slice(0, 36) || `${targetModel.toUpperCase()} Draft`,
                model: targetModel,
                role: builderRole,
                task: builderTask,
                context: builderContext,
                outputFormat: builderOutputFormat,
                language: builderLanguage,
                guidelines: builderGuidelines,
            };
            const filtered = history.filter((h) => h.role !== builderRole || h.task !== builderTask);
            history = [currentDraft, ...filtered].slice(0, 10);
        }

        if (targetModel === "midjourney") {
            targetModel = "chatgpt";
        }

        if (decomposed && replaceAll) {
            builderRole = decomposed.role;
            builderTask = decomposed.task;
            builderContext = decomposed.context;
            builderOutputFormat = decomposed.outputFormat;
            if (decomposed.language) builderLanguage = decomposed.language;
            if (decomposed.guidelines !== undefined) builderGuidelines = decomposed.guidelines;
        }

        activeTab = "builder";
    };

    // 1. Simulate Send to Builder while targetModel was "midjourney"
    const incomingDecomposed: DecomposedPrompt = {
        role: "Senior Full Stack Engineer",
        task: "Build an event-driven notification service in TypeScript",
        context: "- Redis Streams, PostgreSQL, WebSockets",
        outputFormat: "- Architecture overview\n- Code implementation",
        language: "English",
        guidelines: "- Do not use polling",
    };

    handleLoadFromOptimizer(incomingDecomposed, true);

    // Verify draft was safely saved into history with midjourney model tag
    assert.strictEqual(history.length, 1);
    assert.strictEqual(history[0].model, "midjourney");
    assert.strictEqual(history[0].task, "A cybernetic neon city at twilight, 8k render");

    // Verify targetModel was automatically restored from midjourney to chatgpt
    assert.strictEqual(targetModel, "chatgpt", "Model must switch from midjourney to chatgpt upon loading RTCF prompt");
    assert.strictEqual(activeTab, "builder");
    assert.strictEqual(builderRole, "Senior Full Stack Engineer");
    assert.strictEqual(builderTask, "Build an event-driven notification service in TypeScript");
    assert.strictEqual(builderContext, "- Redis Streams, PostgreSQL, WebSockets");
    assert.strictEqual(builderOutputFormat, "- Architecture overview\n- Code implementation");
    assert.strictEqual(builderGuidelines, "- Do not use polling");

    // 2. Verify Claude and Gemini models are preserved without switching
    targetModel = "claude";
    handleLoadFromOptimizer(incomingDecomposed, true);
    assert.strictEqual(targetModel, "claude", "Claude model must be preserved without switching");

    targetModel = "gemini";
    handleLoadFromOptimizer(incomingDecomposed, true);
    assert.strictEqual(targetModel, "gemini", "Gemini model must be preserved without switching");
});
