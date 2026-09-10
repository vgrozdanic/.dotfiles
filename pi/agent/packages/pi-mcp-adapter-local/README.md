# Local Pi MCP Adapter

Lean local fork of [nicobailon/pi-mcp-adapter](https://github.com/nicobailon/pi-mcp-adapter).

## Rule

Never open browser windows or MCP App windows.

- Run MCP tools and return inline results.
- Print OAuth authorization URLs for manual use.
- Reject URL elicitation.
- Ignore MCP App resources and stream metadata.

## Install

```bash
pi install ~/.pi/agent/packages/pi-mcp-adapter-local
```

Remove `npm:pi-mcp-adapter` from Pi settings before loading this package.

## Check

```bash
npm test
npm run typecheck
```

Upstream code remains under MIT license. See `LICENSE`.
