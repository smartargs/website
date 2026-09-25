# 01 · Hello Unit

The [getting-started guide](../getting-started.md) as a scene. Two units made from the same prefab: the player walks where you right-click and fights a skeleton that attacks when you come close.

Scene `Scenes/01_HelloUnit`. Assets `Content/01_HelloUnit` and `Content/Shared`.

## What it teaches

- A unit is a prefab plus a unit definition. The definition decides faction, health, damage and behaviour.
- The basic attack is one ability shared by every unit. It reads damage, range and attack interval from the unit's own definition.
- Units walk over a baked NavMesh, an enemy with hostile AI attacks on sight, and combat text needs no setup.
- Left-click and box selection come from one component, and the marker under selected units is a style asset.

## Assets

**PlayerUnit**, a Unit Definition:

| Field | Value |
|---|---|
| Id | `unit.player` |
| Display Name | Player |
| Faction | Player |
| Pools | One HP pool: Base Max 100, Starting Current 100, Regen Mode Out Of Combat Only, Base Regen Per Second 2 |
| Min Damage / Max Damage | 8 / 12 |
| Move Speed | 5 |

**SkeletonUnit**, a Unit Definition:

| Field | Value |
|---|---|
| Id | `unit.skeleton` |
| Display Name | Skeleton |
| Faction | Enemy |
| Pools | One HP pool: Base Max 100, Starting Current 100, Regen Mode None |
| Min Damage / Max Damage | 8 / 12 |
| Move Speed | 5 |
| Use Hostile AI | on. Aggro Range stays at its default of 8. |

Both use the shared BasicAttack.

## Scene

Ground 30 × 30.

| Object | Setup |
|---|---|
| Player | Player prefab at (0, 0, -4). Definition PlayerUnit. VtDemoReviveAfterDeath with Delay Seconds 4 and Return To Start on. |
| Skeleton | Unit prefab at (0, 0, 6). Definition SkeletonUnit. VtDemoReviveAfterDeath with Delay Seconds 4 and Return To Start on. |
| Main Camera | VtTopDownCamera, Initial Target Player, Default Height 15, so the skeleton's nameplate is fully on screen at the start. |
| Demo UI | Lesson card. Two **VtUnitFrame** with Unit Player and Region Top Left: one with Source Unit, the other with Source Target Of Unit, which shows the unit Player has selected, or else Player's target. **VtBuffBar** with Unit Player and Region Top Left. **VtResourceBar** with Unit Player, Bar Source Cast and Region Top Left. |

## Build it yourself

This builds the scene from nothing but the package.

**The basic attack**

1. **Create → Vantage → Abilities → Effects → Basic Attack Damage**, name it **BasicAttackDamage**.
2. **Create → Vantage → Abilities → Ability Definition**, name it **BasicAttack**, and set Id `ability.basic_attack`, Icon Id `sword`, Targeting Mode Single Target, Triggers GCD off, Ignores GCD on, Can Auto Cast on, Scales With Attack Speed on, Source Cooldown From Unit Attack Interval on, Source Range From Unit Attack Range on. Drag BasicAttackDamage into **Effects**.

**The unit definitions**

3. **Create → Vantage → Units → Unit Definition** twice, name them **PlayerUnit** and **SkeletonUnit**, and fill in the values from [Assets](#assets). Drag BasicAttack into **Basic Attack** on both.

**The level**

4. Create a new scene with a Directional Light.
5. **GameObject → Create Empty**, name it **Level**. Add a **3D Object → Cube** child named **Ground** at (0, -0.5, 0) with Scale (30, 1, 30). Add four cube walls 1.5 high around the edges.
6. Select Level, **Add Component → Navigation → NavMesh Surface**, set **Collect Objects** to **Current Object Hierarchy**, and press **Bake**.
7. **GameObject → UI → Event System**, then press **Replace with InputSystemUIInputModule** in its inspector.

**The unit prefab**

8. **GameObject → Create Empty**, name it **Unit**, at (0, 0, 0).
9. **Add Component → Physics → Character Controller** with **Center** (0, 1, 0), **Height** 2, **Radius** 0.45.
10. **Add Component → Vantage → Units → VtUnit**. Unity adds the unit's other components with it.
11. **Add Component → Vantage → Movement →** **VtLocalMovementExecutor**, **VtTopDownClickToMove** and **VtNavMeshPathProvider**. The executor moves the Character Controller, click-to-move follows paths and turns the unit, and the path provider finds paths on the NavMesh.
12. Add a **3D Object → Capsule** child named **Body** at (0, 1, 0) and remove its Capsule Collider.
13. Drag Unit into the Project window to make it a prefab, then delete it from the scene.

**The player prefab**

14. Right-click **Unit.prefab**, **Create → Prefab Variant**, name it **Player**.
15. Open Player and **Add Component → Vantage → Movement → VtTopDownClickInput** and **VtAbilityHotkeys**. Click input turns right-clicks into walk and attack orders.
   Then **Add Component → Vantage → Selection → VtUnitSelection** and **VtSelectionIndicator**, and drag the **SoftRing** preset from `Packages/Vantage/Runtime/Core/Selection/Presets` into the indicator's **Style**. Left-clicks now select units.

**The scene**

16. Drag **Player.prefab** in at (0, 0, -4). On its **VtUnit**, set **Definition** to PlayerUnit.
17. Drag **Unit.prefab** in at (0, 0, 6). On its **VtUnit**, set **Definition** to SkeletonUnit.
18. Select **Main Camera**, **Add Component → Vantage → Camera → VtTopDownCamera**, drag Player into **Initial Target**, and set **Default Height** to 15.
19. Press Play. Right-click the ground to walk and the skeleton to attack, and left-click a unit to select it.

To match the demo exactly, also add the Facing cube and VtDemoFactionTint to the Unit prefab, VtDemoReviveAfterDeath to both units, and the Demo UI object, as described in the [Demos overview](index.md#kit-prefabs).

## Try

- Right-click the ground to walk, right-click the skeleton to attack.
- Left-click a unit to select it: the second unit frame shows it. Drag a box around both units, Shift-click to add or remove one, Esc to clear.
- Walk near the skeleton and it attacks you first.
- Scroll to zoom, hold the middle mouse button to pan, press Space to snap back.
- Change Min Damage on PlayerUnit while playing.
- F10 hides every panel, R resets the scene.

## In your own game

- Replace the Body capsule with your character model and fit the Character Controller's Height and Center to it.
- Use the [Respawn](../modules/respawn.md) module instead of VtDemoReviveAfterDeath.
