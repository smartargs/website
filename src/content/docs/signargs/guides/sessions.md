# Sessions and signers

A session is one document being signed under one template, on one device. People join it as they
arrive, each signs the fields assigned to them in the order the template sets, and each confirmation
is recorded the moment it is given. The reviewer later reads, in the audit chain, who joined when,
which field each person signed, and in what order.

See it running: [Sign a document](../samples/sign-a-document.md).

## Setup

Add **SignArgs → Local Finalizer** next to your `PdfWorker` and set:

| Field | Value |
|---|---|
| Worker | the `PdfWorker` |
| Folder | the folder under `Application.persistentDataPath` bundles are written to; `SignArgs` by default |
| Audit font | empty for the packaged Roboto, or your own font, see [The audit page and fonts](audit-page.md) |
| Image pixels per point | resolution of the stamped signature image; 4 by default, 1 to 8 |

## Start

```csharp
LocalSigningSession session = await finalizer.StartAsync(documentBytes, "Handover protocol, pump station 7", templateBytes);
```

The title is printed on the audit page. Starting checks everything before anyone sees the document,
which is why starting can throw and confirming later cannot for the same reasons:

| Exception | Cause |
|---|---|
| `RecordFormatException` | The template is not a valid template record. |
| `ArgumentException` | The template is bound to another document by `DocumentSha256`. |
| `ArgumentOutOfRangeException` | A field is on a page the document does not have, or its area does not fit on its page. |
| `AuditTextException` | A text printed on the audit page is empty or cannot be printed: the title, the template's name, a field label, a consent sentence, your application's identifier or version, or the package name or version. |

`AuditTextException` derives from `ArgumentException`, so catch it first.
| `PdfLoadException` | The document cannot be opened. |

`LocalFinalizer.CurrentApplication` is what the session records about your application and the device:
`Application.identifier` (or `Application.productName` on players Unity builds without an
identifier, such as Windows), `Application.version`, the package name and version, and
`SystemInfo.deviceModel`. The audit page prints the first two, as reported by the application.

## Add the signers

```csharp
var signer = new SignerDetails(
    "signer-1",                 // opaque reference: never a name or an email address
    "Anna Müller",              // printed on the audit page, kept out of the records
    string.Empty,               // email or phone, may be empty
    AssuranceLevel.Presence,    // how sure your application is of this person
    new[] { "contractor" });    // the fields they sign
IdentityRecord identity = await finalizer.AddSignerAsync(session, signer);
```

Add each person when they arrive: the chain records when that happened. `SignerRef` is 1 to 64 of
`A-Z a-z 0-9 . _ -` and must not identify the person; it is what the records use in place of their
name. A signer is refused with an `ArgumentException` when their reference is already in the session,
their list of fields is empty, a field is unknown or already taken, or their assurance level is below
a field's minimum, and with an `AuditTextException` when the
audit page cannot print their name.

Check names while they are typed, so nobody is refused after signing:

```csharp
nameInput.onValueChanged.AddListener(text =>
    startButton.interactable = AuditText.IsPrintable(text, finalizer.AuditFont));
```

## Field states

`session.State(fieldId)` says what a field is waiting for:

| State | Meaning |
|---|---|
| `Unassigned` | No signer has been added for it. |
| `Blocked` | Its signer is here, but a field earlier in the signing order is not confirmed. |
| `Ready` | It can be confirmed. |
| `Confirmed` | It is signed. |

`session.Template.Fields` lists the fields in template order, `session.Field(id)` returns one, and
`session.Signature(id)` returns its signature record once confirmed.

## Confirm

Enable the pad only once the field's page is on screen; `PdfView.PageShown` tells you when that
happened. Whether the signer must page through the whole document or may jump to the page is your
application's rule; the records state which pages were shown.

Confirming must be a deliberate act of the signer: a button they press or hold after reading the
consent sentence. Never confirm when the pen lifts.

```csharp
SignatureRecord record = await finalizer.ConfirmAsync(session, fieldId, pad, view);
pad.Clear();
```

`ConfirmAsync` takes the strokes from the pad, draws them into an image the size of the field at
**image pixels per point**, and records them together with the pages the view has shown, the
document's hash, the template's hash, the consent sentence and the evidence. The PDF is not changed
yet. It throws:

| Exception | Cause |
|---|---|
| `InvalidOperationException` | Nothing is drawn, no document is open in the view, the field has no signer, it is already confirmed, or the signing order puts another field first (the message names it). |
| `ArgumentException` | The field id is unknown, or the view never showed the field's page. |

Show the taken signatures over the page yourself until finalizing stamps them, as the sample does,
so page hashes stay hashes of what the engine rendered from the original.

## Threads

`LocalFinalizer` runs engine and session work on the `PdfWorker` thread and returns to the main
thread; `ConfirmAsync` draws the signature image on the thread pool first. The audit font is loaded
on the main thread the first time `AuditFont` is read. A session
has one caller at a time: await each call before making the next one on the same session, and call
`session.AddEvidence`, `State`, `Field` or `Signature` only while no `LocalFinalizer` call on that
session is in flight. Calling `LocalSigningSession.Start`, `AddSigner`, `Confirm` or `Finalize`
yourself is for code that already runs off the main thread.

Next: [Finalizing](finalizing.md).
