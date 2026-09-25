# Localization

Every display string in the package goes through one resolver before it reaches the screen. With nothing installed, strings show as authored. Install a table per language and the same strings become keys.

## How it works

Author a definition's **Display Name**, **Description**, dialogue lines and answers either as final text or as keys such as `item.sword.name`. `VtLocalization.Resolve(text)` returns the table's translation when the current table has that key, otherwise the string itself. A project that never localizes needs no keys and no tables.

The package resolves its own reads: the unit's `Name`, dialogue text, answers and generated quest answers. Your UI resolves what it reads off definitions:

```csharp
label.text = VtLocalization.Resolve(item.displayName);
tooltip.text = VtLocalization.Format("quest.kill.progress", current, required);
```

## Built-in text

The words the package prints on its own, such as "Cooldown" in a tooltip, "Health" on a bar or "Out of range" in a toast, are keys like `vantage.ui.cooldown` with an English text built in. `Resolve` checks your resolver, then your table, then the built-in English, and only then gives the key back, so a project without a table reads English everywhere and a table overrides any line it has a row for. The keys are listed on `VtUiText.Keys`, `VtHudText.Keys`, `VtInventoryText.Keys`, `VtQuestUiText.Keys`, `VtCraftingText.Keys`, `VtTalentText.Keys`, `VtBuildText.Keys` and `VtSelectionThreatText.Keys`; the sample panels' notifications add `VtUiNotifications.Keys`.

A module of your own can register the English of its keys the same way:

```csharp
VtLocalization.RegisterDefaults(new Dictionary<string, string>
{
    { "mygame.ui.stamina", "Stamina" },
});
```

## Failure reasons

When a call refuses — a cast, a craft, an equip, a purchase, a guild invite — it hands back a reason. `VtFailureText.Describe(reason)` turns it into the line to show: a short English sentence such as "Out of range" or "Inventory is full", or an empty string when the call succeeded (`None`, `Success`).

```csharp
if (!crafter.TryCraft(recipe, station, out var reason))
    Toast(VtFailureText.Describe(reason));
```

Each reason has a key of the form `vantage.reason.<module>.<Member>`, for example `vantage.reason.ability.OutOfRange`. `VtFailureText.Key(reason)` returns it. Add a row for the key to your table and `Describe` returns your text instead of the English one; without a row it stays English.

## Tables

1. **Create → Vantage → Localization → Localization Table**, one per language. Set the language code and add rows: the key as authored, and the text.
2. Install it at startup or from your settings menu:

```csharp
VtLocalization.SetTable(germanTable);
VtLocalization.OnLanguageChanged += RedrawAllText;
VtLocalization.Language;
```

Rows with an empty text count as missing, so a half-translated table shows the built-in English for the package's own keys and the key itself for yours.

## Another localization system

Point `VtLocalization.Resolver` at your own lookup and it runs before the table. Return null to fall through.

```csharp
VtLocalization.Resolver = key =>
    LocalizationSettings.StringDatabase.GetLocalizedString("Game", key, fallbackToProjectLocale: false);
```

Unity's Localization package, a spreadsheet exporter or a JSON file all fit the same one-line seam.
