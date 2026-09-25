# Saving and loading

Every unit that carries a `VtPersistentId` can be captured into a save and restored: position, pools, level, equipment with durability, backpack, wallet, active buffs, quest log, crafting skills, learned recipes and hotkey slots. Saves are plain JSON.

## Setup

1. Create a **Definition Catalog** (**Create → Vantage → Setup → Definition Catalog**), drag in every item, buff, quest, currency, recipe, crafting skill and buildable that can appear in a save, and store it as `Assets/Resources/VtDefinitionCatalog.asset`. Saves refer to definitions by id; the catalog turns ids back into assets.
2. Add **Vantage → Save → VtPersistentId** to every unit that should be remembered: the player, NPCs, resource nodes, scene-placed monsters. The id is generated; give the player a readable one such as `player`.

Units without a persistent id, such as monsters from a spawner, are not saved and start fresh on load.

## Runtime

```csharp
var save = VtSaveSystem.Capture();
VtSaveFile.Write(VtSaveFile.PathFor("slot1"), save);

var loaded = VtSaveFile.Read(VtSaveFile.PathFor("slot1"));
int restored = VtSaveSystem.Restore(loaded);
```

Load into the same scene the save was taken in. `Restore` finds each unit by its persistent id and writes the saved state into it. Buildings that were placed with the builder and no longer exist are spawned again from their buildable's prefab. Anything else that is missing goes to your callback:

```csharp
VtSaveSystem.Restore(loaded, spawnMissing: data =>
{
    var prefab = petPrefabs[data.definitionId];
    return Instantiate(prefab, data.position, data.rotation).GetComponent<VtUnit>();
});
```

Return null to skip a unit.

When the scene has a `VtWorldClock`, the save also holds the day, time of day, speed and pause state, and `Restore` puts them back. See [World time](world-time.md).

Every enabled [shared stash](shared-stash.md) is saved too, with its items, currency and unlocks, under its persistent id. A unit's own unlocks and its [hotbar](hotbar.md) slots are part of the unit's data.

## One unit at a time

```csharp
VtUnitSaveData data = VtUnitSaver.Capture(unit);
VtUnitSaver.Restore(otherUnit, data);
```

Useful for character transfer between scenes: capture the player before the scene change, restore into the new scene's player.

## What is not saved

Ability cooldowns, resource node respawn timers, build site progress, threat tables and the roaming home position. Cooldowns reset on load; nodes come back full. If your game needs any of these, capture them next to the save with your own data.

## Format

`VtSaveGame` is a `JsonUtility` object: a version number, the scene name, the time, the world clock, the shared stashes, and a list of units. Add your own fields by wrapping it in your own class or writing a second file next to it. Ids the catalog cannot resolve are skipped with a warning, so a save survives content you removed.
