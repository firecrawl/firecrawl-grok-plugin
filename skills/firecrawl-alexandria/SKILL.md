---
name: firecrawl-alexandria
description: |
  Get structured data from catalogued providers instead of scraping pages. Firecrawl Alexandria is a library of official APIs, licensed publishers, and Firecrawl indexes (financial series, company data, government contracts and law, podcasts, listings, research). Use this skill when the user needs records, listings, prices, filings, transcripts, or a dataset, says "is there an API for", "find a data source for", "pull the records", "get the dataset", or when assembling the answer by scraping would take many pages that one provider call returns directly. Discover with search, inspect with find_tools, execute with scrape.
allowed-tools:
  - mcp__firecrawl__firecrawl_search
  - mcp__firecrawl__firecrawl_find_tools
  - mcp__firecrawl__firecrawl_scrape
  - Bash(firecrawl *)
  - Bash(npx firecrawl *)
---

# Firecrawl Alexandria

Alexandria adds ready-made data providers to Firecrawl search and scrape. There is no new tool for execution: `firecrawl_search` discovers providers, `firecrawl_find_tools` reads a provider's contract, and `firecrawl_scrape` runs the selected capability and returns structured records. Discovery is free. Execution is billed at the price shown on the capability.

Alexandria needs a signed-in Firecrawl account. The plugin's one-time browser sign-in covers it; a keyless session gets `Alexandria requires an API key on a team with Alexandria access`, in which case ask the user to sign in (`/mcp`) or fall back to ordinary search and scrape.

## Via the Firecrawl MCP (preferred)

**1. Discover.** Search with the user's actual question and the `alexandria` source. Keep their market, location, and constraints in the query. Results land in `data.tools` beside any web results.

```json
{
  "name": "firecrawl_search",
  "arguments": {
    "query": "US consumer price index monthly series",
    "sources": ["web", "alexandria"],
    "limit": 5
  }
}
```

Each match carries `provider`, `capability`, and a description. A match is a lead, not data. `toolDetail: "full"` returns the contracts in the same call when you will need several at once.

**2. Inspect.** Read the selected contract before building inputs. `firecrawl_find_tools` with no arguments lists categories; narrow progressively, or jump straight to one capability:

```json
{
  "name": "firecrawl_find_tools",
  "arguments": {
    "providers": ["fred"],
    "capabilities": ["series/observations"],
    "expand": ["options", "response", "examples"]
  }
}
```

A URL argument returns the tools associated with that website without fetching the page. `required: true` inputs must be supplied; a `requiresOneOf` group needs at least one member. `response.key` names the records field inside each result.

**3. Execute.** Pass `alexandria` to `firecrawl_scrape` instead of `url` (exactly one of the two). One call or an array of up to ten:

```json
{
  "name": "firecrawl_scrape",
  "arguments": {
    "alexandria": [
      { "provider": "fred", "capability": "series/observations", "options": { "series_id": "CPIAUCSL" } }
    ],
    "requestId": "cpi-observations-1"
  }
}
```

The response is `{ success, requestId, data: { alexandria: [...], creditsCost } }`. Check every item: each is either a result (`provider`, `capability`, `creditsCost`, `data`, `records`) or an `error` with a `code`. A provider error never fails the batch as a whole. Supply a `requestId` before running anything that may return a large result, and reuse the same ID to retry the identical payload; never mint a new ID to bypass an uncertain outcome.

## Rules

- Discover before you retrieve, and run only capabilities that discovery returned. Do not guess provider or capability names.
- Use the exact input fields the contract declares. Resolve record IDs with the provider's lookup capability rather than inventing them.
- Ordinary web results are fine when they answer the question. Do not pay for adjacent tools to probe coverage; if no tool covers the country, market, or fields needed, continue with search, scrape, or agent.
- Tell the user what each execution cost. Displayed pricing is informational; the API checks available credits.
- Large results stay retained under the `requestId`. If the client rejects a response as too large, do not rerun the provider; recover the retained result with `firecrawl_scrape` and the `firecrawl/bash` capability to select the fields you need.

### Provider terms

Some providers require the organization to accept their terms once. Execution then fails before running with HTTP 403 and `code: "THIRD_PARTY_DATA_TERMS_REQUIRED"`, plus `requiresAction.url` pointing at the Firecrawl dashboard. Accepting terms is a legal act: show the user the agreement (the returned `nextTool` reads it through `firecrawl_scrape` with provider `firecrawl`, capability `terms/show`) and have an organization admin accept it in the dashboard, or, only with the user's explicit authorization, through capability `terms/accept` with the exact reviewed `version`, `digest`, and `confirmed: true`. A request for data is not consent. After acceptance, repeat the identical call with the same `requestId`.

## Via the CLI (fallback)

When the MCP is not connected, the `firecrawl` CLI runs the same flow:

```bash
firecrawl search alexandria "US consumer price index monthly series"     # semantic tool matches only
firecrawl find-tools https://fred.stlouisfed.org                          # tools for a known website
firecrawl list fred series/observations --pretty                          # read the selected contract
firecrawl scrape fred/series/observations --options '{"series_id":"CPIAUCSL"}' --json -o .firecrawl/cpi.json
```

`firecrawl search` alone returns web results plus matching tools; `--sources web` opts out of Alexandria. Save large results with `--json -o` and inspect them in bounded sections.

### Send feedback after every Alexandria task (CLI)

Alexandria coverage grows from what agents report. When the CLI is installed, after the task is done send one `firecrawl alexandria feedback` per website the user needed data from, whether a tool ran, ran badly, or nothing covered the site. It is free, has no time window, and `--silent &` keeps it out of the way. Skip it when `FIRECRAWL_NO_ENDPOINT_FEEDBACK=1` is set.

```bash
firecrawl alexandria feedback \
  --rating "<good|partial|bad>" \
  --url "https://sam.gov" \
  --requested-functionality "Active contracts by agency with their attachments" \
  --rationale "sam-gov/contracts returned the list, but no capability exposes attachment links." \
  --silent &
```

`--provider-feedback` (`missing_provider`, `insufficient_coverage`, `provider_unavailable`) and `--capability-feedback` (`new_capability_request`, `missing_capability`, `insufficient_functionality`, `incorrect_result`, `execution_error`) take JSON arrays; run `firecrawl alexandria feedback --help` for the fields.

## See also

- [firecrawl-search](../firecrawl-search/SKILL.md) — web results and tool discovery in one call
- [firecrawl-scrape](../firecrawl-scrape/SKILL.md) — read a URL or execute a selected capability
- [firecrawl-agent](../firecrawl-agent/SKILL.md) — multi-source research when no provider covers the data
