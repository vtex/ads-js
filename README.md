<div align="center">
  <h1>VTEX Ads JavaScript SDK</h1>
  <p>
    <strong>Integrate VTEX Ads into your storefront with ease</strong>
  </p>
  <p>
  </p>
</div>

<!-- prettier-ignore-start -->
[![NPM ads-core](https://img.shields.io/npm/v/@vtex/ads-core?label=ads-core%20npm)](https://ad-server.vtex.systems/swagger-ui/)
[![NPM ads-react](https://img.shields.io/npm/v/@vtex/ads-react?label=ads-core%20npm)](https://ad-server.vtex.systems/swagger-ui/)
[![CI](https://github.com/vtex/ads-js/actions/workflows/ci.yml/badge.svg)](https://github.com/vtex/ads-js/actions/workflows/ci.yml)
[![Documentation](https://img.shields.io/badge/documentation-blue)](https://vtex.github.io/ads-js/)
<!-- prettier-ignore-end -->

## Packages

This repository is a **monorepo** powered by [pnpm](https://pnpm.io/) and contains two public npm packages:

| Package           | Description                                                                    |
| ----------------- | ------------------------------------------------------------------------------ |
| `@vtex/ads-core`  | Framework-agnostic SDK to fetch sponsored products from the VTEX Ad Network.   |
| `@vtex/ads-react` | Thin React layer (Provider + hook) on top of **ads-core** for an ergonomic DX. |

## Installation

```bash
# pick your favourite package manager
pnpm add @vtex/ads-core              # core only
pnpm add @vtex/ads-react             # React hooks
```

Both packages are shipped as **ES Modules** and include TypeScript declarations out of the box.

## Quick start

### Vanilla JS / TypeScript

```ts
import { getAds } from "@vtex/ads-core";

const ads = await getAds({
  account: "fashion",
  region: "aws-us-east-1",
  // see types for all available parameters
});

console.log(ads.byPlacement.homepage);
```

### React

```tsx
import { AdsProvider, useAds } from "@vtex/ads-react";

export function App() {
  return (
    <AdsProvider account="fashion" region="aws-us-east-1">
      <HomePage />
    </AdsProvider>
  );
}

function HomePage() {
  const { ads, isLoading } = useAds({ placement: "homepage" });

  if (isLoading) return <p>Loading…</p>;
  return <pre>{JSON.stringify(ads, null, 2)}</pre>;
}
```

## Documentation

Comprehensive guides & API reference at <https://vtex.github.io/ads-js/docs>.

Spin up the **playground** locally with `pnpm playground:dev` or try it online
at <https://vtex.github.io/ads-js/>.

## Release & Publishing

This repo uses [Changesets](https://github.com/changesets/changesets) for versioning and the DK CI/CD `npm-publish-v1` pipeline for publishing to npm.

### 1. Create a changeset

After your change is merged, or as part of your PR:

```bash
pnpm changeset
```

Select the affected package(s), choose the bump type (`patch` / `minor` / `major`), and describe the change. This generates a file under `.changeset/` that should be committed alongside your code.

### 2. Version packages

Once the changeset PR is merged into `main`, pull the latest and run:

```bash
git checkout main && git pull
pnpm version-packages
```

This reads all pending changesets, bumps the `package.json` versions, updates `CHANGELOG.md`, and removes the consumed changeset files.

**Open a separate PR** with this commit — `pnpm version-packages` must run after the changesets land on `main`, so it cannot be part of the same PR as the code change. After this PR is merged, proceed to step 3.

### 3. Tag and trigger the pipeline

Create and push a Git tag for each bumped package:

```bash
# Production release
git tag @vtex/ads-core@1.2.3
git push origin @vtex/ads-core@1.2.3

# Beta release
git tag @vtex/ads-core@1.2.3-beta.0
git push origin @vtex/ads-core@1.2.3-beta.0
```

Pushing the tag triggers the `npm-publish-v1` pipeline, which builds the package and publishes it to AWS CodeArtifact.

### 4. Publish to npm

After the pipeline completes, go to **Actions → Publish from CodeArtifact to npm** and trigger it manually with:

- **version**: the full tag name (e.g. `@vtex/ads-core@0.5.2`)
- **CA_TOKEN** and **CA_OWNER**: provided by the pipeline run output
- **environment**: `production` (default) or `beta`

> **Prerequisite:** each package must have a [NPM Trusted Publisher](https://docs.npmjs.com/trusted-publishers) configured on npmjs.com pointing to this repo and the `publish-npm.yml` workflow. This is a one-time setup per package.
