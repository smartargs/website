# Capturing signatures

The signer writes with a finger, a pen or a mouse, and sees smooth ink under it. Behind the ink,
every input event is kept with the time the device reported for it and, for a pen, its pressure: a
pen reporting at 240 Hz gives 240 points a second whatever the frame rate. That record, not the
picture, is what makes a handwritten signature worth keeping.

## Setup

1. Under a canvas, create the pad: an `Image` (white, or your pad background) with an
   `AspectRatioFitter`. Give it the aspect ratio of the signature box on the document, so the ink is
   not squeezed when it is stamped.
2. Add a child that stretches over the pad and add **SignArgs → Stroke Graphic** to it. Turn off its
   **Raycast Target**.
3. Add **SignArgs → Signature Pad** to the pad itself and set:

| Field | Value |
|---|---|
| Ink | the `StrokeGraphic` |
| Line width | fraction of the pad's height; 0.035 by default, 0.005 to 0.2 |
| Ink colour | the colour drawn on screen and stamped into the document |

The pad works on screen-space overlay canvases and on canvases with a camera; world-space canvases
use the same code path but have not been run on a device.
The scene needs an `EventSystem` with the Input System UI module for your buttons; the pad itself
reads input events directly.

## Runtime

```csharp
pad.InkChanged += () => confirmButton.interactable = pad.HasInk;

pad.Clear();                    // start over
pad.enabled = false;            // lock the pad; enabling it again keeps the strokes

StrokeRecord strokes = pad.Strokes;                      // every event since the last Clear
SignatureImage image = await pad.ExportAsync(strokes, 960, 280);
```

`HasInk` is true from the first touch-down; `IsDrawing` while a finger, pen or button is down on the
pad. `InkChanged` fires when a stroke ends and when the pad is cleared.

You rarely call `ExportAsync` yourself: `LocalFinalizer.ConfirmAsync` exports the image at the
field's size. Call it when you want to show the taken signature somewhere else, as the
**Sign a document** sample does. Pass the same `StrokeRecord` you confirm, so the image shows exactly
those strokes.

## What is recorded

`StrokeRecord` holds the surface size in pixels, the device time the capture started, and one stroke
per touch-down to lift, each marked `touch`, `pen` or `mouse`. Each point has its position in
millionths of the surface, its time in microseconds from the first point, and pressure where the
device reports one. A stroke begins only inside the pad; once started, it follows the finger
outside the rectangle until it lifts.

Pressure from a pen changes the line width. Touch "pressure" on a phone is contact size, so it is
recorded but does not change the line.

## The ink and the stamped image

The on-screen ink is a mesh, smoothed for display, and stays sharp at any canvas scale. The stamped
image is drawn from the same points with the same smoothing, fitted and centred in the field's box,
with a transparent background. The records keep the raw points; smoothing never touches them.

## One thing the pad changes in your project

The Input System merges redundant events by default, which drops pointer and touch moves within a
frame before any listener sees them. Enabling a pad turns that merging off for the rest of the
application's run, because the dropped points are the signature. In the editor the setting is
written to your project's input settings asset, so it stays off after play mode ends. If your game
relies on merging to keep high-frequency mouse input cheap, account for that.

## Confirming must be deliberate

Never confirm when the pen lifts. The signer confirms with a button they press or hold, after reading
the consent sentence. See [Sessions and signers](sessions.md#confirm).

## Untested

Touch capture has been measured on an Android phone: every injected touch event became one point.
Mouse capture has been run on a Windows player with events queued through a virtual Input System
mouse: 240 queued events gave 240 points per signature. Pen input and pressure have not been run on
a device with a stylus yet. See [Platforms](../platforms.md).
