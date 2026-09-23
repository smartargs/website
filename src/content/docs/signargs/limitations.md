# Limitations

What this version of SignArgs for Unity does not do, so you can decide before you build on it. Where
a later SignArgs product is planned to cover a limit, the entry says so. Planned means not built
yet: nothing marked planned is available today, and plans can change.

## Viewing

- `PdfView` is a page renderer, not a reader: no text selection, search, zoom or pan gesture,
  thumbnails, links, outlines or annotation editing. Form field values are drawn but cannot be
  edited. Zoom and scroll are yours to add around the `RawImage`.

## Signing

- Everything runs on one device. There is no server, so a session cannot be handed to a signer who
  is somewhere else. Several people sign one document by passing the same device around.
  Planned: remote signers, delivery of the signed document and hosted storage, in SignArgs Cloud.
  Finishing a signature on a phone or in a browser through a companion page is planned as well; its
  product is not settled yet.
- A partial version cannot yet be continued: the fields left open are named on the audit page, but
  signing them later in a version that continues the chain is not in this release. Planned:
  continuing a partial version on another device, without a server, as a free update to this plugin.
  Two devices continuing the same version would each produce a valid bundle; telling the two apart
  needs both bundles, and preventing it is planned for SignArgs Cloud.
- Nothing turns a form field the PDF declares into a template field automatically; you write that
  step, see [Templates and form fields](guides/templates.md#take-the-boxes-from-the-pdf).
- Only assurance levels 0 (presence) and 3 (your application authenticated the signer) can be
  honestly claimed on the device. At level 3 the identity is recorded as reported by your
  application; no signed identity claim is recorded yet. Planned: levels 1 and 2 (a personal link, a
  one-time code) in SignArgs Cloud, and level 4 through identity and signing providers connected to
  SignArgs Cloud.
- Signing works without a network, and the bundle stays on the device: nothing uploads it when a
  connection returns. Planned: an offline queue in SignArgs Pro that uploads finalized bundles to a
  server later, with the upload recorded in the audit chain.

## Legal standing

- SignArgs for Unity produces simple electronic signatures. There is no certificate, no
  cryptographic signature over the PDF, and no trusted timestamp. What it gives you is evidence:
  a signature bound to the pages rendered and shown, a hash-linked record that becomes
  tamper-evident once its head is stored where the bundle holder cannot change it, and a document
  that explains itself.
- Times are device times. The audit page says so.
- Planned: a digital signature and a trusted timestamp applied by the server, in SignArgs Cloud, and
  advanced and qualified electronic signatures through connectors to signing providers. SignArgs Pro
  still produces simple electronic signatures.

## Stored handwriting

- The stroke record holds every point of the signature with its timing and, from a pen, its
  pressure, unencrypted inside the bundle. Treat bundles as personal data; see
  [The signed bundle](signed-bundle.md#personal-data). Planned: this data encrypted with keys you
  hold, in SignArgs Pro.

## Text on the audit page

- The packaged font covers Latin, Latin Extended, Greek and Cyrillic. Other names need your own
  font, see [The audit page and fonts](guides/audit-page.md#your-own-font).
- Only scripts that need no shaping are laid out. Right-to-left and Indic scripts, Thai, combining
  marks, emoji and characters above U+FFFF are refused whatever the font covers; the full list is in
  [The audit page and fonts](guides/audit-page.md#what-can-be-printed).
- A font is embedded whole; subset a large one yourself.

## Input

- Touch, pen and mouse. Planned: XR controllers and hand tracking, in SignArgs Pro.
- Enabling a signature pad turns off the Input System's merging of redundant events for the rest of
  the run, and in the editor for the project. See
  [Capturing signatures](guides/capturing-signatures.md#one-thing-the-pad-changes-in-your-project).

## Platforms

- iOS is a preview and macOS has not been run. See [Platforms](platforms.md).
