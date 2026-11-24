---
sidebar_position: 2
---

# Personal data

The SDK sends VTEX Ads who the shopper is with two ids: the session id and,
optionally, the user id. Neither should be personal data. VTEX Ads doesn't
need to know who the shopper is, only to tell one shopper from another.

## Where the ids go

- **The ad request**: `session_id` and `user_id`, in the body of every request
  to the ad API.
- **The events**: `session_id` and `user_id`, in the body of every impression,
  view and click (`@vtex/ads-stories` sends them; see
  [Ad events](../ads-stories/events.md#ad-events)).
- **The page**: with `@vtex/ads-stories`, the `session-id` and `user-id`
  attributes are in the page's HTML, where any script on it can read them.

## Session id

`session-id` (Stories) or `sessionId` (core) is the store's session: a random,
opaque value that changes when the session does. Use the same one the store
sends with its other ad events. Don't build it from personal data.

## User id

`user-id` (Stories) or `userId` (core) is optional. When set, it is the
shopper's id in the store's platform, the same in every channel, so that
VTEX Ads can tell the same shopper apart across sessions.

Use an opaque id, such as the customer's internal id. Never send:

- an email address, a phone number or a name;
- a document number, such as a CPF or CNPJ;
- a hash of any of these. A hash of an email or a document can be matched
  back to the person by anyone who has the same data.

Without an id like that, leave `user-id` out: the ads and the events work
with the session id alone.

## Other fields

The same goes for the rest of the request: search terms, tags and any custom
field carry what the shopper is browsing, not who they are. A custom product
hydration strategy receives the identity too (see
[Product hydration](../ads-stories/product-hydration.md)): it shouldn't send
it anywhere else.
