# Building

Place structures by paying items and currency. The builder shows a ghost that follows the cursor, snaps and rotates it, validates the footprint every frame, and spawns the prefab on confirm. The placed object is a unit, so it has HP, can hold an inventory, be a crafting station or a resource node, drop loot when destroyed, and be demolished for a refund.

Every field, its default and every member you can call: [Building reference](../reference/building.md).

## Authoring

1. **Create → Vantage → Building → Buildable Category** (Walls, Furniture, …).
2. Make the prefab that gets placed. It must have a `VtUnit`.
3. Optionally make a ghost prefab. Without one, the builder clones the real prefab as the preview. Either way the ghost's colliders, NavMesh obstacles and sockets are turned off, so it never blocks its own placement, carves the NavMesh or catches clicks.
4. **Create → Vantage → Building → Buildable Definition.**

| Field | Meaning |
|---|---|
| Icon / Icon Id | What a build menu or [hotbar](hotbar.md) shows. Icon Id names an icon from the package's icon set when there is no sprite. |
| Sort Weight | Order within the category, lowest first; equal weights keep the list order. Buildable categories have Icon Id too. |
| Prefab / Ghost Prefab | What spawns and what previews. |
| Item Cost / Currency Cost | Paid on placement, from the builder's own bag and wallet or from the [shared stash](shared-stash.md) that serves it. |
| Required Items | Tools the builder must carry in its own bag, such as a hammer. Not consumed. |
| Required Level, Required Completed Quests | Prerequisites. |
| Required Unlock | An [unlock](unlocks.md) that must be owned first. Refused with `Locked` until then. |
| Snap Mode | `Free`, `Grid`, `SurfaceAligned` (tilts to the surface) or `Socket` (see below). |
| Grid Cell Size, Footprint Cells | How many cells the piece covers. Cell size 0 uses the scene `VtWorldGrid`'s build cell (its Cell Size divided by Build Subdivisions); set a value to override it for this piece. A 1×1 piece sits on a cell centre, a 2×1 wall on the edge between two cells. |
| Rotation Step Degrees | How far one rotate press turns the ghost. 0 disables rotation. |
| Socket Family, Socket Snap Distance | Which sockets this piece connects to and from how far. |
| Placement Range | How far from the builder the piece may go, on the ground plane. 0 = anywhere. The preview reports `OutOfRange` beyond it. |
| Footprint Half Extents / Forbidden Overlap Mask | Box overlap check that blocks placement. |
| Allow Overlap With Units | For banners and ground markers. |
| Placement Rules | Checks of your own this piece must pass. See [Placement rules](#placement-rules). |
| Build Seconds | 0 spawns finished. More attaches a `VtBuildSite` that needs progress. |
| Refund On Cancel | Demolishing an unfinished site returns everything. |
| Demolish Refund Fraction | Share of the cost returned when a finished piece is demolished. |

5. Check **Use Builder** on the player's unit definition.
6. Add **Vantage → Building → VtBuildInput** to the player for the controls. See [Controls](#controls).
7. Optionally add the preview components to the player: **VtBuildGhostStyle**, **VtBuildRangeIndicator** and **VtBuildGridPatch**. See [Placement preview](#placement-preview).
8. Add **Vantage → World → VtWorldGrid** to the scene once. Its position is the grid origin and **Cell Size** the cell edge. **Build Subdivisions** splits each cell for building, so 2-unit cliff cells with 2 subdivisions give 1-unit building. Without one, building uses one-unit cells from the world origin.

With a [cliff map](terrain-cliffs.md) in the scene, grid and socket placements must sit on one flat level. A footprint across a cliff edge or on a ramp fails with `CrossesCliff`. The footprint is measured in build cells, and every cliff cell it covers even partly must pass, so on a finer build grid a piece may share a cliff cell with its neighbour or span two flat ones. A footprint over a cell the map marks as blocked fails with `BlockedGround` in every snap mode.

## Controls

`VtBuildInput` reads the player's input while a piece is being placed:

| Input | Keyboard and mouse | Gamepad |
|---|---|---|
| Place | Left button (Confirm Target) | South |
| Stop placing | Esc (Cancel), right button (Command) | East |
| Rotate | R, scroll wheel | D-pad right |
| Rotate back | Shift + R, scroll wheel | D-pad left |

Placing starts from a [hotbar](hotbar.md) slot, a build menu or `BeginPlacement`. While placing, the pointer belongs to the builder, so the placing click does not also walk or select, and the click that started placing never also places. While the wheel rotates, the camera does not zoom. Aiming a ground ability and placing cancel each other: the one started last wins.

| Field | Meaning |
|---|---|
| Keep Placing | `Never`, `WhileModifierHeld` (default: keep placing while Shift is held) or `Always`. The same piece is picked up again at the same rotation, until the next one cannot be paid for. |
| Rotate With Scroll Wheel | Off leaves the wheel to the camera. |
| Out Of Reach | `Refuse` (default) refuses a piece beyond its Placement Range. `WalkThere` keeps the ghost where it is, walks the player into range and places it on arrival. Needs a `VtTopDownClickToMove` on the player. |
| Action fields | Replace any input with an action of your own. Empty fields use the [input](input.md) defaults. |

Put `VtBuildInput` on the same object as the click input and selection. They only give way to placing on their own object. On a gamepad, the ghost needs a cursor: call `SetCursorProvider` (see below).

`Confirm()` and `Cancel()` do what the buttons do, for on-screen buttons.

**Walking to place.** With `WalkThere`, the walk ends in one of these ways:
- The piece is placed once it is in reach.
- Cancel stops both the walk and placing.
- Placing again aims at the cursor anew.
- If the spot becomes refused for another reason, or the player cannot get there, the walk stops and the ghost follows the cursor again.

`IsWalkingToPlace` tells a HUD it is under way. `VtUnitBuilder.HoldPlacement()` and `ReleasePlacement()` keep a ghost still for flows of your own.

## Placement preview

Three components on the player show where a piece can go. Each shows only while placing.

| Component | Shows | Fields |
|---|---|---|
| VtBuildGhostStyle | The ghost in **Valid Color** where the piece can go and **Refused Color** where it cannot. | **Look**: `Auto` tints a buildable's own ghost prefab and keeps its materials, and draws a ghost copied from the real prefab see-through. `Tint` or `ReplaceMaterials` forces one. **Valid Material** / **Refused Material** replace the built-in see-through material. |
| VtBuildRangeIndicator | A ring on the ground with the piece's Placement Range around the player, in **Out Of Range Color** while the ghost is too far. Hidden for pieces without a range. | Colours, **Thickness**, **Material**, **Follow Ground**. |
| VtBuildGridPatch | The grid cells around a `Grid` or `Socket` piece, fading at the edge. Cells a piece cannot use are in **Refused Color**: blocked cells and ramps on the [cliff map](terrain-cliffs.md), and cells holding a collider on the piece's Forbidden Overlap Mask. | **Radius Cells**, **Cell Gap**, colours, **Refresh Seconds**, **Height Offset**, **Material** (must use vertex colours). |

The ring and the grid lie on the ground: on the cliff map when the scene has one, otherwise on the piece's **Surface Mask**. Keep that mask to ground layers so they do not climb onto units. `VtGroundHeight.Sample(point, mask, fallback)` gives the same height to visuals of your own.

For the reason as text next to the ghost, read the [build presenter](#a-build-menu): `state.PlacementRefusalText` ("Out of range", "Something is in the way", a rule's text) and `state.PlacementPosition`. The text is empty while the piece can go there and while the cursor is off the ground.

## Driving it from code

```csharp
var builder = player.GetComponent<VtUnitBuilder>();

builder.IsAvailable(wall, out var reason);            // affordable and prerequisites met?
builder.BeginPlacement(wall, out reason);             // build-menu click
builder.BeginPlacement(wall, 90f, out reason);        // start turned 90 degrees
builder.RotateClockwise();
builder.TryPlace(out reason);
builder.CancelPlacement();
builder.TryDemolish(targetUnit, out reason);          // demolish tool on a placed piece

builder.OnPlacementMoved += (def, pos, rot, why) => { };   // every frame while placing; VtBuildGhostStyle tints from it
builder.OnPlaced         += (def, instance) => { };
builder.OnDemolished     += (def, unit) => { };
builder.OnBuildFailed    += (def, why) => Toast(VtFailureText.Describe(why));
```

`why` is a `VtBuildRefusal`: the `Reason` and, when a placement rule refused, the rule's `RuleKey`. `builder.CurrentRefusal` holds the ghost's refusal this frame and `builder.LastRefusal` the last refused call.

The cursor comes from `IVtBuildCursorProvider`. The default raycasts from the main camera through the mouse. Call `SetCursorProvider` for gamepad, touch or VR.

Costs are paid from `builder.CostSource`: the source set with `SetCostSource`, else the shared stash that serves the unit, else its own bag and wallet. Demolishing refunds the shared stash that paid for the piece, wherever the demolisher stands, and otherwise the demolisher's cost source.

## A build menu

`VtBuildPresenter` reads everything a build menu shows, so your menu only draws it:

```csharp
var presenter = new VtBuildPresenter();
presenter.Bind(player);                        // lists every buildable in the Definition Catalog
presenter.ShowCategory(walls);                 // or ShowAll()
var state = new VtBuildState();
presenter.Read(state);                         // every frame, or when something changed

foreach (var tab in state.Categories) { }      // sorted by Sort Weight, "Other" last; tab.Name, tab.Count
foreach (var tile in state.Buildables)
{
    // tile.Buildable, tile.CanBuild, tile.Reason, tile.Placing
    for (int i = tile.FirstCost; i < tile.FirstCost + tile.CostCount; i++)
    {
        var cost = state.Costs[i];             // cost.Item or cost.Currency, cost.Have / cost.Required
    }
}

presenter.Select(tile.Buildable, out var why); // starts placing; selecting it again stops
```

Fill `presenter.Buildables` to list a set of your own instead of the catalog. `VtFailureText.Describe(tile.Reason)` gives the player-facing reason, and the menu's own words ("Build", "Other", "Requires {0}") are localization keys on `VtBuildText.Keys`. `VtDefinitionCatalog.BuildableCategories` and `BuildablesInCategory` answer the same questions without a unit.

Every placed instance carries a `VtPlacedBuildable` with its definition and the id of the builder who placed it, which is what demolish and your own ownership rules read.

## Walls that connect

Put a **VtBuildSocket** at each end of the wall prefab, facing outward, with a family name such as `wall`. Set the wall buildable's Snap Mode to `Socket` with the same family. While placing, the ghost jumps to the nearest free socket in reach and takes its rotation, so walls line up end to end. With no socket in reach it falls back to the grid. The player can still rotate at a socket.

## Timed builds

A placed prefab with **Build Seconds** above 0 carries a `VtBuildSite`. Advance it however your game likes: a worker, a held key, or check **Auto Build** on the site for a piece that finishes on its own.

```csharp
site.AddBuildProgress(Time.deltaTime);
site.Progress01; site.SecondsRemaining; site.IsComplete;
site.OnBuildCompleted += s => { };
```

The site swaps **Site Visual** for **Complete Visual** when done. Demolishing an unfinished site refunds the full cost when **Refund On Cancel** is on.

## Placement rules

Add checks of your own, such as "not on water", "only near a camp" or "one per player". A rule is asked for the ghost every frame and again when the placement is committed, so the ghost's tint and the server's answer agree. Rules run after the built-in checks: first the scene's rules, then the piece's own, and the first refusal is what the player sees, as `RefusedByRule` with the rule's key.

- **For one piece:** list rule assets under **Placement Rules** on the buildable.
- **For every piece:** add **Vantage → Building → VtBuildPlacementRuleSet** to the scene and list the rules there, or call `VtBuildPlacementRules.Register(rule)` from code.

Two rules ship, under **Create → Vantage → Building → Rules**:

| Rule | Fields |
|---|---|
| Near Tagged Unit | The piece must be within **Radius** of a living unit with **Tag**. **Same Faction Only** ignores other factions, **Count Unfinished** accepts build sites, **Invert** refuses near such a unit instead ("not near an enemy base"). |
| Max Placed | At most **Max Count** of this piece, for each builder or in the whole world. |

Each rule has a **Reason Key**: a localization key or plain text shown when it refuses. `VtFailureText.Describe(refusal)` resolves it; an empty key shows "You cannot build here".

To write your own, subclass `VtBuildPlacementRule`:

```csharp
[CreateAssetMenu(menuName = "My Game/Rules/Not On Water")]
public sealed class NotOnWaterRule : VtBuildPlacementRule
{
    private readonly List<Vector3> cells = new List<Vector3>();

    protected override bool Check(in VtBuildPlacementContext context)
    {
        context.GetFootprintCellCenters(cells);
        foreach (var cell in cells)
            if (WaterMap.IsWater(cell)) return false;
        return true;
    }
}
```

Or implement `IVtBuildPlacementRule` on any class and register it. The context gives the builder, the unit, the buildable, position, rotation, yaw, and the footprint's cell centres. Rules run every frame while placing, so keep them cheap. Placement rules don't affect `IsAvailable` or the build menu, because they depend on where the piece goes.

**Preview and commit.** `context.IsCommit` is false for the ghost and true when the placement is paid. `context.RangeTolerance` is 0 for the ghost and the interact tolerance on commit; add it to your own distance checks. A rule may be stricter for the ghost than on commit, never looser. A rule that needs state only the server has should return true for the ghost and decide on commit.

## Custom snapping and footprints

Subscribe to `OnPlacementMoved`, compute your own position or validity, and feed it back through your UI. Hex grids and circular footprints fit this way without touching the package.

## Multiplayer

Placing and demolishing run on the server, which pays from the server's copy of the cost source and runs the placement rules again. A client learns only that its request was sent; the server's refusal reason does not reach it. Placed pieces are created and removed through `VtSpawning`. With the co-op sample's spawn hooks, give buildable prefabs a `NetworkObject` and the sample's buildable sync, and every client receives the piece, its buildable, its builder and its construction progress.
