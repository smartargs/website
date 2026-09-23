# Limitations

What this version does not do, so you can decide before you build on it.

## Viewing

- `PdfView` is a page renderer, not a reader: no text selection, search, zoom or pan gesture,
  thumbnails, links, outlines or annotation editing. Form field values are drawn but cannot be
  edited. Zoom and scroll are yours to add around the `RawImage`.

## Signing

- Everything runs on one device. There is no server, so a session cannot be handed to a second
  device or to a signer who is somewhere else. Several people sign one document by passing the same
  device around.
- A partial version cannot yet be continued: the fields left open are named on the audit page, but
  signing them later in a version that continues the chain is not in this release.
- Nothing turns a form field the PDF declares into a template field automatically; you write that
  step, see [Templates and form fields](guides/templates.md#take-the-boxes-from-the-pdf).
- Only assurance levels 0 (presence) and 3 (your application authenticated the signer) can be
  honestly claimed on the device. At level 3 the identity is recorded as reported by your
  application; no signed identity claim is recorded yet.

## Legal standing

- Nothing here creates an advanced or qualified electronic signature. There is no certificate, no
  cryptographic signature over the PDF, and no trusted timestamp. What Core gives you is evidence:
  a signature bound to the pages rendered and shown, a hash-linked record that becomes
  tamper-evident once its head is stored where the bundle holder cannot change it, and a document
  that explains itself.
- Times are device times. The audit page says so.

## Text on the audit page

- The packaged font covers Latin, Latin Extended, Greek and Cyrillic. Other names need your own
  font, see [The audit page and fonts](guides/audit-page.md#your-own-font).
- Only scripts that need no shaping are laid out. Right-to-left and Indic scripts, Thai, combining
  marks, emoji and characters above U+FFFF are refused whatever the font covers; the full list is in
  [The audit page and fonts](guides/audit-page.md#what-can-be-printed).
- A font is embedded whole; subset a large one yourself.

## Input

- Touch, pen and mouse. XR controllers and hand tracking are not in this package.
- Enabling a signature pad turns off the Input System's merging of redundant events for the rest of
  the run, and in the editor for the project. See
  [Capturing signatures](guides/capturing-signatures.md#one-thing-the-pad-changes-in-your-project).

## Platforms

- iOS is a preview and macOS has not been run. See [Platforms](platforms.md).
