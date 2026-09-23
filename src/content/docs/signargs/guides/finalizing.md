# Finalizing

Finalizing turns confirmed signatures into a document people can pass around: every signature
stamped in its box, an audit page appended that says what was signed, by whom and how to check it,
and the file hashed. Next to it the bundle is written, with everything a reviewer needs to verify the
document without SignArgs.

## Finalize

```csharp
LocalSigningResult result = await finalizer.FinalizeAsync(session);

Debug.Log($"signed {result.DocumentSha256.Hex} in {result.Folder}");
await view.OpenAsync(File.ReadAllBytes(result.DocumentPath));
```

`FinalizeAsync` needs every field confirmed. It stamps each signature image into a fresh copy of the
original bytes, appends the [audit page](audit-page.md), saves, hashes the result, closes the audit
chain with `document.finalized`, and writes the bundle under **Folder**.

| `LocalSigningResult` | What it is |
|---|---|
| `Folder` | The bundle folder: `<persistentDataPath>/<Folder>/<session id>`. |
| `DocumentPath` | The signed PDF inside it. |
| `DocumentSha256` | SHA-256 of the signed PDF. `.Hex` is the form `sha256sum` prints. |
| `IsPartial` | True for a partial finalize. |
| `IdentityPaths` | One identity file per signer, outside the bundle folder. |
| `Bundle` | The bundle in memory: manifest, files, identities. |

## When someone cannot sign

If a signer leaves or refuses, finalize what is signed:

```csharp
LocalSigningResult result = await finalizer.FinalizePartialAsync(session);
```

It needs at least one confirmed field. The manifest marks the version `partial`, the chain gets one
`field.unsigned` entry per open field, nothing is stamped in those fields, and the audit page names
them. Without it, the signatures already given on the device would be lost. Signing the remaining
fields in a later version is not part of this release; see [Limitations](../limitations.md).

## Failures and retries

A finalize either returns a complete bundle or throws and leaves the session as it was, so it can be
run again:

| Exception | Cause |
|---|---|
| `InvalidOperationException` | A field is unconfirmed (use the partial finalize), no field is confirmed (partial), or the session is already finalized. |
| `PdfException` | The engine failed to stamp, lay out or save. The session can be finalized again. |
| `IOException` | Writing the bundle failed, for example because the storage is full. |

A bundle folder appears complete or not at all, and is never overwritten. The identity files are
written last.

## After finalizing

The session is closed: it takes no more signers, evidence or confirmations. Another round of
signatures on the signed document is a new session on `File.ReadAllBytes(result.DocumentPath)`.

What to do with the bundle is your application's decision: keep it on the device, upload it, or
share it. Every file is listed on [The signed bundle](../signed-bundle.md).

## Timing

On the reference phone, finalizing the three-signer handover protocol took about 200 ms, and
stamping, laying out the audit page, saving and hashing a 100-page document about 55 ms. The audit
font costs about 200 KB per signed document; see [The audit page and fonts](audit-page.md#size).
