# Using the PDF engine directly

The components cover signing. For anything else you want to do with a PDF, such as rendering a
thumbnail, stamping an image outside a signing session or appending a page of text, the engine
underneath is public: `SignArgs.Pdfium.PdfDocument`, a thin layer over PDFium.

Do not use it to change a document that is being signed: a session stamps and hashes its document
itself, exactly once.

## Rules

- **Stay off the main thread.** Every call takes one process-wide lock, because PDFium is not
  thread-safe. A render can take tens of milliseconds, which is a dropped frame.
- **Dispose what you open.** A `PdfDocument` holds native memory. `Dispose` frees it; the finalizer
  is only a safety net, and leaks show up as crashes on headsets a few documents later.
- **Keep your own bytes.** `Open` copies the bytes it needs to keep, so you may reuse your array.

## Render a page

```csharp
using SignArgs.Pdfium;

var pixels = await Task.Run(() =>
{
    using var document = PdfDocument.Open(bytes);
    var options = new PdfRenderOptions { Dpi = 96, RowOrder = PdfRowOrder.BottomUp };
    var size = document.GetRenderSize(0, options);
    var buffer = new byte[size.Width * size.Height * 4];
    document.RenderPage(0, options, buffer);
    return (buffer, size);
});

var texture = new Texture2D(pixels.size.Width, pixels.size.Height, TextureFormat.RGBA32, false);
texture.SetPixelData(pixels.buffer, 0);
texture.Apply();
```

Output is RGBA32. `PdfRowOrder.BottomUp` matches Unity's texture layout. `PdfRenderOptions` also
takes an exact `Width` and `Height` in place of `Dpi`, and switches for `Annotations`, `FormFields`
and the `Background` colour. A second `RenderPage` overload writes into unmanaged memory with a
stride, for reusing one buffer across pages; the engine never allocates the pixels itself.

## Read the document

| Call | Returns |
|---|---|
| `PageCount` | Number of pages. |
| `GetPageSize(page)` | Width and height in points. |
| `GetFormFields(page)` | The page's AcroForm fields: name, kind, rectangle in points, read-only. |

## Edit and save

```csharp
using var document = PdfDocument.Open(bytes);
document.StampImage(0, rgba, width, height, new PdfRect(56, 56, 120, 40));   // rows top-down, straight alpha

var font = PdfFont.Load(File.ReadAllBytes(fontPath));
document.AppendTextPages(new[]
{
    new PdfParagraph("Notes", PdfTextSize.Heading),
    new PdfParagraph("Inspected on site."),
}, new PdfTextPageOptions { Font = font });

byte[] saved = document.Save();
```

`AppendTextPages` wraps paragraphs to the margins and adds as many pages as it needs. It follows the
same text rules as [the audit page](audit-page.md#what-can-be-printed): characters the font does not
draw are refused, never replaced.

## Errors

| Exception | Cause |
|---|---|
| `PdfLoadException` | Opening failed; `Error` is `File`, `Format`, `Password`, `Security`, `Page`, `XfaForm` or `Unknown`, and `NativeErrorCode` is the engine's own code. |
| `PdfPageException` | A page could not be loaded. |
| `PdfEditException` | An edit failed; the document may be partly changed. |
| `PdfSaveException` | Saving failed. |
| `PdfFontException` | The font cannot be embedded. |

`PdfEngine` names the exact PDFium build, as signature records state it.
