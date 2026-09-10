# Items and equipment

Every unit has a `VtUnitEquipment` with twelve slots: head, chest, legs, feet, hands, main hand, off hand, neck, two rings and two trinkets. The backpack is a separate opt-in, see [Inventory](inventory.md).

## Authoring an item

**Create → Vantage → Items → Item Definition.**

| Field | Meaning |
|---|---|
| Slot | Where it equips. `None` for items that are only carried. |
| Requires Two Hands | Equipping it in the main hand unequips the off hand. |
| Rarity | A rarity asset. Five ship: Common to Legendary. Add your own with **Item Rarity Definition**. |
| Tags | Item tag assets such as Cursed, Soulbound or Axe. Tools for resource nodes are recognised by tag. |
| Modifiers / Attribute Grants / Trait Overrides | What the wearer gets while it is equipped. Same rows as a buff. |
| Requirements | Minimum level, minimum attributes, required unit tag. |
| Max Durability | 0 means indestructible. |
| Auto Unequip On Break | Clear the slot when durability hits zero. |
| Set | Membership in an item set. |
| Stackable / Max Stack Size | For the backpack. |
| Use Ability / Consume On Use | Makes the item a consumable, see [Inventory](inventory.md). |

Items listed under **Starting Equipment** on a unit definition are equipped at spawn, in order.

## Equipping at runtime

```csharp
var equipment = unit.GetComponent<VtUnitEquipment>();

if (!equipment.TryEquip(sword, out var reason))
    ShowTooltip(reason);   // LevelTooLow, AttributeTooLow, MissingRequiredTag, SlotOccupiedBlocked, ...

equipment.Unequip(VtEquipmentSlot.MainHand);
equipment.CanEquip(sword, out _);            // check without changing anything
equipment.GetEquipped(VtEquipmentSlot.Head);
```

Rings and trinkets pick the first free slot of their pair. Equipping into a slot that is occupied swaps the items.

## Durability

The package tracks durability per slot and never wears items on its own. Call `ApplyWear` from your own rules:

```csharp
stats.OnPostDealDamage += _ => equipment.ApplyWear(VtEquipmentSlot.MainHand, 1);
equipment.RepairItem(VtEquipmentSlot.MainHand, 25);
equipment.RepairAll();
```

`OnItemBroken` fires once when an item reaches zero.

## Item sets

**Create → Vantage → Items → Item Set Definition** and list tiers: pieces required and the bonus rows for that tier. Set the **Set** field on each member item. Bonuses stack cumulatively, so wearing four pieces of a 2 / 4 / 6 set grants both the 2-piece and the 4-piece bonus. `OnSetTierChanged` fires when the active tier changes; `ActiveSets` lists current sets.

## Items in the world

Put a `VtWorldItem` on any GameObject with a collider and assign an item and count. Right-clicking it walks the player over and picks it up into their backpack. Loot tables spawn these automatically, see [Loot](loot.md). Implement `IVtPickable` yourself for other interactables such as levers or gold piles.

## Events

`OnEquipped`, `OnUnequipped`, `OnDurabilityChanged`, `OnItemBroken`, `OnSetTierChanged`.
