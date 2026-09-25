# Hotbar

A row of slots that hold anything the player can press: abilities, potions, weapons and tools, buildables, or content of your own. Each slot has a key. Your view draws the slots and lets the player drag content onto them.

## Setup

1. Add **Vantage → Hotbar → VtHotbar** to the player.
2. Fill **Slots** with abilities, items or buildables. Empty slots stay empty.
3. Slot 1 presses **Ability 1** (key 1 by default), slot 2 **Ability 2**, and so on. **First Ability Action** moves the whole bar: 7 puts slot 1 on key 7. A slot's own **Action** replaces its key.

A player can carry several bars. For six item slots and four build slots, add two `VtHotbar`s and set the second one's **First Ability Action** to 7. If the unit also has `VtAbilityHotkeys`, leave its slots on the same keys empty so one key does not press twice.

## What a press does

| Content | Press |
|---|---|
| Ability | Casts it like the ability hotkeys do: at the hovered or selected unit, at the cursor, or by starting to aim. |
| Item with an equipment slot | Takes it from the bag and wears it; what it replaces goes back into the bag. Pressing it again puts it away. |
| Other item | Uses one from the bag, aimed like an ability when its use ability needs a target. |
| Buildable | Starts placing it; pressing it again stops. |
| Inventory area | One inventory slot, see below. |

## A hotbar that is part of the inventory

For games where the hotbar is a row of the inventory, put an **Inventory Area** in the bar's slots, or call `bar.AssignArea(hotbarArea, 0, 6)`. The first bar slot holding the area shows the area's slot 0, the next one slot 1, and so on. Each bar slot shows that one stack: its icon, count and wear, so two stacks of wood are two slots.

- With a [held slot](items.md#holding-the-selected-hotbar-slot) on the same area, a press selects the slot, which puts its item in the hand; pressing the selected slot again uses its item, such as eating, or puts on armor kept there. An empty slot can be selected for empty hands. `Active` marks the selected slot.
- Without one, a press uses the item, or puts it on when it can be worn.

The bar can be wider than the area. Bar slots past the area's current size read as `Locked`, and pressing them does nothing, until the area grows: a bar of six over an area of 4 that a backpack grows to 6 shows two locked slots without the backpack. Any split works, since the bar's width and the area's size and Size Stat are separate settings. Redraw on the inventory's `OnLimitsChanged`.

The bar saves these slots as `invslot:<area id>` and finds the area on the unit when it loads, so the area needs no entry in the Definition Catalog. Items still work the old way for games whose bars point at items.

## Drawing it

```csharp
var bar = player.GetComponent<VtHotbar>();

for (int i = 0; i < bar.SlotCount; i++)
{
    VtHotbarSlotState slot = bar.Read(i);
    // slot.Icon / IconId / DisplayName, slot.Count (-1 = none), slot.Durability (-1 = none),
    // slot.Usable, slot.Active (aiming, placing, worn), slot.Locked (not open yet),
    // slot.CooldownFraction, slot.Action for the key cap
}

bar.Press(i);                          // a click on the slot
bar.OnSlotsChanged += Redraw;
```

`VtSlot` from the [UI](ui.md) module draws one slot, and its drag events map onto the bar:

```csharp
if (VtHotbar.CanHold(dragged)) bar.Assign(targetSlot, dragged);   // dropped from the bag or build menu
bar.Move(fromSlot, toSlot);                                        // dragged between slots, swaps
bar.Clear(slot);                                                   // dragged off the bar
```

The slots are saved with the unit.

## Your own content

Implement `IVtHotbarHandler` and register it once:

```csharp
VtHotbar.RegisterHandler(new EmoteHotbarHandler());
```

A handler claims content (`CanHold`), fills the slot state (`Read`), does the press (`Activate`), and gives the content a save id under its `Kind`. Handlers registered later are asked first, so one can replace the built-in handling of abilities, items or buildables. A handler that needs to know which bar slot it draws, or that finds saved content on the unit, implements `IVtHotbarSlotAwareHandler` as well.
