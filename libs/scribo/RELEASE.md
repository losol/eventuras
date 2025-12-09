# Relase Instructions for @eventuras/scribo

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

### NPM Token and Environment Setup

You need to create an npm access token and configure a GitHub environment for automated publishing.

#### Create NPM Token

1. Log in to [npmjs.com](https://www.npmjs.com)
2. Click on your profile picture → **Access Tokens**
3. Click **Generate New Token** → **Granular Access Token**
4. Configure the token:
   - **Token name**: `GitHub Actions - Scribo`
   - **Expiration**: Choose appropriate duration (90 days or custom)
   - **Packages and scopes**: Select `@eventuras/scribo` with **Read and write** permissions
5. Click **Generate token** and copy it (starts with `npm_...`)

> **Note**: Granular tokens are more secure than Classic tokens as they can be scoped to specific packages.

#### Set Up GitHub Environment

1. Go to your GitHub repository
2. Navigate to **Settings** → **Environments**
3. Click **New environment**
4. Name: `scribo-npm`
5. (Optional) Add protection rules:
   - Required reviewers if you want manual approval
   - Deployment branches: Select "Selected branches" and add `main`
6. Click **Add environment secret**
7. Name: `NODE_AUTH_TOKEN`
8. Value: Paste your npm token
9. Click **Add secret**

> **Note**: The package already has GitHub Actions configured as a trusted publisher with provenance support on npmjs.com.


## Workflow Trigger

The release workflow (`.github/workflows/scribo-release.yml`) triggers automatically when:

- Changes are pushed to the `main` branch
- The file `libs/scribo/package.json` is modified
