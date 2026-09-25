# Modules

One page per system. Each page has the authoring steps first and the runtime calls second.

## Core

| Page | What it covers |
|---|---|
| [Units and stats](units.md) | Unit definitions, pools, stats, attributes, buffs, damage, death and revive. |
| [Abilities](abilities.md) | Ability definitions, effects, casting, auto-attack, channels, projectiles. |
| [Combat text](combat-text.md) | Floating numbers, styles, custom presenters. |
| [Movement and input](movement.md) | Click-to-move, path providers, executors, targeting, interaction. |
| [Input](input.md) | Default input actions, your own actions, rebinding and key labels. |
| [UI](ui.md) | The theme and its variables, screen layers, icons, text, badges, key caps, buttons, cards, list rows, pagers, progress bars and nameplates. |
| [Selection](selection.md) | Click, Shift-click, box and double-click selection, markers and marker styles. |
| [Orders and control groups](orders.md) | Move, attack, attack-move, stop and hold for selected units, formations, control groups. |
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
| [Quests](quests.md) | Objectives, rewards, requirements, quest givers, custom objectives, the Quest Graph. |
| [Dialogue](dialogue.md) | Conversations with answers, conditions, effects and quest offers, the Dialogue Graph. |
| [Vendors](vendors.md) | Shops that sell from stock, buy items, price from value and restock. |
| [Respawn](respawn.md) | Death wait, respawn points, revive health and penalties. |
| [Presentation](presentation.md) | Animation, sound and effect cues on abilities, buffs and units. |
| [Localization](localization.md) | Display strings as keys, tables per language, a resolver seam. |
| [Progression](progression.md) | Talent trees, ranks, unlocks by level, attribute points, resets. |
| [Party](party.md) | Invites, leaders, shared XP, currency and quest credit, loot rules, party-only effects. |
| [Summons](summons.md) | Pets and minions that follow, fight by stance and earn their owner's kills. |
| [Encounters](encounters.md) | Ability rotations for monsters, boss fights with phases, adds, resets and rewards. |
| [Chat](chat.md) | Player identity, say, yell, party, guild and whisper chat, system and NPC lines, moderation. |
| [Guilds](guilds.md) | Founding, invites, ranks and permissions, message of the day, guild chat, persistence. |
| [Friends](friends.md) | In-game friends, requests to offline players, presence, Steam and other platform friends. |
| [Mail](mail.md) | Mail with item and currency attachments to offline players, returns, expiry, system mail. |
| [Building](building.md) | Placement, snapping, costs, timed builds, the build menu presenter. |
| [Shared stash and costs](shared-stash.md) | A team or side pool that building, crafting and unlocks pay from; your own cost sources. |
| [Unlocks](unlocks.md) | Research and blueprints bought once, for one player or the whole team. |
| [Hotbar](hotbar.md) | Slots for abilities, items, gear and buildables with keys, drag-to-assign and your own content. |
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
| [World time](world-time.md) | Day and night, day phases with stat changes, night-only spawns, lighting over the day. |
| [Fog of war](fog-of-war.md) | Vision, fog rendering, culling. |
| [Terrain cliffs](terrain-cliffs.md) | Grid cliffs, ramps, the painting tool, wall styles, the shared world grid. |

## Debugging

Add **Vantage → Debug → VtCombatDebugLogger** to a unit to log its casts, hits, buffs, pool changes and target changes to the console. Each category is a checkbox.
