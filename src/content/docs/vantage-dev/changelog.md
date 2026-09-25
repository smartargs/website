# Changelog

What changed in each release of Vantage. Versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html): a new minor version adds systems and components, a patch version fixes things, and a new major version changes something you have to adapt to, which the entry spells out.

## 1.0.0

Initial release.

- Fixed: with a `VtTickDriver` in the scene, `VtPredictedMovementExecutor` never ticked, so other clients' units stopped following the server and the owner's corrections were never applied. It now ticks in the new Movement tick group, between Threat and Engagement.
- Reference pages for every module list each component and asset with every field's default, allowed range and effect, plus the members you can call or override from code. Each module page links to its reference page.
- Items can last a number of uses that add up: with **Durability Mode** set to Uses, moving a copy onto another copy of the same item combines them into one with the durability of both, in the bag and on worn gear. Hotbar slots report the durability left and the full durability as numbers.
