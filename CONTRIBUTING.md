# Contributing

Thanks for contributing to the VTEX Ads JavaScript SDK! This guide covers how to set up the project locally, the day-to-day workflow, and how releases are published.

## Repository layout

This is a **monorepo** managed with [pnpm](https://pnpm.io/) workspaces and [Turborepo](https://turbo.build/).

| Path                   | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| `packages/core`        | `@vtex/ads-core` — framework-agnostic SDK                |
| `packages/react`       | `@vtex/ads-react` — React Provider + hook on top of core |
| `packages/ads-stories` | `@vtex/ads-stories` — Story Ads web component            |
| `packages/playground`  | Vite app to try the SDK locally                          |
| `packages/ads-docs`    | Docusaurus documentation site                            |

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
| Run all dev tasks (turbo)        | `pnpm dev`            |
| Run the docs site (builds first) | `pnpm docs:start`     |

The playground is served at <http://localhost:5173/ads-js/playground/>. It calls the VTEX ad server, so you need a real `account` and `region` to get ads back.

After changing `packages/core` or `packages/react`, run `pnpm build` so the playground picks up the changes. `pnpm dev` does not do this: it runs `tsc --watch`, which does not update the `dist/esm` and `dist/cjs` bundles (built by `tsup`) that the playground consumes.

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

Packages are released in two independent groups, each with its own tag format:

| Packages                               | Version                          | Tag                       |
| -------------------------------------- | -------------------------------- | ------------------------- |
| `@vtex/ads-core` and `@vtex/ads-react` | Always the same for both         | `v1.2.3`, `v1.2.3-beta.0` |
| `@vtex/ads-stories`                    | Its own, from its `package.json` | `v0.1.0-ads-stories`      |

The tag version must match the `version` in the released package's `package.json` on the tagged commit.

#### `ads-core` and `ads-react`

After the PR is merged, pull `main` and push a single Git tag for both packages:

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

#### `ads-stories`

After the PR is merged, pull `main` and push a tag with the `-ads-stories` suffix:

```bash
git checkout main && git pull

git tag v0.1.0-ads-stories
git push origin v0.1.0-ads-stories
```

Pushing the tag triggers only the `ads-stories` `npm-publish-v1` pipeline. There is no beta channel for `ads-stories` yet.

> The package name goes after the version (`v0.1.0-ads-stories`), not before it: the DK webhook rejects tags that don't start with a semver version, such as `ads-stories-v0.1.0`.

#### Test builds of `ads-stories` from a PR

To try `ads-stories` from an open PR before merging, add the `publish-test` label and push a commit to the PR (DK only fires on pushes, so the label alone starts nothing). On every push touching `packages/ads-stories`, DK skips its pack and dispatches `publish-stories.yml` with version `test`. The workflow skips unless the PR has the label; with it, it builds the PR branch and publishes `<version>-test.<sha>` (e.g. `0.1.0-test.3a3f9d2`) to npmjs under the `test` dist-tag, so `latest` is unchanged. The version is in the run summary.

```bash
npm install @vtex/ads-stories@0.1.0-test.3a3f9d2
```

### 3. Publish to npm

After each pipeline completes, the DK automatically triggers the corresponding GitHub Actions workflow:

- **Actions → Publish ads-core to npm** (`publish-core.yml`)
- **Actions → Publish ads-react to npm** (`publish-react.yml`)
- **Actions → Publish ads-stories to npm** (`publish-stories.yml`)

Each workflow reads the version from its own `package.json`, downloads the tarball from CodeArtifact, and publishes it to npmjs. The `CA_TOKEN` and `CA_OWNER` inputs are filled automatically by DK. You can also trigger them manually if needed.

> **Prerequisite:** each package must have a [NPM Trusted Publisher](https://docs.npmjs.com/trusted-publishers) configured on npmjs.com pointing to this repo — `publish-core.yml` for `@vtex/ads-core`, `publish-react.yml` for `@vtex/ads-react` and `publish-stories.yml` for `@vtex/ads-stories`. This is a one-time setup per package.

### Adding a new package

npm only accepts a trusted publisher for a package name that already exists, so the workflow can't publish a brand-new package on its own. Before its first release, someone with publish rights in the `@vtex` npm scope must:

1. Publish a placeholder version (for example `0.0.0-bootstrap.0`, under a `bootstrap` dist-tag so it never becomes `latest`).
2. Configure the trusted publisher on npmjs.com: organization `vtex`, repository `ads-js`, the package's workflow file, no environment.
3. After the first real release, deprecate the placeholder version and remove the `bootstrap` dist-tag.

CodeArtifact needs no setup: it creates the package name on the first upload.
