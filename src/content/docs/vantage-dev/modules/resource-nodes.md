# Resource nodes

Trees, ore veins and fishing spots. A node is a unit that yields items on every hit, demands the right tool and skill, and grows back after it is depleted.

See it running: the [10 · Gathering and Crafting](../demos/10-gathering-crafting.md) demo scene. See [Demos](../demos/index.md) to import the scenes.

Use a plain unit with a [loot table](loot.md) for "thing dies, drops items". Use a resource node for "chop, chop, chop".

## Authoring

1. Create an **Item Tag Definition** for the tool, such as Axe, and add it to the tags of your axe items.
2. Create a **Crafting Skill** such as Woodcutting if you want a skill gate and per-hit XP.
3. **Create → Vantage → Resources → Resource Node Definition.**

| Field | Meaning |
|---|---|
| Harvest Entries / Rolls Per Hit | Weighted item pool rolled on every successful hit. |
| Required Item Tag | The attacker must have an item with this tag equipped. |
| Required Skill / Level / Xp Grant Per Hit | Skill gate and reward. |
| Accepted Damage Types | Hits of other types are ignored. |
| Respawn Seconds | 0 means the node is gone for good once depleted. |
| Alive Visual / Depleted Visual | Swapped on depletion and respawn. |

4. Assign it to **Resource Node** on a unit definition. Give the unit enough HP for the number of hits you want, faction Neutral and aggro range 0.

The **Gathering Speed** stat makes a unit swing faster at resource nodes only: 0.25 is 25% faster, added to its attack speed for abilities that scale with attack speed, such as the basic attack. Put it on tools, buffs or talents.

Drops go straight into the attacker's backpack, not onto the ground. When the backpack has no room for even one of anything the node yields, the hit is refused with `InventoryFull` ("Cannot carry more") and the node keeps its HP. A roll bigger than the room left, such as 5 wood into room for 2, places what fits, and `OnHarvested` reports what was placed. Nodes are Neutral, so nothing attacks them on sight, but they accept deliberate attacks: a player with `VtTopDownClickInput` harvests by right-clicking the node, and selected units with orders harvest on a right-click or an attack-move click. Anything else that should take deliberate attacks without being hostile, such as a practice dummy or a door, gets a component that implements `IVtCommandAttackable`.

## Feedback

```csharp
var node = tree.GetComponent<VtResourceNode>();
node.OnHarvestFailed += (attacker, reason) => Popup("Need an axe");
node.OnHarvested     += (attacker, drops) => Popup("+5 Wood");
node.OnDepleted      += () => { };
node.OnRespawned     += () => { };
node.IsDepleted; node.RespawnRemainingSeconds;
node.Respawn();
```

Nodes show ordinary damage numbers. Uncheck **Emit Combat Text** on the definition for a quiet harvest.
