import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = realpathSync(fileURLToPath(new URL('..', import.meta.url)));
const skills = join(root, 'skills');

function readJson(path) {
  return JSON.parse(readFileSync(join(root, path), 'utf8'));
}

function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(path);
    return entry.name.endsWith('.md') ? [path] : [];
  });
}

test('manifest is valid', () => {
  const manifest = readJson('.grok-plugin/plugin.json');
  assert.equal(manifest.name, 'firecrawl');
  for (const field of ['version', 'description', 'license', 'repository']) {
    assert.equal(typeof manifest[field], 'string', `plugin.json needs ${field}`);
    assert.ok(manifest[field].length > 0, `plugin.json ${field} is empty`);
  }
  assert.equal(manifest.repository, 'https://github.com/firecrawl/firecrawl-grok-plugin');
});

test('manifest version is semver', () => {
  const { version } = readJson('.grok-plugin/plugin.json');
  assert.match(
    version,
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?(\+[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$/
  );
});

test('bundled MCP connection carries no credentials', () => {
  const { mcpServers } = readJson('.mcp.json');
  assert.deepEqual(Object.keys(mcpServers), ['firecrawl']);
  const { note, ...server } = mcpServers.firecrawl;
  assert.equal(typeof note, 'string');
  assert.deepEqual(server, {
    type: 'http',
    url: 'https://mcp.firecrawl.dev/v2/mcp-oauth',
  });
  assert.doesNotMatch(readFileSync(join(root, '.mcp.json'), 'utf8'), /fc-[0-9a-f]{8,}|bearer/i);
});

test('every skill has name and description frontmatter', () => {
  const names = { 'firecrawl-cli': 'firecrawl' };
  for (const entry of readdirSync(skills, { withFileTypes: true })) {
    assert.ok(entry.isDirectory(), `skills/${entry.name} must be a directory`);
    const text = readFileSync(join(skills, entry.name, 'SKILL.md'), 'utf8');
    const frontmatter = text.match(/^---\n([\s\S]*?)\n---\n/)?.[1];
    assert.ok(frontmatter, `skills/${entry.name}/SKILL.md needs frontmatter`);
    assert.equal(frontmatter.match(/^name: (.+)$/m)?.[1], names[entry.name] ?? entry.name);
    assert.match(frontmatter, /^description: .+$/m, `skills/${entry.name} needs a description`);
  }
});

test('relative links in skills resolve inside the plugin', () => {
  const broken = [];
  for (const file of markdownFiles(skills)) {
    for (const [, target] of readFileSync(file, 'utf8').matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
      if (/^[a-z]+:/i.test(target) || target.startsWith('#')) continue;
      const path = resolve(dirname(file), target.split('#')[0]);
      if (!existsSync(path) || !realpathSync(path).startsWith(root + sep)) {
        broken.push(`${file.slice(root.length + 1)} -> ${target}`);
      }
    }
  }
  assert.deepEqual(broken, []);
});

test('skills name exactly the tools on the hosted MCP', () => {
  const available = new Set(readJson('tests/mcp-tools.json').tools);
  const named = new Set(
    markdownFiles(skills).flatMap((file) =>
      [...readFileSync(file, 'utf8').matchAll(/`(firecrawl_[a-z0-9_]+)`/g)].map((match) => match[1])
    )
  );
  assert.deepEqual([...named].filter((tool) => !available.has(tool)), [], 'skills name tools the MCP does not serve');
  assert.deepEqual([...available].filter((tool) => !named.has(tool)), [], 'MCP tools no skill names');
});
