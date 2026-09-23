# Platforms

What the package ships for, and what has actually been run where. Every row carries one of three
statuses:

- **Verified on device**: run on real hardware, with the date.
- **Binaries included, unverified**: the binaries and build steps are in the package and checked on the build
  machine, but nobody has run them on that hardware yet.
- **Not yet**: no PDF engine binary ships for it.

## Targets

| Target | Engine binary | Status |
|---|---|---|
| Android arm64 (IL2CPP) | `libpdfium.so`, 16 KB page-aligned | **Verified on device** 22 Sep 2026 on a OnePlus Nord (Android 12), IL2CPP, stripping "High". |
| Windows x64 editor and player | `pdfium.dll` | Player: **Verified on device** 23 Sep 2026 on Windows 11, Mono: the **Sign a document** sample signed by three people through a virtual Input System mouse, the bundle checked with `sha256sum`. Editor: the development platform; the shared tests run on Windows against the same PDFium build. |
| macOS editor and player, Apple silicon and Intel | universal `libpdfium.dylib` | **Binaries included, unverified**. Both slices export every entry point the bindings use. |
| iOS arm64 device and simulator | `libpdfium.dylib`, per slice | Preview: **binaries included, unverified**. See [iOS](#ios). |
| Android armv7, x86, 32-bit anything | none | Not planned: no 32-bit target is built. |
| Linux player, WebGL, consoles | none | **Not yet**. |
| Meta Quest and other XR headsets | Android arm64 | Not run on a headset. Controller and hand-tracking input are planned for SignArgs Pro, not this plugin. |

## Unity

| | |
|---|---|
| Minimum | Unity 6 LTS (6000.0). |
| Tested on | 6000.3.6f1. |
| Scripting backend | IL2CPP verified on Android; Mono in the editor. |
| Managed stripping | "High" verified on Android. The package's `link.xml` is fed to the linker by the package itself, because Unity does not read `link.xml` inside packages. |
| Input | Input System 1.18 or newer. Touch verified on Android with injected touch events; mouse verified on the Windows player with queued Input System events; pen not yet run. |
| Render pipeline | The components are uGUI and use no pipeline-specific features. |

## PDF engine

PDFium 156.0.8066, the build published by bblanchon/pdfium-binaries, pinned by SHA-256 per binary in
`Plugins/PDFium/PROVENANCE.md`. The bindings are SignArgs' own and written from that release's
headers.

## iOS

The pinned PDFium build ships only a dynamic library for iOS, and Unity's importer ignores a `.dylib`
for iOS. A build step in the package therefore copies the slice matching the SDK you build for into
the Xcode project, links it into UnityFramework, embeds and code-signs it in the app, and rewrites
its install name to `@rpath/libpdfium.dylib`. You do nothing, with one exception: set
**Player Settings → iOS → Other Settings → Target minimum iOS Version** to 17.0 or newer. A lower
target fails the build before anything compiles, with that message.

The generated Xcode project has been inspected on the build machine for every step above. It has not
been built in Xcode, launched on a device or simulator, or submitted to the App Store. Until it has,
iOS is a preview.

## Measured on the reference phone

OnePlus Nord AC2003, Android 12, IL2CPP ARM64, stripping "High", 22 September 2026.

| Measure | Result |
|---|---|
| Open a 100-page document | 6 ms |
| First page at 150 dpi, 1240 × 1754 | 42 to 101 ms, depending on the build |
| Page turn, texture upload included | median 12 ms |
| 20 open-render-close cycles | no memory growth |
| Stamp, audit page, save and hash | 55 ms with the embedded font |
| Sample, Play to first page | 298 ms |
| Sample, confirm one signature | 66 to 99 ms |
| Sample, finalize three signatures | 199 ms |
| Signed document hash on device vs `sha256sum` on a PC | equal |
