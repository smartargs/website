# Tuning

Every global number lives in one asset, `VtTuning`. The package ships defaults in `Runtime/Resources/VtTuning.asset`. To change them, create your own with **Create → Vantage → Tuning**, save it as `Assets/Resources/VtTuning.asset`, and your copy is used instead. Package updates never touch it.

| Group | Values |
|---|---|
| Combat clamps | Resistance cap, evade cap, crit cap, default crit multiplier, armor constant, minimum attack interval, cooldown-reduction cap, thorns filter, out-of-combat delay. |
| Abilities | Global cooldown, minimum cast time, minimum cooldown, cast queue depth. |
| Projectiles | Arrival radius, maximum lifetime, spawn height. |
| Threat | Heal threat ratio, taunt multiplier, call-for-help ratio. |
| Movement feel | Acceleration, rotation speed, waypoint reach distance, unreachable tolerance, stuck recovery, gravity. |

Every field has a tooltip in the Inspector.

## The armor formula

Damage after armor is `damage × K / (K + armor)`, where K is **Armor K**. With the default of 100, 100 armor halves damage and 300 armor cuts it to a quarter. Lower K makes each armor point stronger.

## Attack type versus armor type

The multiplier table for attack types against armor types is `VtDamageMatrix` in code. Only cells that differ from 1.0 are listed. See [Extending](../extending.md) for adding rows.

## Reading tuning from code

```csharp
VtTuning.Instance.globalCooldown;
VtCombatConstants.ArmorK;          // read-only facade over the same asset
VtMovementConstants.Acceleration;
```

Nothing is assignable at runtime. Tests swap the whole asset instead, see [Testing](../testing.md).
