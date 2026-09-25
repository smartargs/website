# Orders and control groups

Command many units at once, RTS style: select them, right-click to move in formation or attack, attack-move, stop and hold position, and save groups on the number keys. Units without orders attack enemies that come close.

See it running: the [23 · Selection and Orders](../demos/23-selection-orders.md) demo scene.

Every field, its default and every member you can call: [Orders and control groups reference](../reference/orders.md).

## Setup

**On each unit you command,** turn on **Takes Orders** in its unit definition. That attaches `VtUnitOrders`. Leave **Use Hostile AI** off on these units; they fight on their own while idle. **Aggro Range** decides how far an idle or attack-moving unit notices enemies.

**On a commander object,** an empty object in the scene rather than a unit, add:

| Component | Role |
|---|---|
| `VtUnitSelection` | Picking units, see [Selection](selection.md). Set **Viewer Faction** to the side you command. |
| `VtSelectionIndicator` | Markers under selected units. |
| `VtOrderInput` | Command-click orders and the order keys. **Screen Point To Ray** replaces the main camera for its raycasts. |
| `VtControlGroups` | Groups on the number keys. |

Do not put `VtOrderInput` on a hero that has `VtTopDownClickInput`; both would answer the command click. Let the camera roam with **Enable Edge Scroll** on the `VtTopDownCamera`, and give it an **Initial Target** such as an empty object at your base, which Space returns to.

## Orders

| Input | Order |
|---|---|
| Right-click the ground | **Move** in formation. Enemies on the way are ignored. |
| Right-click a hostile unit or a resource node | **Attack** it until it dies, then go idle. |
| A, then left-click the ground | **Attack-move**: walk there and fight every hostile unit met on the way. |
| A, then left-click a hostile unit or a resource node | Attack it. Right-click or Esc cancels the A. |
| S | **Stop** and go idle. |
| H | **Hold position**: stay, and attack only what is within attack range. |

The keys are the Attack Move, Stop, Hold Position and Cancel actions; set the action fields on `VtOrderInput` to use others, see [Input](input.md).

Only selected units of the commander's side with `VtUnitOrders` take orders. Enemies and other units can be selected to look at them, but ignore orders.

A group moves in a grid centred on the clicked point and facing the way it travels, each unit taking a near free slot. Set **Formation Spacing** for the gap between slots. A single unit walks to the point itself.

An idle unit attacks the nearest hostile unit inside its Aggro Range, and goes idle again when its target dies. A move ends when the unit stops at its slot, or when no path starts within a second.

## Control groups

| Input | Result |
|---|---|
| Ctrl + 1 to 0 | Save the selection as that group, replacing it. |
| Shift + 1 to 0 | Add the selection to that group. |
| 1 to 0 | Select the living units of that group. |
| The same number twice quickly | Also move the camera to the group. |

A unit can be in several groups. Dead units are skipped when a group is selected, and destroyed units leave it. The keys are the Control Group 1 to 10, Assign Modifier and Additive Modifier actions; set **Group Actions** and the modifier action fields to use others, see [Input](input.md). Control groups use the number keys that `VtAbilityHotkeys` uses by default, so a commander has no hotkeys.

## Runtime

```csharp
var orders = unit.GetComponent<VtUnitOrders>();
orders.Issue(VtOrderKind.Move, point);
orders.Issue(VtOrderKind.AttackMove, point);
orders.Issue(VtOrderKind.Attack, point, enemy);
orders.Issue(VtOrderKind.HoldPosition, orders.transform.position);
orders.Issue(VtOrderKind.Stop, Vector3.zero);
orders.Kind;
orders.OnOrderChanged += kind => { };

var input = commander.GetComponent<VtOrderInput>();
input.OrderMove(point);
input.OrderAttack(enemy);
input.OnOrderIssued += (kind, count) => ShowFeedback(kind, count);

var groups = commander.GetComponent<VtControlGroups>();
groups.AssignSelection(0);
groups.Recall(0, Time.unscaledTimeAsDouble);
groups.Groups.Units(0);
groups.OnGroupRecalled += (group, cameraMoved) => { };
```

`VtFormation.GridSlots` and `VtFormation.AssignNearest` build the same formation for your own order code.

## Multiplayer

On a predicting client, `VtUnitOrders.Issue` sends an **Order** command through the unit's command relay, and the authority starts the order on its copy. Orders run on the authority only, and the resulting movement and attacks replicate as usual. Selection and control groups stay on each player's machine. See [Multiplayer](../multiplayer.md).
