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
| `versions/<session id>/` | In a version that continues a partial one: each earlier version's `manifest.json`, `audit.jsonl`, and its signature and evidence files, one folder per earlier version, never nested. Its `document.pdf` is left out and its `original.pdf` and `template.json` are the ones at the top, byte for byte. |
| `manifest.json` | Every file above with its SHA-256, the SHA-256 of the signed document, the head of the audit chain, `partial` for a partial version, and for a continued version `previousSessionId` and `previousAuditHeadSha256`, the version it continues and that version's audit head. |

Read files through the manifest, never by fixed names: newer versions add files within the same
schema, and a reader that walks the manifest keeps working.

## Continued versions

A partial version can be continued on another device: a new session starts from the same
`original.pdf` and template, carries every confirmed signature unchanged, and at finalize stamps all of
them into a fresh copy, so the last document has one audit page, which lists the versions. A carried
signer's name appears on it only when your application passed their identity record; otherwise the
page prints their reference and identity commitment. Two devices continuing the same version each
produce a valid bundle; only both bundles, verified together, show the fork, and only a server that
owns the session prevents it.

Signer assignments do not carry: the continuing session starts with no signers, so a reference from an
earlier version can sign a field left open there, including one it was assigned to before. It is added
again with its identity record, and keeps its commitment.

## Handing a bundle to another device

A `.signargs` file is a zip container of one verified bundle, not a separate format:

| Entry | What it is |
|---|---|
| `manifest.json` | The manifest, byte for byte. |
| every path the manifest lists | The file, byte for byte, at its bundle path, `versions/` included. |
| `identities/<signer reference>.json` | Identity records your application chose to send, not listed in the manifest. |

`BundleArchive.Write` writes exactly these entries from a `VerifiedBundle`, never a folder's contents,
and refuses an identity record whose reference is not in the bundle or does not match its commitment.
`BundleArchive.Read` refuses an archive that holds any other entry, holds one twice, or holds a file
longer than the manifest lists, a manifest over 1 MiB or an identity record over 64 KiB. It verifies the
bundle in memory and only then writes it to `<Folder>/<session id>`, through a scratch folder
`<session id>.receiving`; a bundle that fails verification leaves nothing behind, and an existing bundle
folder is never overwritten. The identity records are returned to your application, not written: whether
to keep them is your decision.

A received bundle lands next to the bundles written on the device, so it counts when
`BundleDirectory.IsContinued` looks for a version already continued here. Only folders named by a session
id count; `.partial` and `.receiving` folders, `identities/` and anything else are ignored. Receiving does
not refuse a bundle whose version this device already continued: receiving both branches is how a fork is
found.

A continued bundle's longest path, `<session id>/versions/<session id>/signatures/<id>.strokes.json`, is
143 characters from `Folder`. On Windows, a `Folder` deep in the file system can take that past the limit
of 260 characters for a path unless long paths are enabled; keep it short, and copy received archives
rather than extracted folders.

## Personal data

| Where | What |
|---|---|
| `identities/<session>-<signer>.json` | The signer's name and contact as given, and the random salt of their identity commitment. Outside the bundle, one file per person, deletable on request. |
| `document.pdf` | The audit page prints each signer's name. |
| `signatures/<id>.strokes.json` | The handwriting itself, with timing and pressure, in plain text. A continued version carries the strokes of every earlier version under `versions/`. |
| Earlier audit pages | A continued document states only the names its application supplied. A name printed on an earlier version's audit page can be missing from the final one, and the earlier `document.pdf` is not kept in the bundle. |
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
| `version.continued` | Second entry of a continued version: the hash of the previous version's `manifest.json` and of its signed document. |
| `signature.carried` | A signature of an earlier version is carried unchanged, with its record's hash, field, reference and commitment. |
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
3. Walk `audit.jsonl`: the first line has sequence 0. In a first version it has no
   `previousSha256`; in a continued version its `previousSha256` is the manifest's
   `previousAuditHeadSha256`, the audit head of the version it continues. Each later line's
   `previousSha256` is the SHA-256 of the line before it as stored, and the SHA-256 of the last line
   equals `auditHeadSha256` in the manifest. In C#, pass `previousAuditHeadSha256` to
   `AuditChainVerifier.Verify`. A verifier from 0.1.0 does not know that property and reports a
   continued chain as broken at its first entry.
4. For each signature record, check that the hashes it names match the files beside it.
5. For a continued version, repeat steps 1 to 4 for each folder under `versions/`, with its own
   `manifest.json`. Its `original.pdf` and `template.json` are the ones at the top of the bundle, its
   `document.pdf` is not kept, and a path it lists under `versions/` is read from the top of the
   bundle. Then check the links: the second line of each continued chain is `version.continued` and
   names the SHA-256 of the previous version's `manifest.json`; that manifest says `partial`; and the
   `signature.carried` lines name exactly the signatures the previous version confirmed or carried.

Two bundles of the same document can also be compared: `BundleVerifier.Compare` lines up their versions
from the first one and reports whether one continues the other or whether a version was continued twice.

Verification shows that the bundle is consistent with its manifest's `auditHeadSha256`. The plugin has no
key and no trusted timestamp, so whoever holds a bundle could rewrite the chain and every hash
together. The chain becomes tamper-evident once that head is stored somewhere the holder cannot
change it, for example sent to the other party or to your own server when signing ends.

In C#, `BundleVerifier.Verify(folder)` runs every step above and says which one failed; `AuditChainVerifier` checks a chain alone from its stored bytes and `RecordJson` reads every record.
To check an identity, recompute `IdentityCommitment.Compute(identity)` and compare it with the
`signer.added` entry.

## Keeping bundles

The bundle lives in the application's private storage. SignArgs for Unity does not upload, back up or
delete it; that is your application's decision.
