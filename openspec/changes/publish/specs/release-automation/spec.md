## ADDED Requirements

### Requirement: Tag-triggered release
A workflow at `.github/workflows/release.yml` SHALL run when a tag of the form `X.Y.Z` is pushed. It SHALL fail if the tag differs from the `version` in `manifest.json`. It SHALL run the test suite, build the plugin and the standalone library, and create a draft GitHub release named after the tag with `main.js`, `manifest.json`, `styles.css`, `dist/coolchordsheets.js`, `dist/coolchordsheets.esm.js` and `dist/coolchordsheets.css` attached.

#### Scenario: Matching tag
- **WHEN** tag `0.1.0` is pushed and `manifest.json` has version `0.1.0`
- **THEN** a draft release `0.1.0` exists with the six assets (manual check on GitHub)

#### Scenario: Mismatched tag
- **WHEN** tag `0.2.0` is pushed and `manifest.json` has version `0.1.0`
- **THEN** the workflow fails before building and no release is created (manual check on GitHub)

### Requirement: Repository metadata
`manifest.json` SHALL carry `authorUrl` pointing at the owner's GitHub profile. `package.json` SHALL carry `repository` and `homepage` pointing at the repository and the Pages site. Every repository link in `README.md` and `docs/index.html` SHALL point at `github.com/EstebanMDQ/coolchordsheets`.

#### Scenario: Links consistent
- **WHEN** `README.md` and `docs/index.html` are searched for `github.com/`
- **THEN** every match is `github.com/EstebanMDQ/coolchordsheets` or a link to another project such as BRAT

### Requirement: No innerHTML in plugin code
No file under `src/` SHALL use `innerHTML`, `outerHTML` or `insertAdjacentHTML`.

#### Scenario: Source scan
- **WHEN** `src/` is searched for those identifiers
- **THEN** there are no matches
