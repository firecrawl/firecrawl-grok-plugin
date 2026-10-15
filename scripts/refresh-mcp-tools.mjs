// Refreshes tests/mcp-tools.json from the hosted MCP contract snapshot in
// firecrawl/firecrawl-mcp-server. Usage: node scripts/refresh-mcp-tools.mjs [ref]
import { writeFileSync } from 'node:fs';

const repo = 'firecrawl/firecrawl-mcp-server';
const path = 'tests/contract-snapshots/hosted-full.json';
const ref = process.argv[2] ?? 'main';

async function fetchOk(url, init) {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response;
}

const { sha } = await (
  await fetchOk(`https://api.github.com/repos/${repo}/commits/${ref}`, {
    headers: { accept: 'application/vnd.github+json' },
  })
).json();
const snapshot = await (
  await fetchOk(`https://raw.githubusercontent.com/${repo}/${sha}/${path}`)
).json();
const tools = snapshot.sessions.apiKey.tools.map((tool) => tool.split('@')[0]);

writeFileSync(
  new URL('../tests/mcp-tools.json', import.meta.url),
  `${JSON.stringify({ source: { repo, path, commit: sha }, tools }, null, 2)}\n`
);
console.log(`tests/mcp-tools.json: ${tools.length} tools from ${repo}@${sha}`);
