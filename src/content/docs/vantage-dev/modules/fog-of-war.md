# Fog of war

Three states per patch of ground: unexplored (black), explored (dim) and visible. Vision sources reveal the area around them; a URP renderer feature draws the result over the scene, and an optional culler hides objects in the dark.

Every field, its default and every member you can call: [Fog of war reference](../reference/fog-of-war.md).

## Setup

1. Add **Vantage → Fog Of War → VtFogOfWar** to a scene object. Set **Pixels Per Unit** for resolution and the three alphas for the look. **Updates Per Second** (default 20) sets how often the fog is recomputed; fades keep their speed at any rate, and 0 updates every frame. Each update only touches the ground around vision sources and what is still fading, so the cost follows how much the units see, not the map size.
2. In your URP Renderer asset add the **Fog Of War Renderer Feature** and assign the `FogOfWarScreen` material that ships with the package. Enable **Depth Texture** on the URP asset.
3. Set **Vision Radius** on the player's unit definition. Units with a radius above 0 get a `VtVisionSource` and reveal the fog around them. Add **Vantage → Fog Of War → VtVisionSource** by hand to anything else that should see, such as a watchtower. Anything can implement `IVtVisionSource` and call `VtFogOfWar.RegisterSource` if the component does not fit.

On a unit, the **Vision Radius** stat changes how far it sees, like any other stat: a flat modifier adds world units, a percent modifier scales the radius. Put it on items, buffs, talents or a Night day phase (see [World time](world-time.md)) for a spyglass, a blinding smoke or shorter sight after dark. Network interest uses the same radius.

## Hiding things in the fog

Add **VtFogOfWarCuller** to the scene once, then **VtFogCullable** to any object that should react:

| Mode | Behaviour |
|---|---|
| Hide When Unexplored | Visible in vision, dimmed when explored, hidden when unexplored. Trees, rocks, buildings. |
| Hide When Not Visible | Visible in vision only. Monsters and anything that moves. |

**Explored Dim** sets how dark an explored object gets. Objects without `VtFogCullable`, such as the player, are never hidden or dimmed; turn the component off (`enabled = false`) to stop an object following the fog for a while.

## Cameras that see everything

**VtFogOfWarExclude** goes on a **camera** and makes that camera skip the fog pass, so it draws the scene unfogged. Use it for portrait and preview cameras that render off-map, and for cutscene cameras that should see everything. It does nothing on other objects.

## Queries

```csharp
VtFogOfWar.Instance.IsVisible(worldPos);
VtFogOfWar.Instance.IsExplored(worldPos);
VtFogOfWar.Instance.FogEnabled = false;
```

Call `Reinitialize` after changing the terrain size at runtime.

`VtFogOfWar.Instance.Field` is the fog as plain data (`VtFogField`): the opacity of every texel, which ones changed in the last update, and whether any are still fading. A headless server or a test can build a `VtFogField` directly, call `Reveal` for each viewer and `Step` to advance it.
