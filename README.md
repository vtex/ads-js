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
