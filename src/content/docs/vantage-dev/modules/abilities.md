# Abilities

An ability is a definition asset that says when and at what it can be cast, plus a list of effect assets that say what happens.

## Authoring

**Create → Vantage → Abilities → Ability Definition.**

| Field | Meaning |
|---|---|
| Targeting Mode | `Self`, `SingleTarget` or `GroundPoint`. |
| Range | Maximum distance, measured on the ground plane. 0 means no range check. |
| Resource Kind / Cost | What the cast spends. Charged at cast start, refunded if interrupted. |
| Cast Time | 0 for instant. Otherwise a cast bar runs first. |
| Cooldown | Seconds before the ability can be cast again. |
| Triggers GCD / Ignores GCD | Whether the cast starts the global cooldown and whether it waits for it. A basic attack does neither. |
| Can Auto Cast | Lets the ability sit in the auto-fire slot, which is how auto-attacking works. |
| Scales With Attack Speed / Range Bonus | Attack-speed stat shortens the cooldown; range-bonus stat extends the range. |
| Is Channeled | The cast keeps running for `Channel Duration`, firing `Tick Effects` every `Channel Tick Interval`. |
| Effects | Runs in order when the cast resolves. |

Then create effect assets under **Create → Vantage → Abilities → Effects** and drag them into **Effects**.

## Shipped effects

| Effect | What it does |
|---|---|
| Damage | Rolls a damage range, optionally scaled by a stat, and sends it through the pipeline. Can launch a projectile, splash to nearby units, and chain more effects on hit. |
| Basic Attack Damage | Like Damage, but reads the numbers from the caster's unit definition. One asset serves every unit. |
| Heal | Restores HP, with an optional crit roll. |
| Apply Buff | Applies a buff definition to the target for a duration. |
| AoE Damage, AoE Heal, AoE Buff | The same, to every unit in a radius around the target or a ground point. |
| Persistent AoE Damage | Leaves a damaging area on the ground for a while. |
| Taunt, AoE Taunt, Threat On Apply, Threat Shed | Threat manipulation, see [Threat](threat.md). |
| Learn Recipe | Teaches a recipe, see [Crafting](crafting.md). |

New behaviour is a new effect class; see [Extending](../extending.md).

## Casting from keys

Put `VtAbilityHotkeys` on the player and fill its slots. Each press casts at the unit or point under the cursor, or at the current target. See [Movement and input](movement.md#casting-from-keys).

## Casting from code

```csharp
var abilities = unit.GetComponent<VtUnitAbilities>();
abilities.GrantAbility(fireball);

var result = abilities.TryCast(fireball, VtAbilityTargetData.SingleTarget(enemy));
if (result != VtAbilityCastFailReason.Success) ShowFeedback(result);

abilities.TryCast(rainOfFire, VtAbilityTargetData.GroundPoint(clickPoint));
abilities.TryCast(warCry, VtAbilityTargetData.Self());

abilities.InterruptCast();
```

`TryCast` tells you exactly why a cast was refused: not granted, invalid target, out of range, on cooldown, on global cooldown, not enough resource, caster dead, incapacitated, or already casting. If the unit is mid-cast, one follow-up cast is queued and fires when the current one resolves.

Auto-attack is the auto-fire slot:

```csharp
abilities.SetAutoCast(unit.Definition.basicAttack, enemy);
abilities.ClearAutoCast();
```

While a target is set, the unit chases into range, faces it, and recasts the ability whenever it is ready.

## What interrupts a cast

Taking damage, losing the ability to cast (stun, silence), an explicit `InterruptCast`, and a new move order from the click-to-move input. Interrupts refund the resource cost and drop the queued cast.

## Events

```csharp
abilities.OnAbilityCastStarted     += def => ShowCastBar(def.castTime);
abilities.OnAbilityCast            += def => PlayVfx(def);
abilities.OnAbilityCastInterrupted += def => HideCastBar();
abilities.OnGCDStarted             += () => FlashHotbar();
abilities.OnAbilityChannelTick     += def => PulseVfx();
abilities.OnAbilityChannelEnded    += def => HideChannelBar();
```

Cooldowns for a hotbar: `abilities.GetCooldown(def)` and `abilities.GetCooldownFraction(def)`.

## Projectiles and area effects

Set a prefab on the Damage effect's **Projectile** to make the ability fire a projectile that resolves damage on impact, with optional homing and arc. Fill in **Splash** to damage units near the primary target with distance falloff and an optional cone. The unit definition's basic attack has the same two options.
