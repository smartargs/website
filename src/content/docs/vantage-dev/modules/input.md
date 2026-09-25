# Input

Player input reads Input System actions, so keys can be rebound, gamepad buttons work, and key labels always show the current binding.

Every field, its default and every member you can call: [Input reference](../reference/input.md).

## Default actions

The package ships **VtInputActions** in `Runtime/Resources`. Its **Gameplay** map has these actions:

| Action | Keyboard and mouse | Gamepad | Read by |
|---|---|---|---|
| Select | Left button | | `VtUnitSelection` |
| Command | Right button | | `VtTopDownClickInput`, `VtOrderInput`; also cancels aiming, attack-move targeting and placing |
| Confirm Target | Left button | South | Aiming a ground ability, attack-move targeting, placing a building |
| Ability 1 to 10 | 1 to 0 | West, North, LB, RB, LT, RT for 1 to 6 | `VtAbilityHotkeys`, slot 1 on Ability 1 and so on |
| Cancel | Esc | East | Aiming a ground ability, attack-move targeting, placing, `VtUnitSelection` |
| Attack Move | A | | `VtOrderInput` |
| Stop | S | | `VtOrderInput` |
| Hold Position | H | | `VtOrderInput` |
| Control Group 1 to 10 | 1 to 0 | | `VtControlGroups` |
| Assign Modifier | Ctrl | | `VtControlGroups` |
| Additive Modifier | Shift | | `VtControlGroups`, `VtUnitSelection`, `VtBuildInput` (keep placing) |
| Camera Snap Back | Space | Right stick press | `VtTopDownCamera` |
| Rotate Placement | R | D-pad right | `VtBuildInput` |
| Rotate Placement Back | Shift + R | D-pad left | `VtBuildInput` |

The cursor position, the drag distance and the scroll wheel stay on the mouse.

## Mouse buttons

The buttons are actions like any key, so rebinding them changes the whole control scheme:

- **Swap the buttons:** bind Select and Confirm Target to the right button and Command to the left.
- **Move on left-click:** bind Command to the left button as well. A press on a unit you can select but not attack, such as your own units, selects it. Every other press is a command: move, attack or pick up. Box selection needs a button of its own, so it is off in this layout.
- **Confirm and Command on one button:** while aiming or picking an attack-move target, confirming wins.

The press that starts aiming, such as a click on a hotbar slot, never also confirms it.

## Using your own actions

- **One input:** every component has an action field for each input, such as **Cancel Aim Action** on `VtAbilityHotkeys` or **Action** on a hotkey slot. Drag an action from your own asset into it. Empty fields use the default. Vantage reads a copy of the shipped asset at runtime, so don't drag actions from the shipped asset: they would not follow rebinding.
- **All inputs:** give your asset actions with the same names and install it once at startup. The names are in `VtInputActionNames`.

```csharp
VtInput.SetActions(myActions);
```

## Rebinding

Rebind with the Input System's interactive rebinding, then tell Vantage so key labels redraw. On the shipped actions, binding 0 is the keyboard key and binding 1 the gamepad button where there is one. Rotate Placement Back is the exception: binding 0 is the Shift + R composite, with its parts at 1 and 2, and the gamepad button at 3.

```csharp
var action = VtInput.Find(VtInputActionNames.Ability(0));
action.Disable();
action.PerformInteractiveRebinding(0)
    .WithControlsHavingToMatchPath("<Keyboard>")
    .OnComplete(operation =>
    {
        operation.Dispose();
        action.Enable();
        VtInput.NotifyBindingsChanged();
    })
    .Start();
```

Keep the player's changes between sessions:

```csharp
PlayerPrefs.SetString("bindings", VtInput.SaveBindingOverrides());
VtInput.LoadBindingOverrides(PlayerPrefs.GetString("bindings"));
```

## Showing keys

```csharp
string label = VtInput.DisplayString(hotkeys.GetAction(0), VtInput.KeyboardMouseScheme);
string pad = VtInput.DisplayString(hotkeys.GetAction(0), VtInput.GamepadScheme);
VtInput.OnBindingsChanged += RedrawKeyLabels;
```

`VtControlGroups.GetGroupAction` does the same for control groups.

While a window or a menu is open, `VtInput.IsGameplayBlocked` is true and hotkeys, orders, selection, control groups and click-to-move do nothing. The UI's navigation stack holds it for you; hold it yourself with `VtInput.BlockGameplay(owner)` and `UnblockGameplay(owner)` for a cutscene or a minigame. Several owners can hold it at once.

`VtInput.ActiveScheme` is the scheme of the device the player used last: keyboard and mouse until a gamepad button is pressed, then gamepad until a key or the mouse is used again. `OnActiveSchemeChanged` fires when it flips, and `SetActiveScheme` sets it from your own device handling. The `VtKbd` key cap in [UI](ui.md#key-cap) reads all of this for you.

## Gamepad

Gamepad buttons cast, cancel and snap the camera back. Abilities that need a unit or a point under the cursor still need a cursor: replace `CursorRay` on `VtAbilityHotkeys`, drive `VtUnitSelection` through its pointer calls, or use your own controller.
