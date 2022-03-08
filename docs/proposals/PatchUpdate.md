# Realtime Fine events

> Should be noted this is intentionally being made overly complicated in order to understand more concepts

Updated schema, adding in some simple metadata options, to help keep an eye on changes.

In theory we should never have a conflict, as with bowling each shot can take seconds to bowl, but if
two people do attempt to change something at the same time it can happen, mainly with removing an item
from the game lists, so these changes should help

```diff
{
  "season": string,
  "round": number,
  "players": PlayersMap,
  "captains": PlayersMap,
  "type": Type,
  
+  "lastUpdated": ISODate,
+  "createdAt": ISODate,
+  "revisionID": ObjectID
}
```

Changes to the way `PATCH` requests happen is now a `write control` will be passed, this will be used to validate versions of the data being passed along.

```diff
- type PatchBody = Array<PatchDocument>
+ interface PatchBody {
+		patches: Array<PatchDocument>
+	  writeControl: WriteControl
+ }
```

The newer way now places the main diffing at the `real time server`, this is where a shadow of the client should be held, this would allow for
RTF to work independently of the `fines` system, and can lock the data using Redis' CRDT abilities.

## References

### WriteControl

This should help control the way the patches are applied, so they are
only applied on valid documents, so we know the client is up-to-date with
the server.

> Added for 1.0.0

```typescript
interface WriteControl {
  requiredRevisionId: ObjectID;
}
```

### PlayersMap

> Updated for 1.0.0

```diff
- type PlayersMap = Map<string, GameList>
+ type PlayersMap = Map<string, GameMap>
```

### GameMap

> Added for 1.0.0

```typescript
type GameMap = Map<string, Array<string>> // Map('0' => ['H'], '1' => [])
```

### GameList

> Depreciated for 1.0.0

```typescript
type GameList = Array<Array<string>> // [[], ['H'], []]
```

### Type

```typescript
enum Type {
  week = 'week',
  round = 'round',
  block = 'block'
}
```
