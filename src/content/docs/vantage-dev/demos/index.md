# Demos

The **Demos** sample is a set of small playable scenes. Each scene shows one part of Vantage and explains itself on screen. The pages in this section describe every scene exactly: the assets it uses with their field values, where every object stands, and the steps to build it yourself.

## Import the scenes

1. Open **Window → Package Manager** and select **Vantage**.
2. Open **Samples** and press **Import** next to **Demos**. Unity copies the sample to `Assets/Samples/Vantage/<version>/Demos`.
3. Accept the TextMeshPro essentials import if Unity offers it. The labels above units need it.
4. Open **Vantage → Demos**. The window lists every scene; press **Play** next to one.

The scenes need the Universal Render Pipeline and the Input System set as the active input handling.

## The scenes

| Scene | What it teaches |
|---|---|
| [01 · Hello Unit](01-hello-unit.md) | Click to move, auto-attack, an enemy that fights back, combat text and the camera. |
| [02 · Damage Lab](02-damage-lab.md) | Armor, resistance, evasion, immunity, invulnerability, thorns, regeneration, crits, lifesteal and armor penetration. |
| [03 · Abilities](03-abilities.md) | Cast times, a channel, cooldowns, projectiles, splash, ground areas, lingering areas and interrupts. |
| [04 · Stats, Buffs and Auras](04-stats-buffs-auras.md) | Attributes and derived stats, stacking buffs, damage and healing over time, stuns and immunity, auras. |
| [05 · Items and Inventory](05-items-inventory.md) | Equipment, requirements, two-handed weapons, durability, item sets, consumables, world items and gold. |
| [06 · Leveling and Talents](06-leveling-talents.md) | Experience from kills, the level curve, attribute points, a talent tree with ranks, prerequisites and level unlocks, and a reset. |
| [07 · AI and Threat](07-ai-threat.md) | Wandering, a patrol route, aggro, chase and leash, call for help, a threat table with taunt, healing threat and vanish. |
| [08 · Spawners and Loot](08-spawners-loot.md) | Packs, weighted variants, respawn timers, corpse reuse, loot tables with guaranteed and weighted drops, and gold. |
| [09 · Quests and Dialogue](09-quests-dialogue.md) | A quest giver with a conversation tree, requirements by level, item, flag and quest state, kill, collect, talk and reach objectives, a timed and a repeatable quest. |
| [10 · Gathering and Crafting](10-gathering-crafting.md) | Trees and ore with tool and skill requirements and respawn, stations with recipes, skill levels, and learning a recipe. |
| [23 · Selection and Orders](23-selection-orders.md) | Box selection, group orders in formation, attack-move, hold position and control groups for a small army. |
| [24 · UI Gallery](24-ui-gallery.md) | The UI components with a theme card for dark and light mode, accent colours, corner radius and typefaces. |
| [25 · HUD](25-hud.md) | Every HUD panel and window under a caption: frames, bars, lists, the prompt, and the inventory, quest, dialogue, crafting and talent windows. |
| [26 · RPG HUD](26-rpg-hud.md) | The resource bar, unit frame, buff bar and action bar in an action RPG arrangement over an empty screen: target on top, cast bar, buffs, action bar with ability icons and tooltips, health, mana and experience stacked at the bottom, with a layout file of the demo's own. |

## Controls

- Right-click the ground to walk, a hostile unit to attack, an item or gold to pick it up.
- Left-click a unit to select it, Shift-click to add or remove one, drag a box to select several, double-click to select every unit of that kind on screen, and press Esc to clear.
- In 23 · Selection and Orders there is no hero. Right-click gives the selected units orders, A and a left-click attack-moves, S stops and H holds. Ctrl and a number saves a control group, the number selects it. Move the mouse to the screen edge to scroll.
- Number keys cast the abilities on the hotbar. Clicking a slot casts too.
- Scroll to zoom, hold the middle mouse button to pan, press Space to re-centre on your unit.

Every panel on screen can be hidden:

| Key | Panel |
|---|---|
| F1 | Folds the lesson card. Clicking its title does the same. |
| F4 | The inventory window, in 05, 08, 09 and 10. |
| F5 | Damage Lab attack settings. |
| F8 | The scene window or panel: talents in 06, spawners in 08, the quest log in 09, crafting in 10, the gallery in 24 and 25. |
| F10 | Hides the HUD at once. |
| R | Loads the scene again, putting every unit, item and panel back to its start. |

The unit frames, the action bar, the stat list, the resource bars, the buff bars and cast bars, the currency readout, the quest tracker, the threat list, the selection panel and the interaction prompt are the sample's [HUD panels](panels.md) and hide with F10. The inventory, talent, quest log, crafting and dialogue windows are the sample's windows: a key opens one through **VtDemoWindowKey**, Esc closes the topmost, and the conversation window opens by itself when someone speaks. Messages such as a refused cast or a level gained are toasts from the sample's notifications.

The lesson card is split into pages: Overview, Look at, Try, and Panels with the keys of the panels in the current scene. The name of the page shown sits under the title. Look at lists each asset or object as a small tag above its explanation, Try numbers the steps, and Panels shows each key as a key cap. Back, a bar per page and Next sit under a divider at the bottom of the card; click a bar to jump to its page.

Every unit with health has a nameplate over its head: its name, level and a health bar, red for enemies, green for allies and amber for neutral units, with the unit's hint and its active buffs underneath. A unit's hint is the Subtitle of its **VtNameplateInfo**. Resource nodes and crafting stations have **VtNameplateInfo** with Hidden on and keep their world labels. See [UI](panels.md#nameplates). When the Game view is too short for a page, the page scrolls with the mouse wheel and the panels below it stay in view.

## What the sample contains

| Folder | Contents |
|---|---|
| `Content` | Unit definitions, abilities, effects, buffs, auras and items. One folder per scene, plus `Shared`. |
| `Kit` | Prefabs, materials and UI settings used by every scene. |
| `Scenes` | The scenes, each with a folder holding its baked NavMesh. |
| `Scripts` | The demo-only components, all named `VtDemo…`. |
| `Editor` | The **Vantage → Demos** window. |

## The layout every scene shares

Every scene has these root objects. The scene pages only list what differs.

| Object | Setup |
|---|---|
| Directional Light | Light type Directional, Intensity 1.1, Soft Shadows, rotation (55, -35, 0). Environment lighting is a flat grey. |
| Level | A **Ground** cube scaled to the scene's size, 1 high, at y -0.5, and four **Wall** cubes 1.5 high around the edge. A **NavMesh Surface** on Level with Collect Objects set to Current Object Hierarchy and Use Geometry set to Render Meshes, baked. |
| Main Camera | Tag MainCamera, a Camera with a solid dark background, an Audio Listener, and **VtTopDownCamera** with Enable Edge Scroll off and Initial Target set to the player. Each scene sets its own **Default Height** so every unit it teaches, and its nameplate, is on screen at the start; the page of the scene names the value. |
| EventSystem | Event System and Input System UI Input Module. |
| Demo UI | UI Document using `Kit/UI/VtDemoPanelSettings`, **VtUiRoot**, **VtDemoCanvas**, **VtUiNavigation**, **VtTooltipHost**, **VtToasts** with Position Bottom Center so the toasts stay clear of the lesson card, **VtUiNotifications** with Player and Toasts set, **VtNameplates** with Viewer set to the player and Filter Neutral on, **VtDemoNameplateText**, **VtDemoLessonCard** and the scene's panels. The unit frames, action bar, stat list and resource bars on the pages are the package's HUD panels, see [UI](panels.md#hud-panels). |

Units and items are instances of the kit prefabs. Each instance sets its own **Definition**, or item, and every unit gets **VtDemoReviveAfterDeath** so the scene stays playable. On the player instance, the label's **Show Health** is off.

### Build the shared layout

1. Create a new scene with a **Directional Light**, or start from an empty scene and add one.
2. **GameObject → Create Empty**, name it **Level**, at (0, 0, 0).
3. Add a **3D Object → Cube** as a child of Level, name it **Ground**, set Position (0, -0.5, 0) and Scale to the scene's size with a height of 1, for example (30, 1, 30).
4. Add four more cubes under Level as walls, 1.5 high, along the edges of the ground.
5. Select Level, **Add Component → Navigation → NavMesh Surface**, set **Collect Objects** to **Current Object Hierarchy**, and press **Bake**. Units are placed outside Level so they are not baked into the NavMesh.
6. Select **Main Camera**, check that its tag is MainCamera, and **Add Component → Vantage → Camera → VtTopDownCamera**. Set its **Initial Target** once the player is in the scene.
7. **GameObject → UI → Event System**. In its inspector, press **Replace with InputSystemUIInputModule**.

## Kit prefabs

**Unit.prefab** is every unit in every scene.

| Part | Setup |
|---|---|
| Unit (root) | **VtUnit**, Definition set per instance. **Character Controller** with Center (0, 1, 0), Height 2, Radius 0.45, Skin Width 0.02. **VtLocalMovementExecutor**, **VtTopDownClickToMove**, **VtNavMeshPathProvider**, **VtUnitPresenter** for cast, impact and death effects, **VtDemoFactionTint** pointing at Body. VtUnit adds the other unit components itself: modifiers, stats, traits, buffs, combat engagement, abilities, combat text and equipment. |
| Body | Capsule at (0, 1, 0) with its collider removed and the `Unit` material. Coloured by faction when the scene starts. |
| Facing | Small dark cube at (0, 1.45, 0.42), so you can see where the unit looks. |

**Player.prefab** is a prefab variant of Unit with **VtTopDownClickInput**, **VtAbilityHotkeys**, **VtGroundTargetIndicator**, **VtUnitSelection**, and **VtSelectionIndicator** with Style set to the package preset **SoftRing**, added.

**Kit/Vfx** holds the effects: particle prefabs named after what they show, such as FireSparks, FireBurst, FrostRing, SnowFall, MeteorImpact and DeathPuff, all using one additive particle material, `Particle`, with a soft round texture. Burst and spark prefabs keep their particles at the unit's chest or feet through a child offset. Area prefabs are authored for a radius of 1 and are used by cues with **Scale To Area** on.

**WorldItem.prefab** is an item on the ground: a gold **Box** cube 0.5 wide turned 45 degrees, a **Box Collider** set to **Is Trigger** with Center (0, 0.4, 0) and Size (1, 0.8, 1), **VtWorldItem** with Item and Count set per instance, and a Label at (0, 1.2, 0). The collider is a trigger so units walk over items while clicks still find them.

**GoldPile.prefab** is a flat gold cylinder with a trigger **Box Collider**, **VtDemoGoldPile** with Currency set to Gold and Amount set per instance, and a Label.

**FireProjectile.prefab** and **ArcaneProjectile.prefab** are glowing spheres 0.35 across without shadows, used as projectile prefabs by damage effects.

The materials in `Kit/Materials` use the URP Lit shader. `Kit/UI/VtDemoPanelSettings` uses Scale Mode Constant Pixel Size at Scale 1, so the panels stay readable in a small Game view, with the theme `VtDemoTheme`. That theme imports the Vantage default theme and adds three rules for the demo cards: 10 px below each card, 6 px below its header, and a 20 px title. See [UI](../modules/ui.md).

### Build the prefabs

**Unit**, the prefab every unit uses:

1. **GameObject → Create Empty**, name it **Unit**, at (0, 0, 0). Its pivot is the unit's feet.
2. **Add Component → Physics → Character Controller**. Set **Center** (0, 1, 0), **Height** 2, **Radius** 0.45. Center Y is half the height, so the capsule stands on the pivot instead of floating above it.
3. **Add Component → Vantage → Units → VtUnit**. Unity adds the unit's other components with it: modifiers, stats, traits, buffs, combat engagement, abilities, combat text and equipment.
4. **Add Component → Vantage → Movement → VtLocalMovementExecutor**. It moves the Character Controller.
5. **Add Component → Vantage → Movement → VtTopDownClickToMove**. It follows paths, turns the unit and applies gravity.
6. **Add Component → Vantage → Movement → VtNavMeshPathProvider**. It finds paths on the baked NavMesh.
7. **Add Component → Vantage → Presentation → VtUnitPresenter**. It plays the effects authored on abilities, buffs and unit definitions.
8. **GameObject → 3D Object → Capsule** as a child named **Body**, at (0, 1, 0). Remove its **Capsule Collider**; the Character Controller is the unit's collider.
9. Optional, as in the table above: the **Facing** cube, and **VtDemoFactionTint** on the root with Body assigned.
10. Drag Unit from the Hierarchy into the Project window to save it as a prefab.

**Player**, the unit you control:

1. Right-click **Unit.prefab** in the Project window, **Create → Prefab Variant**, and name it **Player**.
2. Open it and **Add Component → Vantage → Movement → VtTopDownClickInput**. It turns right-clicks into orders: walk to the ground, attack a hostile unit, pick up an item.
3. **Add Component → Vantage → Movement → VtAbilityHotkeys**. It casts abilities from keys; scenes without abilities leave its slots empty.
4. **Add Component → Vantage → Visuals → VtGroundTargetIndicator**. It draws the ring while a ground ability is aimed.
5. **Add Component → Vantage → Selection → VtUnitSelection**. It turns left-clicks and drags into selection.
6. **Add Component → Vantage → Selection → VtSelectionIndicator**, and drag **SoftRing** from `Packages/Vantage/Runtime/Core/Selection/Presets` into **Style**. It draws the markers under selected and hovered units.

**WorldItem**, an item on the ground:

1. **GameObject → Create Empty**, name it **WorldItem**.
2. Add a **3D Object → Cube** child named **Box** at (0, 0.3, 0), Rotation (0, 45, 0), Scale (0.5, 0.5, 0.5), and remove its Box Collider.
3. On the root, **Add Component → Physics → Box Collider**: **Is Trigger** on, Center (0, 0.4, 0), Size (1, 0.8, 1).
4. **Add Component → Vantage → Items → VtWorldItem**, and save it as a prefab. Each placed copy sets its own Item and Count.

**GoldPile**, gold on the ground:

1. **GameObject → Create Empty**, name it **GoldPile**.
2. Add a **3D Object → Cylinder** child named **Coins** at (0, 0.08, 0), Scale (0.7, 0.08, 0.7), and remove its collider.
3. On the root, add a **Box Collider** with **Is Trigger** on, Center (0, 0.3, 0), Size (1, 0.6, 1).
4. **Add Component → Vantage → Demos → VtDemoGoldPile**, set **Currency** to Gold, and save it as a prefab.

**FireProjectile** and **ArcaneProjectile**:

1. **GameObject → Create Empty**, name it after the projectile.
2. Add a **3D Object → Sphere** child named **Ball** with Scale (0.35, 0.35, 0.35), remove its collider, set **Cast Shadows** to Off, and give it the Fire or Arcane material.
3. Save it as a prefab. A damage effect with this prefab under **Projectile** adds the flight behaviour when it launches.

## Shared content

`Content/Shared` holds what several scenes use.

| Asset | Type | Settings |
|---|---|---|
| BasicAttackDamage | Basic Attack Damage effect | None. It reads damage from the caster's unit definition. |
| BasicAttack | Ability Definition | Id `ability.basic_attack`, Display Name Attack, Targeting Mode Single Target, Triggers GCD off, Ignores GCD on, Can Auto Cast on, Scales With Attack Speed on, Source Cooldown From Unit Attack Interval on, Source Range From Unit Attack Range on, Effects BasicAttackDamage. |
| Gold | Currency | Id `currency.gold`, Display Name Gold. |
| Strength, Intelligence, Agility | Attribute Definition | Ids `attr.strength`, `attr.intelligence`, `attr.agility`. |
| AttributeFormula | Attribute Formula | The rows below. |

| Source attribute | Target stat | Per point | Is Percentage |
|---|---|---|---|
| Strength | Physical power | 0.02 | on |
| Intelligence | Spell power | 0.02 | on |
| Agility | Crit chance | 0.005 | off |
| Agility | Attack speed | 0.01 | on |

Every unit definition in the sample sets Damage Channel Melee, Damage Type Physical, Attack Range 2, Attack Interval 1 and Basic Attack BasicAttack unless its page says otherwise. Fields a page does not mention keep their defaults.

## Demo-only components

These exist to make the scenes readable. A game does not need them.

| Component | What it does | In your game |
|---|---|---|
| VtDemoCanvas | Puts the demo panels into the regions of the package's VtUiRoot. F10 hides the HUD, R loads the scene again. | VtUiRoot on its own. |
| VtDemoLessonCard | The card explaining the scene. | Not needed. |
| VtDemoWindowKey | Opens one of the sample's windows with a function key and lists it on the lesson card. | An input action bound to the window. |
| VtDemoSpawnerPanel | Counts down each spawner's respawn. | Not needed. |
| VtDemoPresetSelection | Selects a unit at start so the target frame in 25 · HUD and 26 · RPG HUD has something to show. | Not needed. |
| VtDemoRpgHudLoop | Makes the hero of 26 · RPG HUD take hits, cast and gain experience every few seconds, so the bars move without a world to play in. | Not needed. |
| VtDemoHudGallery | Places every HUD panel and window under a caption in 25 · HUD. | Not needed. |
| VtDemoHudSeed | Accepts quests, adds threat, levels a skill, puts buffs on the hero and starts a conversation at start, so the panels in 25 · HUD and 26 · RPG HUD have something to show. | Not needed. |
| VtDemoDamageLabController | The Damage Lab keys. | Not needed. |
| VtDemoBillboardLabel | World labels over items, gold, spawners, quest locations, resource nodes and stations. | Your own world labels. |
| VtDemoNameplateText | Adds each unit's hit readout and active buffs to its nameplate subtitle. A buff an aura keeps up reads "· aura" instead of a countdown. | A `VtNameplates.SubtitleProvider` of your own. |
| VtDemoHitReadout | Keeps the last hit, the average and the hit count on a Damage Lab dummy. | Your own combat log or floating numbers. |
| VtDemoReviveAfterDeath | Revives a unit a few seconds after it dies. | The [Respawn](../modules/respawn.md) module. |
| VtDemoPatrol | Walks a unit back and forth. | Patrol routes, see [AI roaming](../modules/ai-roaming.md). |
| VtDemoInvulnerable | Calls `SetInvulnerable(true)` at start. | Your own rules. |
| VtDemoWearOnHit | Wears the main-hand item on every hit. | Your durability rule. |
| VtDemoGoldPile | Gold on the ground, a custom `IVtPickable`. | Your own pickups. |
| VtDemoStartingCurrency | Adds gold at start. | Your new-game setup or save file. |
| VtDemoFactionTint | Colours the capsule by faction. | Your models. |
