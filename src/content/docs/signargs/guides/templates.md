# Templates and form fields

A template is what makes a signature mean something specific: which box on which page, the exact
sentence the signer agrees to, how sure your application must be of them, and who signs first. The
signer sees their own sentence before signing; the reviewer later finds the same sentence in the
signature record and the template's hash pinned in the audit chain, so what was enforced can be
checked.

## What a template holds

| Part | What it is |
|---|---|
| `TemplateId` | Opaque reference, 1 to 64 of `A-Z a-z 0-9 . _ -`. |
| `Name` | The document type as people call it, printed on the audit page. |
| `Fields` | At least one field, ids unique within the template. |
| `DocumentSha256` | Optional. Binds the template to exactly one document; a session refuses other bytes. Leave it out to use the template for every document of that type. |

Each field:

| Part | What it is |
|---|---|
| `Id` | Identifies the field in records. A discovered form field's name can be used as it is. |
| `Label` | The field's name as people read it, printed on the audit page. |
| `PageIndex` | Zero-based page the signature is stamped on. |
| `Area` | The box, in thousandths of a PDF point, origin at the page's bottom-left corner, y up. |
| `ConsentText` | The sentence this signer agrees to, copied into their signature record. |
| `MinimumAssurance` | The lowest [assurance level](../concepts.md#assurance-levels) a signer of this field may have. |
| `Order` | Optional rank. Every field of a lower rank must be confirmed first; equal ranks sign in any order; a field without a rank can be signed at any time. |

## Write one in code

```csharp
using SignArgs.Core.Json;
using SignArgs.Core.Records;

var template = new SignatureTemplate("handover-protocol", "Handover protocol", new[]
{
    new SignatureField("contractor", "Contractor", 2, FieldArea.FromPoints(56, 560, 240, 70),
        "I confirm that the installation was carried out as described and hand it over.",
        AssuranceLevel.Presence) { Order = 1 },
    new SignatureField("site-manager", "Site manager", 2, FieldArea.FromPoints(56, 400, 240, 70),
        "I confirm that I inspected the installation shown and accept it.",
        AssuranceLevel.Presence) { Order = 2 },
});

byte[] stored = RecordJson.Write(template);
```

`FieldArea.FromPoints` converts points to the stored unit. Sessions take the stored bytes, not the
object, because the bytes are what gets hashed and copied into the bundle.

## Or keep it as a file

A template is canonical JSON; the **Sign a document** sample ships
`handover-protocol.template.json.bytes`. Name the file `.json.bytes` so Unity imports it as a
`TextAsset` with its bytes untouched, and pass `textAsset.bytes`. Read one back with
`RecordJson.ReadSignatureTemplate(bytes)`; a malformed template throws `RecordFormatException`
naming what broke the format's rules.

## Take the boxes from the PDF

If the document already declares signature widgets, read their rectangles instead of typing
coordinates. You still write the consent sentence and the minimum level yourself, because no default
is right for those:

```csharp
var declared = await view.GetFormFieldsAsync(2);
var fields = declared
    .Where(field => field.Kind == PdfFormFieldKind.Signature)
    .Select(box => new SignatureField(
        box.Name, box.Name, box.PageIndex,
        FieldArea.FromPoints(box.Area.X, box.Area.Y, box.Area.Width, box.Area.Height),
        "I confirm …", AssuranceLevel.Presence))
    .ToList();
```

Nothing turns a discovered field into a template field automatically yet; the step above is yours.

## What starting a session checks

When a session starts with a template, it checks that the template parses, that it is bound to this
document if it is bound at all, that every field lies within a page the document has, and that every
text the audit page will print is non-empty and can be printed in the audit font. A template that passes can no
longer fail later for any of those reasons. See [Sessions and signers](sessions.md).

## Make the pad match the box

Give the signature pad the aspect ratio of the field's box. The stamped image is fitted and centred,
so a mismatched pad leaves the signature small in its box rather than distorted, but a matching one
lets the signer use all of it.
