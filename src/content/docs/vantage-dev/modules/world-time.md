# World time

`VtWorldClock` runs day and night. A day is split into phases such as Dawn, Day, Dusk and Night. A phase can change stats, turn spawners on and off, and gate quests and dialogue. `VtDayNightLighting` moves the sun and tints the scene to match.

## Setup

1. **Create → Vantage → World Time → Day Phase** once per phase. Set **Start Time**: 0 is midnight, 0.25 is 6:00, 0.5 is noon, 0.75 is 18:00. A phase lasts until the next one starts; the last phase of the day runs through midnight.
2. **Create → Vantage → World Time → Day Night Cycle**. Set **Day Length Seconds** and **Start Time**, and drag the phases into **Phases** in any order.
3. Add **Vantage → World Time → VtWorldClock** to one GameObject in the scene and assign the cycle.

| Day Night Cycle | Meaning |
|---|---|
| Day Length Seconds | Real seconds one game day takes at time scale 1. 1200 is a 20-minute day. |
| Start Time | Time of day a new game starts at. |
| Phases | The phases of the day. |

## Phase modifiers

A phase can change stats on every unit while it lasts, for example +20% damage for undead at night, shorter sight for players through the Vision Radius stat, or less move speed for everyone.

| Day Phase | Meaning |
|---|---|
| Display Name | Name for the UI, or a localization key. |
| Start Time | Where the phase begins in the day. |
| Modifiers | Stat changes, the same rows items and buffs use. |
| Affected Tags | Only units with at least one of these tags. Empty means no tag filter. |
| Affected Factions | Only units of these factions. Empty means no faction filter. |

A unit has to pass both filters. The changes show up on the unit's `VtUnitModifiers` under the source `"phase"`, arrive on units that spawn during the phase, and leave when the phase ends. If you change a unit's tags or faction in the middle of a phase, call `VtWorldClock.Instance.RefreshModifiers(unit)`.

## Night-only monsters

Put the Night phase in a `VtMobSpawner`'s **Active Phases**. The spawner fills when night begins and, with **Despawn Outside Phases**, clears at dawn. See [Spawning](spawning.md).

## Quests and dialogue

**Create → Vantage → Quests → Requirements → Time Of Day** passes while the clock is in one of its **Phases** (empty means any) and has reached **Minimum Day**. Use it in a quest's requirements or on a dialogue answer. It never passes in a scene without a clock.

## Encounters

The **Set Time Of Day** encounter action moves the clock, for a boss that calls the night. With **Skip Forward** on, the clock runs forward so every phase and day in between fires; off, it jumps.

## Lighting

1. **Create → Vantage → World Time → Day Night Look**. A new look already has a warm day and a blue night; edit the gradients and curve to taste.
2. Add **Vantage → World Time → VtDayNightLighting** to any GameObject. Drag your directional light into **Sun** and the look into **Look**.

| Setting | Meaning |
|---|---|
| Rotate Sun | Move the sun along the look's path: up at 6:00, highest at noon, down at 18:00. Off keeps the light's rotation. |
| Drive Ambient | Set the scene's ambient color. Set **Lighting → Environment Lighting → Source** to **Color**. |
| Drive Fog | Set the scene's fog color. |

Lighting only changes how the scene looks, never gameplay. `Apply(timeOfDay)` shows a time of day at once, for previews.

## Runtime

```csharp
var clock = VtWorldClock.Instance;
clock.Day; clock.TimeOfDay; clock.Hours; clock.CurrentPhase; clock.TimeScale; clock.Paused;

clock.SetTimeOfDay(0.5f);
clock.SetTime(day: 3, timeOfDay: 0.25f);
clock.AdvanceHours(8f);
clock.SetTimeScale(10f);
clock.SetPaused(true);

VtWorldClock.OnPhaseChanged += (previous, current) => { };
VtWorldClock.OnNewDay       += day => { };
VtWorldClock.ActivePhase;
```

To react to dawn, dusk or any other phase, subscribe to `OnPhaseChanged` and compare the phase asset; there is no need to poll the clock. A flock of birds that leaves at dusk and returns at dawn:

```csharp
public sealed class Birds : MonoBehaviour
{
    [SerializeField] private VtDayPhaseDefinition dawn;
    [SerializeField] private VtDayPhaseDefinition dusk;

    private void OnEnable()  => VtWorldClock.OnPhaseChanged += HandlePhase;
    private void OnDisable() => VtWorldClock.OnPhaseChanged -= HandlePhase;

    private void HandlePhase(VtDayPhaseDefinition previous, VtDayPhaseDefinition current)
    {
        if (current == dawn) FlyIn();
        else if (current == dusk) FlyAway();
    }
}
```

Read `VtWorldClock.ActivePhase` once in `OnEnable` as well if the object can appear in the middle of a phase.

`AdvanceHours` fires every phase and day it passes, so use it for sleeping and waiting. `SetTime` jumps and fires at most one phase change and one new day. One large frame never skips a phase: every boundary crossed fires in order.

## Saving

`VtSaveSystem.Capture` stores the day, time, speed and pause state when the scene has a clock, and `VtSaveSystem.Restore` puts them back.

## Multiplayer

Every copy runs the clock on its own so time moves smoothly. Only the host or server can change it: `SetTime`, `AdvanceHours`, `SetTimeScale` and `SetPaused` return false on a client. Phase modifiers apply on every copy, so stats match without extra traffic.

With the co-op sample, add a `NetworkObject` and `VtNetcodeWorldClockSync` next to the clock; that is all. With another framework, send `clock.CaptureState()` to clients when they join and in `VtWorldClock.OnClockAdjusted`, which fires on the host after every change by hand, and apply it there with `clock.ApplyFromNet(state)`.

## Headless servers and tests

`VtWorldClockScheduler` is the clock without a scene. Build it from a cycle, call `Tick(deltaTime)` and read the same properties and events.
