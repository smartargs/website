# Camera

`VtTopDownCamera` is a fixed-pitch follow camera with zoom, edge scrolling and middle-mouse panning.

See it running: the [01 · Hello Unit](../demos/01-hello-unit.md) demo scene. See [Demos](../demos/index.md) to import the scenes.

Every field, its default and every member you can call: [Camera reference](../reference/camera.md).

## Setup

1. Add **Vantage → Camera → VtTopDownCamera** to the main camera.
2. Drag the player into **Initial Target**, or call `SetTarget` from your spawn code.
3. Make sure the scene has an Event System. The camera uses it to ignore scroll input over UI.

| Setting | Meaning |
|---|---|
| Pitch | Downward angle. 58 degrees is a classic RTS view. |
| Default / Min / Max Height | Starting zoom and its limits. |
| Enable Zoom, Zoom Speed | Scroll-wheel zoom. |
| Enable Edge Scroll, Edge Scroll Speed, Border | Pan when the mouse sits near the window edge. |
| Enable Middle Mouse Pan, Pan Speed | Drag with the middle button. |
| Snap Back Action | Re-centres on the target. Empty uses the Camera Snap Back action: Space, or the right stick press. See [Input](input.md). |

Edge scrolling and panning detach the camera into free mode. `IsInFreeCameraMode` tells you which mode it is in. `FocusOn(point)` moves the camera to a point in free mode, as control groups do on a double tap; snapping back returns to the target.

## Sharing the scroll wheel

If another system needs the wheel for a moment, hold it. `VtBuildInput` does this while it rotates a build ghost.

```csharp
VtTopDownCamera.HoldScroll(this);     // the wheel no longer zooms
VtTopDownCamera.ReleaseScroll(this);  // zoom returns when the last holder lets go
```

`VtTopDownCamera.IsScrollBlocked` still takes a predicate of your own, and `IsScrollHeld` answers whether anything holds the wheel.

The camera uses the Input System package only.
