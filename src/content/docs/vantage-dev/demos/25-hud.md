# 25 · HUD

Every HUD panel and every window of the sample's [HUD panels](panels.md), each under a caption that says what it is, the way [24 · UI Gallery](24-ui-gallery.md) shows the components. The panels read units that exist only as data, so nothing moves or fights; the greybox props behind them show the panels' transparency. The feature scenes use the same panels and windows in play.

Scene `Scenes/25_Hud`. Assets `Content/25_Hud` and `Content/Shared`.

## What it teaches

- A HUD is a handful of components next to the UI Document: `VtUiRoot` for the layers, then one component per panel pointed at a unit and a region.
- A panel can also be placed inside an element of your own with `PlaceIn`, which is how the gallery puts each one under its caption.
- The target frame is the same component as the player frame, with **Source** set to Target Of Unit.
- The action bar reads the unit's `VtAbilityHotkeys`: the abilities in slot order with their key caps and cost lines.
- The resource bars and the stat list read the same pools, level and modifiers every other system reads; the second bar draws from the shipped compact layout to show how a layout of your own goes on a panel.
- `VtToasts` shows short messages in four severities; `VtUiNotifications` feeds it from a unit's events.
- The currency readout, quest tracker, threat list, selection panel, minimap and interaction prompt are HUD panels like the frames: one component, one unit, one region.
- A window is a component too: `VtInventoryWindow`, `VtQuestLogWindow`, `VtDialogueWindow`, `VtCraftingWindow` and `VtTalentWindow` each build a `VtWindow` on the Windows layer, or under an element of your own with `PlaceIn`, which is how the gallery shows them open.
- The windows only call the public API the systems already have: equip, use, abandon, craft, learn, choose an answer.

## Assets

Unit definitions use the demo defaults unless listed: Physical damage in Channel Melee, Attack Range 2, Attack Interval 1, Move Speed 5, and the shared BasicAttack.

**HeroCurve**, an XP Curve: Id `xp.hero`, Max Level 5, XP To Next Level 60, 90, 130, 180.

| Ability | Settings |
|---|---|
| Strike | Id `ability.hud_strike`, Icon Id `sword`, Targeting Mode Single Target, Range 3, Cooldown 3, no cost. Effect **StrikeDamage**, a Damage effect: 20 to 28 Physical, Channel Melee. |
| Firebolt | Id `ability.hud_firebolt`, Icon Id `flame`, Targeting Mode Single Target, Range 15, Resource Cost 25 MP, Cast Time 1. Effect **FireboltDamage**, a Damage effect: 30 to 40 Fire, Channel Magic. |
| Mend | Id `ability.hud_mend`, Icon Id `bandage`, Targeting Mode Self, Resource Cost 40 MP, Cast Time 1.5, Cooldown 6. Effect **MendHeal**, a Heal effect of 60. |

Items, all Item Definitions:

| Item | Id | Slot | Other fields |
|---|---|---|---|
| Iron Sword | `item.hud_iron_sword` | Main Hand | Modifiers Physical Power 0.15, Is Percentage on. |
| Oak Shield | `item.hud_oak_shield` | Off Hand | Modifiers Armor 20. |
| Silver Ring | `item.hud_silver_ring` | Ring 1 | Modifiers Crit Chance 0.05. |
| Health Potion | `item.hud_health_potion` | None | Is Stackable on, Max Stack Size 10. |
| Herbs | `item.hud_herbs` | None | Is Stackable on, Max Stack Size 20. |
| Copper Ore | `item.hud_copper_ore` | None | Is Stackable on, Max Stack Size 20. |
| Copper Bar | `item.hud_copper_bar` | None | Is Stackable on, Max Stack Size 20. |

Quests: **MainQuests**, a Quest Category with Id `questcat.hud_main`, Display Name Main, Sort Weight 0 and Color (1, 0.82, 0.35). **RaiderTag**, a Unit Tag with Id `tag.hud_raider`. **SlayRaiders**, a Kill Objective with Description "Slay raiders on the causeway", Required Count 5 and Target Tag RaiderTag. **GatherHerbs**, a Collect Objective with Description "Gather Herbs", Required Count 3 and Item Herbs. **Reward120Xp**, an XP reward of 120.

| Quest | Settings |
|---|---|
| The Sunken Causeway | Id `quest.hud_causeway`, Description "Raiders hold the old causeway. Clear them out.", Category MainQuests, Objectives SlayRaiders, Rewards Reward120Xp. |
| A Poultice for the Elder | Id `quest.hud_poultice`, Description "The Elder needs three Herbs from the marsh.", Category MainQuests, Objectives GatherHerbs, Rewards Reward120Xp, Time Limit Seconds 600. |

Talents, each with Point Cost 1: **Toughness** (`talent.hud_toughness`, Required Level 1, Max Rank 3, Modifiers Per Rank Max HP 25), **Heavy Blows** (`talent.hud_heavy_blows`, Required Level 2, Max Rank 2, Modifiers Per Rank Physical Power 0.1 percentage) and **Battle Rhythm** (`talent.hud_battle_rhythm`, Required Level 3, Max Rank 1, Modifiers Per Rank Attack Speed 0.2 percentage, Prerequisites Heavy Blows rank 2). **HeroTree**, a Talent Tree: Id `tree.hud_hero`, those three talents, Starting Talent Points 2, Talent Points Per Level 1, Starting Attribute Points 3, Attribute Points Per Level 2, Spendable Attributes Strength and Agility.

Crafting: **Smithing**, a Crafting Skill with Id `skill.hud_smithing`, XP Curve HeroCurve and Max Level 5. **ForgeStation**, a Recipe Station type with Id `station.hud_forge`. **Metalwork**, a Recipe Category with Id `recipecat.hud_metalwork`.

| Recipe | Settings |
|---|---|
| Copper Bar | Id `recipe.hud_copper_bar`, Category Metalwork, no station, Inputs Copper Ore 2, Output Copper Bar 1, Craft Seconds 2, Required Skill Smithing level 0, XP Grant 30, Learned By Default on. |
| Iron Sword | Id `recipe.hud_iron_sword`, Category Metalwork, Station ForgeStation, Inputs Copper Bar 3, Output Iron Sword 1, Craft Seconds 3, Required Skill Smithing level 3, XP Grant 60, Learned By Default on. |

**ElderTalk**, a Dialogue Definition with Id `dialogue.hud_elder` and two nodes: `start` says "The causeway has been quiet since you came. What brings you back?" with Include Quest Answers on and the answers "Tell me about the marsh." (to `marsh`) and "Goodbye." (ends); `marsh` says "Herbs grow where the water stands. Mind the raiders." and returns to `start`.

**EldersBlessing**, a Buff Definition with Id `buff.hud_elders_blessing`, Display Name "Elder's Blessing", Default Duration 60, Stacking Policy Refresh and Modifiers Armor 25.

| Unit Definition | Settings |
|---|---|
| Hero | Id `unit.hero`, Faction Player, Pools HP Base Max 300 with Starting Current 240 and MP Base Max 200 with Starting Current 130, both without regeneration, Min / Max Damage 10 / 14, XP Curve HeroCurve, Starting Level 1, Granted Abilities Strike, Firebolt and Mend, Base Attributes Strength 8 and Agility 6, Starting Equipment Iron Sword and Oak Shield, Starting Inventory Health Potion 4, Silver Ring 1, Copper Ore 6 and Herbs 1, Talent Tree HeroTree, Use Quest Log, Use Dialogue, Use Crafter, Use Recipe Book and Use Crafting Skills on. |
| Squire | Id `unit.hud_squire`, Faction Player, HP 180, Min / Max Damage 6 / 9. |
| Elder | Id `unit.hud_elder`, Faction Neutral, HP 100, no damage, no basic attack. |
| Target | Id `unit.hud_target`, Faction Enemy, HP Base Max 500 with Starting Current 320, no damage, no basic attack, Move Speed 0, Use Threat Table on. |

The pools start part-way so the bars show a fill. Strength and Agility are the shared attributes in `Content/Shared`, and the shared **AttributeFormula** turns Strength into Physical Power and Agility into Crit Chance and Attack Speed. Gold is the shared currency.

## Scene

Ground 30 × 30.

| Object | Setup |
|---|---|
| Main Camera | VtTopDownCamera with Initial Target set to Focus, otherwise the shared layout. |
| Focus | Empty object at (0, 0, 0). |
| Props | Empty object at (0, 0, 0) with four children: **Crate**, a cube at (-4, 0.75, 2) scaled 1.5 with the Item material; **Pillar**, a cylinder at (3, 1.5, -1) scaled (1.2, 1.5, 1.2) with the Unit material; **Block**, a cube at (0, 0.5, 5) scaled (6, 1, 1) with the Dark material; **Orb**, a sphere at (6, 1, 4) scaled 2 with the Unit material. |
| Data | Empty object with four children, each an empty object at (0, -20, 0) with **VtUnit** and **VtNameplateInfo** with Hidden on: **Target**, **Squire** and **Elder** with their definitions, and **Hero** with Definition Hero, **VtAttributeDerivedStatsBinding** with Formula AttributeFormula, **VtAbilityHotkeys** switched off with slots key 1 Strike, key 2 Firebolt, key 3 Mend, **VtUnitInventory** with Base Capacity 12, **VtUnitWallet**, **VtDemoStartingCurrency** with Currency Gold and Amount 145, **VtUnitSelection**, **VtDemoPresetSelection** with Target set to Target, and **VtDemoHudSeed** with Hero set to Hero, Quests The Sunken Causeway and A Poultice for the Elder, Threat Target set to Target, Attackers Hero and Squire with Threat 340 and 190, Skills Smithing with Skill Levels 2, Speaker Elder, Dialogue ElderTalk and Buffs EldersBlessing. |
| Herbs | WorldItem prefab at (1.5, -20, 0), Count 2, next to the Hero so the interaction prompt has something to name. |
| Demo UI | Lesson card. Two **VtUnitFrame** with Unit set to Hero, one with Source Unit and one with Source Target Of Unit. **VtBuffBar** with Unit set to Hero and Region Top Left. Two **VtResourceBar** with Unit set to Hero: one with Bar Source Pool and Pool HP, one with Bar Source Experience and Layout set to `Runtime/Resources/VtLayouts/VtResourceBarCompact`. **VtStatList** titled Hero with rows Strength, Agility, Physical power, Crit chance and Armor. **VtActionBar** with Hero's VtAbilityHotkeys and Slot Size Large. **VtCurrencyReadout**, **VtQuestTracker**, **VtThreatList** and **VtMinimap** with Unit set to Hero. **VtSelectionPanel** with Selection set to Hero's VtUnitSelection. **VtInteractionPrompt** with Player set to Hero and Key Text RMB. **VtInventoryWindow**, **VtQuestLogWindow**, **VtDialogueWindow**, **VtTalentWindow** and **VtCraftingWindow**, all with Unit set to Hero and Draggable off; the crafting window has Recipes Copper Bar and Iron Sword and Open At Station off. **VtDemoHudGallery**. |

VtDemoHudGallery builds its layer 20 pixels in from the left, top and bottom and 480 pixels from the right, so the lesson card keeps its column, and fills it with a scroll view of nineteen sections, each a small caption, a muted line of explanation and the panel itself placed with `PlaceIn` at a minimum width of 320 pixels: Unit frame, Target frame, Resource bar, Resource bar · compact layout, Buff bar, Stat list, Action bar, Currency readout, Quest tracker, Threat list, Selection panel, Minimap, where every unit stands on the same spot, and Interaction prompt; then Inventory window, Quest log, Dialogue window, Crafting window and Talent window, each opened in place; then Toasts with four small buttons Info, Success, Warning and Error that show, as title over detail, "Quest accepted" over "The Sunken Causeway", "Level up" over "You reached level 5", "Out of range" over "Firebolt" and "Item broken" over "Iron Sword" through the scene's VtToasts, the titles through their localization keys. The regions the panels name are not used, since the gallery places them itself. VtDemoHudSeed runs after the gallery: it accepts the two quests, puts the Hero and the Squire on the Target's threat table, sets Smithing to level 2, puts Elder's Blessing on the Hero for a minute and starts the conversation with the Elder, so every panel has something to show.

## Build it yourself

1. Build the scene as in [Build the shared layout](index.md#build-the-shared-layout) with a 30 × 30 Level. This scene uses no prefabs.
2. **GameObject → Create Empty**, name it **Focus**, at (0, 0, 0), and set it as the VtTopDownCamera **Initial Target**.
3. **GameObject → Create Empty**, name it **Props**, and add the four primitives above as children.
4. **Create → Vantage → Leveling → XP Curve**, name it HeroCurve; create the three abilities and their effects with **Create → Vantage → Abilities**; the items, quests, talents, skill, recipes, dialogue and buff under their **Create → Vantage** menus; and the four unit definitions with **Create → Vantage → Units → Unit Definition**, with the values above.
5. **GameObject → Create Empty**, name it **Data**, add the four empty children with the components above, and drop a WorldItem prefab with Herbs next to the Hero.
6. Add a UI Document with the demo Panel Settings, then **VtUiRoot**, **VtDemoCanvas**, **VtUiNavigation**, **VtTooltipHost**, **VtToasts**, **VtUiNotifications**, **VtNameplates**, **VtDemoNameplateText**, **VtDemoLessonCard**, the thirteen HUD panels, the five windows and **VtDemoHudGallery** with the values above.

## Try

- Read each caption: it names the component and what it draws.
- Hover an item, a talent or a recipe for its tooltip; click a bag item to equip or use it, and a talent to learn it.
- Compare the panels with the same ones in 03 · Abilities or 06 · Leveling and Talents, where they follow a fight.
- Press the toast buttons for one message of each severity, F8 to hide the gallery, and F10 to hide the HUD.

## In your own game

- Add `VtUiRoot` next to your UI Document, then the panels you need, each with its unit and a region, or `PlaceIn` an element of your own layout. See [UI](panels.md#hud-panels).
- Add `VtUiNavigation` and the windows you need, and open them from your input. See [Windows for the player](panels.md#windows-for-the-player).
- Translate every toast by adding rows for the keys on `VtUiNotifications.Keys` to your localization table.
