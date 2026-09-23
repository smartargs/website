# Showing documents

The signer reads the document in your application, page by page, with the values already filled into
its form drawn as they are. Every page drawn is remembered with a hash of its pixels, so a reviewer
can later tell which pages were on screen before the signature was given.

See it running: [Show a PDF](../samples/show-a-pdf.md).

## Setup

1. Add **SignArgs → PDF Worker** to any object in the scene. One per scene is enough; every
   SignArgs component shares it.
2. Under a canvas, create a `RawImage` for the page and add an `AspectRatioFitter` set to
   **Fit In Parent**, so pages keep their proportions whatever their size.
3. Add **SignArgs → PDF View** and set:

| Field | Value |
|---|---|
| Worker | the `PdfWorker` |
| Target | the `RawImage` |
| Aspect | the `AspectRatioFitter` (optional) |
| Dpi | 150 for a phone held at reading distance; 36 to 300. A PDF point is `dpi / 72` pixels. |

## Runtime

```csharp
await view.OpenAsync(pdfBytes);            // opens and shows page 1; closes what was open
await view.OpenAsync(pdfBytes, password);  // for an encrypted PDF

view.NextPage();                           // for buttons; clamps at the ends, logs failures
view.PreviousPage();
await view.ShowPageAsync(2);               // zero-based; completes when the page is on screen

view.PageShown += index => label.text = $"Page {index + 1} of {view.PageCount}";

view.Close();                              // frees the document once a render in flight ends
```

`IsOpen`, `PageCount` and `PageIndex` (-1 before the first page shows) describe the current state.
Page requests are served in order, so pressing **Next** three times quickly shows three pages in turn.

Opening throws `PdfLoadException` when the bytes are not a PDF, the password is wrong, or the file
is encrypted in a way the engine does not support; its `Error` says which.

## What gets recorded

`view.Rendering` returns the resolution and render flags plus every page shown since the document
was opened, each with its pixel size and SHA-256 over its pixels. `LocalFinalizer.ConfirmAsync`
reads it for you and puts it into the signature record. Each distinct rendering of a page is recorded
once, in the order it was first shown; showing the same page again with the same pixels adds nothing.

## Form fields

`PdfView` draws the values of the document's AcroForm fields as part of the page. To read which
fields a page declares, for example to find where its signature boxes are:

```csharp
IReadOnlyList<PdfFormField> fields = await view.GetFormFieldsAsync(pageIndex);
foreach (var field in fields)
    Debug.Log($"{field.Name} {field.Kind} {field.Area.X},{field.Area.Y} {field.IsReadOnly}");
```

Areas are in PDF points, origin at the bottom-left of the page. Field values are drawn but not
editable: `PdfView` is a renderer, not a form editor. See [Templates and form fields](templates.md)
for turning signature boxes into signing fields.

## Performance

On the reference phone (a OnePlus Nord on Android 12, IL2CPP, stripping "High"), rendering the first
page of a 100-page document at 150 dpi took 42 to 101 ms depending on the build, a page turn
including texture upload about 12 ms, and the **Sign a document** sample shows its first page about
300 ms after Play, opening and hashing included. The pixel buffer and texture are reused between
pages of the same size. See [Platforms](../platforms.md) for the dated measurements.

## Limits

`PdfView` shows one page at a time. It has no text selection, search, zoom or pan gesture,
thumbnails, links, outlines or annotation editing. Put the `RawImage` inside a `ScrollRect` or your
own zoom control if you need them; a higher **dpi** keeps zoomed text sharp at the cost of memory.
