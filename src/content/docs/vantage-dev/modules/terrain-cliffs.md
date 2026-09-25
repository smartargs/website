# Terrain cliffs

Grid-based cliffs painted in the Scene view, the way tile-based map editors do it. Every cell holds a whole level, cliffs appear where neighbouring levels differ, and flagged cells become ramps. On a Unity Terrain the map shapes the heightmap and paints a cliff layer along every drop, or stands wall meshes on the edges if you prefer. Without a terrain it builds its own ground and walls through a style. Building snaps to the same cells, so a wall footprint can never straddle a cliff edge.

## Setup

1. Add **Vantage → World → VtWorldGrid** to an empty object. Its position is the corner of cell (0, 0) and **Cell Size** is the cell edge in world units. One per scene; building reads it too.
2. Add **Vantage → Terrain → VtCliffMap** to the same object. Set **Width** and **Height** in cells and press **Resize**. Set **Level Height** for how tall one step is.
3. Assign your **Terrain** if you have one, then press **Fit To Terrain** to move the origin to its corner and size the grid to cover it. Without a terrain the map generates a walkable ground mesh at each cell's level.
4. With a terrain, pick how cliffs show under **Cliffs On Terrain**:

| Mode | What you get |
|---|---|
| Painted Slopes | The heightmap slope is the cliff. **Cliff Layer** is painted along every drop, ramp sides included; **Ground Layer** takes over where a cliff goes away. Nothing is hidden and there are no meshes. The default. |
| Wall Meshes | The style stands walls on the cell edges with a rock rim on top that hides the heightmap slope. |

5. Optionally assign a **Style** for Wall Meshes mode or for a scene without a terrain. Without one you get plain grey walls.

## Painting

Select the map and press **Edit Cliffs**, or pick **Cliff Editor** from the Scene view toolbar.

| Action | Effect |
|---|---|
| Click or drag | Raise the cells under the brush by one level. |
| Shift + click | Lower by one level. |
| Ctrl + click | Toggle a ramp on the cell. |
| Level mode | Set cells to the chosen level. |
| Block mode | Close cells to walking and building. Shift + click opens them again. |
| 1 to 5, [ and ] | Switch mode, shrink or grow the brush. |
| Esc, Stop Editing, or any toolbar tool | Leave the cliff editor. |

A ramp needs a neighbour exactly one level up on one side and the cell's own level on the opposite side. Cells that do not qualify keep their flag and turn into a ramp as soon as the neighbours fit. Ramps show green in the Scene view, blocked cells red.

Each stroke is one undo step, including the terrain heights it wrote.

## Terrain heights

A heightmap cannot stand vertical, so between two levels the terrain always slopes over one sample spacing. How steep a cliff looks is therefore set by the heightmap resolution: keep it fine enough that a cell holds eight or more samples. The map's inspector warns when it does not and offers **Set Heightmap Resolution**, which resamples the heightmap and the control map, writes every level back and repaints. Sculpting inside plateaus and hand-painted textures are lost when the resolutions change.

In Painted Slopes mode **Slope Width** sets how wide the blend between two levels is, centred on the cell edge and capped at one cell. Steepness is level height over slope width. The cliff layer is painted over that width plus **Cliff Paint Padding** on each side, so the rock covers the whole face and wraps a little over the lip. Terrain textures are projected straight down, so a steep face stretches its texture; a wider slope stretches less, and a triplanar terrain shader removes the stretch entirely. In Wall Meshes mode the slope is pushed just behind the wall and every wall carries a flat rock rim on top, twice the sample spacing deep, that hides it.

The map owns only the ground that makes the cliffs. In Painted Slopes mode that is the slope band along every level change, half the **Slope Width** on each side of the edge but never less than one heightmap sample, plus every ramp and the ground right around it. In Wall Meshes mode it is every cell beside a wall or ramp. Everything else keeps what the terrain height tools sculpted, so a riverbed or relief can run right up to the foot of a cliff. **Rebuild Cliffs** regenerates geometry, the owned heights and the paint, for after you swap the style or layers or edit the terrain by hand. **Write All Levels To Terrain** flattens the whole map to its levels when you want a clean start.

The terrain is written only when you change the cliffs: painting, the inspector's settings, **Rebuild Cliffs**, or `ApplyFromNet` with different levels. Opening the scene or entering Play mode never touches it. If the levels were changed without the terrain following, for example by editing the scene file, the map brings the terrain up to date the next time it loads.

While you paint, only the terrain around the brush is updated and the terrain's detail work waits for the end of the stroke, so strokes stay smooth on large terrains.

## Styles

**Create → Vantage → Terrain → Cliff Style (Procedural)** builds the walls as one mesh with a tiling material. Assign a rock material, set **UV Scale**, and it works with no models at all. A triplanar or world-space tiling shader hides the stretching on tall walls.

**Create → Vantage → Terrain → Cliff Style (Kit)** places modelled pieces:

| Piece | Shape |
|---|---|
| Wall Piece | One cell wide, one level high. Stacked for taller drops. |
| Ramp Side Rising | Triangle rising from nothing on the left to one level on the right. Optional. |
| Ramp Side Falling | The mirror. Optional. |

Author each piece in a unit box with local X running along the wall from left to right, Y up and the front facing local -Z; **Piece Size** tells the style how big your box is. Shapes the kit has no piece for are built procedurally with **Fallback Material**.

To place your own art in any other way, subclass `VtCliffStyle` and fill the root the map hands you:

```csharp
public sealed class MyCliffStyle : VtCliffStyle
{
    public override void Build(VtCliffMap map, Transform root)
    {
        var segments = VtCliffMeshBuilder.CollectSegments(map.Grid, Vector3.zero, map.CellSize);
        foreach (var segment in segments)
        {
            PlaceMyWall(root, segment.start, segment.end, segment.lowStart, segment.highStart, map.LevelHeight);
        }
    }
}
```

## Gameplay

- Painted slopes are steeper than a NavMesh agent's slope limit, and wall meshes carry a mesh collider, so a bake routes units around cliffs and up the ramps either way. Keep the ramp slope, level height over cell size, under the agent's limit.
- Building refuses a footprint that spans two levels or sits on a ramp with `VtBuildFailureReason.CrossesCliff`.
- Query the ground from code:

```csharp
var map = VtCliffMap.Instance;
map.GetLevelAtWorld(point);     // whole level of the cell under a point
map.SampleGroundHeight(point);  // world Y of the actual ground, sculpting included
map.SampleHeight(point);        // world Y of the cell's level, sloped on ramps, ignoring sculpting
map.WorldToCell(point);         // the cell itself
map.Grid.GetShape(cell);        // Flat, Edge or Ramp
map.IsBlockedAtWorld(point);    // true on a blocked cell
```

Use `SampleGroundHeight` to place props, units or effects on the ground. `SampleHeight` is the level the grid assigns, which is what footprints and cliff rules use.

`ApplyFromNet(levels, ramps, blocked)` mirrors a replicated or loaded map; `Grid.LevelsCopy()`, `Grid.RampsCopy()` and `Grid.BlockedCopy()` give the arrays to send. The generated walls are never saved with the scene and are rebuilt on load.

## Blocked cells

Blocked cells close ground without a cliff: river exits, deep water, fenced-off land. Paint them in Block mode or call `Grid.SetBlocked(cell, true)` and then `RebuildGeometry()`.

- Building refuses a footprint over a blocked cell with `VtBuildFailureReason.BlockedGround`, in every snap mode.
- The map puts a **Not Walkable** `NavMeshModifierVolume` over each run of blocked cells, under the generated root. Rebake the NavMesh after changing them, as after changing cliffs, and leave the `NavMeshSurface`'s **Collect Objects** on a mode that includes the map.
- Blocking a cell does not change its level or the terrain.
