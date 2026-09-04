import type { SettingSource, ToolName } from "@cursor/sdk";
import type { CursorLocalToolMode } from "./cursor-config.js";

export interface CursorLocalToolPolicy {
	mode: CursorLocalToolMode;
	tools?: ToolName[];
	settingSources?: SettingSource[];
	createPiBridge: boolean;
	exposeOverlappingPiBuiltins?: boolean;
}

export function buildCursorLocalToolPolicy(
	mode: CursorLocalToolMode,
	cursorSettingSources: SettingSource[] | undefined,
	piBridgeCallable = false,
): CursorLocalToolPolicy {
	if (mode === "none") {
		return {
			mode,
			tools: [],
			settingSources: [],
			createPiBridge: false,
			exposeOverlappingPiBuiltins: false,
		};
	}
	if (mode === "pi-only") {
		return {
			mode,
			tools: piBridgeCallable ? ["mcp"] : [],
			settingSources: [],
			createPiBridge: true,
			exposeOverlappingPiBuiltins: true,
		};
	}
	return {
		mode,
		settingSources: cursorSettingSources,
		createPiBridge: true,
	};
}
