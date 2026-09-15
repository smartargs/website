# Localization

Every display string in the package goes through one resolver before it reaches the screen. With nothing installed, strings show as authored. Install a table per language and the same strings become keys.

## How it works

Author a definition's **Display Name**, **Description**, dialogue lines and answers either as final text or as keys such as `item.sword.name`. `VtLocalization.Resolve(text)` returns the table's translation when the current table has that key, otherwise the string itself. A project that never localizes needs no keys and no tables.

The package resolves its own reads: the unit's `Name`, dialogue text, answers and generated quest answers. Your UI resolves what it reads off definitions:

```csharp
label.text = VtLocalization.Resolve(item.displayName);
tooltip.text = VtLocalization.Format("quest.kill.progress", current, required);
```

## Tables

1. **Create → Vantage → Localization → Localization Table**, one per language. Set the language code and add rows: the key as authored, and the text.
2. Install it at startup or from your settings menu:

```csharp
VtLocalization.SetTable(germanTable);
VtLocalization.OnLanguageChanged += RedrawAllText;
VtLocalization.Language;
```

Rows with an empty text count as missing, so a half-translated table shows the key for what is left.

## Another localization system

Point `VtLocalization.Resolver` at your own lookup and it runs before the table. Return null to fall through.

```csharp
VtLocalization.Resolver = key =>
    LocalizationSettings.StringDatabase.GetLocalizedString("Game", key, fallbackToProjectLocale: false);
```

Unity's Localization package, a spreadsheet exporter or a JSON file all fit the same one-line seam.
