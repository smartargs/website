# Inventory

`VtUnitInventory` is an optional backpack: a flat list of item stacks. Add it to units that carry things, usually the player. Items in the bag grant nothing; equip them to get their bonuses.

## Setup

Add **Vantage → Items → VtUnitInventory** to the prefab and set **Base Capacity** (0 means unlimited). Assign a stat to **Capacity Stat** if bags should be able to add slots; a bag item then grants "+6" on that stat like any other modifier.

Items listed under **Starting Inventory** on the unit definition are added at spawn.

## Runtime

```csharp
var inv = unit.GetComponent<VtUnitInventory>();
inv.TryAddItem(potion, 3);
inv.TryRemoveItem(potion, 1);
inv.GetCount(potion);
inv.IsFull;
inv.Entries;                       // for rendering
inv.OnInventoryChanged += RedrawBackpack;
```

Stackable items merge up to their max stack size; the rest opens a new entry.

## Consumables

An item with a **Use Ability** is usable. Using it casts that ability through the normal ability rules (cooldown, cost, cast time), then removes one from the stack if **Consume On Use** is set.

```csharp
inv.TryUseItem(healthPotion, VtAbilityTargetData.Self());
inv.TryUseItem(bomb, VtAbilityTargetData.SingleTarget(enemy));
inv.TryUseItem(scroll, VtAbilityTargetData.GroundPoint(point));
```

The result is the same `VtAbilityCastFailReason` an ability cast returns, so "on cooldown" and "not enough mana" feedback comes for free.

## Picking things up

Loot drops and `VtWorldItem` objects are picked up by right-clicking them. For trigger-based pickups write a few lines:

```csharp
private void OnTriggerEnter(Collider other)
{
    var inv = other.GetComponent<VtUnitInventory>();
    if (inv != null && inv.TryAddItem(item, count)) Destroy(gameObject);
}
```
