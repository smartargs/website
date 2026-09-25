# Presentation

Cues bind animation, sound and effects to gameplay moments without code. A cue is an animator trigger, a sound and an effect prefab, each optional, authored on the ability, buff or unit definition. One component on the unit plays them.

Every field, its default and every member you can call: [Presentation reference](../reference/presentation.md).

## Authoring

| Where | Cues |
|---|---|
| Ability definition | **Cast Start** on the caster when the cast bar starts. **Cast** on the caster when the ability resolves. **Impact** on each target the ability damages. |
| Buff definition | **Applied** and **Removed** on the target. **Loop Vfx Prefab** stays on the target while the buff lasts. |
| Unit definition | **Hit**, **Death** and **Revive** on the unit itself. |
| AoE Damage, AoE Heal and AoE Buff effects | **Area Cue** at the centre of the area when the effect resolves. |
| Persistent AoE Damage effect | **Area Cue** when the area appears, **Pulse Cue** on every damage pulse, and **Loop Cue**, an effect that stays on the area until it ends. |

Each cue has:

| Field | Meaning |
|---|---|
| Animator Trigger | Trigger parameter set on the unit's Animator. Ignored by area cues. |
| Sound | Clip played once through the unit's AudioSource, or at its position when it has none. |
| Vfx Prefab | Prefab spawned at the effect anchor, or at the centre of the area. |
| Vfx Seconds | Lifetime of the spawned effect. 0 leaves it to the prefab. |
| Scale To Area | Area cues only. Scales the effect's width and depth by the area's radius, so one prefab authored for a radius of 1 fits every size. |

## Effects at a point

Area cues need no presenter: they play where the area is. Play any cue at a point yourself the same way:

```csharp
VtPresentation.PlayAt(myCue, landingPoint, areaRadius: 4f);
VtPresentation.OnPlayedAt += (cue, point, radius) => { };
```

Area cues play where ability effects run, which in a networked game is the server. Forward `OnPlayedAt` to clients and call `PlayAt` there to show them.

## Setup

Add **Vantage → Presentation → VtUnitPresenter** to the unit prefab. It finds the Animator and AudioSource in the children, or take the fields. Set **Vfx Anchor** to a bone or empty for effects that should not sit at the feet. **Dead Bool Parameter** names an Animator bool the presenter sets on death and clears on revive; leave it empty if your controller has none.

The presenter runs on every copy of a unit. In a networked game the co-op sample's unit sync replays hits, deaths, revives, casts and buffs on every client, so observers see and hear the same cues.

## Runtime

```csharp
var presenter = unit.GetComponent<VtUnitPresenter>();
presenter.Play(myCue);
presenter.OnCuePlayed += (cue, spawnedEffect) => { };
```

For moments the cues do not cover, the gameplay events remain: casts, channel ticks, evades, heals and level-ups all fire on their components, see [Abilities](abilities.md) and [Units](units.md).
