# Asset Store publisher assets

Artwork for the smartargs publisher profile on the Unity Asset Store. Built from the site's own
parts: Geist Sans and Silkscreen (outlined, so the SVGs need no fonts installed), the fortress full
stop from the home page headline, and the catalog covers of vantage-dev and SignArgs for Unity.

| File | What it is |
|---|---|
| `banner.svg`, `banner.png` | The promo banner, 1950 × 650. Unity shows it at the top of the publisher page during a discount period. |
| `profile-mark.svg`, `profile-mark-1024.png`, `profile-mark-160.png` | Profile picture: the fortress alone. Reads at avatar size, which is the point. |
| `profile-wordmark.svg`, `profile-wordmark-1024.png`, `profile-wordmark-160.png` | The same with the wordmark under it, for places that show the image without the publisher name. |

Unity documents what these two images are for but not how large they must be, so the sizes above are
a judgement call: 1950 × 650 follows the store's own wide artwork, and the square exports cover both
the 160 × 160 icon the store uses elsewhere and any larger slot. The SVGs are the source; re-export
at whatever the publisher portal asks for:

```sh
npx sharp -i banner.svg -o banner.png resize <width> <height>
```

## Publisher profile copy

Headline (41 of 60 characters):

> Useful software for Unity, built to last.

About (267 of 300 characters):

> smartargs is a game development company in Salzburg, Austria, publishing the tools and systems we
> build: ready-made gameplay systems for Unity 6, and on-device PDF signing with a verifiable audit
> trail. Every package ships with documentation, samples and a changelog.
