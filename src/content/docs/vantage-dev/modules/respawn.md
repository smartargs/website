# Respawn

What happens after a player dies. Rules say how long the wait is, where the unit comes back, with how much health, and what it loses. The library runs the flow and raises events for your death screen.

## Authoring

1. **Create → Vantage → Respawn → Respawn Rules.** One asset usually serves every player.
2. Assign it to **Respawn Rules** on the player's unit definition. A `VtUnitRespawn` component attaches on spawn.
3. Place **VtRespawnPoint** components in the scene at graveyards, shrines or bases. Give them factions if a point serves one side only, and an id if rules point at one specifically.

| Rule | Meaning |
|---|---|
| Delay Seconds | Wait after death before respawn is allowed. |
| Automatic | Respawn as soon as the delay passes. Off means your UI calls `Respawn` from a button. |
| Mode | `NearestPoint`, `FixedPoint` by id, `Checkpoint` from the last `SetCheckpoint` call, or `WhereDied`. Every mode falls back to the nearest point, then to where the unit died. |
| Revive Hp Fraction | Health on return as a fraction of maximum, never below 1. |
| Xp Loss Fraction | Share of the XP toward the next level that is lost. A level is never lost. |
| Durability Loss Fraction | Share of each equipped item's maximum durability worn off. |

Monsters do not use this; spawners bring them back.

## Runtime

```csharp
var respawn = player.GetComponent<VtUnitRespawn>();
respawn.OnDeathStarted += seconds => ShowDeathScreen(seconds);
respawn.OnRespawnReady += () => releaseButton.visible = true;
respawn.OnRespawned    += position => HideDeathScreen();

releaseButton.onClick += () => respawn.Respawn();

respawn.IsWaiting;
respawn.SecondsRemaining;
respawn.CanRespawnNow;
respawn.SetCheckpoint(shrine.position);
```

`Respawn` refuses while the unit is alive or the delay is still running. On a networked client it forwards to the server, which applies the rules to its own copy. The wait, death position and checkpoint save with the unit, so a reload mid-wait continues the countdown.
