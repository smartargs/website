# Modules

One page per system. Each page has the authoring steps first and the runtime calls second.

## Core

| Page | What it covers |
|---|---|
| [Units and stats](units.md) | Unit definitions, pools, stats, attributes, buffs, damage, death and revive. |
| [Abilities](abilities.md) | Ability definitions, effects, casting, auto-attack, channels, projectiles. |
| [Combat text](combat-text.md) | Floating numbers, styles, custom presenters. |
| [Movement and input](movement.md) | Click-to-move, path providers, executors, targeting, interaction. |
| [Camera](camera.md) | Top-down follow camera. |
| [Tuning](tuning.md) | The global numbers asset. |
| [Ticking](ticking.md) | Central tick driver, pause and slow motion, custom tickables. |

## Character

| Page | What it covers |
|---|---|
| [Items and equipment](items.md) | Item definitions, slots, durability, sets, world items. |
| [Inventory](inventory.md) | The backpack and consumables. |
| [Currency](currency.md) | Currencies and wallets. |
| [Leveling](leveling.md) | XP curves, levels, XP on kill. |
| [Crafting](crafting.md) | Recipes, recipe books, skills, stations. |
| [Quests](quests.md) | Objectives, rewards, quest givers, custom objectives. |
| [Building](building.md) | Placement, snapping, costs, timed builds. |
| [Saving and loading](saving.md) | Persistent ids, per-unit snapshots, JSON files. |

## World

| Page | What it covers |
|---|---|
| [Loot](loot.md) | Drop tables. |
| [Threat](threat.md) | Aggro tables, taunt, vanish, call for help. |
| [Auras](auras.md) | Radius buffs. |
| [AI roaming](ai-roaming.md) | Wander, chase, leash. |
| [Spawning](spawning.md) | Scene spawners with respawn. |
| [Resource nodes](resource-nodes.md) | Harvestable trees and ore. |
| [Fog of war](fog-of-war.md) | Vision, fog rendering, culling. |
| [Terrain cliffs](terrain-cliffs.md) | Grid cliffs, ramps, the painting tool, wall styles, the shared world grid. |

## Debugging

Add **Vantage → Debug → VtCombatDebugLogger** to a unit to log its casts, hits, buffs, pool changes and target changes to the console. Each category is a checkbox.
