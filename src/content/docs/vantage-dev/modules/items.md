# Items and equipment

Every unit has a `VtUnitEquipment` with thirteen slots: head, chest, legs, feet, hands, main hand, off hand, neck, two rings, two trinkets and back (backpack, cloak or quiver). The backpack is a separate opt-in, see [Inventory](inventory.md).

See it running: the [05 · Items and Inventory](../demos/05-items-inventory.md) demo scene. See [Demos](../demos/index.md) to import the scenes.

## Authoring an item

**Create → Vantage → Items → Item Definition.**

| Field | Meaning |
|---|---|
| Icon / Icon Id | What bags, hotbars and tooltips show. Icon Id names an icon from the package's icon set when there is no sprite. |
| Slot | Where it equips. `None` for items that are only carried. |
| Requires Two Hands | Takes both hands in the main hand. What happens to the off-hand item is set on the unit, see [Two-handed items](#two-handed-items). |
| Rarity | A rarity asset. Five ship: Common to Legendary. Add your own with **Item Rarity Definition**. |
| Tags | Item tag assets such as Cursed, Soulbound or Axe. Tools for resource nodes are recognised by tag. |
| Modifiers / Attribute Grants / Trait Overrides | What the wearer gets while it is equipped. Same rows as a buff. |
| Requirements | Minimum level, minimum attributes, required unit tag. |
| Max Durability | Durability of one copy. 0 means indestructible. |
| Durability Mode | **Condition** (default): durability is the item's state, capped at Max Durability and restored by repair. **Uses**: Max Durability is what one copy gives, and copies combine, see [Combining copies](#combining-copies). |
| Auto Unequip On Break | Clear the slot when durability hits zero. |
| Set | Membership in an item set. |
| Stackable / Max Stack Size | For the backpack. |
| Use Ability / Consume On Use | Makes the item a consumable, see [Inventory](inventory.md). |
| World Item Prefab | What lands on the ground when a unit drops it, see [Dropping things](inventory.md#dropping-things). Empty uses the default on `VtTuning`. |
| Value | Currency and amount vendors price from, see [Vendors](vendors.md). No currency means no vendor trades it. |

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

`TryEquip` and `Unequip` do not touch the bag. To wear something the player carries, and put back what it replaces, use the bag-aware pair:

```csharp
equipment.TryEquipFromInventory(axe, out reason);               // NotInInventory when not carried
equipment.TryEquipFromInventory(ring, VtEquipmentSlot.Ring2, out reason);  // into a chosen slot
equipment.TryUnequipToInventory(VtEquipmentSlot.MainHand, out reason);  // InventoryFull when there is no room
```

Both send the request to the host on a client.

To work with a particular bag slot, as a drag-and-drop window does:

```csharp
equipment.TryEquipFromSlot(slot, VtEquipmentSlot.None, out reason);   // that copy goes on; what it replaces takes its slot
equipment.TryUnequipToSlot(VtEquipmentSlot.Head, slot, out reason);   // into that slot, or swap with a helm there
equipment.TryMoveWorn(VtEquipmentSlot.Ring1, VtEquipmentSlot.Ring2, out reason);
```

The bag's `TryMove` does the same when one side is `VtInventorySlotRef.Worn(slot)`, so a window can treat worn gear as one more slot. See [Inventory](inventory.md#moving-items).

## Holding the selected hotbar slot

By default the main hand is a normal equipment slot: the item is taken out of the bag to go on. In games where the hotbar is the inventory, add **Vantage → Items → VtUnitHeldSlot** to the unit and pick the **Area** (for example the hotbar area, see [Inventory](inventory.md#areas)). The selected slot of that area is then the main hand:

```csharp
var held = unit.GetComponent<VtUnitHeldSlot>();
held.Select(2, out var reason);    // key 3: hold what sits in slot 2
held.Select(-1, out reason);       // empty hands
held.Held;                         // the stack in the selected slot
held.OnSelectionChanged += RedrawHotbar;
```

- The item stays in its slot while held; its bonuses, abilities, set pieces and visuals work as if it were worn, and `equipment.IsHeldFromInventory` is true.
- Wear from hits, repairs and deaths lands on the slot's stack. A held item that breaks with **Auto Unequip On Break** is gone from its slot.
- Moving a copy of a **Uses** item onto the held one, or onto the main hand, combines it into the held stack, see [Combining copies](#combining-copies).
- Selection is a position: moving or swapping stacks changes what is held, and selecting food or materials holds nothing in the main hand.
- `TryEquip` into the main hand puts the item into the area and selects it (refused with `HeldSlotFull` when the area has no free slot); equipping from the bag selects the item or brings it into the area; taking the main hand off clears the selection.
- The Two Hand Rule below applies when a two-hander is selected. A selection it refuses changes nothing.
- Selection is saved and works from clients.

## Two-handed items

**Two Hand Rule** on the unit's `VtUnitEquipment` decides what happens to the off-hand item when a two-handed item goes into the main hand:

| Rule | What happens |
|---|---|
| Off Hand Comes Off (default) | The off-hand item goes into the bag. Nothing can go into the off hand while the two-hander is held. |
| Off Hand Suspended | The off-hand item stays worn but gives nothing while the two-hander is held, and counts again when it leaves. Good for a torch or shield that should come back when the player switches away from a bow. `IsSuspended(slot)` and `OnSlotSuspended` let visuals hide it. Suspended pieces do not count toward sets. |
| Off Hand Blocks Two Hander | The two-hander is refused with `SlotOccupiedBlocked` until the off-hand item is taken off, and nothing can go into the off hand while a two-hander is held. |

A suspended item is hidden by `VtUnitEquipmentVisuals` and does not count as a tool for resource nodes. `PassesTwoHandRule(item, slot, out reason)` tells a drag view whether the rule allows a drop.

## Backpacks and other gear that adds bag space

An item with a modifier on the bag's **Capacity Stat** (see [Inventory](inventory.md)) adds bag space while it is worn. Such an item cannot come off, or be swapped for one that adds less, while the bag would then hold more than it can: `TryUnequipToInventory`, `TryEquipFromInventory` and `TryEquip` refuse with `WouldOverflowInventory`, and `Unequip` returns false. Empty the bag first. The check reads the capacity modifiers on the item itself; bag space that comes from attributes the item grants or from a set bonus is not checked. Gear taken off into the bag is never lost: if the bag then holds more than it can, it takes nothing new until room is made.

A backpack whose durability reaches zero with **Auto Unequip On Break** still comes off. The bag then holds more than it can: nothing new fits until items are taken out. Turn **Auto Unequip On Break** off for gear that should stay on when broken.

## Durability

The package tracks durability per slot and never wears items on its own. Call `ApplyWear` from your own rules:

```csharp
stats.OnPostDealDamage += _ => equipment.ApplyWear(VtEquipmentSlot.MainHand, 1);
equipment.RepairItem(VtEquipmentSlot.MainHand, 25);
equipment.RepairAll();
```

`OnItemBroken` fires once when an item reaches zero. `OnDurabilityChanged` passes the slot, the durability left and the item's maximum.

Wear stays with the item when it goes into the bag. `TryUnequipToInventory` and the swap in `TryEquipFromInventory` put the item away with the durability it lost, and putting it on again from the bag brings that durability back. When the bag holds several copies with different wear, `TryEquipFromInventory` takes the newest. `equipment.GetWear(slot)` reads what a worn item has lost.

### Combining copies

Set **Durability Mode** to **Uses** for items that last a number of uses, such as a sword with 200 durability that gives 200 hits. Two copies of the same item then combine into one with the uses of both:

- Moving a copy onto another copy combines them: bag slot onto bag slot, a bag copy onto the worn one, or the worn one onto a bag copy. The combined item sits where the move ended, and the other slot empties. The worn item stays on when a copy is combined into it.
- Quick-move (`TryQuickMove`, a right-click in most windows) combines a carried copy into the worn one.
- There is no limit: five copies of a 200 sword make one item of 1000. More copies make an item last longer, never hit harder.
- Nothing combines on its own. A crafted, bought or picked-up copy lands in a slot of its own.
- Repair does nothing on Uses items; their uses are spent, not damaged. Respawn durability loss counts one copy's Max Durability.
- Only items that do not stack combine. A combined item cannot be split again and sells for the price of one copy.

`equipment.GetMaxDurability(slot)` and a bag entry's `Capacity` read the combined total; `GetExtraDurability(slot)` and the entry's `extraDurability` read what the combined copies added. The total is kept when the item comes off, goes on, moves between ring or trinket slots, is dropped and picked up, and in saves and replication. Saves from before combining existed load one copy.

## Item sets

**Create → Vantage → Items → Item Set Definition** and list tiers: pieces required and the bonus rows for that tier. Set the **Set** field on each member item. Bonuses stack cumulatively, so wearing four pieces of a 2 / 4 / 6 set grants both the 2-piece and the 4-piece bonus. `OnSetTierChanged` fires when the active tier changes; `ActiveSets` lists current sets.

## Items in the world

Put a `VtWorldItem` on any GameObject with a collider and assign an item, count and, for worn items, wear and extra durability. Right-clicking it walks the player over and picks it up into their backpack; when only part fits, the rest stays on the ground. Units drop items with `TryDropSlot`, see [Dropping things](inventory.md#dropping-things). Loot tables spawn these automatically, see [Loot](loot.md). Implement `IVtPickable` yourself for other interactables such as levers or gold piles.

## Events

`OnEquipped`, `OnUnequipped`, `OnDurabilityChanged`, `OnItemBroken`, `OnSetTierChanged`.
