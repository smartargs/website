# Evidence

A signature says "I agree"; evidence says to what, in the application's own terms: which checklist
items were ticked, a screenshot of the inspected installation, the version of the model that was
shown. SignArgs binds it into the signature records by hash, so the reviewer can prove it has not
changed since. It cannot prove it is true, and the audit page says so: evidence is stored as
reported by the application, with the application, version and device that reported it.

## Bind evidence

```csharp
session.AddEvidence("checklist", "text/plain", Encoding.UTF8.GetBytes("Checks 1 to 5 carried out."));
session.AddEvidence("screenshot", "image/png", screenshotPng, fieldId: "site-manager");
```

| Argument | What it is |
|---|---|
| `kind` | What the item is, such as `checklist` or `screenshot`. Printed on the audit page. |
| `mediaType` | The media type of the bytes, such as `image/png`. |
| `content` | The bytes, kept exactly as given. |
| `fieldId` | Bind to one field, or leave it out to bind to every field confirmed afterwards. |

Bind evidence before the field it belongs to is confirmed. A field takes at most one item of its
own; bind further items to the session. Evidence bound to the session after some fields are
confirmed binds only to the ones confirmed later.

Each item becomes one record with its SHA-256, its size and its provenance (application, version,
package, device and device time), plus the bytes themselves, and one `evidence.added` entry in the
audit chain. The signature records of the fields it binds to carry the record's hash.

## Errors

| Exception | Cause |
|---|---|
| `AuditTextException` | The kind or the media type cannot be printed on the audit page. |
| `ArgumentException` | The field is unknown, or it already has evidence of its own. |
| `InvalidOperationException` | The field is already confirmed, or the session is finalized. |

## Personal data

Evidence is stored in the bundle as given. A screenshot with a face in it, or a checklist with a
name, puts personal data into the bundle, where it cannot be erased without breaking a hash. Keep
evidence about the work, not about the person.
