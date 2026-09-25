# Samples

Two scenes ship with the package. Each is the shortest scene that shows its part working, with every
object named after what it does.

| Sample | What it shows |
|---|---|
| [Show a PDF](show-a-pdf.md) | The viewer alone: a three-page PDF with filled form fields, paged with two buttons, and the form fields each page declares read back. |
| [Sign a document](sign-a-document.md) | The product: three people sign a handover protocol in turn on one device, or hand it over to another device part-way, and the signed PDF, its audit page and the bundle are written to the device's storage. |

## Import

Open **Window → Package Manager**, select **SignArgs Core**, open the **Samples** tab and press
**Import** next to the sample. Unity copies it to `Assets/Samples/SignArgs Core/<version>/`. Open the
scene in that folder and press Play.

If you installed from the Asset Store, the samples are already in the imported `SignArgs` folder.

Each sample has its own assembly definition that references the SignArgs assemblies, so its scripts
compile the moment it is imported. The PDF and the template are imported as `TextAsset`s: their files
end in `.bytes` so Unity keeps the exact bytes.

## Running on a device

Both scenes run on a phone as they are. Add the scene to **File → Build Profiles → Scene List**, pick
your target and build. On Android the bundle lands in the app's private storage; pull it with
`adb` to look at it (see [Sign a document](sign-a-document.md#look-at-the-result)).
