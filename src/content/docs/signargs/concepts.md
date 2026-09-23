# Concepts

A handful of ideas carry the whole package. Every other page assumes them.

## A signature is bound to the pages rendered and shown

A handwritten image pasted into a PDF proves nothing. What SignArgs keeps instead, for every
signature, is a record that ties together:

- the SHA-256 of the exact document bytes the signer was shown;
- every page `PdfView` drew while they looked, with the resolution it was drawn at and a hash of its
  pixels;
- every input event of the signature with the time the device reported for it;
- the image that was stamped, the consent sentence the signer agreed to, and the template that put
  the field there;
- whatever evidence your application bound to it.

That is why the pad and the view are handed to `ConfirmAsync` together, and why confirming refuses a
capture whose shown pages never include the field's page.

## Record what can be proven, label what cannot

Some things SignArgs can prove, such as that a file matches the hash recorded for it. Others it can
only report, such as the time on the device's clock or what your application said about the job. The
records keep the two apart: times are stored as device times and the audit page says so, and
evidence is stored "as reported by the application" with who reported it. Nothing is presented as
more certain than it is.

## Template, session, signer, field

- A **template** describes a document type: its signature **fields**, where each one is on which
  page, the sentence its signer agrees to, the minimum [assurance level](#assurance-levels) and the
  signing order. It is stored as a record, so the chain can pin exactly which rules were enforced.
- A **session** is one document being signed under one template. It starts with the document bytes,
  a title and the template, and ends when it is finalized.
- A **signer** joins the session when they arrive, with an opaque reference, their name, and the
  fields they sign. One signer can sign several fields; one field has one signer.
- Each field moves from `Unassigned` to `Ready` (or `Blocked` while an earlier field in the order is
  unsigned) to `Confirmed`.

## Confirm, then finalize

Confirming records one signature: its record is written and the audit chain grows by one entry. The
PDF is not touched. Finalizing then does everything that changes the document, once, for all
confirmed signatures together: stamps each image into a fresh copy of the original bytes, appends the
audit page, saves, hashes and writes the bundle. The page hashes in the signature records therefore
stay hashes of what the engine rendered from the original.

A finalized document is never modified again. More signatures on the signed document take a new
session.

## The audit chain

Every event in a session is one line of `audit.jsonl`: session created, signer added, evidence
added, signature confirmed, field left unsigned, document finalized. Each line carries the SHA-256 of
the line before it, and the manifest carries the hash of the last one. Change, drop or reorder a line
and the chain no longer matches that head. Anyone can check it with a SHA-256 tool and the rules on
[The signed bundle](signed-bundle.md#verify-a-bundle).

Core has no key and no trusted timestamp, so whoever holds a bundle could rewrite the chain and the
manifest together. The chain is tamper-evident once the head is stored somewhere the holder cannot
change it, for example sent to the other party or to your own server when signing ends.

## People are pseudonymous in the records

The chain and the records never contain a signer's name or contact details. They carry an opaque
signer reference you choose and an identity commitment: a salted hash of the name and contact. The
salt and the plain details live in a separate identity file, one per signer, outside the bundle.
Delete that file and every hash still verifies; the bundle just no longer says who that person was.
The signed PDF itself shows names on its audit page, because that is the document people read.

## Assurance levels

How sure the application is that the person signing is the invited signer, stated per signer and
required per field:

| Level | Name | Meaning |
|---|---|---|
| 0 | `Presence` | The signer is there, on the operator's device. |
| 1 | `UniqueLink` | The signer holds their own link. Needs a server. |
| 2 | `OneTimeCode` | The link plus a one-time code to their email or phone. Needs a server. |
| 3 | `HostAppIdentity` | Your application authenticated the signer. |
| 4 | `ProviderCheck` | An identity provider checked them. Needs a signing provider. |

On the device only levels 0 and 3 can be honestly claimed; the others need a server or a signing
provider that Core does not have. The session records the level you pass and refuses a signer whose
level is below what their field requires. At level 3 the identity is recorded as reported by your
application; Core does not yet record a signed identity claim from it.

## One worker thread for the PDF engine

PDFium is not thread-safe, so every call into it takes one process-wide lock. The `PdfWorker`
component owns the background thread SignArgs components run engine work on, so rendering,
stamping and saving never stall a frame. The main thread only uploads finished textures. Put one
`PdfWorker` in the scene and reference it from `PdfView` and `LocalFinalizer`.

## The shared packages

Everything that has to behave the same on the device and, later, on a server lives in three plain C#
packages with no Unity references: `com.signargs.shared.core` (records, hashing, the audit chain),
`com.signargs.shared.pdfium` (the PDF engine bindings) and `com.signargs.shared.signing` (sessions,
bundles, the audit page). `com.signargs.core` adds the Unity components on top. The shared packages
are unit-tested with plain `dotnet test`, and their record formats are pinned by golden files.
