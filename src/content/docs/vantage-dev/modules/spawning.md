# Spawning

`VtMobSpawner` keeps a number of monsters alive around a point and respawns them after they die.

See it running: the [08 · Spawners and Loot](../demos/08-spawners-loot.md) demo scene. See [Demos](../demos/index.md) to import the scenes.

## Setup

1. Create an empty GameObject where the monsters should appear.
2. Add **Vantage → Spawning → VtMobSpawner** and drag the monster prefab into **Prefab**.
3. Set **Respawn Time** on the monster's unit definition. 0 means no respawn.

| Setting | Meaning |
|---|---|
| Variants | Optional weighted list of prefabs. When filled, every spawn rolls one of them instead of Prefab. |
| Count | How many units the point keeps alive. 3 makes a pack; each one respawns on its own timer. |
| Spawn Radius | Units appear at a random point within this distance. 0 is exactly at the spawner. |
| Spawn On Awake | Off means you call `TrySpawn` or `SpawnAll` yourself. |
| Respawns After Death | Respawn after the definition's Respawn Time. |
| Reuse Instances | Revive the corpse in place on respawn instead of instantiating. Use it for dense areas. |
| Corpse Linger Seconds | Remove corpses after this long. 0 leaves them. Ignored with Reuse Instances. |
| Patrol Route | A `VtPatrolRoute` the spawned monsters walk, see [AI roaming](ai-roaming.md). |

## Runtime

```csharp
spawner.TrySpawn(out VtUnit spawned);
spawner.SpawnAll();
spawner.Despawn();
spawner.LiveUnits; spawner.LiveCount; spawner.PendingRespawns; spawner.RespawnSecondsRemaining;
spawner.Count = 5;

spawner.OnUnitSpawned         += unit => { };
spawner.OnUnitDied            += unit => { };
spawner.OnRespawnTimerStarted += seconds => { };
```

`CurrentUnit` is the first live unit, which is all you need for a single monster.

## Common setups

- **Boss after minions**: Spawn On Awake off, call `TrySpawn` from your encounter script.
- **Night-only**: call `SpawnAll` at dusk and `Despawn` at dawn.
- **Deterministic rolls** in tests or replays: `SetRandom` with your own `IVtRandom`.

Spawned units are created and removed through `VtSpawning`, the same hooks loot, buildings, projectiles and summons use. A networked game points `VtSpawning.InstantiateFn` and `VtSpawning.DespawnFn` at its spawn calls once, as the co-op sample's spawn hooks do. Override `InstantiatePrefab` in a subclass only when one spawner should spawn differently.
