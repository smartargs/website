# Crafting

Recipes turn items into items. Optional layers: a recipe book for recipes that must be learned, crafting skills that level up, stations you must stand at, and craft timers.

## Authoring

1. **Create → Vantage → Crafting → Recipe Category** (Weapons, Food, …), **Recipe Station** (Anvil, Cookpot, …) and **Crafting Skill** (Smithing, …, each with an XP curve) as needed.
2. **Create → Vantage → Crafting → Recipe Definition.**

| Field | Meaning |
|---|---|
| Inputs | Items consumed. |
| Required Items | Items that must be carried but are not consumed, such as a hammer. |
| Output | Item and count produced. |
| Craft Seconds | 0 is instant. |
| Station | Empty means craft anywhere. |
| Required Skill / Required Skill Level | Skill gate. |
| Xp Grant | Skill XP awarded on success. |
| Required Level / Required Completed Quests | Character gates. |
| Learned By Default | Off means the player must learn it first. |

3. On the player's unit definition check **Use Crafter**, and **Use Recipe Book** and **Use Crafting Skills** if you use those layers.
4. For stations, check **Use Crafting Station** on the station's unit definition and set **Station Type**. Right-clicking the station walks the player over and fires `OnStationOpened` for your recipe window.

## Runtime

```csharp
var crafter = player.GetComponent<VtUnitCrafter>();

if (!crafter.IsAvailable(recipe, station, out var reason))
    ShowReason(reason);   // NotLearned, MissingIngredients, WrongStation, SkillTooLow, ...

crafter.TryCraft(recipe, station, out reason);
crafter.CancelCraft();
crafter.IsCrafting; crafter.CurrentProgress01; crafter.CurrentRemainingSeconds;

crafter.OnCraftStarted   += r => { };
crafter.OnCraftProgress  += (r, progress01) => { };
crafter.OnCraftCompleted += r => { };
crafter.OnCraftCancelled += r => { };
crafter.OnCraftFailed    += (r, why) => { };
```

Pass `null` as the station for recipes that craft anywhere. Cancelling a timed craft consumes nothing.

Skills:

```csharp
var skills = player.GetComponent<VtUnitCraftingSkills>();
skills.GetLevel(smithing);
skills.AddXp(smithing, 25);
skills.OnSkillLeveledUp += (skill, from, to) => { };
```

## Learning recipes from scrolls

1. Author the recipe with **Learned By Default** off.
2. Create a **Learn Recipe** effect (under ability effects) that references it, and an ability containing only that effect.
3. Create the scroll item with **Use Ability** set to that ability and **Consume On Use** on.

Using the scroll from the backpack adds the recipe to the player's recipe book. `VtUnitRecipeBook` also exposes `Learn`, `Forget` and `IsLearned` for shops and trainers.
