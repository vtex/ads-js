<div align="center">
  <h1>VTEX Ads JavaScript SDK</h1>
  <p>
    <strong>Delivers sponsored products for the VTEX Ad Network.</strong>
  </p>
  <p>

<!-- prettier-ignore-start -->
[![OpenAPI specification](https://img.shields.io/badge/specs-green?logo=swagger&label=OpenAPI)](https://ad-server.vtex.systems/swagger-ui/)
![Minimum Supported Rust Version](https://img.shields.io/badge/rustc-1.80+-ab6000.svg)
[![CI](https://github.com/vtex/ad-server/actions/workflows/check.yml/badge.svg)](https://github.com/vtex/ad-server/actions/workflows/check.yml)
[![Chat on Slack](https://img.shields.io/badge/%23team--ad--network-purple?logo=slack&label=Slack)](https://vtex.enterprise.slack.com/archives/C06QBFHREAC)
<!-- prettier-ignore-end -->

  </p>
</div>

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
pnpm add @vtex/ads-core @vtex/ads-react # core + React helpers
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
  const { ads, status } = useAds({ placement: "homepage" });

  if (status !== "success") return <p>Loading…</p>;
  return <pre>{JSON.stringify(ads, null, 2)}</pre>;
}
```

## Live playground

Spin up the **playground** locally with `pnpm dev` or try it online at
<https://vtex.github.io/ads-js/>.

## Documentation

Comprehensive guides & API reference are coming soon at
<https://vtex.github.io/ads-js/docs>.

## Contributing

1. Clone & install deps: `pnpm i`
2. Run the test suite: `pnpm test`
3. Open a pull request – we welcome fixes and improvements!
