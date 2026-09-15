# Leveling

XP curves are assets, levels live on a component, and monsters award XP on death.

See it running: the [06 · Leveling and Talents](../demos/06-leveling-talents.md) demo scene. See [Demos](../demos/index.md) to import the scenes.

## Setup

1. **Create → Vantage → Leveling → XP Curve.** Fill **XP To Next Level** with one value per level (index 0 is level 1 → 2). Set **Max Level**. Levels past the array extrapolate from the last value.
2. On units that level, assign the curve to **XP Curve** on the unit definition and set **Starting Level**. The unit gets a `VtUnitLevel`.
3. On units that grant XP when killed, set **XP Award** on their definition.

## Runtime

```csharp
var level = player.GetComponent<VtUnitLevel>();
level.Level;
level.CurrentXp;
level.XpToNextLevel;
level.AddXp(120);
level.SetLevel(10);
level.OnLeveledUp += (oldLevel, newLevel) => Celebrate();
level.OnXpChanged += (lvl, xp, toNext) => RedrawBar();
```

`AddXp` applies the XP-gain stat, so "+25% XP" trinkets and rested bonuses work through normal modifiers. Restore a saved value exactly with `AddXp(saved, applyGainMultiplier: false)` or `ApplyLevelFromNet`.

## Reading level anywhere

Use `unit.Level` rather than looking up the component. It returns the live level for units that level and the definition's starting level for units that do not, so a hand-authored level 20 boss is level 20 to every level gate. `unit.OnLeveledUp` forwards the component's event.

Item requirements, per-level attribute growth, recipe levels and quest prerequisites all read this value.

## What the package does not decide

Stat gains per level are yours: subscribe to `OnLeveledUp` and push a modifier source, or author **Attribute Growth Per Level** on the unit definition and let the attribute formula do the rest.
