# Changelog

What changed in each release of SignArgs for Unity. Versions follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html): a new minor version adds features, a
patch version fixes things, and a new major version changes something you have to adapt to, which the
entry spells out. Record formats carry their own schema version; a change within a schema only adds
properties, so bundles written by an older version still verify.

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
