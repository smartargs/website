# SignArgs Core

SignArgs Core is a Unity 6 package that shows a PDF, captures a handwritten signature and finalizes
the signed document on the device: the signature stamped where it belongs, an audit page appended,
the file hashed, and a bundle of records written that anyone can check later. It needs no server, no
account for the signer and no network.

A signature is only worth something if it is bound to the pages rendered and shown. Core records the exact
bytes of the document, a hash of every page as it was drawn on screen, every input event of the
stroke with the time the device reported for it, and whatever context your application binds to the
signature, in one chained set of records.

## What ships

| Feature | What you get |
|---|---|
| Showing documents | `PdfView` draws pages on a `RawImage` with form field values filled in, renders off the main thread, and hashes every page it shows. |
| Form fields | Reads the fields a PDF declares on a page, signature boxes among them, so you place signatures where the document says. |
| Signature capture | `SignaturePad` records touch, pen or mouse at event rate, with the device's timestamp and pen pressure, and draws the ink as a mesh. |
| Templates | A small record that says where each signature goes, what each signer agrees to, how sure you must be of them, and in which order they sign. |
| Several signers | One document, several fields, several people signing in turn on one device, each with their own consent sentence. |
| Evidence | Bind your application's context (a checklist, a screenshot, a model version) to one signature or to all of them. |
| Finalizing | Stamps every signature, appends an audit page, saves, hashes and writes the bundle. A partial finalize keeps signatures already given when someone cannot sign. |
| Signed bundle | The signed PDF, the original, one record per signature, the strokes, the audit chain and a manifest of SHA-256 hashes. Verifiable without SignArgs. |
| Pseudonymous records | Names and contact details are kept out of the records, in one deletable file per signer. Deleting one breaks no hash. The signed PDF's audit page still prints the names. |
| PDF engine | PDFium, pinned, with our own bindings, safe under IL2CPP and managed stripping "High". Usable directly for documents outside a session. |

## Where to start

1. [Samples](samples/index.md): import **Sign a document** and press Play. Three people sign a
   handover protocol in turn; the scene tells you what to press.
2. [Quick start](quick-start.md) builds the same thing from an empty scene in about half an hour.
3. [Concepts](concepts.md) explains the handful of ideas every other page relies on. Read it once.
4. [Guides](guides/index.md) have one page per feature, with the setup and the calls.
5. [The signed bundle](signed-bundle.md) lists every file you get and shows how to verify one.
6. [Platforms](platforms.md) says what has been run where, and what has not.
7. [Limitations](limitations.md) lists what this version does not do.
8. [API overview](api-overview.md) is the map of every public type.

## Requirements

- Unity 6 LTS (6000.0) or newer. Developed and tested on 6000.3.
- Input System, uGUI and Newtonsoft JSON, pulled in as dependencies. The signature pad reads Input
  System events directly, so the project's active input handling must include the Input System.
- IL2CPP or Mono. IL2CPP with managed stripping "High" is tested from the first build; the package
  brings its own `link.xml` and feeds it to the linker.
- A target the package ships the PDF engine for: Android arm64, Windows x64, macOS (Apple silicon and
  Intel), and iOS 17 or newer as a preview. See [Platforms](platforms.md).
