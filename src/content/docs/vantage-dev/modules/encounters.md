# Encounters

Monsters that use abilities, and boss fights with phases, adds, resets and rewards. Two parts: an ability rotation on any unit definition, and an encounter component in the scene.

## Ability rotations

Fill **Ability Rotation** on a unit definition and the unit casts on its own, alongside its basic attack. Entries are in priority order; each decision the first entry that is allowed is cast.

| Entry field | Meaning |
|---|---|
| Ability | What to cast. Granted automatically. |
| Target | `CurrentTarget`, `Self`, `TopThreat` or `RandomHostileInRange`. |
| Min Hp Fraction, Max Hp Fraction | Cast only while the unit's own health is inside this window. `0` to `0.3` makes an enrage. |
| Interval Seconds | Extra wait between uses on top of the ability's cooldown. |
| Only In Combat | Cast only while the unit has a target. |

A current-target entry that is out of range makes the unit close in. Pair a rotation with **Use Hostile AI**, which picks the target.

```csharp
var rotation = boss.GetComponent<VtAbilityRotation>();
rotation.OnRotationCast += (ability, target) => { };
```

## Encounters

Add **Vantage → Encounters → VtEncounter** to an empty object at the arena and fill it:

| Field | Meaning |
|---|---|
| Bosses | Units that must die to win. The first living one drives the phases. |
| Spawners | Add spawners, referenced by index from spawn actions. Turn off their **Spawn On Awake**. |
| Start Radius | Challengers this close start the fight. 0 means only engaging a boss starts it. |
| Leash Radius, Reset Delay Seconds | With no challenger inside the radius for this long, the fight resets. |
| Phases | Health thresholds with actions, highest first. |
| On Start, On Reset, On Complete | Actions for those moments. |
| Completion Rewards | Rewards for every challenger inside the leash radius on victory. A pet's reward goes to its owner. |
| Complete Once | Stay completed. Uncheck for a fight that can be pulled again once its bosses are back. |

Challengers are living units hostile to the bosses. A reset returns every boss to where it stood at the pull, with full health, no threat and no invulnerability, removes buffs the encounter applied, and clears the adds.

## Actions

**Create → Vantage → Encounters → Actions**:

| Action | Does |
|---|---|
| Cast Ability | The boss casts at once at the boss, its target, its top threat, a random challenger or every challenger. |
| Apply Buff | Buffs the boss, all bosses or challengers. Removed on reset. |
| Spawn Adds | Fills or clears the spawner at an index. |
| Set Invulnerable | Makes the boss or all bosses invulnerable or vulnerable. |
| Message | Raises `OnMessage` with a localized line for a yell or banner. |

A custom step subclasses `VtEncounterAction` and overrides `Execute(encounter, boss)`. `encounter.ResolveTargets`, `encounter.ApplyTrackedBuff` and `encounter.GetSpawner` are there for it.

## Runtime

```csharp
encounter.OnStarted      += e => ShowBossBar(e.PhaseBoss);
encounter.OnPhaseEntered += (e, index) => { };
encounter.OnMessage      += (e, line) => ShowYell(line);
encounter.OnReset        += e => HideBossBar();
encounter.OnCompleted    += e => PlayVictory();

encounter.State; encounter.CurrentPhaseIndex; encounter.ElapsedSeconds;
encounter.StartEncounter();
encounter.ResetEncounter();
```

## Behaviour trees and your own scripting

An encounter is deliberately a state machine with hooks, not a scripting language. For bosses that need more, run your behaviour tree or visual scripting graph from the events above and drive the same building blocks the actions use: `VtUnitAbilities.TryCastNow`, `VtUnit.SetInvulnerable`, `VtMobSpawner.SpawnAll` and `VtCombatEngagement.SetTarget`.

## Multiplayer and saving

Rotations and encounters run on the server. The co-op sample's encounter sync mirrors the fight on every client: whether it runs, the phase and the time since the pull, the start, phase, reset and win events, and boss lines, which each client localizes itself. Encounters are not saved, so a loaded scene starts every fight idle.
