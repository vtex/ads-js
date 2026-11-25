---
"@vtex/ads-stories": minor
---

The ESM build bundles Lit, lowered to ES2018 like the rest of the package, so bundlers that read `module` instead of `exports`, such as webpack 4 on VTEX IO, can import `@vtex/ads-stories` directly. `lit` stays a dependency for the type declarations.

`@vtex/ads-stories/react` also resolves in TypeScript projects that don't read `exports` (`moduleResolution: "node"`), such as VTEX IO apps, so `import type {} from "@vtex/ads-stories/react"` types `<vtex-ads-story-carousel>` in JSX there too.
