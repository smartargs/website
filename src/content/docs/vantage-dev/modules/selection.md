# Selection

Players select units with the mouse: click one, Shift-click to add or remove, drag a box around several, or double-click to pick every unit of that kind on screen. Selected and hovered units get a marker on the ground. Selection belongs to each player's own screen and is never replicated.

See it running: every [demo scene](../demos/index.md); [01 · Hello Unit](../demos/01-hello-unit.md) walks through it, and [23 · Selection and Orders](../demos/23-selection-orders.md) uses it for an army.

Every field, its default and every member you can call: [Selection reference](../reference/selection.md).

## Setup

Add these to the player prefab:

| Component | Role |
|---|---|
| `VtUnitSelection` | Click, Shift-click, box and double-click selection, hover, and the clear key. Clicks come from the Select action, the left button by default; see [Input](input.md#mouse-buttons). Command clicks stay with `VtTopDownClickInput` and `VtOrderInput`. |
| `VtSelectionIndicator` | Draws a marker under every selected unit and the hovered one, coloured by relation and sized to the unit. |

On an object without a unit, such as an RTS commander, set **Viewer Faction** to the side the player commands; relations and box filters are measured from it. To give the selected units orders, see [Orders and control groups](orders.md).

Set **Unit Mask** to the layers your unit colliders are on. A unit needs a collider to be clicked or hovered; boxes use unit positions and need none.

## Selecting

| Input | Result |
|---|---|
| Left-click a unit | Selects only that unit. |
| Shift + left-click a unit | Adds it, or removes it when it is already selected. |
| Drag with the left button | Draws a box. Releasing selects the units inside; with Shift, adds them. A box around nothing clears. |
| Double-click a unit | Selects every living unit with the same unit definition on screen. |
| Left-click the ground | Clears, when **Clear On Ground Click** is on. |
| Esc | Clears. |
| Right-click attack | Selects the target, when **Select On Attack** is on and at most one unit is selected. |

Esc is the Cancel action and Shift the Additive Modifier action; set **Clear Action** and **Additive Action** to use others, see [Input](input.md).

The first selected unit is the primary selection. Single-target hotkeys cast at the unit under the cursor, otherwise at the primary selection, otherwise at the current combat target. While a ground ability is being aimed, clicks and Esc belong to the aim. The table lists the default buttons.

**Box Filter** decides what a box keeps when it covers several sides:

| Box Filter | Keeps |
|---|---|
| Prefer Own Faction | Units of your faction if the box holds any, otherwise hostile units, otherwise the rest. The default. |
| Own Faction Only | Units of your faction. |
| Everything | Every selectable unit in the box. |

Dead units can be clicked but are left out of boxes and double-clicks. Turn off **Selectable** on a unit definition for props and scenery. **Max Selected** caps how many units are selected at once.

## Markers

Markers are green for your faction, red for hostile factions and yellow for everything else; set the three colours on the indicator. The hovered unit gets a fainter marker, set by **Hover Alpha**. The marker radius is the unit definition's **Selection Radius** when it is above 0, otherwise the radius of the unit's Character Controller or collider, plus **Radius Padding**.

The look is a style asset. Drag one into **Style**, and optionally a different one into **Hover Style**. Leave Style empty for a plain thin ring. The package ships these presets in `Runtime/Core/Selection/Presets`:

| Preset | Look |
|---|---|
| ThinRing | A thin solid ring. |
| SoftRing | A wide ring with soft edges. |
| Brackets | Four corner brackets. |
| SpinningDashes | A slowly turning dashed ring. |

### Your own look

- **A ring of your own:** **Create → Vantage → Selection → Ring Style** and set Thickness, Softness, Dashes, Dash Fill, Spin Degrees Per Second, Radius Scale and, optionally, a Material.
- **Any prefab:** **Create → Vantage → Selection → Prefab Style** and set **Prefab** to a decal projector, a textured quad, a mesh or particles, authored for a radius of 1. It is placed at the unit, scaled by the radius and tinted with the relation colour through `_BaseColor` and `_Color`.
- **A prefab with its own behaviour:** put a `VtSelectionMarker` subclass on the prefab. It then places, sizes and colours the marker itself:

```csharp
public sealed class PulsingMarker : VtSelectionMarker
{
    public override void Apply(in VtSelectionMarkerState state, float deltaTime)
    {
        transform.position = state.Position;
        float pulse = state.IsPrimary ? 1f + Mathf.Sin(Time.time * 6f) * 0.06f : 1f;
        transform.localScale = Vector3.one * state.Radius * pulse;
    }
}
```

- **From code:** subclass `VtSelectionStyle` and return your marker from `CreateMarker`.

## Runtime

```csharp
var selection = player.GetComponent<VtUnitSelection>();
selection.Select(unit);
selection.Add(unit);
selection.Toggle(unit);
selection.Remove(unit);
selection.SelectMany(units);
selection.Clear();

selection.Selected;
selection.Primary;
selection.Hovered;
selection.OnSelectionChanged += () => RefreshPortraits(selection.Selected);
selection.OnHoverChanged += unit => ShowTooltip(unit);
```

To draw the box yourself, turn off **Draw Box** and read `IsBoxSelecting` and `BoxScreenRect`, in screen pixels with the origin at the bottom left.

For a gamepad cursor or touch, call `PointerDown`, `PointerMove` and `PointerUp` with your pointer position, and replace `UnitAtScreenPoint`, `WorldToScreen`, `ScreenRect` or `Candidates` when your game finds units differently.
