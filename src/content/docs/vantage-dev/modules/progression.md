# Progression

Talent trees and attribute points. A tree is a class or specialization: the talents a unit can learn and how many points it earns per level. Learning a talent pushes its grants into the unit; a reset takes them all back.

See it running: the [06 · Leveling and Talents](../demos/06-leveling-talents.md) demo scene. See [Demos](../demos/index.md) to import the scenes.

## Authoring

1. **Create → Vantage → Progression → Talent** for each node. Set the level, prerequisites, ranks, cost and what each rank grants.
2. **Create → Vantage → Progression → Talent Tree.** Drag the talents in and set the points per level.
3. Assign the tree to **Talent Tree** on the unit definition. A `VtUnitProgression` component attaches on spawn.

| Talent field | Meaning |
|---|---|
| Required Level | Minimum level for the first rank. |
| Prerequisites | Talents that must already be learned, each at a rank. |
| Max Rank | How often it can be learned. Modifiers and attribute grants multiply by the rank. |
| Point Cost | Talent points per rank. |
| Auto Learn | Learned on its own, for free, as soon as level and prerequisites allow. Use it for "Fireball at level 5". |
| Abilities | Granted at the first rank, revoked on reset. |
| Modifiers Per Rank, Attribute Grants Per Rank | Same rows as an item, times the rank. |
| Trait Overrides | Applied while any rank is learned. |

| Tree field | Meaning |
|---|---|
| Starting Talent Points, Talent Points Per Level | Talent points at level 1 and per level after it. |
| Starting Attribute Points, Attribute Points Per Level | Attribute points the player places by hand. 0 per level disables allocation. |
| Spendable Attributes | Which attributes take points. Empty means any. |

A class choice is a tree per class on separate unit definitions, or one definition whose tree you swap before spawn.

## Runtime

```csharp
var progression = player.GetComponent<VtUnitProgression>();

progression.TalentPointsAvailable;
progression.AttributePointsAvailable;
progression.GetRank(talent);

if (!progression.CanLearn(talent, out var reason)) ShowReason(reason);
progression.TryLearn(talent, out reason);
progression.TrySpendAttributePoint(strength, out reason);
progression.Reset();
progression.GrantBonusTalentPoints(1);

progression.OnTalentLearned       += (talent, rank) => { };
progression.OnAttributePointSpent += (attribute, points) => { };
progression.OnPointsChanged       += () => RedrawTree();
progression.OnReset               += () => RedrawTree();
```

Reasons: `NotInTree`, `MaxRank`, `LevelTooLow`, `MissingPrerequisite`, `NoPoints`, `AttributeNotAllowed`, and `AuthorityNotLocal` on a networked client, where the request travels to the server and the events report the outcome. Ranks, spent points and bonuses save with the unit.
