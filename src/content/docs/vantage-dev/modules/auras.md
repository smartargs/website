# Auras

An aura applies a buff to every eligible unit within a radius of its owner, for as long as they stay in range. Paladin auras, a necromancer's bone armor, a hex that slows enemies nearby: all auras.

See it running: the [04 · Stats, Buffs and Auras](../demos/04-stats-buffs-auras.md) demo scene. See [Demos](../demos/index.md) to import the scenes.

Every field, its default and every member you can call: [Auras reference](../reference/auras.md).

## Authoring

1. Create the buff (**Create → Vantage → Units → Buff Definition**) and set its stacking policy to **Refresh**. Two emitters of the same aura then share one instance on each target instead of stacking.
2. **Create → Vantage → Auras → Aura Definition.** Assign the buff and set:

| Field | Meaning |
|---|---|
| Radius | Effect radius in world units. |
| Target Filter | `SelfOnly`, `Allies`, `AlliesExceptSelf`, `Enemies` or `AllUnits`. |
| Required Tags / Excluded Tags | Only units with all required tags and none of the excluded ones. |
| Refresh Interval | How often the aura re-applies. Smaller is more responsive. |
| Mutually Exclusive With | Auras that cannot run on the same owner at the same time. Enabling one disables the others. |

3. Add the aura to **Passive Auras** on the unit definition. The unit gets one `VtAuraEmitter` per aura at spawn.

Units that leave the radius lose the buff shortly after the next interval.

Buff instances an aura applies are marked with `FromAura`, so a buff bar can show them as lasting while the unit stays in range instead of counting the refresh interval down over and over.

## Toggling at runtime

Add or find the `VtAuraEmitter`, set its `Definition`, and flip `enabled`. `Refresh()` forces an immediate application, for example right after a teleport.

Auras stop emitting while the owner is dead or unable to cast.
