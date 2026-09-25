# Loot

A loot table decides what drops when a unit dies. Drops appear as pickable world items at the corpse; currency goes straight to the killer's wallet.

See it running: the [08 · Spawners and Loot](../demos/08-spawners-loot.md) demo scene. See [Demos](../demos/index.md) to import the scenes.

Every field, its default and every member you can call: [Loot reference](../reference/loot.md).

## Authoring a table

**Create → Vantage → Loot → Loot Table.**

| Section | Meaning |
|---|---|
| Guaranteed Drops | Always drop. Each rolls its own count between min and max. |
| Entries | The weighted pool. Higher weight is more likely. |
| Rolls | How many independent picks from the pool per death. |
| Currency Drops | Amount ranges credited to the killer's wallet. |
| Default World Item Prefab | A prefab with a `VtWorldItem`, spawned once per drop. |

To tune the chance of dropping anything at all, add an entry with **no item** and a weight. When the roll lands on it, nothing drops. One potion at weight 1 next to an empty entry at weight 9 is a 10% potion chance.

Assign the table to **Loot Table** on the unit definition. That is the whole setup.

## Adjusting drops in code

`VtLootDropper.OnRolled` hands you the list of drops before they spawn. Add, remove or resize entries for magic find, party rules or quest conditions.

```csharp
var dropper = boss.GetComponent<VtLootDropper>();
dropper.worldItemPrefab = bossLootBag;              // per-unit visual override
dropper.OnRolled += drops => { if (!questActive) drops.Clear(); };
```

For deterministic drops in tests or replays, call `dropper.SetRandom(yourRandom)` with your own `IVtRandom`.

## Multiplayer

Loot rolls on the server. Dropped items are created through `VtSpawning`, so with the co-op sample's spawn hooks a world item prefab that has a `NetworkObject` and the sample's world item sync reaches every client with its item, count and party reservation. Picking up runs on the server.
