---
"@vtex/ads-react": patch
---

Fix `require("@vtex/ads-react")`: the CommonJS build was emitted as `index.cjs.js`, which Node loads as an ES module in this `"type": "module"` package, so it returned no exports. It is now emitted as `index.cjs`.
