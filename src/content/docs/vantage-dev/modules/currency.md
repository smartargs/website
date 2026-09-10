# Currency

Currencies are assets; wallets are per-unit balances. Gold, honor, tokens and premium currency all fit.

## Setup

1. **Create → Vantage → Currency → Currency** for each currency: id, display name, colour, sort weight, optional icon.
2. Add **Vantage → Currency → VtUnitWallet** to units that hold money, usually the player.

Loot tables with **Currency Drops** credit the killer's wallet on death. Kills without a killer, or by a unit without a wallet, credit nothing.

## Runtime

```csharp
var wallet = player.GetComponent<VtUnitWallet>();
wallet.Get(gold);
wallet.CanAfford(gold, 250);
wallet.TryRemove(gold, 250);     // false and unchanged when short
wallet.Add(gold, 50);
wallet.OnChanged += (currency, balance) => RedrawHud();
```

If your design wants gold lying on the ground, author it as an item and route the pickup to the wallet instead of the backpack.
