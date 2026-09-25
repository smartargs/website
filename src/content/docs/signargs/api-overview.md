# API overview

Every public type of SignArgs for Unity and the packages it shares with the server side. Members carry
XML documentation, so the editor shows the same contracts; this page is the map.

## Unity components, `SignArgs.Unity.*`

| Type | Namespace | What it is |
|---|---|---|
| `PdfWorker` | `Rendering` | The one background thread the PDF engine runs on. Add one per scene and reference it from the components below. |
| `PdfView` | `Rendering` | Shows a document on a `RawImage`. `OpenAsync`, `ShowPageAsync`, `NextPage`, `PreviousPage`, `Close`; `PageCount`, `PageIndex`, `IsOpen`, the `PageShown` event, `GetFormFieldsAsync` for the fields a page declares, and `Rendering`: how the pages were drawn and every page shown with its pixel hash. |
| `SignaturePad` | `Capture` | Captures strokes on a UI rectangle. `Strokes` is the record of every input event, `ExportAsync` draws it into the image to stamp, `Clear` starts over; `HasInk`, `IsDrawing`, the `InkChanged` event. |
| `StrokeGraphic` | `Capture` | The mesh that draws the ink; a pad references one. Its `color` and the pad's ink colour are the same. |
| `LocalFinalizer` | `Finalization` | Signing on the device: `StartAsync` (document, title, template bytes), `AddSignerAsync`, `ConfirmAsync(session, fieldId, pad, view)`, `FinalizeAsync`, `FinalizePartialAsync`; to continue on another device, `VerifyAsync(folder)`, `ExportAsync(bundle, identities, path)`, `ReceiveAsync(path)` and `ContinueAsync(bundle, title, identities)`, which refuses a version already continued on this device; `OutputRoot`, `AuditFont` (the packaged Roboto, or a TextAsset of your own), and `CurrentApplication`, which is what evidence provenance records about your application and the device. |
| `LocalSigningResult` | `Finalization` | What finalizing returned: `Bundle`, `Folder`, `DocumentPath`, `DocumentSha256`, `IsPartial`, and `IdentityPaths`, one per signer. |

## Sessions, `SignArgs.Signing.Session`

| Type | What it is |
|---|---|
| `LocalSigningSession` | The signers of one document on one device, no server: `Start`, `Continue`, `AddSigner`, `AddEvidence`, `Confirm(fieldId, capture)`, `Finalize`, `FinalizePartial`; `Template`, `TemplateSha256`, `Field(id)`, `State(id)`, `Signature(id)`, `CarriedSignatures`, `CarriedSigners`, `PreviousSessionId`, `Signers`, `Identities`, `SessionId`, `DocumentSha256`, `PageCount`, `AuditEntries`, `IsFinalized`. `LocalFinalizer` drives it on the worker thread; use it directly only off the main thread. |
| `SigningRequest` | What is to be signed: document bytes, title, the template's stored bytes, the application, and `AuditFont`, the font the audit page is drawn in. |
| `ContinueRequest` | What continuing a verified partial version needs: the `VerifiedBundle`, the title, the application, `AuditFont`, and optional `Identities` of earlier signers. The document and template come from the bundle. A carried signer is named on the audit page only when their identity record is supplied and matches the chain; otherwise the page prints their reference and commitment. |
| `CarriedSigner` | One signer of a carried signature: `SignerRef`, `IdentityCommitment`, and `Name`, null when your application supplied no matching identity record. The audit page then prints the reference and commitment; a policy that needs every name refuses in your code before finalizing. |
| `FieldState` | What a field waits for: `Unassigned`, `Blocked` by the signing order, `Ready`, `Confirmed`. |
| `SignerDetails` | `SignerRef` (opaque, 1 to 64 of `A-Z a-z 0-9 . _ -`), `Name`, `Contact`, `Assurance`, and `FieldIds`, the fields this person signs. |
| `SigningApplication` | Application, its version, the plugin and version, and the device model. |
| `SignatureCapture` | What the surface captured: `Strokes`, `Image`, `Rendering`. |
| `SignatureImage` | The image in the two forms finalizing needs: `Rgba` to stamp, `Png` for the bundle, and its size. |
| `AuditText` | `IsPrintable(text, font)` and `Check(what, text, font)`: can the audit page print this text in that font? Call it where text is entered. |
| `AuditTextException`, `AuditTextProblem` | Thrown for text that cannot: `What`, `Text`, `Position`, and `Problem`, which says whether the font does not draw the character or the page cannot lay out its script. |

## Bundles, `SignArgs.Signing.Bundles`

| Type | What it is |
|---|---|
| `SignedBundle` | A finalized session in memory: `Manifest`, `ManifestJson`, `Files`, `Read(path)`, `DocumentSha256`, `IsPartial`, and `Identities`, one record per signer, which are personal data kept apart from the rest. |
| `BundleEntry` | One file: `Path`, `MediaType`, `Content`. |
| `BundleLayout` | The names inside a bundle: `Document`, `OriginalDocument`, `Template`, `AuditChain`, `Manifest`, and per identifier `SignatureRecord(id)`, `Strokes(id)`, `SignatureImage(id)`, `EvidenceRecord(id)`, `EvidenceContent(id)`. |
| `BundleVerifier` | Checks a bundle folder before anything in it is shown: `Verify(folder)` returns a `BundleVerification` with `IsIntact`, the first `Problem` and a `Detail` sentence, and on success a `VerifiedBundle` holding the bytes that were checked. It checks every listed file and hash, the chain against the manifest's head, the documents and template the chain pins, each signature and evidence record against its files, and that every field is signed or left open exactly once. A continued version is checked with every earlier version it carries: each continues a partial version on the same document and template, carries exactly the signatures that version holds, no field is signed twice and a signer reference keeps one commitment. `VerifiedBundle.Lineage` lists the versions, oldest first. `Compare(first, second)` says whether two verified bundles are the same, one continues the other, they fork from a common version, conflict, or are unrelated. |
| `BundleDirectory` | Writes a bundle: `Write(bundle, root)`, `IdentityPath(bundle, identity, root)`, and `IsContinued(root, sessionId)`, true when a bundle folder under `root`, named by its session id, already continues that version; `Write` refuses a second continuation. A bundle folder appears complete or not at all and is never overwritten; the identity files are written last and outside it. |
| `BundleArchive` | The `.signargs` container for handing a bundle to another device: `Write(verifiedBundle, identities, path or stream)` writes the manifest, the listed files and the identity records you choose; `Read(path or stream, root)` accepts only those entries, verifies the bundle and only then writes it to `root/<session id>`. Throws `InvalidDataException` for an archive it did not write. |
| `ReceivedBundle` | What `BundleArchive.Read` returns: the `Verification`, the `Folder` written, null when verification failed, and the `Identities` the sender included, each checked against its commitment and not written to disk. |

## Records, `SignArgs.Core.*`

The formats the plugin and the server both write, as canonical JSON: UTF-8, fixed property order,
integers only, times to the millisecond with the device's offset. The same record always produces
the same bytes, so its SHA-256 identifies it.

| Type | Namespace | What it is |
|---|---|---|
| `SignatureRecord` | `Records` | The confirmed signature and everything it binds, with `RenderingParameters` and `RenderedPage` for what was on screen, and `TemplateSha256`, the template that placed its field. |
| `SignatureTemplate`, `SignatureField`, `FieldArea` | `Records` | Where a document type's signatures go: per field an id, a label, a page, a rectangle in thousandths of a point, the consent sentence, the minimum assurance level and the signing order. Optionally bound to one document by hash. |
| `StrokeRecord` | `Records` | `StrokeSurface`, `Stroke` and `StrokePoint`: every event in millionths of the surface, microseconds from the first point, pressure where there is any. |
| `EvidenceItem` | `Records` | Context bound to a signature, with `EvidenceProvenance`: which application, version, device and device time supplied it. |
| `BundleManifest`, `BundleFile` | `Records` | The bundle's table of contents, the audit head it was written under, `Partial` when fields were left unsigned, and `PreviousSessionId` with `PreviousAuditHeadSha256` for a version that continues a partial one. |
| `AssuranceLevel` | `Records` | 0 presence, 1 unique link, 2 one-time code, 3 host-application identity, 4 provider check. A local session takes 0 or 3. |
| `AuditEntry`, `AuditEvent`, `AuditEventKinds` | `Audit` | One link of the chain: session, sequence, hash of the previous entry, and the event with both clocks, its `FieldId`, and kinds `session.created`, `signer.added`, `evidence.added`, `signature.confirmed`, `field.unsigned`, `document.finalized`, and for a continued version `version.continued` and `signature.carried`. |
| `AuditChain`, `AuditChainVerifier` | `Audit` | Appending, and checking a chain from its stored bytes alone. Verifying hashes the bytes as stored, so entries from a newer version still verify. |
| `IdentityRecord`, `IdentityCommitment` | `Identity` | Who a signer reference stands for, and the salted commitment in the chain. Erasing the record breaks no hash. |
| `Sha256Digest` | `Hashing` | A digest as 64 lowercase hexadecimal characters, the form `sha256sum` prints. |
| `RecordJson` | `Json` | Reads and writes every record above. `RecordFormatException` says what broke the format's rules. |
| `SchemaVersion` | | The schema major version every record carries. |

## The PDF engine, `SignArgs.Pdfium`

Use it directly for documents outside a signing session; remember that every call takes one
process-wide lock and belongs off the main thread.

| Type | What it is |
|---|---|
| `PdfDocument` | `Open`, `PageCount`, `GetPageSize`, `GetFormFields`, `GetRenderSize`, `RenderPage` (into a `byte[]` or unmanaged memory, never allocating pixels), `StampImage`, `AppendTextPages`, `Save`. |
| `PdfRenderOptions`, `PdfRowOrder` | Resolution or pixel size, row order, annotations, form fields, background. Output is RGBA32. |
| `PdfPageSize`, `PdfPixelSize`, `PdfRect` | Sizes in points and pixels, and a rectangle on a page. |
| `PdfFormField`, `PdfFormFieldKind` | A form field the document declares: name, kind (a signature field among them), page, rectangle in points, and whether it is read-only. |
| `PdfParagraph`, `PdfTextSize`, `PdfTextPageOptions` | Text for appended pages, wrapped to the margins in two sizes; the options carry the font, which is required and is embedded in the document. |
| `PdfFont`, `PdfFontException` | A font read from a static TrueType file: `Load`, `Covers(codePoint)`, `Covers(text)`, `CoveredCodePointCount`. Variable fonts, CFF-flavoured OpenType and collections are refused, and the whole file is embedded in every document. |
| `PdfEngine` | The engine's name and exact build, as a signature record states them. |
| `PdfException` and friends | `PdfLoadException` with a `PdfError` and the engine's own code, `PdfPageException`, `PdfEditException`, `PdfSaveException`. |
