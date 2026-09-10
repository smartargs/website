# Building

Place structures by paying items and currency. The builder shows a ghost that follows the cursor, snaps and rotates it, validates the footprint every frame, and spawns the prefab on confirm. The placed object is a unit, so it has HP, can hold an inventory, be a crafting station or a resource node, drop loot when destroyed, and be demolished for a refund.

## Authoring

1. **Create → Vantage → Building → Buildable Category** (Walls, Furniture, …).
2. Make the prefab that gets placed. It must have a `VtUnit`.
3. Optionally make a ghost prefab. Without one, the builder clones the real prefab as the preview.
4. **Create → Vantage → Building → Buildable Definition.**

| Field | Meaning |
|---|---|
| Prefab / Ghost Prefab | What spawns and what previews. |
| Item Cost / Currency Cost | Paid on placement. |
| Snap Mode | `Free`, `Grid`, `SurfaceAligned` (tilts to the surface) or `Socket` (see below). |
| Grid Cell Size, Footprint Cells | How many cells the piece covers. Cell size 0 uses the scene's `VtWorldGrid`, which cliffs share; set a value to override it for this piece. A 1×1 piece sits on a cell centre, a 2×1 wall on the edge between two cells. |
| Rotation Step Degrees | How far one rotate press turns the ghost. 0 disables rotation. |
| Socket Family, Socket Snap Distance | Which sockets this piece connects to and from how far. |
| Footprint Half Extents / Forbidden Overlap Mask | Box overlap check that blocks placement. |
| Allow Overlap With Units | For banners and ground markers. |
| Build Seconds | 0 spawns finished. More attaches a `VtBuildSite` that needs progress. |
| Refund On Cancel | Demolishing an unfinished site returns everything. |
| Demolish Refund Fraction | Share of the cost returned when a finished piece is demolished. |

5. Check **Use Builder** on the player's unit definition.
6. Add **Vantage → World → VtWorldGrid** to the scene once. Its position is the grid origin and **Cell Size** the cell edge. Without one, building uses one-unit cells from the world origin.

With a [cliff map](terrain-cliffs.md) in the scene, grid and socket placements must sit on one flat level. A footprint across a cliff edge or on a ramp fails with `CrossesCliff`.

## Driving it from UI

```csharp
var builder = player.GetComponent<VtUnitBuilder>();

builder.IsAvailable(wall, out var reason);            // affordable and prerequisites met?
builder.BeginPlacement(wall, out reason);             // build-menu click
builder.RotateClockwise();                            // R key
builder.TryPlace(out reason);                         // left click
builder.CancelPlacement();                            // Escape
builder.TryDemolish(targetUnit, out reason);          // demolish tool on a placed piece

builder.OnPlacementMoved += (def, pos, rot, valid, why) => TintGhost(valid);
builder.OnPlaced         += (def, instance) => { };
builder.OnDemolished     += (def, unit) => { };
builder.OnBuildFailed    += (def, why) => Toast(why);
```

The cursor comes from `IVtBuildCursorProvider`. The default raycasts from the main camera through the mouse. Call `SetCursorProvider` for gamepad, touch or VR.

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

## Custom snapping and footprints

Subscribe to `OnPlacementMoved`, compute your own position or validity, and feed it back through your UI. Hex grids and circular footprints fit this way without touching the package.
