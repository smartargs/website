# 26 · RPG HUD

The HUD panels arranged the way an action RPG lays them out, over an empty screen: the selected enemy's frame with its portrait at the top, the minimap and the quest tracker in the top right, and the player's cast bar, buffs, action bar, health, mana and experience stacked at the bottom. L opens the quest log. There is no ground, no model and nothing to click. The panels read units that exist only as data, and a small loop makes the hero take hits, cast and gain experience so the bars move.

Scene `Scenes/26_RpgHud`. Assets `Content/26_RpgHud` (with the painted map `AshenValeMap.png`), `Kit/UI/VtDemoRpgBar`, `Kit/UI/VtDemoRpgCastBar`, `Kit/UI/VtDemoRpgXpBar` and `Kit/UI/VtDemoRpgActionBar`.

## What it teaches

- An RPG HUD is not a special component. It is the sample's panels with a **Region** and an **Order** each: a region stacks its panels from the top down, lowest Order first.
- The player's buffs and cast are separate panels at the bottom, while the target's frame at the top carries its own portrait with the level in a round badge on its corner, name, health and buffs through the package's `VtUnitFrameTarget` layout.
- One panel serves the player and the target: **Source** set to Target Of Unit follows what the unit has selected or fights. The name and portrait border turn red because the Ember Wraith is hostile to the hero.
- The portrait is left empty: the wraith has no **Portrait** sprite and the scene has no `VtPortraitStudio`, so the frame shows its initials, EW. A sprite on the definition, or a studio and a model, would fill it.
- A layout of your own goes on a panel's **Layout** field. `VtDemoRpgBar` is a copy of the sample's compact resource bar layout with a fixed width; health and mana use it. The cast bars use `VtDemoRpgCastBar`, narrower and thinner, with space below it. `VtDemoRpgXpBar` does the same for the thin layout, which leaves the label and the numbers out.
- A bar shows its label and numbers in a tooltip while the pointer is over it, so the thin experience bar can stay quiet.
- The cast bar is a resource bar with **Bar Source** Cast. It fills in the theme's cast colour, `--vt-cast`, and hides while nothing is cast.
- `VtDemoRpgActionBar` places the action bar's ten slots itself, named `slot-1` to `slot-10`, spread over the same width as the bars. Hotkey slots without an ability show as empty placeholders.
- The action bar draws each ability's icon, and the buff bar each buff's. An ability or buff without a sprite of its own names an icon from the package's icon set in **Icon Id**. Hovering an ability shows its name, cost, cast time, cooldown, range, damage or healing and description; hovering a buff shows its time left, what it changes and its description.
- The tooltip words such as "Cooldown" and "Time left" are localization keys with English built in, so they read as words without a table.
- Both units have **Emit Combat Text** off, so no floating numbers cover the HUD.
- The action bar's cooldown sweeps come from the abilities, so they turn whether a key, a click or a script cast the ability.
- The minimap needs no markers wired by hand. It reads the units by relation, sees that Warden Brennan has a quest the hero can take, and points to the watchtower because an accepted quest needs it. Only the vendor has a `VtMapMarker`. The map picture is a painted texture on a `VtMapArea`, the way a game with drawn maps would do it.
- The quest tracker and the quest log read the hero's `VtUnitQuestLog`; the two quests are accepted at start by the seed.

## Assets

Unit definitions use the demo defaults unless listed: Physical damage in Channel Melee, Attack Range 2, Attack Interval 1, Move Speed 5, and the shared BasicAttack.

**AdventurerCurve**, an XP Curve: Id `xp.rpg_adventurer`, Max Level 10, XP To Next Level 60, 80, 100, 120, 140, 160, 180, 200, 220.

| Ability | Settings |
|---|---|
| Slash | Id `ability.rpg_slash`, Description "A quick cut at the target in reach.", Icon Id `sword`, Targeting Mode Single Target, Range 3, Cooldown 4, no cost. Effect **SlashDamage**, a Damage effect: 18 to 24 Physical, Channel Melee. |
| Fireball | Id `ability.rpg_fireball`, Description "Hurls a ball of fire at the target.", Icon Id `flame`, Targeting Mode Single Target, Range 15, Resource Cost 30 MP, Cast Time 1.5, Cooldown 3. Effect **FireballDamage**, a Damage effect: 40 to 55 Fire, Channel Magic. |
| Renew | Id `ability.rpg_renew`, Description "Mends your own wounds.", Icon Id `heart-pulse`, Targeting Mode Self, Resource Cost 35 MP, Cast Time 1, Cooldown 8. Effect **RenewHeal**, a Heal effect of 70. |

| Buff | Settings |
|---|---|
| Fortitude | Id `buff.rpg_fortitude`, Description "Hardened against blows.", Icon Id `shield`, Default Duration 600, Stacking Policy Refresh, Modifiers Armor 20. |
| Swiftness | Id `buff.rpg_swiftness`, Description "Your strikes come faster.", Icon Id `wind`, Default Duration 45, Stacking Policy Refresh, Modifiers Attack Speed 0.15, Is Percentage on. |
| Ember Shield | Id `buff.rpg_ember_shield`, Description "Cinders harden around the wraith.", Icon Id `shield-half`, Default Duration 30, Stacking Policy Refresh, Modifiers Armor 30. |
| Fury | Id `buff.rpg_fury`, Description "The wraith strikes in a frenzy.", Icon Id `zap`, Default Duration 20, Stacking Policy Refresh, Modifiers Attack Speed 0.25, Is Percentage on. |
| Burning | Id `buff.rpg_burning`, Description "Fire eats at it.", Icon Id `flame`, Harmful on, Default Duration 8, Stacking Policy Refresh, Tick Effect 12 Fire every 1 second. |
| Chilled | Id `buff.rpg_chilled`, Description "Frost slows every step.", Icon Id `snowflake`, Harmful on, Default Duration 12, Stacking Policy Refresh, Modifiers Move Speed -0.2, Is Percentage on. |
| Sundered | Id `buff.rpg_sundered`, Description "Cracked armour, less of it with every stack.", Icon Id `shield-off`, Harmful on, Default Duration 15, Stacking Policy Stack Independent, Modifiers Armor -10. |

| Unit Definition | Settings |
|---|---|
| Adventurer | Id `unit.rpg_adventurer`, Display Name Ilse, Faction Player, Pools HP Base Max 1200 with Starting Current 860 and Regen Mode Passive at 6 per second, and MP Base Max 400 with Starting Current 260 and Regen Mode Passive at 14 per second, Min / Max Damage 10 / 14, XP Curve AdventurerCurve, Starting Level 4, Granted Abilities Slash, Fireball and Renew, Use Quest Log on, Emit Combat Text off. |
| Ember Wraith | Id `unit.rpg_ember_wraith`, Faction Enemy, HP Base Max 3000 with Starting Current 1900 and Regen Mode Passive at 22 per second, Starting Level 6, no Icon Id, no Portrait, no damage, no basic attack, Move Speed 0, Emit Combat Text off. |
| Ash Wolf | Id `unit.rpg_ash_wolf`, Faction Enemy, HP 400, no damage, no basic attack, Move Speed 0, Emit Combat Text off. |
| Warden Brennan | Id `unit.rpg_warden_brennan`, Faction Neutral, HP 500, no Basic Attack, Move Speed 0, Aggro Range 0, Use Quest Giver on, Offered Quests Ash Wolves, Emit Combat Text off. |

| Quest | Settings |
|---|---|
| Embers in the Vale | Id `quest.rpg_embers`, Description "A wraith of cinders haunts the vale road.", no category, no rewards, Objectives **SlayTheWraith**, a Kill objective: Description "Slay the Ember Wraith", Required Count 1, Target Definition Ember Wraith. |
| The Old Watchtower | Id `quest.rpg_watchtower`, Description "Light the beacon on the north-east ridge.", no category, no rewards, Objectives **ReachTheWatchtower**, a Reach Location objective: Description "Reach the old watchtower", Required Count 1, Location Id `rpg_watchtower`, Arrive Radius 4. |
| Ash Wolves | Id `quest.rpg_ash_wolves`, Description "Thin the pack before it reaches the farms.", no category, no rewards, Objectives **HuntAshWolves**, a Kill objective: Description "Hunt ash wolves", Required Count 3, Target Definition Ash Wolf. |

**AshenValeMap**, a 512 × 512 PNG painted by the builder, north up, imported without mipmaps and with Wrap Mode Clamp: a dark green-grey ground with darker groves from Perlin noise, a winding blue-grey river down the east side and a sandy road across the middle. Any top-down picture works in its place.

**VtDemoRpgBar**, a UXML layout in `Kit/UI`: a root element named `rpg-bar` with the classes `vt-resource-bar` and `vt-resource-bar--compact`, width 560 pixels and top margin 4 pixels, holding a VtText named `label`, and an element named `track` with a VtProgressBar named `bar` and a VtText named `value`. It is the package's `VtResourceBarCompact` layout with a width.

**VtDemoRpgCastBar**, a UXML layout in `Kit/UI`: a root element named `rpg-cast-bar` with the class `vt-resource-bar`, width and minimum width 300 pixels and bottom margin 32 pixels, holding an element named `header` with the class `vt-resource-bar__header` and in it a VtText named `label` and a VtText named `value`, then a VtProgressBar named `bar` with height 6 pixels. It is the package's `VtResourceBar` layout, narrower and with a thinner bar.

**VtDemoRpgXpBar**, a UXML layout in `Kit/UI`: a root element named `rpg-xp-bar` with the classes `vt-resource-bar` and `vt-resource-bar--thin`, width 560 pixels and top margin 6 pixels, holding only a VtProgressBar named `bar`. It is the package's `VtResourceBarThin` layout with a width. It has no `label` and no `value` part, so the bar shows no text.

**VtDemoRpgActionBar**, a UXML layout in `Kit/UI`: a root element named `rpg-action-bar` with the class `vt-action-bar`, width 560 pixels, top margin 6 and bottom margin 2 pixels, holding an element named `row` with Flex Direction Row and Justify Content Space Between, and in it ten VtSlots named `slot-1` to `slot-10`, each with Size Medium and left and right margins 0. It has no `slots` part, so a hotkey past the tenth is not drawn.

## Scene

No Level: the scene has no ground, no walls and no NavMesh.

| Object | Setup |
|---|---|
| Main Camera | VtTopDownCamera with Initial Target set to Focus, otherwise the shared layout. Camera Background (0.24, 0.26, 0.29), a slate grey lighter than the shared layout's so the dark HUD cards stand out. It looks at nothing, so the screen is that colour. |
| Focus | Empty object at (0, 0, 0). |
| Data | Empty object with five children with **VtUnit** and **VtNameplateInfo** with Hidden on, none with a model: **Ember Wraith** at (2, -20, 6), two **Ash Wolf** at (-12, -20, 14) and (-8, -20, 18), **Warden Brennan** at (11, -20, -7), and **Ilse** at (0, -20, 0) with Definition Adventurer, **VtAbilityHotkeys** switched off with ten slots, key 1 Slash, key 2 Fireball, key 3 Renew and slots 4 to 10 empty, **VtUnitSelection**, **VtDemoPresetSelection** with Target set to Ember Wraith, **VtDemoHudSeed** with Hero set to Ilse, Quests Embers in the Vale and The Old Watchtower, and Buffs Fortitude and Swiftness, and **VtDemoRpgHudLoop** with Hero Ilse, Target Ember Wraith, Abilities Fireball, Slash, Fireball, Renew, Target Buffs Ember Shield, Fury, Burning, Chilled, Sundered and Sundered, Interval 2.5, Damage Per Step 18 and XP Per Step 12. Two more children without a unit: **Old Watchtower** at (70, -20, 55) with **VtQuestLocationMarker**, Location Id `rpg_watchtower`, and **Vendor** at (-14, -20, -9) with **VtMapMarker**, Icon `store`, Tint Primary, Reveal Always. |
| Map Area | Empty object at (0, -20, 0) with **VtMapArea**, Size (120, 120), Image AshenValeMap, Display Name Ashen Vale. |
| Demo UI | The shared Demo UI without **VtDemoLessonCard**, so the HUD is all there is on screen, and with **VtToasts** Position Bottom Right. Region Top Right: **VtMinimap** with Unit Ilse, Diameter 220 and Order 0, the other fields at their defaults; **VtQuestTracker** with Unit Ilse and Order 1. **VtQuestLogWindow** with Unit Ilse and **VtDemoWindowKey** with Window the quest log, Panel Name quest log and Toggle Key L. Region Top Center: **VtUnitFrame** with Unit Ilse, Source Target Of Unit, Layout `VtUnitFrameTarget` from the package, Pool Layout `VtResourceBarCompact` from the package, Portrait Studio empty, Health Only on and Order 0; **VtResourceBar** with Unit Ilse, Source Target Of Unit, Bar Source Cast, Layout VtDemoRpgCastBar and Order 1. Region Bottom Center, every bar with Unit Ilse and Layout VtDemoRpgBar unless named: **VtResourceBar** with Bar Source Cast, Layout VtDemoRpgCastBar instead and Order 0; **VtBuffBar** with Unit Ilse and Order 1; **VtActionBar** with Ilse's VtAbilityHotkeys, Layout VtDemoRpgActionBar, Slot Size Medium, Show Caption off, Show Tooltip on and Order 2; **VtResourceBar** with Bar Source Pool, Pool HP, Show Label off and Order 3; **VtResourceBar** with Bar Source Pool, Pool MP, Show Label off and Order 4; **VtResourceBar** with Bar Source Experience, Layout VtDemoRpgXpBar instead and Order 5: a slim bar only, with the level and the numbers in the tooltip. |

VtDemoRpgHudLoop puts the Target Buffs on the Ember Wraith at start and gives each back for its default duration whenever it runs out, keeping two stacks of Sundered because it is listed twice. It runs a step every 2.5 seconds: the hero takes 18 true damage while it has more than twice that left, gains 12 experience until the top of the curve, and casts the next ability in its list, at the target or on itself, unless a cast is still running. Health and mana regenerate, so the scene runs for as long as you leave it.

## Build it yourself

1. Create the XP curve, the three abilities with their effects, the buffs, the four unit definitions, the three objectives and the three quests with the values above, and put Ash Wolves in Warden Brennan's Offered Quests.
2. Duplicate `Packages/Vantage/Runtime/Resources/VtLayouts/VtResourceBarCompact.uxml` into your project, open it in UI Builder, select the root and set Width to 560 and Margin Top to 4. Do the same with `VtResourceBarThin.uxml` and Margin Top 6 for the experience bar. For the cast bars, duplicate `VtResourceBar.uxml`, set the root's Width and Min Width to 300 and Margin Bottom to 32, and the bar's Height to 6. For the action bar, duplicate `VtActionBar.uxml`, set its root's Width to 560, replace the `slots` element with an element named `row` set to Row and Space Between, and drag ten VtSlots into it, named `slot-1` to `slot-10`, Size Medium, side margins 0.
3. Build the scene as in [Build the shared layout](index.md#build-the-shared-layout), then delete the Level object and remove **VtDemoLessonCard** from the Demo UI object.
4. Add Focus and set it as the camera's Initial Target.
5. Add the Data object and its units with the components above, give the hotkeys ten slots and put Slash, Fireball and Renew in slots 1 to 3. Add the Old Watchtower and the Vendor.
6. Add the Map Area with **Vantage → UI → VtMapArea**, Size (120, 120), Display Name Ashen Vale, and your own top-down picture as Image.
7. On the Demo UI object set **VtToasts** Position to Bottom Right and add the panels of the table with their Region and Order, the quest log with its window key, and set your layouts: the package's target frame layout on the target frame with the package's compact bar as its Pool Layout, your compact one on health and mana, the cast one on both cast bars, the thin one on the experience bar, and the action bar one on the action bar.

## Try

- Watch the bottom stack: the cast bar appears while Fireball or Renew is cast and hides again, mana drains and regenerates, health drops with every hit and comes back with Renew, the cooldowns sweep on the action bar, and the experience bar fills.
- Hover an ability on the action bar: its tooltip shows the name, cost, cast time, cooldown, range, damage or healing and the description.
- Watch the top: the target's health falls with every Fireball and Slash, next to its empty portrait with the initials EW and its level badge. Under the bar its two buffs count down, and its three debuffs carry a red border, Sundered with two stacks.
- Hover a debuff on the target frame: its tooltip is subtitled Debuff and shows what it takes away, or the fire it deals each second.
- Toasts from the hero's level-ups stack in the bottom right.
- Read the minimap: the arrow is Ilse, the red dots north of her are the wraith and the wolves, the yellow mark is Warden Brennan with a quest to offer, the store icon is the vendor, and the pin on the rim to the north-east points to the watchtower, far outside the map. The buttons under it zoom; zoomed out, the whole painted vale shows.
- Press L for the quest log with the two quests and their objectives; the tracker under the minimap lists the same two.
- Give the Ember Wraith definition a **Portrait** sprite: the frame draws it in place of the initials.
- Hover a buff over the action bar: its tooltip shows the time left, the armor or attack speed it grants and its description.
- Hover the thin experience bar: the tooltip shows the level and the experience numbers the bar leaves out, at the cursor, and follows it along the bar.
- Select the Demo UI object in the Hierarchy and change a panel's Region or Order while the scene plays: the panel moves at once.
- Clear the Layout of a bar to see the package's own arrangement, with the label and numbers over the bar.
- F10 hides the whole HUD.

## In your own game

- Put `VtUiRoot` next to your UI Document and add the panels you want, each with the player as its unit and a region. See [UI](panels.md#hud-panels).
- Give a unit definition a **Portrait** sprite for a painted portrait, or add one `VtPortraitStudio` per model portrait on screen. See [UI](panels.md#portraits).
- Add a `VtMapArea` per map with a captured or painted picture and a `VtMinimap` pointed at the player. See [Minimap](panels.md#minimap).
- Give your abilities a sprite in **Icon**. Until the art exists, **Icon Id** names one of the package's icons, such as `flame`, `sword` or `heart-pulse`.
- For an arrangement the regions cannot express, such as the vitals beside a hotbar, make an element of your own in your UXML and call `PlaceIn` on each panel.
- To split the action bar, for example slots 1 to 3 left of the vitals and 4 to 6 right of them, put slots named `slot-1` to `slot-6` where you want them in a copy of the action bar's layout.
- For a frame top left instead of bars at the bottom, use `VtUnitFrame` with Source Unit and move the buff bar and cast bar next to it.
