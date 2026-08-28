---
name: firecrawl-developer-search
description: |
  Search an index built for coding agents — GitHub issues, merged pull requests, repository READMEs, and curated documentation sites — and get back the matched passages, not just links. Use this skill whenever the question is about code: how a library, framework, or API behaves, what an error message or stack trace means, whether a bug was reported or fixed, what a function returns, what a default is, or which repos do a given thing. Triggers on "why does <library> do X", "what does this error mean", "is this a known bug", "how do I use <library>", "what's the API for", pasted stack traces, and pasted error strings. Prefer this over a general web search for programming questions — it answers from the primary source instead of a blog post about it.
allowed-tools:
  - mcp__firecrawl__firecrawl_developer_search
  - mcp__firecrawl__firecrawl_search
  - mcp__firecrawl__firecrawl_scrape
  - Bash(firecrawl *)
  - Bash(npx firecrawl *)
---

# firecrawl developer search

## Via the Firecrawl MCP (preferred)

This plugin bundles the Firecrawl MCP server. When it's connected, prefer the native **`firecrawl_developer_search`** tool over the CLI — it needs no local install and authenticates through the plugin's one-time browser sign-in. The `firecrawl` CLI commands below are the fallback for when the MCP isn't connected.

Semantic search over indexed developer sources. Each result carries an `id`, a `url`, a title, and the **matched passages in markdown**, so tables and code blocks survive intact.

The `id` prefix tells you what kind of source a hit is: `doc:`, `issue:`, `pull_request:`, or `readme:`.

## When to use

- The question is about code behaviour, a library or framework, an API contract, an error message, or a known bug
- You want the issue that reported it, the merged PR that fixed it, or the doc page that defines the contract — not a blog post describing it
- Before falling back to a general web search: reach for the index first, the open web second

Not for this skill: comparisons and opinions ("X vs Y"), news and outages, or a project with no public repo or indexed docs. Those are [firecrawl-search](../firecrawl-search/SKILL.md) plus [firecrawl-scrape](../firecrawl-scrape/SKILL.md) questions.

## Quick start

MCP (preferred):

```text
firecrawl_developer_search(query: "tokio select cancellation safety", k: 10)
firecrawl_developer_search(query: "agent skill frontmatter conventions", skills: "only")
```

CLI fallback:

```bash
# Ask a developer question
firecrawl developer "axum middleware ordering" --limit 10 -o .firecrawl/dev-axum-middleware.json --json

# Search a literal error string plus the library name
firecrawl developer "ERR_REQUIRE_ESM in vitest config" -o .firecrawl/dev-esm-error.json --json
```

Put all scoping intent in the query text — the repo slug, the library name, the version, the error string. Semantic retrieval handles the scoping; there are no repo or type flags on the MCP tool or the CLI.

## Options

| Option (MCP)   | Option (CLI)         | Description                                                |
| -------------- | -------------------- | ---------------------------------------------------------- |
| `query`        | `<query>`            | Natural-language question or search phrase (required)      |
| `k`            | `--limit <n>`        | Number of ranked results, 1–100 (default 10)               |
| `skills`       | —                    | Set to `"only"` to search only agent-skill files           |
| —              | `-o, --output <path>` | Output file path                                           |
| —              | `--json` / `--pretty` | JSON output, compact or pretty                             |

## Tips

- **Match the query to the question.** A literal error message wants the error string plus the library name. A conceptual "how do I do X" wants the whole question in natural language.
- **Volatile parts hurt a match.** If an error string returns nothing, strip paths, line numbers, ids, and addresses and retry — the invariant middle of the message is what's indexed.
- **A merge supersedes a report.** When an issue and a pull request disagree, the merged PR is the current behaviour. Read the resolution before answering, never the opening report alone.
- **Quote the passage, cite the `url`.** The passages are the evidence — hand them over rather than paraphrasing into a claim the user can't check. `title` is often absent on `doc:` hits; fall back to `url`.
- **Raise `k` before giving up, and scrape when a hit is the right page.** If a result is clearly the right page but the passage is the wrong part of it, [scrape](../firecrawl-scrape/SKILL.md) its `url` for the whole thing.
- Already running a web search? `firecrawl_search(query, categories: ["developer"])` folds developer hits into the same call as web results (they come back tagged `category: "developer"`). It exposes no passage control, so prefer the dedicated tool when the question is purely a code question.
- With the CLI, write results to `.firecrawl/` with `-o` to keep the context window clean. Naming convention: `.firecrawl/dev-{topic}.json`.

## See also

- [firecrawl-search](../firecrawl-search/SKILL.md) — general web search, and the `categories: ["developer"]` blend
- [firecrawl-scrape](../firecrawl-scrape/SKILL.md) — read a full page behind a promising hit
- [firecrawl-agent](../firecrawl-agent/SKILL.md) — autonomous multi-source research when one search won't settle it
