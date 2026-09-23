# The signed bundle

Every finalized session leaves one folder: the signed PDF for people to read, and the records that
let anyone check it later with nothing but a SHA-256 tool. This page is for the developer who stores
bundles, the reviewer who checks one, and the compliance team that asks what personal data is in it.

## Where it is

```
<Application.persistentDataPath>/<Folder>/
    <session id>/            one bundle per finalized session
    identities/              one file per signer, outside every bundle
```

**Folder** is the setting on `LocalFinalizer`, `SignArgs` by default. A bundle folder appears complete
or not at all and is never overwritten.

## What is in a bundle

| File | What it is |
|---|---|
| `document.pdf` | The signed document: signatures stamped, audit page appended. |
| `original.pdf` | The document exactly as the signers saw it. |
| `template.json` | The template that placed the fields, byte for byte as passed. |
| `signatures/<id>.json` | One per signature, named by its signature id (a GUID; the field id is inside): document hash, consent sentence, assurance level, pages seen with their pixel hashes, the hashes of the strokes, the image, the evidence and the template, and the device time of confirmation. |
| `signatures/<id>.strokes.json` | Every input event of that signature: position, time, pressure where reported. |
| `signatures/<id>.png` | The image stamped in that field. |
| `evidence/<id>.json`, `evidence/<id>.data` | One record and the bytes, per evidence item, named by its evidence id (a GUID). |
| `audit.jsonl` | The audit chain, one entry per line. |
| `manifest.json` | Every file above with its SHA-256, the SHA-256 of the signed document, the head of the audit chain, and `partial` for a partial version. |

Read files through the manifest, never by fixed names: newer versions add files within the same
schema, and a reader that walks the manifest keeps working.

## Personal data

| Where | What |
|---|---|
| `identities/<session>-<signer>.json` | The signer's name and contact as given, and the random salt of their identity commitment. Outside the bundle, one file per person, deletable on request. |
| `document.pdf` | The audit page prints each signer's name. |
| `signatures/<id>.strokes.json` | The handwriting itself, with timing and pressure, in plain text. |
| `evidence/` | Whatever your application bound. |

The records and the chain name signers only by the opaque reference you chose and the identity
commitment: the SHA-256 of the 32 salt bytes followed by the canonical JSON
`{"name":…,"contact":…}`. Deleting an identity file
breaks no hash and leaves the other signers' commitments intact; the bundle then no longer says who
that person was. Names printed on the signed PDF and the strokes cannot be removed without breaking
the document's hash; decide with that in mind how long you keep bundles.

## The audit chain

Each line of `audit.jsonl` is one canonical JSON entry: the session, a sequence number, the SHA-256
of the previous line, and the event with the device time and its offset. A `receivedTime` from a
server has room in the format; a session on the device has no server, so it records device time
only. The event kinds are:

| Kind | Written when |
|---|---|
| `session.created` | The session starts. Pins the document's and the template's hashes. |
| `evidence.added` | Evidence is bound. |
| `signer.added` | A signer joins, with their reference and commitment. |
| `signature.confirmed` | A field is confirmed, with its signature record's hash. |
| `field.unsigned` | A partial finalize leaves a field open. |
| `document.finalized` | The signed document is written, with its hash. |

## Record format

Records are canonical JSON: UTF-8, a fixed property order, integers only (areas in thousandths of a
point, stroke positions in millionths of the surface, times from the first point in microseconds),
and timestamps to the millisecond with the device's offset, as `yyyy-MM-ddTHH:mm:ss.fff±hh:mm`. The
same record always produces the same bytes, so its SHA-256 identifies it. Every record carries
`"schema": 1`; changes within schema 1 only add properties.

## Verify a bundle

With any SHA-256 tool and no SignArgs code:

1. Hash every file the manifest lists and compare with the manifest.
2. Hash `document.pdf` and compare with `documentSha256` in the manifest.
3. Walk `audit.jsonl`: the first line has sequence 0 and no `previousSha256`, because a first
   version continues nothing; each later line's `previousSha256` is the SHA-256 of the line before
   it as stored; and the SHA-256 of the last line equals `auditHeadSha256` in the manifest.
4. For each signature record, check that the hashes it names match the files beside it.

Verification shows that the bundle is consistent with its manifest's `auditHeadSha256`. The plugin has no
key and no trusted timestamp, so whoever holds a bundle could rewrite the chain and every hash
together. The chain becomes tamper-evident once that head is stored somewhere the holder cannot
change it, for example sent to the other party or to your own server when signing ends.

In C#, `AuditChainVerifier` checks a chain from its stored bytes and `RecordJson` reads every record.
To check an identity, recompute `IdentityCommitment.Compute(identity)` and compare it with the
`signer.added` entry.

## Keeping bundles

The bundle lives in the application's private storage. SignArgs for Unity does not upload, back up or
delete it; that is your application's decision.
