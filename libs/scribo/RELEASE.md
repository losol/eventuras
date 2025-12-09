# Release Instructions for @eventuras/scribo

This document explains how to configure the automated release workflow for `@eventuras/scribo`.

## Release Process

### Standard Release

1. **Create changesets** for your changes:

   ```bash
   # Option A: Manual (recommended for better changelog messages)
   pnpm changeset
   
   # Option B: Auto-generate from commits (review and edit after)
   pnpm changeset:suggest
   ```

   > **Tip**: `changeset:suggest` analyzes your git commits since the last release and automatically generates changeset files. Review the generated changesets and edit them for clarity if needed.

2. **Version the package** when ready:

   ```bash
   pnpm changeset:version
   ```

3. **Commit and push** the version bump:

   ```bash
   git add .
   git commit -m "chore(scribo): release v0.x.x"
   git push origin main
   ```

4. **Automated workflow** will:
   - ✅ Build the package
   - ✅ Publish to npm with provenance
   - ✅ Create Git tag `@eventuras/scribo@x.x.x`
   - ✅ Create GitHub Release with changelog

### Manual Release

If the automated workflow fails or you need to publish manually:

```bash
cd libs/scribo
pnpm build
npm login --scope @eventuras --auth-type web
npm publish --access public
```

## Release Setup

### NPM Trusted Publishing Setup (Recommended)

Scribo uses **npm trusted publishing with OIDC** for secure, token-free publishing.

#### Configure Trusted Publisher on npmjs.com

1. Log in to [npmjs.com](https://www.npmjs.com)
2. Navigate to `@eventuras/scribo` package settings
3. Find **Trusted Publisher** section
4. Click **GitHub Actions**
5. Configure:
   - **Organization or user**: `losol`
   - **Repository**: `eventuras`
   - **Workflow filename**: `scribo-release.yml` (include `.yml` extension)
   - **Environment name**: `scribo-npm`
6. Click **Add trusted publisher**

#### Set Up GitHub Environment

The workflow uses a GitHub environment for deployment protection (optional but recommended):

1. Go to your GitHub repository
2. Navigate to **Settings** → **Environments**
3. Click **New environment**
4. Name: `scribo-npm`
5. (Optional) Add protection rules:
   - Required reviewers if you want manual approval
   - Deployment branches: Select "Selected branches" and add `main`
6. Click **Create environment**

> **Note**: With trusted publishing, you don't need to add any secrets to this environment. The workflow uses OIDC authentication automatically.

### Legacy: Token-Based Publishing (Not Recommended)

If you cannot use trusted publishing, you can fall back to traditional npm tokens:

1. Create a granular access token on npmjs.com with write access to `@eventuras/scribo`
2. Add it as `NODE_AUTH_TOKEN` secret in the `scribo-npm` environment
3. Update the workflow to include `NODE_AUTH_TOKEN` environment variable in the publish step

However, trusted publishing is strongly recommended for better security.


## Workflow Trigger

The release workflow (`.github/workflows/scribo-release.yml`) triggers automatically when:

- Changes are pushed to the `main` branch
- The file `libs/scribo/package.json` is modified
