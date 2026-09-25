# Threat

Threat gives monsters a memory of who hurt them, so tanks can hold aggro and healers can pull it. Without it a unit simply attacks whatever it was told to.

See it running: the [07 · AI and Threat](../demos/07-ai-threat.md) demo scene. See [Demos](../demos/index.md) to import the scenes.

Every field, its default and every member you can call: [Threat reference](../reference/threat.md).

## Enabling it on a monster

Check **Use Threat Table** on the unit definition. The unit gets a `VtThreatTable` and automatically writes threat for every hit it takes. Its combat engagement then follows the top entry: when someone overtakes the current target's threat, the monster switches.

Players do not need a table, but they should get a `VtThreatAutoSubscriber` so their heals generate threat on the monsters fighting the healed unit.

## How threat accumulates

| Event | Threat |
|---|---|
| A hit lands | Applied damage, scaled by the attacker's threat multiplier stat. |
| A heal lands | A fraction of the heal, on every monster already fighting the healed unit. |
| A hit lands near pack-mates | A fraction of the damage propagates to same-faction units within their aggro range. |

Tank gear grants the threat multiplier stat like any other modifier: `+50%` means every action writes one and a half times the threat.

Per table: **Decay Rate Per Second** (0 keeps threat until combat ends) and **Prune After Seconds** (rows with no activity are dropped).

## Abilities

Add these effects to abilities:

| Effect | Result |
|---|---|
| Taunt | Sets the caster above the current top threat and makes the target attack the caster. |
| AoE Taunt | The same for every monster in a radius. |
| Threat On Apply | Adds a fixed amount of threat, positive or negative, without damage. |
| Threat Shed | Removes the caster from every nearby table. Vanish, feign death. |

## Runtime

```csharp
var table = monster.GetComponent<VtThreatTable>();
table.TopAttacker;
table.GetThreat(player.Id);
table.AddThreat(player.Id, 50f);
table.Reset();
table.OnThreatChanged += topId => { };
```

Disable call-for-help on a hermit monster by setting **Call For Help Ratio** to 0 on its `VtThreatAutoSubscriber`; the global default lives in [Tuning](tuning.md).
