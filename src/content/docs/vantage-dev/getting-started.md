# Getting started

By the end of this page you have a player that walks where you click and fights an enemy that fights back.

## Install

Copy the `com.smartargs.vantage` folder into your project's `Packages/` folder, or add it through **Window → Package Manager → + → Add package from disk** and pick its `package.json`.

To run the package's own tests from your project, add this line to `Packages/manifest.json`:

```json
"testables": ["com.smartargs.vantage"]
```

## 1. Create a unit definition

A unit definition is the blueprint for a kind of unit. Right-click in the Project window and choose **Create → Vantage → Units → Unit Definition**. Name it `PlayerUnit`.

Set these fields and leave the rest at their defaults:

| Field | Value |
|---|---|
| Id | `unit.player` |
| Display Name | `Player` |
| Faction | `Player` |
| Pools → element 0 | Kind `HP`, Base Max `100`, Starting Current `100`, Regen Mode `OutOfCombatOnly`, Base Regen Per Second `2` |
| Min Damage / Max Damage | `8` / `12` |
| Attack Range | `2` |
| Attack Interval | `1` |
| Move Speed | `5` |

Armor, crit, evade and the other combat stats already exist in the package. You never have to create them.

## 2. Create the basic attack

The basic attack is an ordinary ability that reads its damage from whoever casts it, so one asset serves every unit in your game.

1. **Create → Vantage → Abilities → Effects → Basic Attack Damage**. Name it `BasicAttackDamage`.
2. **Create → Vantage → Abilities → Ability Definition**. Name it `BasicAttack` and set:

| Field | Value |
|---|---|
| Id | `ability.basic_attack` |
| Targeting Mode | `SingleTarget` |
| Range | `2` |
| Cast Time / Cooldown | `0` / `0` |
| Triggers GCD | off |
| Ignores GCD | on |
| Can Auto Cast | on |
| Scales With Attack Speed | on |
| Effects | drag in `BasicAttackDamage` |

3. Open `PlayerUnit` again and drag `BasicAttack` into **Basic Attack**.

## 3. Build the prefab

1. Create an empty GameObject (or use your character model) and add **Vantage → Units → VtUnit**. Unity adds the rest of the unit's components for you.
2. Drag `PlayerUnit` into the **Definition** field.
3. Add **Vantage → Movement → VtTopDownClickToMove**, **VtNavMeshPathProvider** and **VtTopDownClickInput**. The first one also adds a `CharacterController`.
4. Save it as a prefab.

## 4. Make an enemy

Duplicate `PlayerUnit`, name it `SkeletonUnit`, set **Faction** to `Enemy`, check **Use Hostile AI**, and build a second prefab from it without the input component.

## 5. Set up the scene

- A ground plane with a collider, and a NavMesh baked over it: add a **NavMeshSurface** component (AI Navigation package) to the ground and press **Bake**. Without a bake the player still walks, in straight lines, and the console tells you why.
- A camera tagged `MainCamera` looking down at the ground.
- An **EventSystem** (GameObject → UI → Event System).
- Your player prefab at `(0, 1, 0)` and the skeleton a few units away.

Press Play. Right-click the ground and the player walks there. Walk near the skeleton and it attacks you; right-click it and the player fights back until one of them dies. Damage numbers float above both units.

## What next

- Give the skeleton loot, XP and aggro by setting fields on its definition. Every module opts in the same way: a field or checkbox on the unit definition.
- Add a second ability with a cast time and a cooldown, grant it on the definition, add **VtAbilityHotkeys** to the player and drop the ability into slot 1. Press 1 to cast it.
- Read [Concepts](concepts.md) once. It is short and it explains why the rest of the package looks the way it does.

## If something does not work

| Symptom | Check |
|---|---|
| Right-click does nothing | Is there a camera tagged `MainCamera` and an EventSystem? Do the input component's layer masks include your ground and unit layers? |
| The player walks through walls | Bake a NavMesh over the level and make sure the walls are included in the bake, see [Movement](modules/movement.md). |
| A cast never lands | The target must be inside the ability's range, measured on the ground plane, and the caster must not be silenced or stunned. |
| "No VtStatDefinition registered" warnings | Only your own custom stats use the registry. Add them to a Stat Registry Bootstrap asset, see [Units and stats](modules/units.md). |
