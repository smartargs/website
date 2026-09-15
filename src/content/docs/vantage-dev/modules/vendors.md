# Vendors

Shops on NPCs. A vendor sells from a stock list, buys the player's items, prices everything from item values, and restocks on a timer. The library runs the trade; you draw the window.

## Authoring

1. Give each tradeable item a **Value**: a currency and an amount, on the item definition. Items without a value currency cannot be bought or sold.
2. **Create → Vantage → Vendors → Vendor Definition.** Add stock lines and set the multipliers.
3. On the NPC's unit definition check **Use Vendor** and assign the definition.

Right-clicking the NPC walks the player over and fires `OnVendorOpened` on its `VtVendor` component with the customer. Open your shop window there.

| Field | Meaning |
|---|---|
| Currency | What the vendor trades in. Empty means each item's own value currency. |
| Buy Price Multiplier | What the player pays, as a multiple of item value. |
| Sell Price Multiplier | What the vendor pays for the player's items, as a multiple of item value. |
| Buys Items | Uncheck for a vendor that only sells. |
| Stock | One line per item for sale. |

| Stock line | Meaning |
|---|---|
| Item | What is for sale. |
| Price Override | Fixed price per unit at this vendor. 0 uses value times the buy multiplier. |
| Stock | Units on hand. -1 is unlimited. |
| Restock Seconds | Seconds after the first sale from a full line until it refills. 0 never restocks. |

Stock counts are per NPC instance and save with the unit. Two merchants sharing a definition sell independently.

## Runtime

```csharp
var vendor = npc.GetComponent<VtVendor>();
vendor.OnVendorOpened += customer => OpenShop(vendor, customer);

foreach (var line in vendor.Stock)
    AddRow(line.Item, vendor.GetBuyPrice(line.Item), line.Remaining);

if (!vendor.CanBuy(player, item, 1, out var reason)) ShowReason(reason);
vendor.TryBuy(player, item, 1, out reason);
vendor.TrySell(player, item, 3, out reason);

vendor.GetSellPrice(item);
vendor.GetStock(item);
vendor.OnBought += (customer, item, count, paid) => { };
vendor.OnSold += (customer, item, count, received) => { };
vendor.OnStockChanged += () => Redraw();
```

`TryBuy` charges the wallet, adds to the inventory and reduces stock in one step, and refuses before touching anything when the customer cannot afford it, the item would not fit, the line is sold out, or the customer stands farther than **Interact Radius** plus the interact tolerance from the tuning asset. `TrySell` needs the item to be sellable and held.

The failure reasons: `NotSold`, `OutOfStock`, `NoPrice`, `NoWallet`, `CannotAfford`, `NoInventory`, `InventoryFull`, `NotSellable`, `VendorDoesNotBuy`, `TooFar`, plus `AuthorityNotLocal` on a networked client, where the request travels to the server and the wallet and inventory events report the outcome.
