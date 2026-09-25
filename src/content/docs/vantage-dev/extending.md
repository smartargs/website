# Extending

Most additions are new assets. Some are one small class. A few are an enum value inside the package.

The [Reference](reference/index.md) lists every base class and interface you can build on, with the shipped subclasses and the members to override.

## No code needed

| You want | Do this |
|---|---|
| A new buff, ability, item, recipe, quest, loot table, aura | Create the asset and reference it. |
| A new attribute (Wisdom, Luck) | Create an **Attribute Definition**, add a row to your **Attribute Formula**, grant it from items and buffs. |
| A new stat your items scale (bleed damage, magic find) | Create a **Stat Definition**. Reference it from a Damage effect's **Damage Bonus Stat** or read it in your code. |
| A new unit tag, item tag or rarity | Create the definition asset. Tags are queried with `HasTag`; rarities sort by weight. |
| A new pool max or regen stat | Create the stat and bind it on your **VtCoreStats** copy under Resource Pool Bindings. |

## One class

### Ability effect

```csharp
[CreateAssetMenu(menuName = "MyGame/Effects/Teleport")]
public sealed class TeleportEffect : VtAbilityEffect
{
    public override void Execute(in VtAbilityContext ctx)
    {
        var move = ctx.Caster.GetComponent<VtTopDownClickToMove>();
        if (move != null) move.Teleport(ctx.TargetPoint);
    }
}
```

The asset appears under your menu path. Drag it into any ability's Effects list. `ctx` gives you the caster, the definition, the target unit and the target point.

### Damage pipeline hooks

Shields, damage conversion, procs and on-kill effects subscribe to `VtUnitStats` events instead of changing the pipeline. See [Units and stats](modules/units.md#damage-and-healing).

### Quest objective or reward

Subclass `VtQuestObjective` or `VtQuestReward`. See [Quests](modules/quests.md#custom-objectives-and-rewards).

### Path provider, cursor provider, combat text presenter

Each is an interface with one or two members. See [Movement](modules/movement.md#pathfinding), [Building](modules/building.md#driving-it-from-code) and [Combat text](modules/combat-text.md#replacing-the-renderer).

### Spawner and roaming variants

Subclass `VtMobSpawner` or `VtRoaming`. See [Spawning](modules/spawning.md#variants) and [AI roaming](modules/ai-roaming.md#obstacles).

### Your own random source

Loot and resource nodes accept an `IVtRandom` through `SetRandom`, for seeded or server-controlled rolls.

## Enum values inside the package

These live in `Runtime/Enums` and are safe to extend by appending. Never reorder or renumber existing values: assets store the integers.

| Enum | Then |
|---|---|
| `VtDamageType` | Add a resistance stat asset, a field on `VtCoreStats`, and a case in `VtUnitStats.ResistFor`. Without a resist stat the new type only uses the all-resistance stat. |
| `VtResourceKind` | Optionally add max and regen stats and bind them on VtCoreStats. Add the pool to unit definitions and spend it from your code. |
| `VtAttackType`, `VtArmorType` | Add multiplier cells to `VtDamageMatrix.Rows`. Cells left out are 1.0. |
| `VtTraitKey` | Use a high number. Set it from buff trait overrides and read it with `VtUnitTraits.GetBool`. |
| `VtEquipmentSlot` | Author items for the new slot. Paired slots such as rings need a matching case in `VtUnitEquipment`. |
| `VtDamageSource` | A label only. Set it on `VtDamageInfo` and filter on it in your procs. |

Because these edits touch package files, keep the package in your project's `Packages/` folder rather than installing it read-only, and record what you changed so the next update is easy to merge.

## Not extensible

`VtDamageChannel` (melee, ranged, magic) and `VtTargetingMode` (self, single target, ground point) are wired into the pipeline and are not meant to grow by appending a value. Cone and chain targeting are effects: an AoE effect on a single-target ability already gives you a cleave.

## After any extension

1. The project compiles with no errors.
2. The package tests are green. See [Testing](testing.md).
3. Your own scene still plays.
