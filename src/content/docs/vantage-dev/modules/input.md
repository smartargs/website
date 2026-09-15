# Input

Player input reads Input System actions, so keys can be rebound, gamepad buttons work, and key labels always show the current binding.

## Default actions

The package ships **VtInputActions** in `Runtime/Resources`. Its **Gameplay** map has these actions:

| Action | Keyboard | Gamepad | Read by |
|---|---|---|---|
| Ability 1 to 10 | 1 to 0 | West, North, LB, RB, LT, RT for 1 to 6 | `VtAbilityHotkeys`, slot 1 on Ability 1 and so on |
| Cancel | Esc | East | Aiming a ground ability, attack-move targeting, `VtUnitSelection` |
| Attack Move | A | | `VtOrderInput` |
| Stop | S | | `VtOrderInput` |
| Hold Position | H | | `VtOrderInput` |
| Control Group 1 to 10 | 1 to 0 | | `VtControlGroups` |
| Assign Modifier | Ctrl | | `VtControlGroups` |
| Additive Modifier | Shift | | `VtControlGroups`, `VtUnitSelection` |
| Camera Snap Back | Space | Right stick press | `VtTopDownCamera` |

Clicks, dragging, the cursor position and the scroll wheel stay on the mouse.

## Using your own actions

- **One input:** every component has an action field for each input, such as **Cancel Aim Action** on `VtAbilityHotkeys` or **Action** on a hotkey slot. Drag an action from your own asset into it. Empty fields use the default.
- **All inputs:** give your asset actions with the same names and install it once at startup. The names are in `VtInputActionNames`.

```csharp
VtInput.SetActions(myActions);
```

## Rebinding

Rebind with the Input System's interactive rebinding, then tell Vantage so key labels redraw. On the shipped actions, binding 0 is the keyboard key and binding 1 the gamepad button where there is one.

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

## Gamepad

Gamepad buttons cast, cancel and snap the camera back. Abilities that need a unit or a point under the cursor still need a cursor: replace `CursorRay` on `VtAbilityHotkeys`, drive `VtUnitSelection` through its pointer calls, or use your own controller.
