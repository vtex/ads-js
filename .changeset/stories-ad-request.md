---
"@vtex/ads-stories": minor
---

Request the Story from the ad API with `@vtex/ads-core` instead of rendering a fixed test Story. The element takes the `publisher-id`, `session-id` and `placement` attributes (required) and `user-id`, `account-name` and `channel` (optional), and renders nothing while loading, without a required attribute, on error or when the placement has no Story.
