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
them. Without it, the signatures already given on the device would be lost.

## Continue on another device

A partial version can be finished elsewhere, without a server. The device that finalized it hands the
bundle over as one `.signargs` file:

```csharp
BundleVerification verification = await finalizer.VerifyAsync(result.Folder);
await finalizer.ExportAsync(verification.Bundle, identitiesToSend, archivePath);
```

`identitiesToSend` are the identity records the next device may print: the ones from
`result.Bundle.Identities`, and those your application received with the version it continued. Send
none and the next audit page prints the earlier signers by reference and identity commitment. Moving the
file is up to your application: a share sheet, a USB cable, your own backend.

The next device receives it, and continues it in a new session:

```csharp
ReceivedBundle received = await finalizer.ReceiveAsync(archivePath);
if (!received.Verification.IsIntact) { /* show received.Verification.Detail and stop */ }
LocalSigningSession session = await finalizer.ContinueAsync(received.Verification.Bundle, title, received.Identities);
foreach (CarriedSigner signer in session.CarriedSigners)
{
    if (signer.Name == null) { /* your policy: refuse, or accept a signer printed by reference */ }
}
```

`ReceiveAsync` accepts only an archive `BundleArchive` writes, verifies the bundle and every earlier
version in it before anything is shown, and writes it under `OutputRoot`. `ContinueAsync` starts from the
same original document and template, carries every confirmed signature unchanged and draws nothing: show
the carried signatures over the pages yourself if you want to, as the sample does. From here the session
works as usual: add the remaining signers, confirm, and finalize, completely or partially again. The
finalized document stamps every signature, carried ones included, and has one audit page that lists all
versions.

A signer from an earlier version can be added again only with their identity record, and keeps their
commitment. Signer assignments do not carry: add each remaining signer again for the fields still open.

`ContinueAsync` refuses a version that a bundle under `OutputRoot` already continues, and finalizing checks
again. That keeps one device from forking a version. Two devices that continue the same version each
produce a valid bundle; only both bundles, verified together with `BundleVerifier.Compare`, show the fork,
and only a server that owns the session prevents it. See [Limitations](../limitations.md).

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
