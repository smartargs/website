# Crafting

Recipes turn items into items. Optional layers: a recipe book for recipes that must be learned, crafting skills that level up, stations you must stand at, and craft timers.

See it running: the [10 · Gathering and Crafting](../demos/10-gathering-crafting.md) demo scene. See [Demos](../demos/index.md) to import the scenes.

## Authoring

1. **Create → Vantage → Crafting → Recipe Category** (Weapons, Food, …), **Recipe Station** (Anvil, Cookpot, …) and **Crafting Skill** (Smithing, …, each with an XP curve) as needed.
2. **Create → Vantage → Crafting → Recipe Definition.**

| Field | Meaning |
|---|---|
| Icon / Icon Id | What the recipe list shows; empty usually means the output item's icon. Icon Id names an icon from the package's icon set. |
| Sort Weight | Order within the category, lowest first; equal weights keep the list order. Recipe categories have Icon Id and Sort Weight too. |
| Inputs | Items consumed, from the crafter's own bag or the [shared stash](shared-stash.md) that serves it. |
| Required Items | Items that must be carried in the crafter's own bag but are not consumed, such as a hammer. |
| Required Unlock | An [unlock](unlocks.md) that must be owned first. Refused with `Locked` until then. |
| Output | Item and count produced. |
| Output Destination | **Crafter Bag** (default) puts the output in the crafter's bag. **Cost Source** puts it back where the ingredients came from: the shared stash when one paid, else the crafter's bag. Use Cost Source for materials made from materials. |
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

Ingredients come from `crafter.CostSource`: the source set with `SetCostSource`, else the shared stash that serves the unit, else its own bag. A timed craft pays when it finishes, from the source chosen when it started, and fails with `MissingIngredients` if that source no longer has them or the stash that paid was disabled. The crafted item goes where the recipe's **Output Destination** says; with Crafter Bag and no bag on the unit it goes into the cost source. When the output would land in the crafter's bag and the bag has no room for it, counting the ingredients the bag gives up, the craft is refused with `InventoryFull`. A timed craft checks again when it finishes and, if the bag filled up meanwhile, fails with `InventoryFull` without spending anything. `VtDefinitionCatalog.RecipeCategories` and `RecipesInCategory` list recipes by category, lowest **Sort Weight** first.

Pass `null` as the station for recipes that craft anywhere. When you pass a station, the crafter must stand within its **Interact Radius** plus `Interact Range Tolerance` from the tuning asset, or the reason is `TooFarFromStation`. Cancelling a timed craft consumes nothing.

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
