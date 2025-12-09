// scripts/suggest-changeset.ts
// Generate per-package Changesets from commit scopes (npm workspaces + aliases + warnings)
// Run: npm run suggest:changeset -- --since origin/main [--write] [--no-dedupe-titles]

import {execSync} from 'node:child_process'
import {existsSync, readFileSync, writeFileSync, mkdirSync} from 'node:fs'
import {dirname, join, resolve, basename} from 'node:path'

type Bump = 'patch' | 'minor' | 'major'
type Commit = { hash: string; subject: string; body: string }
type Pkg = { name: string; dir: string; token: string; private?: boolean }

/** CLI */
const SINCE = arg('--since') ?? 'origin/main'
const WRITE = has('--write')
const DEDUPE_TITLES = !has('--no-dedupe-titles')

/** Order */
const ORDER: Bump[] = ['patch', 'minor', 'major']

/** Get arg value */
function arg(flag: string) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined
}

/** Has flag */
function has(flag: string) {
  return process.argv.includes(flag)
}

/** Run git */
function git(cmd: string) {
  return execSync(`git ${cmd}`, {encoding: 'utf8'}).trim()
}

/** Read workspaces from package.json (array or { packages }) */
function readRootWorkspaces(): string[] {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
  const ws = pkg.workspaces
  if (Array.isArray(ws)) return ws
  if (ws && Array.isArray(ws.packages)) return ws.packages
  return []
}

/** Minimal glob: foo/* (one level), foo/** (any depth) */
function matchesGlob(glob: string, path: string) {
  const g = glob.replace(/\/+$/, '');
  const p = path.replace(/\/+$/, '')
  if (g.endsWith('/**')) {
    const base = g.slice(0, -3);
    return p === base || p.startsWith(base + '/')
  }
  if (g.endsWith('/*')) {
    const base = g.slice(0, -2);
    if (!p.startsWith(base + '/')) return false;
    return p.slice(base.length + 1).split('/').length === 1
  }
  return p === g
}

/** Workspace dirs from globs */
function workspaceDirsFromGlobs(globs: string[]) {
  const files = git('ls-files **/package.json').split('\n').filter(Boolean)
  const dirs = files.map(f => dirname(f))
  return Array.from(new Set(dirs.filter(d => globs.some(g => matchesGlob(g, d)))))
}

/** Read package.json → Pkg (token = folder name) */
function readPkg(dir: string): Pkg | null {
  const pj = join(dir, 'package.json')
  if (!existsSync(pj)) return null
  try {
    const json = JSON.parse(readFileSync(pj, 'utf8'))
    if (!json?.name) return null
    const name: string = json.name
    const token = basename(dir).toLowerCase()
    return {name, dir: resolve(dir), token, private: !!json.private}
  } catch {
    return null
  }
}

/** All workspaces */
function getWorkspaces(): Pkg[] {
  const dirs = workspaceDirsFromGlobs(readRootWorkspaces())
  return dirs.map(readPkg).filter(Boolean) as Pkg[]
}

/** Load aliases from scripts/scope-aliases.json */
function loadAliases(): Record<string, string> {
  const SCOPE_ALIASES_PATH = './scripts/scope-aliases.json'
  if (!existsSync(SCOPE_ALIASES_PATH)) {
    console.info('Info: no scope alias file found at scripts/scope-aliases.json.')
    return {}
  }
  try {
    return JSON.parse(readFileSync(SCOPE_ALIASES_PATH, 'utf8'))
  } catch (err) {
    console.warn(`⚠️  Failed to parse ${SCOPE_ALIASES_PATH}:`, err)
    return {}
  }
}

/** Commits since ref */
function getCommits(ref: string): Commit[] {
  const raw = git(`log ${ref}..HEAD --pretty=format:%H:::%s:::%B`)
  const lines = raw ? raw.split('\n') : []
  const out: Commit[] = [];
  let cur: Commit | null = null
  for (const line of lines) {
    if (line.includes(':::')) {
      if (cur) out.push(cur)
      const parts = line.split(':::')
      const hash = parts[0] ?? ''
      const subject = parts[1] ?? ''
      const body = parts[2] ?? ''
      cur = {hash, subject, body}
    }
  }
  if (cur) out.push(cur)
  return out
}

/** Bump policy: feat→minor, breaking(!/BREAKING)→major, else patch */
function inferBump(subject: string, body: string): Bump {
  if (/^(\w+)(\([^)]*\))?!:/.test(subject) || /BREAKING CHANGE/i.test(body)) return 'major'
  const type = subject.split(':')[0]?.split('(')[0]
  return type === 'feat' ? 'minor' : 'patch'
}

/** Extract scopes: type(scope,scope2): msg */
function extractScopes(subject: string): string[] {
  const m = subject.match(/^\w+\(([^)]+)\)!?:/)
  if (!m || !m[1]) return []
  return m[1].split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
}

/** Keep higher bump */
function merge(a: Bump | null, b: Bump | null): Bump | null {
  const ai = a ? ORDER.indexOf(a) : -1;
  const bi = b ? ORDER.indexOf(b) : -1
  return ai >= bi ? (a ?? null) : (b ?? null)
}

/** Commit title */
function commitTitle(c: Commit) {
  return c.subject.trim()
}

/** Pretty commit formatter (no repeated subject) */
// include full body (all lines), but remove duplicated first line if it equals the subject/message
function describeCommit(c: Commit): string {
  // grab raw subject and body
  const subject = c.subject.trim()
  const bodyRaw = (c.body ?? '').replace(/\r\n/g, '\n')

  // parse conventional parts once
  const m = subject.match(/^(\w+)(\([^)]+\))?:\s*(.+)$/)
  const type = (m?.[1] ?? 'chore').toLowerCase()
  const emoji =
    type === 'feat' ? '🧱' :
      type === 'fix' ? '🐞' :
        type === 'docs' ? '📝' :
          type === 'test' ? '✅' :
            type === 'refactor' ? '♻️' :
              type === 'ci' ? '⚙️' :
                type === 'chore' ? '🧹' : '🔧'

  // clean and split body lines
  const bodyLines = bodyRaw.split('\n').map(l => l.replace(/\s+$/, ''))
  // remove blank lines at start
  while (bodyLines.length && bodyLines[0]?.trim() === '') bodyLines.shift()

  // known duplicate variants of the title to drop from the first body line
  const message = (m?.[3] ?? subject).trim()
  const dupCandidates = new Set([
    subject,
    message,
    `${type}${m?.[2] ?? ''}: ${message}`.trim()
  ].map(s => s.toLowerCase()))

  // strip first body line if it duplicates the title/message
  if (bodyLines.length && bodyLines[0] && dupCandidates.has(bodyLines[0].trim().toLowerCase())) {
    bodyLines.shift()
    // also strip an extra blank line after that, if present
    if (bodyLines.length && bodyLines[0]?.trim() === '') bodyLines.shift()
  }

  // indent full remaining body (all lines)
  const bodyBlock = bodyLines.length ? `\n  ${bodyLines.join('\n  ')}` : ''

  // final: emoji + subject on first line, full body below, then short hash
  return `${emoji} ${subject}${bodyBlock} (${c.hash.slice(0, 7)})`
}

/** Safe slug */
function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

/** Build per-package changeset */
function buildChangesetForPackage(pkg: string, bump: Bump, commits: Commit[]) {
  // Sort commits by type priority: feat, docs, fix, others (refactor, test, chore, ci)
  const typePriority: Record<string, number> = {
    feat: 0,
    docs: 1,
    fix: 2,
    refactor: 3,
    test: 4,
    chore: 5,
    ci: 6,
  }

  const sortedCommits = [...commits].sort((a, b) => {
    const getType = (subject: string) => {
      const m = subject.match(/^(\w+)(\([^)]+\))?:/)
      return m?.[1]?.toLowerCase() ?? 'other'
    }

    const typeA = getType(a.subject)
    const typeB = getType(b.subject)
    const priorityA = typePriority[typeA] ?? 99
    const priorityB = typePriority[typeB] ?? 99

    return priorityA - priorityB
  })

  const lines = ['---', `"${pkg}": ${bump}`, '---', '']

  // Add commits as flat list (sorted by type, but no section headers)
  for (const c of sortedCommits) {
    lines.push(`- ${describeCommit(c)} [${pkg}]`)
  }

  if (lines[lines.length - 1] === '') lines.push('- Suggested changes')
  return lines.join('\n')
}

/** Main */
;(function main() {
  if (!existsSync('.git')) {
    console.error('Run from repository root.');
    process.exit(1)
  }

  const pkgs = getWorkspaces()
  if (!pkgs.length) {
    console.error('No npm workspaces found.');
    process.exit(1)
  }

  const aliases = loadAliases()

  // token -> package name
  const tokenToPkg = new Map<string, string>()
  for (const p of pkgs) if (!p.private) tokenToPkg.set(p.token, p.name)

  // results
  const bumps = new Map<string, Bump>()
  const notes = new Map<string, Commit[]>()
  const commits = getCommits(SINCE)

  let skipped = 0

  for (const c of commits) {
    const bump = inferBump(c.subject, c.body)
    const scopes = extractScopes(c.subject)

    if (!scopes.length) {
      console.warn(`⚠️  No scope → skipped: ${c.subject} (${c.hash.slice(0, 7)})`)
      skipped++
      continue
    }

    for (const raw of scopes) {
      const pkgName = aliases[raw] ?? tokenToPkg.get(raw)
      if (!pkgName) {
        console.warn(`⚠️  Unknown scope "${raw}" → skipped: ${c.subject} (${c.hash.slice(0, 7)})`)
        skipped++
        continue
      }

      const prev = bumps.get(pkgName) ?? null
      const next = merge(prev, bump)
      if (next) bumps.set(pkgName, next)

      const list = notes.get(pkgName) ?? []
      if (DEDUPE_TITLES) {
        const title = commitTitle(c)
        if (list.some(x => commitTitle(x) === title)) continue
      }
      list.push(c)
      notes.set(pkgName, list)
    }
  }

  if (!bumps.size) {
    console.log(`No package bumps inferred since ${SINCE}.`);
    return
  }

  console.table([...bumps.entries()].map(([pkg, bump]) => ({
    package: pkg,
    bump,
    commits: (notes.get(pkg) ?? []).length
  })))

  if (skipped) console.log(`⚠️  ${skipped} commit(s) skipped due to missing/unknown scope.`)

  if (!WRITE) {
    console.log('Preview only. Use --write to create per-package .changeset files.')
    return
  }

  if (!existsSync('.changeset')) mkdirSync('.changeset', {recursive: true})
  const date = new Date().toISOString().slice(0, 10)

  for (const [pkg, bump] of bumps.entries()) {
    const pkgCommits = notes.get(pkg) ?? []
    const firstTitle = pkgCommits[0]?.subject ?? pkg
    const suffix = slug(pkg.split('/').pop()!)
    const filename = `${date}-${slug(firstTitle).slice(0, 40) || 'changes'}-${suffix}.md`
    const md = buildChangesetForPackage(pkg, bump, pkgCommits)
    writeFileSync(join('.changeset', filename), md, 'utf8')
    console.log(`✅  Created .changeset/${filename}`)
  }
})()
