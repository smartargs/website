# Ticking

Every simulation component in Vantage advances through `Tick(float deltaTime)` and never reads the Unity clock itself. By default each component calls its own `Tick` from `Update`. You can take that over.

Every field, its default and every member you can call: [Ticking reference](../reference/ticking.md).

## One driver for everything

Add **Vantage → Core → VtTickDriver** to a scene object. From then on the driver advances every registered component once per frame in a fixed order, and the components' own `Update` methods do nothing.

Order of groups: Stats, Auras, Buffs, Abilities, Threat, Movement, Engagement, AI, World, Projectiles.

**Simulation Time Scale** on the driver scales the delta before it is handed out. Set it to 0 to pause the world while menus and UI keep running, or to 0.2 for slow motion.

## Ticking from your own loop

Servers, replays and tests call the manager directly:

```csharp
VtTickManager.Tick(1f / 30f);
```

Components register themselves in `OnEnable`, so anything alive is included.

## Adding your own tickable

```csharp
public sealed class DayNight : MonoBehaviour, IVtTickable
{
    private void OnEnable()  => VtTickManager.Register(this, VtTickGroup.World);
    private void OnDisable() => VtTickManager.Unregister(this);

    public void Tick(float deltaTime) { }

    private void Update()
    {
        if (VtTickManager.IsDriven) return;
        Tick(Time.deltaTime);
    }
}
```

The `Update` fallback keeps the component working in scenes without a driver.
