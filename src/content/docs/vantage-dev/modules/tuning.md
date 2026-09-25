# Tuning

Every global number lives in one asset, `VtTuning`. The package ships defaults in `Runtime/Resources/Vantage/VtTuning.asset`. To change them, create your own with **Create → Vantage → Tuning**, save it as `Assets/Resources/VtTuning.asset`, and your copy is used instead. Package updates never touch it.

To keep the asset somewhere else, reference it from a boot scene and hand it over before gameplay starts:

```csharp
VtTuning.OverrideInstance(myTuning);
```

The values are grouped into combat clamps, abilities, projectiles, threat, multiplayer, party, dropped items, chat, guilds, friends, mail, movement feel and server-authoritative movement. The [Tuning reference](../reference/tuning.md) lists every field with its default, allowed range and what it changes.

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
