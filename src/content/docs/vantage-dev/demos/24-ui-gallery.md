# 24 · UI Gallery

Every Vantage UI component in one place, with a theme card that switches the whole screen between dark and light mode, accent colours, corner radius and typefaces. The level behind it only exists so the see-through HUD surfaces have something to show through.

![The gallery in dark mode with a blue accent, showing the buttons and controls sections.](../images/demos/13-ui-gallery.png)

Scene `Scenes/24_UiGallery`. Assets `Kit/UI/VtDemoTheme` and `Kit/Fonts`.

## What it teaches

- One theme style sheet on the Panel Settings styles every component.
- `VtTheme` switches mode, accent, radius and typeface at runtime with classes on the UI Document's root.
- A typeface is a class in your own theme style sheet that sets the `--vt-font` variables.
- Cards in every combination of title, description, header action, content, footer and surface.
- `VtButton` in each variant and size, with a selected and a disabled button.
- Unity's built-in controls styled by the theme, with the focus ring they draw when you Tab or use a gamepad.
- A pager that shows one page at a time with Back and Next, with its controls in a card footer, once with a page count and once with a bar per page.
- A progress bar in each colour, and nameplates for hostile, friendly and neutral units, a targeted unit and the viewer.

## Assets

| Asset | Settings |
|---|---|
| Kit/Fonts | IBM Plex Sans Regular, Medium, SemiBold and Bold, with its licence `IBMPlexSans-OFL.txt`. |
| Kit/UI/VtDemoTheme | Imports the Vantage default theme. Adds the demo card spacing and title size, theme-aware key caps (border `--vt-border`, text `--vt-muted-foreground`), the chip's selected look as `.vt-demo-chip.vt-is-selected` (border `--vt-primary`, fill `--vt-hover`, text `--vt-foreground`), row hover `--vt-hover`, bar track `--vt-track`, and two typefaces: `vt-typeface-plex` with the IBM Plex Sans files, and `vt-typeface-mono` with the package's JetBrains Mono, Medium standing in for SemiBold and Bold. |

## Scene

Ground 30 × 30.

| Object | Setup |
|---|---|
| Main Camera | VtTopDownCamera with Initial Target set to Focus, otherwise the shared layout. |
| Focus | Empty object at (0, 0, 0). |
| Props | Empty object at (0, 0, 0) with four children: **Crate**, a cube at (-4, 0.75, 2) scaled 1.5 with the Item material; **Pillar**, a cylinder at (3, 1.5, -1) scaled (1.2, 1.5, 1.2) with the Unit material; **Block**, a cube at (0, 0.5, 5) scaled (6, 1, 1) with the Dark material; **Orb**, a sphere at (6, 1, 4) scaled 2 with the Unit material. |
| Demo UI | Lesson card and **VtDemoUiGallery** with Typefaces Inter (`vt-typeface-inter`), IBM Plex Sans (`vt-typeface-plex`) and JetBrains Mono (`vt-typeface-mono`). |

VtDemoUiGallery builds its layer 20 pixels in from the left, top and bottom and 480 pixels from the right, so the lesson card keeps its column. The theme card is 300 pixels wide with the Window surface; the examples sit in a scroll view 20 pixels to its right and are 260 pixels wide with 16 pixels between them. Under the card examples, a Buttons section shows two rows: Outline, Primary, Ghost and a Danger button reading Abandon quest, then Small, Medium and Large outline buttons, a Selected one carrying `vt-is-selected` and a Disabled one. A Controls section holds a 340 pixel card titled Built-in controls, described "Styled by the theme, with a focus ring.", with one of each under a small muted caption: a plain `ui:Button` reading Plain ui:Button, a Toggle labelled Show nameplates and switched on, a Slider from 0 to 1 at 0.6, a Text field holding Ashcroft, a Dropdown field with Windowed, Borderless and Fullscreen showing Borderless, a Radio button group with Low, Medium and High on Medium, and a 64 pixel Scroll view of eight muted rows. Under them, a Pager section holds two 260 pixel cards: Pager in a card, with a three-page pager and its controls in the card footer, and Pager with steps, the same with Indicator Style set to Steps. A Progress bar section holds a 260 pixel card titled Progress bars with one bar per kind: Primary 0.7, Health 0.55, Mana 0.8, Stamina 0.35 and Experience 0.6. A Nameplate section shows five plates: a hostile Bandit at level 7 and 0.62 health, a targeted hostile Ogre at level 12 and 0.35, a friendly Squire at level 5 and 0.9, a neutral Elder without a level at full health, and the viewer's own Warden at level 9 and 0.8. Each plate but the Warden's carries its relation marker in front of the name: a red square, a green circle, an amber diamond.

## Build it yourself

1. Build the scene as in [Build the shared layout](index.md#build-the-shared-layout) with a 30 × 30 Level. This scene uses no prefabs.
2. **GameObject → Create Empty**, name it **Focus**, at (0, 0, 0), and set it as the VtTopDownCamera **Initial Target**.
3. **GameObject → Create Empty**, name it **Props**, and add the four primitives above as children, removing nothing.
4. Put the IBM Plex Sans files in `Kit/Fonts`, and add the typeface classes to your theme style sheet as in [UI](../modules/ui.md#switching-at-runtime).
5. Add a UI Document with the demo Panel Settings, **VtDemoCanvas**, **VtDemoLessonCard** and **VtDemoUiGallery**, and fill **Typefaces** with the three rows above.

## Try

- Switch to Light: the lesson card, the theme card and every example follow.
- Pick an accent and a radius, then a typeface. Card titles keep their weight in every typeface.
- Press F8 to hide the gallery and look at the scene behind the HUD surfaces.
- Page through the lesson card and the pager example with Back and Next. The lesson card's Next is a primary `VtButton`.
- Press Tab, or push a gamepad stick, to move focus through the controls: each one draws its focus ring.
- Scroll the examples column to reach the pager, progress bar and nameplate sections.

## In your own game

- Put the Vantage theme, or your own that imports it, on your Panel Settings.
- Call `VtTheme.SetMode`, `SetAccent`, `SetRadius` and `SetTypeface` with `UIDocument.rootVisualElement` from your settings screen.
- See [UI](../modules/ui.md) for the variables, the classes and the card.
