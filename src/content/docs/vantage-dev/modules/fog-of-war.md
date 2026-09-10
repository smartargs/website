# Fog of war

Three states per patch of ground: unexplored (black), explored (dim) and visible. Vision sources reveal the area around them; a URP renderer feature draws the result over the scene, and an optional culler hides objects in the dark.

## Setup

1. Add **Vantage → Fog Of War → VtFogOfWar** to a scene object. Set **Pixels Per Unit** for resolution and the three alphas for the look.
2. In your URP Renderer asset add the **Fog Of War Renderer Feature** and assign the `FogOfWarScreen` material that ships with the package. Enable **Depth Texture** on the URP asset.
3. Set **Vision Radius** on the player's unit definition. Units with a radius above 0 get a `VtVisionSource` and reveal the fog around them. Add **Vantage → Fog Of War → VtVisionSource** by hand to anything else that should see, such as a watchtower. Anything can implement `IVtVisionSource` and call `VtFogOfWar.RegisterSource` if the component does not fit.

## Hiding things in the fog

Add **VtFogOfWarCuller** to the scene once, then **VtFogCullable** to any object that should react:

| Mode | Behaviour |
|---|---|
| Hide When Unexplored | Visible in vision, dimmed when explored, hidden when unexplored. Trees, rocks, buildings. |
| Hide When Not Visible | Visible in vision only. Monsters and anything that moves. |

**Explored Dim** sets how dark an explored object gets. Put **VtFogOfWarExclude** on objects that must never be affected, such as the player.

## Queries

```csharp
VtFogOfWar.Instance.IsVisible(worldPos);
VtFogOfWar.Instance.IsExplored(worldPos);
VtFogOfWar.Instance.FogEnabled = false;
```

Call `Reinitialize` after changing the terrain size at runtime.
