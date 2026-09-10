# Units and stats

The unit is the one building block. This page covers the unit definition, resource pools, stats and attributes, buffs, and death.

## Authoring a unit

**Create → Vantage → Units → Unit Definition.** The important sections:

| Section | What it controls |
|---|---|
| Identity | `id`, display name, faction, targeting priority, tags. |
| Pools | One row per resource: kind (HP, MP, Stamina, Rage, …), base max, starting value, regen mode and rate. Every fighting unit needs an HP row. |
| Basic attack | Damage range, damage type, attack type, range, interval, optional splash and projectile. Read by the shared basic-attack ability. |
| Defense | Armor type (used by the attack-type × armor-type table). |
| Abilities | The basic attack and any abilities granted at spawn. |
| Attributes | Base attribute points and growth per level. |
| Immunities | Crowd-control categories and damage types this unit ignores. |
| Innate modifiers and traits | Stat rows and trait overrides the unit always has. |
| Opt-ins | Checkboxes and references that attach optional systems: loot table, XP curve, threat table, quest log, crafting, resource node, builder, roaming, hostile AI, vision radius, auras, starting equipment and inventory. |

Assign the definition to a `VtUnit` component. At spawn the unit builds its pools, grants its abilities, equips its starting gear and attaches every opt-in module.

## Reading and changing stats

```csharp
var stats = unit.GetComponent<VtUnitStats>();
stats.HP;                     // current HP
stats.MaxHP;                  // after modifiers
stats.GetPool(VtResourceKind.MP)?.Current;
stats.SpendResource(VtResourceKind.MP, 20);
stats.RestoreResource(VtResourceKind.MP, 20);
```

Stat bonuses are sources on `VtUnitModifiers`. A source is a named array of rows; replacing or removing the source updates every dependent value.

```csharp
var mods = unit.GetComponent<VtUnitModifiers>();
mods.SetSource("potion_haste", new[]
{
    new VtItemModifier { stat = VtCoreStats.Instance.attackSpeed, value = 0.10f, isPercentage = true },
});
mods.RemoveSource("potion_haste");
```

The shipped stats live on `VtCoreStats.Instance` (armor, crit chance, evade, lifesteal, resistances, power, pool max and regen stats, and more). Reference them from code through that singleton; reference them in assets by dragging the stat asset in.

## Attributes

Attributes are your game's primary numbers: Strength, Intelligence, Luck. Create them with **Create → Vantage → Units → Attribute Definition**. Items and buffs grant attribute points the same way they grant stats. To make attributes matter, create an **Attribute Formula** asset with rows like "Strength → +1 physical power per point", add a `VtAttributeDerivedStatsBinding` to the unit, and assign the formula. Base points and per-level growth are set on the unit definition.

## Buffs

**Create → Vantage → Units → Buff Definition.** A buff has stat rows, attribute rows, trait overrides (for example `CanCast = false` for a silence), an optional tick that deals damage or heals every N seconds, a default duration, a crowd-control category, and a stacking policy: unique, refresh, add duration, or independent stacks.

```csharp
var buffs = unit.GetComponent<VtUnitBuffs>();
buffs.ApplyBuff(burning, duration: 5f, applier: attacker.Id);
buffs.HasBuff(burning);
buffs.RemoveBuff(burning);
buffs.OnBuffAdded += instance => { };
```

Buffs are usually applied from an ability with the **Apply Buff** effect. A unit whose definition lists the buff's crowd-control category under immunities refuses it and shows an Immune popup.

## Damage and healing

```csharp
target.TakeDamage(new VtDamageInfo
{
    rawAmount = 35f,
    type = VtDamageType.Fire,
    channel = VtDamageChannel.Magic,
    source = VtDamageSource.Ability,
    attacker = caster.Id,
});

stats.Heal(25);
stats.Heal(25, applier: healer.Id, canCrit: true);
```

Hooks on `VtUnitStats`:

| Event | Use it for |
|---|---|
| `OnPreTakeDamage` | Change or cancel a hit before it resolves: shields fill `absorbed`, conversions change `type`, `cancelled = true` drops it. |
| `OnPostTakeDamage` | React to a resolved hit. `appliedDamage` is final. |
| `OnPreDealDamage` / `OnPostDealDamage` | Same two moments, on the attacker. |
| `OnEvaded`, `OnHealed` | Misses and heals, for feedback. |
| `OnDied`, `OnRevived` | Death and resurrection. `VtUnitStats.OnAnyUnitDied` is a static version for systems that watch every unit. |

## Death and revive

A unit with 0 HP is dead. It ignores further damage and every kind of healing, including regen and heal-over-time ticks. Bring it back with `Revive`:

```csharp
if (stats.IsDead) stats.Revive(Mathf.CeilToInt(stats.MaxHP * 0.3f));
```

Respawning a unit by assigning its definition again also restores it, without firing `OnRevived`.

## Level

Read a unit's level from `unit.Level`. Units with an XP curve track it on their `VtUnitLevel` component; units without one report their definition's starting level. Subscribe to `unit.OnLeveledUp` for level-ups. See [Leveling](leveling.md).

## Traits

Traits are categorical values with priorities: armor type, attack type, damage type, and boolean flags such as `CanCast` or `CanMove`. The definition seeds them at priority 0; buffs and items override at higher priorities.

```csharp
var traits = unit.GetComponent<VtUnitTraits>();
if (!traits.GetBool(VtTraitKey.CanCast, true)) return;
```

## Custom stats

Stats the package does not ship, such as `magic_find`, are just more Stat Definition assets. Reference them from items and effects by dragging them in. If your code looks them up by id at runtime, list them in a **Stat Registry Bootstrap** asset placed at `Assets/Resources/VtStatRegistryBootstrap`.
