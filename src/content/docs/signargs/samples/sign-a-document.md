# Sign a document

Three people sign a handover protocol in turn on one device: the contractor, the site manager and the
owner. A template places their fields on page 3 in that order, each signer sees their own consent
sentence, and the signature pad unlocks only while page 3 is on screen, because a signature is bound
to the pages rendered and shown. Finalizing stamps the three signatures, appends an audit page and writes the
bundle under `Application.persistentDataPath/SignArgs`.

The scene is guided: the line at the top of the card always says what to do next.

![The Sign a document sample before the first signer starts](../images/samples/sign-a-document-start.png)

## Walk through it

1. Press Play. The protocol opens on page 1. The step line reads **Signature 1 of 3 · Contractor**.
2. Type a name in the **Name** field (the sample suggests one) and press **Sign as Contractor**. The
   session starts here: the template is checked, the checklist evidence is bound, and the contractor
   is added as the first signer.
3. The pad is locked and says why. Page through to page 3 with **Next ›**, or press **Show page 3**.
   The pad unlocks and the contractor's box on the page is outlined.
4. Read the consent sentence under the name, sign inside the white box, and press
   **Confirm signature**. The signature is drawn over its box by the sample; it is stamped into the
   file only when signing finishes.
5. Repeat for the site manager and the owner. After the third confirmation the document is finalized
   and reopened from the signed file on page 3; the audit pages follow it, pages 4 and 5 for three
   signers.

| Step 3: the pad is locked | Step 4: signing | Step 5: signed |
|---|---|---|
| ![The pad locked until page 3 is on screen](../images/samples/sign-a-document-locked.png) | ![The contractor's box outlined on page 3 and a signature on the pad](../images/samples/sign-a-document-signing.png) | ![All three signatures stamped on page 3 of the signed document](../images/samples/sign-a-document-signed.png) |

**Finish partly** finalizes with the signatures taken so far. The manifest marks the version partial
and the audit page names the fields left open.

**Start over** begins a new session on the original document.

## Look at the result

In the editor and on desktop players, **Open bundle folder** opens the folder. On Android, pull it:

```
adb shell run-as <your.bundle.id> ls files/SignArgs
adb exec-out run-as <your.bundle.id> tar c -C files SignArgs > signargs.tar
```

Each session is one folder named after its session id, and each signer has one identity file in
`identities/` beside those folders. The files are listed on [The signed bundle](../signed-bundle.md).

## What is in the scene

| Object | Components | What it does |
|---|---|---|
| `Canvas/Column/Document/Page` | `RawImage`, `AspectRatioFitter` | The page. A `Field` outline on it marks the box the current signer fills. |
| `Canvas/Column/Card` | `Image` | The signing card: step line, instruction, name field, consent sentence, pad and buttons. |
| `Card/Pad Area/Signature Pad` | `Image` (white), `AspectRatioFitter`, `SignaturePad` | The pad. Its aspect ratio matches the signature box on the page, so the ink is not squeezed when it is stamped. |
| `Signature Pad/Ink` | `StrokeGraphic` | Draws the ink. Raycast target off. |
| `Signature Pad/Lock` | `Image`, `Text`, `Button` | Covers the pad until the field's page is on screen, with a **Show page 3** button. |
| `SignArgs` | `PdfWorker`, `PdfView`, `LocalFinalizer`, `SignDocumentSample` | The worker thread, the view (**dpi** 150), the finalizer (**folder** `SignArgs`, **image pixels per point** 4) and the sample script. |

The sample script's **Document** is `handover-protocol.pdf.bytes`, its **Template** is
`handover-protocol.template.json.bytes`, and its **Title** is `Handover protocol, pump station 7`.

## The template

```json
{
  "schema": 1,
  "type": "template",
  "templateId": "handover-protocol",
  "name": "Handover protocol",
  "fields": [
    {
      "id": "contractor",
      "label": "Contractor",
      "pageIndex": 2,
      "area": { "x": 56000, "y": 560000, "width": 240000, "height": 70000 },
      "consentText": "I confirm that the installation was carried out as described and hand it over.",
      "minimumAssurance": 0,
      "order": 1
    },
    { "id": "site-manager", "label": "Site manager", "...": "order 2, 160 points lower" },
    { "id": "owner", "label": "Owner", "...": "order 3, 160 points lower again" }
  ]
}
```

Areas are in thousandths of a PDF point from the bottom-left corner: the contractor's box is 240 by
70 points, 56 points from the left edge. See [Templates and form fields](../guides/templates.md).

## How the script drives it

`SignDocumentSample` is split in two files: `SignDocumentSample.cs` is the signing flow, and
`SignDocumentSample.Interface.cs` updates the card's texts and buttons, draws the taken signatures
over the page and opens the bundle folder. The flow is the
[quick start](../quick-start.md) with three signers:

```csharp
_session = await finalizer.StartAsync(document.bytes, title, template.bytes);
_session.AddEvidence("checklist", "text/plain", Encoding.UTF8.GetBytes("Checks 1 to 5 on page 2 carried out."));

var signer = new SignerDetails("signer-" + ++_signers, signerName.text, string.Empty,
    AssuranceLevel.Presence, new[] { _field.Id });
await finalizer.AddSignerAsync(_session, signer);

// once the field's page is on screen and the signer has pressed Confirm
await finalizer.ConfirmAsync(_session, _field.Id, pad, view);

// after the last field, or when Finish partly is pressed
var result = partial ? await finalizer.FinalizePartialAsync(_session) : await finalizer.FinalizeAsync(_session);
await view.OpenAsync(File.ReadAllBytes(result.DocumentPath));
```

The pad stays disabled until `PageShown` reports the field's page; confirming would refuse a capture
whose shown pages do not include it anyway, but a pad that refuses after the signer has signed is a
worse experience than a locked one.

The script logs each step with its timing under `[Sample]` in the console, which is the quickest way
to see how long opening, confirming and finalizing take on your device.
