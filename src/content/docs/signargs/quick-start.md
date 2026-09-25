# Quick start

Signing one field of one document on the device, from an empty scene. Half an hour, no server.

The fastest way to see it working first is the **Sign a document** sample in the Package Manager:
it is this page's scene with three signers and a document to sign; press Play and follow the step
line. Everything below is what the sample does, explained.

## 1. Install

Put `com.signargs.core` and the three packages it shares with the server side
(`com.signargs.shared.core`, `com.signargs.shared.pdfium`, `com.signargs.shared.signing`) in your
project's `Packages/` folder, or point at them from `Packages/manifest.json`:

```json
"com.signargs.core": "file:../../packages/com.signargs.core"
```

Unity pulls in the Input System, uGUI and Newtonsoft JSON itself. If the Input System asks to
restart the editor and switch the input handling, say yes: the signature pad reads input events
directly and needs it.

## 2. Build the scene

On a screen-space canvas:

| Object | Components | Set in the inspector |
|---|---|---|
| `SignArgs` | `PdfWorker`, `PdfView`, `LocalFinalizer` | `PdfView`: **worker** the `PdfWorker`, **target** the `RawImage` below, **aspect** its `AspectRatioFitter`, **dpi** 150. `LocalFinalizer`: **worker** the same `PdfWorker`, **folder** a name under `persistentDataPath`, **image pixels per point** 4 |
| `Document/Page` | `RawImage`, `AspectRatioFitter` (fit in parent) | nothing |
| `Signature Pad` | `Image` (white), `AspectRatioFitter`, `SignaturePad` | `SignaturePad`: **ink** the `StrokeGraphic` below, **line width** 0.035, **ink colour** as you like |
| `Signature Pad/Ink` | `StrokeGraphic`, stretched over the pad | raycast target off |

The **Show a PDF** sample is the first two rows of that table as a scene: copy its `Document` object
into your own canvas if all you need is the viewer.

Give the pad the same aspect ratio as the signature box on the document, so the ink is not
squeezed when it is stamped. Add your own buttons for paging, clearing and confirming, and an
`EventSystem` with the Input System UI module so they work.

## 3. Write a template

A template says where the signatures go on a document type, what each signer agrees to, how sure
your application has to be of them, and in which order they sign. It is a record like any other:
keep it as a file next to the PDF, or build it in code. Areas are in thousandths of a PDF point,
with the origin at the bottom-left corner of the page.

```csharp
var template = new SignatureTemplate("handover-protocol", "Handover protocol", new[]
{
    new SignatureField("contractor", "Contractor", 2, FieldArea.FromPoints(56, 560, 240, 70),
        "I confirm that the installation was carried out as described and hand it over.",
        AssuranceLevel.Presence) { Order = 1 },
    new SignatureField("site-manager", "Site manager", 2, FieldArea.FromPoints(56, 400, 240, 70),
        "I confirm that I inspected the installation shown and accept it.",
        AssuranceLevel.Presence) { Order = 2 },
});

var stored = RecordJson.Write(template);   // or File.ReadAllBytes / a TextAsset
```

If the PDF already declares signature widgets, read them instead of typing coordinates; you still
state the consent sentence and the minimum level yourself, because no default is right for those:

```csharp
var declared = await view.GetFormFieldsAsync(2);
var boxes = declared.Where(field => field.Kind == PdfFormFieldKind.Signature);
var fields = boxes.Select(box => new SignatureField(
    box.Name, box.Name, box.PageIndex,
    FieldArea.FromPoints(box.Area.X, box.Area.Y, box.Area.Width, box.Area.Height),
    "I confirm …", AssuranceLevel.Presence));
```

Set `DocumentSha256` on the template to bind it to exactly one document; leave it out to reuse the
template for every document of that type. A session refuses a bound template with other bytes.

## 4. Start a session and add the signers

Starting checks everything before anyone sees the document: the template parses, every field fits
its page, and every text that will be printed on the audit page can be printed. That is why
starting can throw and confirming later cannot.

```csharp
using SignArgs.Core.Json;
using SignArgs.Core.Records;
using SignArgs.Signing.Session;
using SignArgs.Unity.Capture;
using SignArgs.Unity.Finalization;
using SignArgs.Unity.Rendering;

[SerializeField] private PdfView view;
[SerializeField] private SignaturePad pad;
[SerializeField] private LocalFinalizer finalizer;
[SerializeField] private TextAsset document;
[SerializeField] private TextAsset template;   // a .json renamed .json.bytes

private LocalSigningSession session;

private async Task StartSigning()
{
    session = await finalizer.StartAsync(document.bytes, "Handover protocol, pump station 7", template.bytes);
    session.AddEvidence("checklist", "text/plain", Encoding.UTF8.GetBytes("Checks 1 to 5 carried out."));
    await view.OpenAsync(document.bytes);
}

private async Task AddSigner(string name, string fieldId)
{
    // an opaque reference, never a name or an email address, then the name, contact and how sure you are
    var signer = new SignerDetails("signer-1", name, string.Empty, AssuranceLevel.Presence, new[] { fieldId });
    await finalizer.AddSignerAsync(session, signer);
}
```

Add each person when they arrive: the chain records when that happened. A signer is refused if a
field is already taken, if their assurance level is below what the field demands, or if the audit
page cannot print their name. Check the name while it is typed, so nobody is refused after signing:

```csharp
nameInput.onValueChanged.AddListener(text =>
    startButton.interactable = AuditText.IsPrintable(text, finalizer.AuditFont));
```

`AddEvidence` binds whatever your application knows: a screenshot, a model version, which checklist
items were ticked. Pass a field id to bind it to one signature, or nothing to bind it to every
signature confirmed afterwards. It is stored as your application reported it, and the audit page
says so; SignArgs proves it has not changed since, not that it is true.

`session.State(fieldId)` says what a field is waiting for: `Unassigned`, `Blocked` by the signing
order, `Ready`, or `Confirmed`.
## 5. Let each signer read, sign and confirm

Paging is `view.NextPage()`, `view.PreviousPage()` or `view.ShowPageAsync(index)`. Enable the pad
only once the signer has seen the page the signature goes on; `view.PageShown` tells you when that
happened, and confirming refuses a capture whose pages never included it. Confirming records the
signature and its evidence; nothing is written into the PDF until FinalizeAsync stamps every
confirmed signature at once, so the sample draws each taken signature over the page as its own UI
and the page hashes in the records stay hashes of what the engine rendered. The sample keeps the pad
locked until then and offers a "Show page 3" button; whether a signer may jump there or must page
through is your application's rule, the plugin only records which pages were seen.

Confirm has to be a deliberate act of the signer: a button they press, or a button they hold. Never
confirm when the pen lifts.

```csharp
private async Task Confirm(string fieldId)
{
    await finalizer.ConfirmAsync(session, fieldId, pad, view);   // writes that field's signature record
    pad.Clear();

    if (session.Template.Fields.Any(field => session.State(field.Id) != FieldState.Confirmed)) return;

    var result = await finalizer.FinalizeAsync(session);         // stamps, hashes, writes the bundle
    Debug.Log($"signed {result.DocumentSha256.Hex} in {result.Folder}");
    await view.OpenAsync(File.ReadAllBytes(result.DocumentPath));
}
```

If somebody cannot sign after all, `finalizer.FinalizePartialAsync(session)` finalizes what is
signed: the manifest marks the version partial and the audit page names the fields left open. Without
it the signatures already given would be lost. The open fields can be signed later, on this device or
another, in a version that continues it; see
[Finalizing](guides/finalizing.md#continue-on-another-device).

`ConfirmAsync` takes the strokes, draws them into an image the size of that field, and binds them
together with the pages rendered and shown, the document's hash, the template and the evidence. It
refuses a field whose turn has not come, naming the field the order puts first. `FinalizeAsync`
stamps that image into a fresh copy of the original bytes, appends the audit page, saves, hashes
and writes the bundle. Either returns a bundle or throws, and a failed finalize can be run again.

## 6. What you get

`result.Folder` is one folder per session under `persistentDataPath`:

| File | What it is |
|---|---|
| `document.pdf` | The signed document: signature stamped, audit page appended. |
| `original.pdf` | The document exactly as the signer saw it. |
| `template.json` | The template that placed the fields, byte for byte as you passed it. |
| `signatures/<id>.json` | One per signature: document hash, consent text, pages seen with their pixel hashes, hashes of the strokes, the image and the evidence, and the template's hash. |
| `signatures/<id>.strokes.json` | Every input event of that signature: position, time, and pressure where the device reports it. |
| `signatures/<id>.png` | The image that was stamped in that field. |
| `evidence/…json`, `evidence/…data` | One record and one file per evidence item. |
| `audit.jsonl` | The audit chain, one entry per line: session created, evidence added, signature confirmed, document finalized. Each entry carries the hash of the one before it. |
| `manifest.json` | Every file above with its SHA-256, plus the hash of the signed document and the head of the audit chain. |

Signers' names and contact details are **not** in any of these. Each person has one file at
`identities/<session>-<signer>.json` next to the bundle, holding the random salt behind their
identity commitment. Delete one and the records still verify, and the other signers' commitments
still match theirs; the bundle simply no longer says who that signer was.

To check a bundle later, without SignArgs: hash `document.pdf` and compare it with
`documentSha256` in the manifest, hash every listed file, then walk `audit.jsonl` and check that
each entry's `previousSha256` is the SHA-256 of the previous line and that the last line hashes to
`auditHeadSha256`.

## Rules worth knowing

- **Text on the audit page** has to be drawn by the audit font and laid out without shaping.
  The font that ships with the package is Roboto, covering Latin, Latin Extended, Greek and
  Cyrillic; set `LocalFinalizer`'s **audit font** to a static TrueType file of your own (imported as
  a TextAsset, so name it `.ttf.bytes`) to sign for people whose names it does not draw. Right-to-
  left, Indic and combining scripts are refused whatever the font covers, because a PDF text object
  draws glyphs in order without joining or reordering them. Anything refused is refused, never
  transliterated or replaced with a box, and the rule applies to the document title, the field
  label, the signer's name, the consent sentence, the evidence kinds and your application's name
  and version. `AuditTextException.Problem` says which of the two limits was hit.
- **A font is embedded whole in every document it writes.** Roboto adds about 200 KB to a finalized PDF
  (306 KB of font, compressed in the file). If you pass a large font, such as one covering CJK, subset it first, or every signed document
  and both PDFs in every bundle carry all of it.
- **Do not call the PDF engine yourself on the main thread.** Everything here runs on the
  `PdfWorker` thread. A `LocalSigningSession` has one caller at a time.
- **The signature pad switches off the Input System's merging of redundant events** for the rest of
  the run, because merging drops touch and mouse moves before any listener sees them. In the editor
  that setting is written to your project's input settings asset, so it stays off after play mode.
- **Times are device times.** The audit page says so. A trusted timestamp needs a server.
- **Pen pressure** is drawn as line width; touch "pressure" on a phone is contact size, so it is
  recorded but does not change the line.
