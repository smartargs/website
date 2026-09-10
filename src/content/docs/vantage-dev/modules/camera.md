# Camera

`VtTopDownCamera` is a fixed-pitch follow camera with zoom, edge scrolling and middle-mouse panning.

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
| Snap Back Key | Re-centres on the target. Space by default. |

Edge scrolling and panning detach the camera into free mode. `IsInFreeCameraMode` tells you which mode it is in.

## Sharing the scroll wheel

If another system needs the wheel for a moment, for example rotating a build ghost, block the camera:

```csharp
VtTopDownCamera.IsScrollBlocked = () => builder.IsPlacing;
```

The camera uses the Input System package only.
