import { describe, expect, it } from "vitest";
import { buildCursorLocalToolPolicy } from "../src/cursor-local-tool-mode.js";

describe("Cursor local tool mode policy", () => {
	it("preserves Cursor-owned and ambient surfaces by default", () => {
		expect(buildCursorLocalToolPolicy("cursor", ["all"])).toEqual({
			mode: "cursor",
			settingSources: ["all"],
			createPiBridge: true,
		});
	});

	it("keeps only MCP for a populated Pi bridge and removes ambient settings", () => {
		expect(buildCursorLocalToolPolicy("pi-only", ["all"], true)).toEqual({
			mode: "pi-only",
			tools: ["mcp"],
			settingSources: [],
			createPiBridge: true,
			exposeOverlappingPiBuiltins: true,
		});
	});

	it("fails closed when Pi-only has no callable bridge surface", () => {
		expect(buildCursorLocalToolPolicy("pi-only", ["all"], false)).toEqual({
			mode: "pi-only",
			tools: [],
			settingSources: [],
			createPiBridge: true,
			exposeOverlappingPiBuiltins: true,
		});
	});

	it("disables every tool and avoids creating a Pi bridge in none mode", () => {
		expect(buildCursorLocalToolPolicy("none", ["all"])).toEqual({
			mode: "none",
			tools: [],
			settingSources: [],
			createPiBridge: false,
			exposeOverlappingPiBuiltins: false,
		});
	});
});
