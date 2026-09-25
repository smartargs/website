# Unlocks

An unlock is bought once and kept: a research step, a blueprint, a tier of a tech tree. A buildable or recipe that requires one is refused with `Locked` until it is owned.

Every field, its default and every member you can call: [Unlocks reference](../reference/unlocks.md).

## Authoring

1. **Create → Vantage → Progression → Unlock.**

| Field | Meaning |
|---|---|
| Id, Display Name, Description, Icon, Icon Id | Identity and what a menu shows. Icon Id names an icon from the package's icon set when there is no sprite. |
| Currency Cost / Item Cost | Paid once on unlock, such as build points or research points. |
| Required Unlocks | Unlocks that must be owned first. |
| Required Level | Minimum level of the buyer. |

2. Set **Required Unlock** on the buildables and recipes it opens.
3. Add **Vantage → Progression → VtUnitUnlocks** to the player, and the unlock to the Definition Catalog.

## Who owns it

Whoever pays keeps the unlock. A player served by a [shared stash](shared-stash.md) pays from the stash, and the whole team then has the unlock. Without a stash the player pays from their own wallet and bag, and only that player has it. Checks look at both, so a worker without `VtUnitUnlocks` still passes a gate its side has unlocked. A team's unlocks count wherever its members stand, even outside a stash's zone.

## Runtime

```csharp
var unlocks = player.GetComponent<VtUnitUnlocks>();

unlocks.CanUnlock(forge, out var reason);   // MissingPrerequisite, MissingCurrency, ...
unlocks.TryUnlock(forge, out reason);       // pays and records it
unlocks.Has(forge);
VtUnitUnlocks.IsUnlocked(unit, forge);      // any unit, with or without the component

unlocks.Grant(forge);                       // free, kept by this unit: quest rewards
stash.GrantUnlock(forge);                   // free, for the team

unlocks.OnUnlocked += def => Toast(def.displayName);
unlocks.OnUnlockFailed += (def, why) => Toast(VtFailureText.Describe(why));
```

On a client, `TryUnlock` sends the request to the host. A unit's own unlocks are saved with the unit, and a stash's unlocks with the stash.
