# Changelog

What changed in each release of SignArgs for Unity. Versions follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html): a new minor version adds features, a
patch version fixes things, and a new major version changes something you have to adapt to, which the
entry spells out. Record formats carry their own schema version; a change within a schema only adds
properties, so bundles written by an older version still verify.

## Unreleased

- Record format, additive within schema 1: the bundle manifest can name the partial version it continues
  (`previousSessionId`, `previousAuditHeadSha256`), and the audit chain has two new kinds,
  `version.continued` and `signature.carried`.
- `LocalSigningSession.Continue`: continues a verified partial version as a new session on the same
  original document and template, carries its signatures unchanged, restamps them all at finalize, and
  states the versions on the audit page. The earlier version's records travel in the bundle under
  `versions/`.
- `LocalFinalizer.VerifyAsync`, `ExportAsync`, `ReceiveAsync` and `ContinueAsync`: hand a partial version
  to another device and finish it there, on the worker thread. `ContinueAsync` refuses a version already
  continued on this device.
- The **Sign a document** sample: **Hand over** replaces **Finish partly** and also writes a `.signargs`
  file to `SignArgs Outbox`; **Open received** continues the newest file in `SignArgs Inbox` and draws the
  carried signatures. Signer references are now `signer-<field id>`.
- `Confirm` refuses a signature image whose PNG does not decode to exactly its pixels (8-bit RGBA or RGB,
  not interlaced), because a later version restamps the signature from the PNG.
- `BundleDirectory.IsContinued`, and `Write` refuses a second continuation of the same version on one
  device.
- `BundleVerifier`: checks a bundle folder and every earlier version it carries, every file, the chain, each
  signature and evidence record, the fields and the links between versions, and names the first check that
  failed; `Compare` tells two bundles of one document apart: same, continued, forked or conflicting.
- `BundleArchive` and `ReceivedBundle`: a verified bundle and the identity records you choose, in one
  `.signargs` zip for another device; reading accepts only what writing puts in, verifies, and writes the
  bundle only if it verifies.
- `BundleDirectory.IsContinued` counts only folders named by a session id.
- `LocalSigningSession.CarriedSigners`: the signers of carried signatures, and whether their name was
  supplied, so an application that needs every name can refuse before finalizing.

## 0.1.0

First release, not yet on the Asset Store.

- `PdfView` and `PdfWorker`: pages rendered off the main thread with form field values, every page
  shown recorded with its pixel hash, and the form fields each page declares.
- `SignaturePad` and `StrokeGraphic`: touch, pen and mouse captured at event rate with device
  timestamps and pressure, drawn as a mesh.
- Templates with per-field consent sentence, minimum assurance and signing order.
- `LocalFinalizer`: several signers and fields in one session on one device, evidence, confirm,
  finalize and partial finalize.
- The audit page, drawn in embedded Roboto, covering Latin, Latin Extended, Greek and Cyrillic; your own TrueType
  font for other scripts.
- Signed bundle with the audit chain, schema 1, and identity records kept outside it.
- PDFium 156.0.8066 for Android arm64, Windows x64 and macOS; iOS 17 and newer as a preview.
- Samples: **Show a PDF** and **Sign a document**.
