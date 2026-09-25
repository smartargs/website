# Combat text

Floating damage, heal, crit, dodge, absorb and immune numbers above units. It works with no setup: every unit publishes its combat events, and a default presenter appears in the scene on first play if you have not placed one.

See it running: the [02 · Damage Lab](../demos/02-damage-lab.md) demo scene. See [Demos](../demos/index.md) to import the scenes.

Every field, its default and every member you can call: [Combat text reference](../reference/combat-text.md).

## Styling

**Create → Vantage → UI → Combat Text Style.** One entry per kind of text: colour, prefix, suffix, font scale, rise distance, lifetime and an optional sound. Kinds not listed fall back to the style's defaults.

Place a `VtWorldSpaceCombatTextPresenter` on any scene object and drag the style into **Style**. Other settings on the presenter:

| Setting | Effect |
|---|---|
| Font | TextMeshPro font asset, or leave empty for the default. |
| Render On Top | Labels draw over geometry. Turn it off for text that can be hidden behind walls and large bodies. |
| Horizontal Jitter | Random sideways offset so overlapping hits do not stack on one line. |
| Max Live Popups | Cap on labels in flight; the oldest recycle early. |

Labels appear just above the target's visible mesh, so small and huge units both look right without per-unit tuning.

## Silencing units

Uncheck **Emit Combat Text** on a unit definition to keep swarms and dummies from flooding the screen.

## Replacing the renderer

Subscribe to the feed and draw the events however you like: UI Toolkit, a screen-space combat log, or both at once.

```csharp
public sealed class CombatLog : MonoBehaviour, IVtCombatTextPresenter
{
    private void OnEnable()  => VtCombatTextFeed.OnEvent += HandleEvent;
    private void OnDisable() => VtCombatTextFeed.OnEvent -= HandleEvent;

    private void HandleEvent(VtCombatTextEvent evt) => Show(in evt, null);

    public void Show(in VtCombatTextEvent evt, VtCombatTextStyle style)
    {
        AppendLine($"{evt.kind} {evt.amount}");
    }
}
```

Disable the default presenter if you do not want both.

## Publishing your own text

Anything can publish, for example "+5 Wood" when a resource node is harvested:

```csharp
VtCombatTextFeed.Publish(new VtCombatTextEvent(
    VtCombatTextKind.Heal, amount: 5, damageType: VtDamageType.Physical,
    isCrit: false, attacker: VtUnitId.None, target: unit,
    worldPosition: unit.transform.position));
```
