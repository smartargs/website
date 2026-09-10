# Testing

The package ships an EditMode test suite that runs in a few minutes. Use it to confirm an install, and reuse its fixture for tests of your own content and extensions.

## Running the package tests

1. Add the package to the `testables` list in your project's `Packages/manifest.json`:

```json
"testables": ["com.smartargs.vantage"]
```

2. Open **Window → General → Test Runner**, pick the **EditMode** tab, and run all.

## Writing your own

Create an EditMode test assembly that references `Vantage.Runtime` and `Vantage.Editor.Tests`. The fixture `VtTestUnitBuilder` in namespace `Vantage.Tests` builds units, definitions, abilities, items, buffs, loot tables and more without a scene.

```csharp
using NUnit.Framework;
using Vantage.Tests;

public sealed class FireballTests
{
    private VtTestUnitBuilder.Tracker tracker;

    [SetUp]    public void SetUp()    => tracker = new VtTestUnitBuilder.Tracker();
    [TearDown] public void TearDown() => tracker.Dispose();

    [Test]
    public void Fireball_hits_for_its_damage_range()
    {
        var (_, caster) = VtTestUnitBuilder.Create("Caster");
        var (_, target) = VtTestUnitBuilder.Create("Target");
        var effect = VtTestUnitBuilder.BuildDamageEffect(min: 30, max: 30, VtDamageType.Fire);
        var fireball = VtTestUnitBuilder.BuildAbility(effects: new[] { effect });

        var abilities = caster.GetComponent<VtUnitAbilities>();
        abilities.GrantAbility(fireball);
        var before = target.GetComponent<VtUnitStats>().HP;

        abilities.TryCast(fireball, VtAbilityTargetData.SingleTarget(target));

        Assert.AreEqual(before - 30, target.GetComponent<VtUnitStats>().HP);
    }
}
```

The tracker destroys every object the builder created and restores global state when disposed.

## Time

Nothing in the package reads the Unity clock during a test. Advance time by calling `Tick` on the component, or `VtTickManager.Tick(dt)` for everything at once:

```csharp
target.GetComponent<VtUnitStats>().Tick(5f);   // five seconds of regen
VtTickManager.Tick(1.5f);                       // global cooldown expires
```

## Tuning in tests

Swap the tuning asset for the duration of a test instead of editing values:

```csharp
tracker.OverrideTuning(t => t.globalCooldown = 0f);
```

## Deterministic rolls

Loot tables, resource nodes and crit rolls accept a seeded random through `SetRandom` or the builder's `BuildPinnedRng(seed)`, so drop tests do not flake.
