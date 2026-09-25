# Shared stash and costs

Building, crafting and unlocks take their costs from a *cost source*. By default that is the acting unit's own bag and wallet. Place a **VtSharedStash** in the scene and every unit it serves pays from the stash instead: the team's stone and wood in a co-op survival game, or one side's resources in a strategy game.

Every field, its default and every member you can call: [Shared stash and costs reference](../reference/shared-stash.md).

## Setup

1. Add an empty object to the scene and give it **Vantage → Economy → VtSharedStash**. A `VtPersistentId` is added with it.
2. Pick who it serves:

| Field | Meaning |
|---|---|
| Scope | **Faction** serves every unit of the faction below. **Members** serves only the units in the member list. |
| Faction | The faction served, `Player` by default. All players in a co-op game share it. |
| Members | The units served when Scope is Members. Add more from code with `AddMember`. |
| Zone Tag | Serve units only while they stand in a zone around a unit with this tag, such as a camp around a campfire. Empty serves them anywhere. See below. |
| Zone Same Faction Only | Only zones of the served unit's own faction count. On by default. |
| Starting Items / Starting Currency | Added once when the scene starts. |

3. Add the stash's items, currencies and unlocks to the [Definition Catalog](saving.md) so it can be saved and sent over the network.

When two enabled stashes serve the same unit, the one enabled first wins. Disable a stash to stop it serving.

## What changes for a served unit

- **Building** checks and pays the item and currency cost from the stash. Demolishing a piece refunds the stash that paid for it, wherever the demolisher stands.
- **Crafting** takes ingredients from the stash. A timed craft pays when it finishes, from the source that served the unit when it started, so a craft started in camp still pays from the stash after the player walks out; if that source no longer has the ingredients, the craft fails and produces nothing. The crafted item goes into the crafter's own bag, or back into the stash when the recipe's **Output Destination** is Cost Source (planks cut at camp go into the pool). See [Crafting](crafting.md).
- **Unlocks** bought by the unit are paid from the stash and belong to the whole team: they stay owned wherever a member stands. With a Zone Tag, an unlock bought outside every zone is paid from the pack and kept by that unit alone. See [Unlocks](unlocks.md).
- **Tools stay personal.** A buildable's or recipe's **Required Items**, such as a hammer, must be in the unit's own bag.
- The unit's own bag and wallet no longer count toward costs while a stash serves it.

Vendors are not affected: buying and selling always use the customer's own bag and wallet.

## Filling it

```csharp
stash.Deposit(player, stone, 10);          // from the unit's bag
stash.DepositCurrency(player, gold, 50);   // from the unit's wallet
stash.DepositAll(worker);                  // everything a worker carries, at a drop-off point
stash.DepositAll(player, VtStashDepositFilter.ItemsTagged(resourceTag));   // only resources; tools and food stay
stash.AddItem(wood, 5);                    // straight in, from your own code

stash.GetItemCount(stone);
stash.GetCurrency(gold);
stash.OnChanged += RefreshStashPanel;
```

A `VtStashDepositFilter` picks what `DepositAll` moves: items with at least one of its **Tags** (empty means every item), and the wallet only when **Include Currency** is on. It is serializable, so a drop-off point or a button can hold one in the Inspector. Items that cannot be traded always stay with the unit, and deposited items lose their wear.

Depositing is refused for a unit the stash does not serve, such as one outside its zone. On a client, `Deposit`, `DepositCurrency` and `DepositAll` send the request to the host as one command, which checks this before moving anything. A filtered deposit sends its tags by id; give every tag an id.

## Serving by place: camps and drop-off points

Give the stash a **Zone Tag** and it serves units only while they stand near a unit with that tag: a campfire in a survival game, a drop-off point or base in a strategy game, a guild hall. Put **Vantage → Economy → VtStashZone** on that unit (usually the placed piece's prefab) and set its **Radius**. Any number of zones work for one stash, and zones placed during play count at once.

- A zone counts while its unit is alive, and once its build site is finished unless **Count Unfinished** is on.
- Away from every zone the unit pays from its own bag and wallet again, so the first campfire of a new camp is built from the pack.
- Build and crafting menus show costs against whatever pays right now. Read the presenter every frame; `VtBuildState.Stash` and `VtCraftingState.Stash` say which stash pays, or null for the own pack.
- In multiplayer the host lets a unit at a zone's edge count as inside by the interact tolerance from `VtTuning`, while clients do not, so a menu never shows the stash where the host would refuse it.

## Your own pool

Implement `IVtCostSource` (count, spend and give back items and currency) for a guild bank, a per-player pool or anything else, and hand it to a component:

```csharp
builder.SetCostSource(myPool);
crafter.SetCostSource(myPool);
unlocks.SetCostSource(myPool);
builder.SetCostSource(null);               // back to stash or own bag
```

`VtCostSources.Resolve(unit)` returns the source a unit would pay from, and `VtCostSources.HasItems`, `HasCurrency`, `SpendItems`, `SpendCurrency` and `Refund` run cost lists against any source for systems of your own.

## Saving and multiplayer

`VtSaveSystem` saves every enabled stash with the scene, under its persistent id. In the co-op sample, give the stash a `NetworkObject` and **VtNetcodeStashSync**; the host sends the contents to every client when they join and after every change.
