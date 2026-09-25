# Summons

Pets, minions and temporary allies. A summon ability spawns units that fight for the caster: they take the caster's faction, follow it, attack by stance, earn its kills, and count as its party.

Every field, its default and every member you can call: [Summons reference](../reference/summons.md).

## Authoring

1. Make a unit prefab for the summon with a unit definition, a basic attack that can auto-cast, and a mover if it should follow.
2. **Create → Vantage → Abilities → Effects → Summon** and assign the prefab.
3. Add the effect to a Self ability, or a Ground Point ability to summon at a spot.

| Field | Meaning |
|---|---|
| Prefab | Unit prefab to spawn. |
| Definition Override | Definition to use instead of the prefab's own. |
| Count | Units per cast, spread in a circle of **Spawn Radius**. |
| Max Active | Most summons from this effect at once. The oldest is dismissed to make room. 0 means no limit. |
| Lifetime Seconds | How long each lasts. 0 means until it dies or is dismissed. |
| Dismiss On Owner Death | End the summons when the caster dies. |
| Inherit Owner Faction | Fight for the caster's side instead of the definition's faction. |
| Add Companion Ai, Stance | Give each summon a `VtCompanionAi` starting in this stance. |

## Stances

| Stance | Behaviour |
|---|---|
| Passive | Follows the owner. Never attacks. |
| Defensive | Attacks the owner's target and anything that damages the owner or the companion. |
| Aggressive | Defensive, plus the nearest hostile inside the summon's **Aggro Range**. |

`VtCompanionAi` has **Follow Distance**, **Leash Distance** (teleport back beyond it), **Assist Range** (ignore targets farther from the owner) and **Think Interval**. It turns off a `VtHostileAi` on the same unit.

## What a summon shares with its owner

- **Kill credit.** XP, currency drops, kill objectives and loot reservation all treat a pet's kill as the owner's, including the owner's party share.
- **Party.** A pet counts as a member of its owner's party, so party-only heals and auras reach it.
- **Threat.** Monsters build threat on the pet that hits them, so a pet can tank.

## Runtime

```csharp
var summons = player.GetComponent<VtUnitSummons>();
foreach (var summon in summons.Active) DrawPetFrame(summon.Unit);

summons.SetStance(VtCompanionStance.Passive);
summons.DismissAll();
summons.Active[0].Dismiss();

summons.OnSummoned    += summon => { };
summons.OnSummonEnded += summon => { };
summon.SecondsRemaining;
VtSummon.ResolveCreditUnit(unit);
```

A summon that dies, times out or loses its owner ends on its next tick and despawns. Summons are not saved; permanent pets are recast after loading.

## Multiplayer

Dismiss and stance calls forward from the owner's client. Summons spawn and despawn through `VtSpawning.InstantiateFn` and `VtSpawning.DespawnFn`; the co-op sample's spawn hooks point them at network spawning, and its summon sync sends the owner link to clients. Networked summon prefabs carry `VtSummon`, `VtCompanionAi` and the sample's sync ahead of time, since components added on the server do not replicate.
