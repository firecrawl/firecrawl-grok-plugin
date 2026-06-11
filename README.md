# Firecrawl Plugin for Grok Build

Turn any website into clean, LLM-ready markdown or structured data — directly from Grok Build.

This plugin bundles Firecrawl's hosted [MCP server](https://github.com/firecrawl/firecrawl-mcp-server) plus a set of skills, giving Grok Build the ability to scrape, search, crawl, map, extract, and monitor the web. Installing the plugin wires up the MCP automatically — the first web action signs you in through your browser, with no API key to paste.

**The hosted MCP is the primary way this plugin works** — its native `firecrawl_*` tools are the default execution path for every web operation. The [Firecrawl CLI](https://github.com/firecrawl/cli) is an optional fallback, used only when the MCP is unavailable or for local-file workflows (`download`/`parse`) that a remote server can't perform.

## Features

- **Search** - Web search with optional scraping of results (supports web, news, and image sources)
- **Scrape** - Extract clean markdown content from any webpage, with JavaScript rendering
- **Map** - Discover all URLs on a website
- **Crawl** - Extract content from entire websites
- **Interact** - Drive a live browser session on a scraped page — click, fill forms, navigate flows, handle pagination/infinite scroll, and log in

All operations include automatic JavaScript rendering, anti-bot handling, and proxy rotation.

## Installation

### 1. Install the Plugin

In Grok Build, run `/plugin` and search for **firecrawl**, then select it to install. This installs both the skills and the bundled Firecrawl MCP server.

### 2. Sign In

The first time Grok uses a Firecrawl tool, you'll be prompted to authorize in your browser (OAuth). Approve it once — no API key to copy or paste. You can also check the connection any time with `/mcp`.

**That's it.** No global npm install, no manual key management.

### Optional: Firecrawl CLI (for local-file parsing)

The bundled MCP covers the full remote toolset (scrape, search, crawl, map, extract, agent, interact, monitor). The one capability it can't provide is parsing files on your local disk — for that, install the [Firecrawl CLI](https://github.com/firecrawl/cli):

```bash
npm install -g firecrawl-cli
firecrawl login --browser            # or: firecrawl login --api-key "fc-YOUR-API-KEY"
```

The `firecrawl-cli` and `firecrawl-parse` skills use the CLI when present. **Get your free API key at:** https://firecrawl.dev/app/api-keys

## Usage

Once installed, Grok Build automatically uses Firecrawl's MCP tools for web tasks — no extra setup. Just ask naturally:

**Search the web:**

```text
Search for "best practices for React testing" and compile the key recommendations
```

**Scrape a page:**

```text
Scrape https://docs.firecrawl.dev/introduction and summarize the key points
```

**Discover site structure:**

```text
Map all URLs on https://firecrawl.dev
```

**Research a topic:**

```text
Research the latest developments in AI agents and give me a summary
```

### CLI Commands (optional fallback)

By default the plugin uses the bundled hosted MCP. The Firecrawl CLI is only needed when the MCP is unavailable or for local-file workflows (`download`/`parse`). When used, it runs these commands:

| Command                    | Description                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------ |
| `firecrawl search "query"` | Search the web (supports `--sources`, `--scrape`, `--tbs` for time filters)          |
| `firecrawl scrape <url>`   | Scrape a single page to markdown                                                     |
| `firecrawl map <url>`      | Discover all URLs on a site                                                          |
| `firecrawl interact`       | Interact with a scraped page — click, fill forms, navigate (operates on a scrape ID) |
| `firecrawl --status`       | Check auth status, concurrency, and credits                                          |

### Output Files

Results are saved to a `.firecrawl/` directory in your project to keep Grok Build's context window clean:

```text
.firecrawl/search-react_server_components.json
.firecrawl/docs.github.com-actions-overview.md
.firecrawl/firecrawl.dev.md
```

## Configuration

The default MCP path needs no configuration — it authenticates via browser OAuth on first use. These variables apply only to the optional CLI / self-hosted paths:

| Variable            | Required | Description                                                                                                    |
| ------------------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| `FIRECRAWL_API_KEY` | CLI-only | Needed only for CLI auth paths (`firecrawl login --api-key` or env-var auth); not required for the bundled MCP |
| `FIRECRAWL_API_URL` | No       | Custom API endpoint (for self-hosted instances)                                                                |

## Self-Hosted Deployment

Firecrawl can be self-hosted. Set `FIRECRAWL_API_URL` to point to your instance:

```bash
export FIRECRAWL_API_URL=https://your-firecrawl-instance.com
```

See the [Firecrawl documentation](https://docs.firecrawl.dev) for self-hosting instructions.

## Resources

- [Firecrawl Documentation](https://docs.firecrawl.dev)
- [Firecrawl CLI Repository](https://github.com/firecrawl/cli)
- [API Reference](https://docs.firecrawl.dev/api-reference)
- [Get API Key](https://firecrawl.dev)

## License

This plugin is licensed under AGPL-3.0, consistent with Firecrawl's open-source license.

## Support

- [Firecrawl Discord](https://discord.gg/gSmWdAkdwd)
- [GitHub Issues](https://github.com/mendableai/firecrawl/issues)
- Email: hello@firecrawl.dev
