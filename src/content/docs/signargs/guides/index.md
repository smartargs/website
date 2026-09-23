# Guides

One page per feature. Each opens with what the feature does for the signer or the reviewer, then
the setup and the calls, then its limits.

| Guide | Covers |
|---|---|
| [Showing documents](showing-documents.md) | `PdfWorker`, `PdfView`: opening, paging, form field values, page hashes. |
| [Capturing signatures](capturing-signatures.md) | `SignaturePad`, `StrokeGraphic`: input devices, event-rate capture, pressure, the exported image. |
| [Templates and form fields](templates.md) | Where signatures go, consent sentences, assurance, signing order; reading fields from the PDF. |
| [Sessions and signers](sessions.md) | `LocalFinalizer.StartAsync`, adding signers, field states, confirming. |
| [Evidence](evidence.md) | Binding your application's context to a signature. |
| [Finalizing](finalizing.md) | Finalizing, partial finalize, retries, where the files go. |
| [The audit page and fonts](audit-page.md) | What the appended page shows, which scripts print, using your own font. |
| [Using the PDF engine directly](pdf-engine.md) | `PdfDocument` for rendering and editing outside a signing session. |

Every component is under **Add Component → SignArgs**. Every asynchronous call returns a `Task` that
completes on the main thread and throws the documented exception on failure, so `await` it inside a
`try` in an `async` method; an `async void` Unity event handler that lets an exception escape only
logs it.
