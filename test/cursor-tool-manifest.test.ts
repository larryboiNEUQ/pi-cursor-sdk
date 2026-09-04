import { describe, expect, it } from "vitest";
import { buildCursorPrompt } from "../src/context.js";
import {
	buildCursorToolManifestText,
	CURSOR_TOOL_MANIFEST_ENV,
	resolveCursorToolManifestEnabled,
} from "../src/cursor-tool-manifest.js";

describe("cursor-tool-manifest", () => {
	it("builds manifest with bridge tools and host summary", () => {
		const text = buildCursorToolManifestText({
			piBridgeEnabled: true,
			bridgeSnapshot: {
				tools: [
					{
						piToolName: "cursor_ask_question",
						mcpToolName: "pi__cursor_ask_question",
						description: "ask",
						inputSchema: { type: "object" },
						sourceInfo: { source: "extension", path: "test", scope: "temporary", origin: "top-level" },
					},
				],
				mcpToolNameToPiToolName: new Map([["pi__cursor_ask_question", "cursor_ask_question"]]),
				piToolNameToMcpToolName: new Map([["cursor_ask_question", "pi__cursor_ask_question"]]),
			},
		});

		expect(text).toContain("Callable tool surfaces this run:");
		expect(text).toContain("Cursor host/MCP");
		expect(text).toContain("Pi tool toggles affect pi tools/bridge exposure only");
		expect(text).toContain("pi__cursor_ask_question");
		expect(text).toContain("cursor-replay-*");
	});

	it("omits bridge lines when pi bridge guidance is disabled", () => {
		const text = buildCursorToolManifestText({
			includePiBridgeGuidance: false,
			piBridgeEnabled: true,
			bridgeSnapshot: {
				tools: [
					{
						piToolName: "cursor_ask_question",
						mcpToolName: "pi__cursor_ask_question",
						description: "ask",
						inputSchema: { type: "object" },
						sourceInfo: { source: "extension", path: "test", scope: "temporary", origin: "top-level" },
					},
				],
				mcpToolNameToPiToolName: new Map(),
				piToolNameToMcpToolName: new Map(),
			},
		});

		expect(text).toContain("Callable tool surfaces this run:");
		expect(text).toContain("Cursor host/MCP");
		expect(text).toContain("configured MCP depends on Cursor settings");
		expect(text).not.toContain("Pi bridge");
		expect(text).not.toContain("pi__cursor_ask_question");
	});

	it("notes disabled bridge", () => {
		const text = buildCursorToolManifestText({ piBridgeEnabled: false });
		expect(text).toContain("Pi bridge: disabled");
		expect(text).not.toContain("SwitchMode");
	});

	it("distinguishes disabled bridge from empty exposure", () => {
		const disabled = buildCursorToolManifestText({ piBridgeEnabled: false });
		const empty = buildCursorToolManifestText({ piBridgeEnabled: true, bridgeSnapshot: { tools: [], mcpToolNameToPiToolName: new Map(), piToolNameToMcpToolName: new Map() } });
		expect(disabled).toContain("disabled");
		expect(empty).toContain("no pi__* tools exposed");
	});

	it("reports Pi-only as MCP-only with ambient Cursor surfaces disabled", () => {
		const text = buildCursorToolManifestText({
			toolMode: "pi-only",
			piBridgeEnabled: true,
			bridgeSnapshot: {
				tools: [{
					piToolName: "read",
					mcpToolName: "pi__read",
					description: "Read",
					inputSchema: { type: "object" },
					sourceInfo: { source: "builtin", path: "test", scope: "temporary", origin: "top-level" },
				}],
				mcpToolNameToPiToolName: new Map([["pi__read", "read"]]),
				piToolNameToMcpToolName: new Map([["read", "pi__read"]]),
			},
		});
		expect(text).toContain("Cursor host tools: disabled");
		expect(text).toContain("Cursor settings/plugins/configured MCP: disabled");
		expect(text).toContain("Pi bridge: pi__read");
	});

	it("reports no callable fallback when Pi-only bridge exposure is empty", () => {
		const text = buildCursorToolManifestText({
			toolMode: "pi-only",
			piBridgeEnabled: true,
			includePiBridgeGuidance: false,
		});
		expect(text).toContain("Pi bridge: no pi__* tools exposed; no callable tools");
	});

	it("reports none without creating or advertising a Pi bridge surface", () => {
		const text = buildCursorToolManifestText({ toolMode: "none", piBridgeEnabled: true });
		expect(text).toContain("Callable tools: none");
		expect(text).toContain("Cursor host tools: disabled");
		expect(text).toContain("Cursor settings/plugins/configured MCP: disabled");
		expect(text).not.toContain("Pi bridge");
		expect(text).not.toContain("pi__");
	});

	it("defaults manifest env to enabled", () => {
		expect(resolveCursorToolManifestEnabled({})).toBe(true);
		expect(resolveCursorToolManifestEnabled({ [CURSOR_TOOL_MANIFEST_ENV]: "0" })).toBe(false);
	});

	it("includes manifest in bootstrap prompts when provided", () => {
		const manifest = buildCursorToolManifestText();
		const prompt = buildCursorPrompt(
			{ messages: [{ role: "user", content: "hi", timestamp: 1 }] },
			{ toolManifest: manifest },
		);
		expect(prompt.text).toContain("Callable tool surfaces this run:");
		expect(prompt.text).toContain("Cursor SDK tool boundary:");
		expect(prompt.text).toContain("See callable surfaces below.");
	});
});
