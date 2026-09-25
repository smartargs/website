# Vantage

Vantage is a Unity 6 package that gives an RPG or action game its gameplay
systems out of the box. You author content as assets (units, abilities, items,
loot tables, quests, recipes) and drop in tunings; the mechanics ship with the
package. It runs single-player as-is and is built so the same code serves a
co-op host or an authoritative server later. It comes with top-down movement, input and camera; the rest works the same whether your game is top-down, third-person or first-person, so any other view just brings its own controller.

## What ships

| System | What you get |
|---|---|
| Units and stats | HP / MP / stamina pools, regen, armor, resistances, crit, evade, attributes that derive stats. |
| Damage pipeline | One `TakeDamage` path with hooks for shields, conversions, immunities, thorns and lifesteal. |
| Abilities | Cast bars, cooldowns, global cooldown, resource costs, channels, projectiles, area effects. The basic attack is an ability too. |
| Buffs and auras | Timed stat changes, damage / heal over time, crowd control, radius auras. |
| Combat text | Floating damage, heal, crit, dodge numbers with zero setup. |
| Movement and input | Click-to-move with pluggable pathfinding, right-click to attack or pick up. |
| Items | Equipment slots, rarity, durability, item sets, requirements, an opt-in backpack, consumables. |
| Loot and currency | Weighted drop tables, guaranteed drops, multi-currency wallets. |
| Leveling | XP curves, level component, XP on kill. |
| Threat | Per-mob aggro tables, taunt, vanish, call for help. |
| AI roaming | Wander, chase, leash back home. |
| Quests | Kill / collect / talk / reach objectives, item / currency / XP rewards, quest givers. |
| Crafting | Recipes, recipe books, crafting skills, stations, timed crafts. |
| Resource nodes | Trees, ore, fishing spots with tool and skill gates and respawn. |
| Building | Ghost preview, snapping, footprint validation, item and currency costs. |
| Spawning | Scene-placed spawners with respawn timers. |
| Saving and loading | Per-unit snapshots keyed by a persistent id, JSON on disk, buildings respawned on load. |
| Fog of war | Units reveal a fog texture rendered through a URP feature. URP only. |

## Where to start

1. [Getting started](getting-started.md) takes you from install to a unit that walks and fights in about ten minutes.
2. [Demos](demos/index.md) are small playable scenes, one per part of Vantage, each documented down to the field values.
3. [Concepts](concepts.md) explains the handful of ideas everything is built on.
4. [Modules](modules/index.md) has one short page per system with the authoring steps and the runtime calls.
5. [Reference](reference/index.md) lists every component and asset with each Inspector field, its default and what it changes, and the members you can call or override.
6. [Extending](extending.md) shows how to add your own effects, damage types, resources and more.
7. [Multiplayer](multiplayer.md) covers the co-op sample, how casts travel to the server, and what you still replicate yourself.
8. [Testing](testing.md) explains how to run the package's tests and write your own against it.

## Requirements

- Unity 6000.3 or newer.
- Universal Render Pipeline.
- Input System package.
- UGUI 2.0 (brings TextMeshPro, used for combat text).

Pathfinding runs on Unity's built-in NavMesh, baked with the AI Navigation package that every Unity 6 project has. Other pathfinders plug in through one interface, see [Movement](modules/movement.md).
