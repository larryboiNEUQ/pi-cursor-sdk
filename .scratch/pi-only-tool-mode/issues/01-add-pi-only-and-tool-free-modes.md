# 01: Add Pi-only and tool-free modes for local Cursor agents

**What to build:** Let operators choose whether a local Cursor-backed model keeps the existing Cursor-owned tool surface, uses only tools supplied by Pi, or runs without tools. The Pi-only mode must remove Cursor host tools and Cursor-configured MCP/plugin tools while retaining active bridgeable Pi tools, including overlapping Pi built-ins, so execution remains visible to Pi and passes through Pi tool hooks such as permission review. Existing users must retain today’s behavior unless they explicitly select a restrictive mode.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] A local tool-mode setting supports `cursor`, `pi-only`, and `none`, with `cursor` as the backward-compatible default.
- [ ] Operators can select the mode persistently in user or trusted-project configuration and override it for one run through documented CLI and environment controls; invalid explicit values fail closed with a useful error.
- [ ] `cursor` preserves the current Cursor host, settings, plugin, configured MCP, and Pi-bridge behavior without adding an SDK tool restriction.
- [ ] `pi-only` disables Cursor host tools, Cursor-configured MCP/plugin tools, and ambient Cursor setting sources while retaining only the per-run Pi bridge and all active bridgeable Pi tools, including names that overlap Cursor host tools.
- [ ] If the Pi bridge is disabled or has no exposed tools, `pi-only` presents no callable tools rather than falling back to a Cursor-owned surface.
- [ ] `none` presents no callable tools and does not create or advertise a Pi bridge surface.
- [ ] Pi-only tool execution emits normal Pi tool-call and tool-result events, remains cancellable, and is demonstrably subject to Pi permission hooks rather than being executed directly by the Cursor SDK.
- [ ] Agent pooling and local resume identity include the effective tool mode and callable surface so an agent created under one mode is never reused under another incompatible mode.
- [ ] Runtime status and `/cursor-tools` clearly report the effective tool mode and distinguish Cursor-owned, ambient MCP, and Pi-bridge availability.
- [ ] Focused tests lock the installed Cursor SDK contract for no-tools and MCP-only restrictions and cover configuration precedence, trusted-project handling, agent create/resume options, bridge exposure, pool replacement, and unchanged cloud behavior.
- [ ] User-facing documentation explains that restrictive modes still use Cursor’s SDK agent loop and system context, so they approximate—but do not become—a raw model API.
- [ ] A local live smoke proves that `pi-only` can complete a harmless Pi read-only tool call without any Cursor-native tool activity, and that `none` completes a text-only turn with no tool activity.
