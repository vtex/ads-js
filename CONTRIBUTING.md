# Contributing

Thanks for contributing to the VTEX Ads JavaScript SDK! This guide covers how to set up the project locally, the day-to-day workflow, and how releases are published.

## Repository layout

This is a **monorepo** managed with [pnpm](https://pnpm.io/) workspaces and [Turborepo](https://turbo.build/).

| Path                  | Description                                              |
| --------------------- | -------------------------------------------------------- |
| `packages/core`       | `@vtex/ads-core` — framework-agnostic SDK                |
| `packages/react`      | `@vtex/ads-react` — React Provider + hook on top of core |
| `packages/playground` | Vite app to try the SDK locally                          |
| `packages/ads-docs`   | Docusaurus documentation site                            |

## Local setup

**Prerequisites**

- Node.js 20 (CI runs on Node 20; run `nvm use` to pick it up from `.nvmrc`)
- pnpm 10.14.0 (pinned in `packageManager`)

```bash
npm i -g pnpm@10.14.0

pnpm install
pnpm build   # required once: the playground and docs consume the built packages
```

> **Note:** `pnpm install` does not build the workspace packages. If you skip `pnpm build`, the playground fails with `Failed to resolve entry for package "@vtex/ads-core"` (or `@vtex/ads-react`).

## Running locally

| Goal                             | Command               |
| -------------------------------- | --------------------- |
| Run the playground               | `pnpm playground:dev` |
| Run all dev/watch tasks (turbo)  | `pnpm dev`            |
| Run the docs site (builds first) | `pnpm docs:start`     |

The playground is served at <http://localhost:5173/ads-js/playground/>. It calls the VTEX ad server, so you need a real `account` and `region` to get ads back.

After changing `packages/core` or `packages/react`, rebuild them (`pnpm build`) for the playground to pick up the changes, or run `pnpm dev` to rebuild in watch mode.

## Quality checks

Run these before opening a PR. CI runs the same checks.

| Check             | Command            |
| ----------------- | ------------------ |
| Build             | `pnpm build`       |
| Type-check        | `pnpm check-types` |
| Tests (Vitest)    | `pnpm test`        |
| Lint              | `pnpm lint`        |
| Formatting        | `pnpm format`      |
| Fix lint + format | `pnpm autoformat`  |

## Release & Publishing

This repo uses [Changesets](https://github.com/changesets/changesets) for versioning and the DK CI/CD `npm-publish-v1` pipeline for publishing to npm.

### 1. Prepare the PR

In your feature branch, create the changeset and version in one go:

```bash
pnpm changeset        # describe the change and bump type
pnpm version-packages # bump package.json, update CHANGELOG, delete the changeset file
```

Open a single PR with everything: code changes, updated `package.json`, updated `CHANGELOG.md`.

### 2. Tag and trigger the pipeline

After the PR is merged, pull `main` and push a single Git tag for both packages (they are always kept at the same version):

```bash
git checkout main && git pull

# Production release
git tag v1.2.3
git push origin v1.2.3

# Beta release
git tag v1.2.3-beta.0
git push origin v1.2.3-beta.0
```

Pushing the tag triggers two `npm-publish-v1` pipelines in parallel — one for `ads-core` and one for `ads-react` — which build each package and publish them to AWS CodeArtifact.

### 3. Publish to npm

After both pipelines complete, the DK automatically triggers the corresponding GitHub Actions workflows:

- **Actions → Publish ads-core to npm** (`publish-core.yml`)
- **Actions → Publish ads-react to npm** (`publish-react.yml`)

Each workflow reads the version from its own `package.json`, downloads the tarball from CodeArtifact, and publishes it to npmjs. The `CA_TOKEN` and `CA_OWNER` inputs are filled automatically by DK. You can also trigger them manually if needed.

> **Prerequisite:** each package must have a [NPM Trusted Publisher](https://docs.npmjs.com/trusted-publishers) configured on npmjs.com pointing to this repo — `publish-core.yml` for `@vtex/ads-core` and `publish-react.yml` for `@vtex/ads-react`. This is a one-time setup per package.
