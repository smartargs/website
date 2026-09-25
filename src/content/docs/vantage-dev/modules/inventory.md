# Inventory

`VtUnitInventory` is an optional backpack: a flat list of item stacks. Add it to units that carry things, usually the player. Items in the bag grant nothing; equip them to get their bonuses.

See it running: the [05 · Items and Inventory](../demos/05-items-inventory.md) demo scene. See [Demos](../demos/index.md) to import the scenes.

Every field, its default and every member you can call: [Inventory reference](../reference/inventory.md).

## Setup

Add **Vantage → Items → VtUnitInventory** to the prefab and set **Base Capacity** (0 means unlimited). Assign a stat to **Capacity Stat** if bags should be able to add slots; a bag item then grants "+6" on that stat like any other modifier. Wear it in the **Back** slot; it cannot be taken off while the bag would overflow without it (see [Items](items.md#backpacks-and-other-gear-that-adds-bag-space)). Capacity from worn gear adds to Base Capacity, so Base Capacity must be above 0.

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

## Slots

Every stack sits in a numbered slot. Slots stay where they are when something else is taken out, and a new item fills the first free slot, so a view can draw a fixed grid.

```csharp
int slots = inv.SlotCount();                            // the capacity, or the used range when unlimited
var entry = inv.GetSlot(VtInventorySlotRef.InBag(3));   // entry.item is null for an empty slot
inv.OnSlotChanged += slot => RedrawSlot(slot.index);    // each slot a change touched
```

`Entries` lists the occupied slots in order, without the gaps. Taking items out empties the last slots that hold them first. Positions are saved; saves from before slots existed fill the slots in order. A network layer mirrors the bag with `CaptureSlots` on the host and `ApplyInventoryFromNet` on clients, which keeps every stack in its slot.

## Areas

A bag can be split into areas: a hotbar row and a main grid, a belt, a backpack that opens while a backpack is worn, a quiver that only takes arrows. Create **Create → Vantage → Items → Inventory Area** for each and list them under **Areas** on the inventory, in the order new items fill them. With areas listed, Base Capacity and Capacity Stat are not used.

| Field | Meaning |
|---|---|
| Id | Name used in slot addresses and saves, such as `area.hotbar`. |
| Base Size | Slots in the area. 0 without a Size Stat makes an area that grows as needed; use that only for a bag's last or only area, since it takes every item the areas before it do not. |
| Size Stat | A stat that adds slots, like bag items granting +6. A size of 0 shuts the area. |
| Unit Limit | Most items the area holds in total, counted across all its stacks, such as a pouch of 50 materials. 0 without a Unit Limit Stat: only the slots limit it. |
| Unit Limit Stat | A stat that raises the unit limit, like a backpack granting +150. |
| Opened By | An equipment slot, such as Back. The area is shut while that slot is empty, and the item there cannot come off while the area holds anything. |
| Preferred Tags | New items with one of these tags try this area first, such as materials into the backpack. |
| Pay Priority | Lower pays crafting and building costs first. |
| Rules / Slot Rules | What the area's slots take, for all slots or single ones. |

Three rules ship under **Create → Vantage → Items → Slot Rules**: **Item Tag** (must have, or with Invert must not have, one of the tags), **Equipment Kind** (only items worn in the listed slots) and **Stackable**. Subclass `VtInventorySlotRule` for your own.

Some setups:

- **Hotbar and main grid:** `hotbar` (9) then `main` (27). Pickups fill the hotbar first; give `main` the lower Pay Priority so costs come out of it first.
- **Backpack worn on the back:** `hotbar` (6) and `backpack` (6, Opened By Back, Preferred Tags material, Pay Priority below the hotbar's).
- **The hotbar is what you hold:** add a `VtUnitHeldSlot` for the hotbar area, and the selected slot is the main hand. See [Items](items.md#holding-the-selected-hotbar-slot).
- **Bags that add slots:** `bag` (16) plus `bag2` with Base Size 0 and a Size Stat the bag items raise.
- **Materials as counts:** `pouch` (Base Size 0, Unit Limit 50, a Unit Limit Stat the backpack raises by 150, Preferred Tags material) and `bar` (Base Size 4, a Size Stat the backpack raises by 2, an inverted Item Tag rule for material so materials never spill onto the bar). The HUD draws the pouch as numbers and "84 / 200".

### Carry limits

An area with a unit limit takes items until it holds that many, whatever the stacks: 30 wood and 20 stone fill a pouch of 50. Adding more places what fits; once a preferred area is full, new items go on to the next area that takes them, so give the other areas a rule if they must not.

```csharp
inv.UnitsIn("area.pouch");                  // 84
inv.UnitLimit("area.pouch");                // 200, or -1 without a limit
inv.HowManyFit(wood, 30);                   // how many of 30 would fit now
int placed = inv.AddAsMuchAsFits(wood, 30); // adds what fits; you keep the rest
inv.OnLimitsChanged += RedrawCounts;        // an area's size or unit limit changed
```

Moving a stack into an area with a unit limit moves what fits onto a stack there, and refuses a move into an empty slot or a swap that would put the area over its limit with `CarryLimit` ("Cannot carry more").

### When an area gets smaller

Taking off gear that makes an area smaller, or lowers its unit limit, is refused with `WouldOverflowInventory` while the area would then hold something it has no room for: an item in a slot past the new size, or more items than the new limit. Each area is judged on its own, so an area without a limit next to it does not help. Empty those slots, or drop to the lower limit, first.

A size or limit that drops for another reason, such as a buff that runs out or a backpack that breaks, cannot be refused. Nothing is lost: items past the new size stay in their slots, which read as locked (`IsSlotLocked`), and an area over its limit keeps what it holds. Such an area takes nothing new until items leave, and everything in it can still be moved out, used or spent.

## Moving items

```csharp
var from = new VtInventorySlotRef("area.main", 4);
var to = new VtInventorySlotRef("area.hotbar", 0);

inv.TryMove(from, to, 0, out var why);     // 0 moves the whole stack; a number splits that many off
inv.CanMove(from, to, 0, out why);          // same check without moving, for highlighting a drop target
inv.TryQuickMove(from, out why);            // to the other areas, preferred ones first
inv.TryUseSlot(to, VtAbilityTargetData.Self()); // use and consume from that stack
Toast(VtFailureText.Describe(why));
```

A move goes into an empty slot, onto the same item with room (what does not fit stays), or swaps two whole stacks. A copy of an item with **Durability Mode** Uses moved onto another copy combines with it instead, see [Combining copies](items.md#combining-copies). Part of a stack cannot swap, a full stack refuses more, and a slot rule refuses with its own text. All of these work from clients; the server checks them again.

Worn gear has its own address, `VtInventorySlotRef.Worn(VtEquipmentSlot.Head)`. Moving a bag slot there puts the item on, moving from there takes it off into that slot (or swaps with a helm in it), and moving between two worn slots swaps rings or trinkets. Moving a Uses copy onto the worn copy, or the worn copy onto a bag copy, combines them. `GetSlot` on a worn address reads what is worn. Quick-move combines a Uses copy into the worn one, puts an item on when its equipment slot is empty, takes worn items off, and moves anything else to the other areas. A refusal from equipment comes as `EquipRefused` with the equipment reason in `EquipReason`.

## Worn items in the bag

Items with a **Max Durability** keep their wear in the bag. Each entry has a `wear` (durability lost), `Durability`, `Capacity` and `DurabilityFraction`; a new item has no wear. Entries with different wear never stack. Gear taken off keeps its wear, and `TryAddItem(item, count, wear)` adds copies that are already worn. `WearOfNext(item)` tells which wear the next copy taken out has. Wear is saved with the bag, and saves from before wear existed load everything as new.

An entry of a Uses item that copies were combined into also has `extraDurability`, the durability those copies added. `Capacity` is Max Durability plus that, and `Durability` is `Capacity` minus `wear`. `AddAsMuchAsFits(item, count, wear, extraDurability)` adds such an item.

`VtInventoryPresenter` reports `Durability` and `MaxDurability` (the entry's `Capacity`) for every entry, so a bag view can draw a wear bar when `MaxDurability` is above 0, or print the uses left of a combined tool.

Wear and combined durability live on the bag entry only. Depositing an item into a [shared stash](shared-stash.md) or attaching it to mail sends it as a new item.

## Consumables

An item with a **Use Ability** is usable. Using it casts that ability through the normal ability rules (cooldown, cost, cast time), then removes one from the stack if **Consume On Use** is set.

```csharp
inv.TryUseItem(healthPotion, VtAbilityTargetData.Self());
inv.TryUseItem(bomb, VtAbilityTargetData.SingleTarget(enemy));
inv.TryUseItem(scroll, VtAbilityTargetData.GroundPoint(point));
```

The result is the same `VtAbilityCastFailReason` an ability cast returns, so "on cooldown" and "not enough mana" feedback comes for free.

## Picking things up

Loot drops and `VtWorldItem` objects are picked up by right-clicking them. When only part of a pile fits, the unit takes that part and the rest stays on the ground (`OnPartlyPickedUp`). Picked-up items keep the pile's **Wear** and **Extra Durability**. For trigger-based pickups write a few lines:

```csharp
private void OnTriggerEnter(Collider other)
{
    var inv = other.GetComponent<VtUnitInventory>();
    if (inv == null) return;
    count -= inv.AddAsMuchAsFits(item, count);
    if (count == 0) Destroy(gameObject);
}
```

## Dropping things

```csharp
inv.TryDropSlot(new VtInventorySlotRef("area.main", 4), 0, out var why); // 0 drops the whole stack
inv.OnDropped += worldItem => PlayThud(worldItem.transform.position);
```

The items land **Drop Distance** (on `VtTuning`, default 1) in front of the unit as a `VtWorldItem` with their count, wear and extra durability. The prefab is the item's **World Item Prefab**, else **Default World Item Prefab** on `VtTuning`; it must hold a `VtWorldItem`. Items that are not **Droppable**, or have no prefab, are refused with `NotDroppable`. Dropping works from clients; the server takes the items out and spawns the world item. Give the prefab your network object so clients see it.
