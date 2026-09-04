import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { Agent, JsonlLocalAgentStore } from "@cursor/sdk";
import { readInstalledPackageVersion } from "./helpers/installed-package.js";

const roots: string[] = [];

afterEach(() => {
	for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("installed Cursor SDK local tool restriction contract", () => {
	it.each([
		["no-tools", []],
		["MCP-only", ["mcp"]],
	] as const)("accepts the %s allowlist", async (_label, tools) => {
		expect(readInstalledPackageVersion("@cursor/sdk")).toBe("1.0.27");
		const root = mkdtempSync(join(tmpdir(), "cursor-sdk-tools-contract-"));
		roots.push(root);
		const agent = await Agent.create({
			model: { id: "contract-only-model" },
			tools: [...tools],
			local: {
				cwd: root,
				settingSources: [],
				store: new JsonlLocalAgentStore(join(root, "store")),
			},
		});
		try {
			expect(agent.agentId).toMatch(/^agent-/);
		} finally {
			await agent[Symbol.asyncDispose]();
		}
	});

	it("keeps restrictions caller-supplied and rejects unknown tool names", async () => {
		const root = mkdtempSync(join(tmpdir(), "cursor-sdk-tools-contract-"));
		roots.push(root);
		await expect(Agent.create({
			model: { id: "contract-only-model" },
			tools: ["not-a-real-cursor-tool"],
			local: {
				cwd: root,
				settingSources: [],
				store: new JsonlLocalAgentStore(join(root, "store")),
			},
		})).rejects.toThrow(/Unknown tool name.*Valid tool names:.*mcp/s);

		const declaration = readFileSync(new URL("../node_modules/@cursor/sdk/dist/esm/options.d.ts", import.meta.url), "utf8");
		expect(declaration).toContain("Not persisted on the agent: pass `tools` again on `Agent.resume`");
		expect(declaration).toContain('`[]` — no built-in tools; the model can only respond with text.');
		expect(declaration).toContain('`"mcp"` grants the whole MCP tool family');
	});
});
