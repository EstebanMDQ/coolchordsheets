## Context

The repository exists and is empty. The Pages workflow from `docs-and-demo` is ready but Pages must be enabled with the Actions source before it can deploy. Obsidian's community listing requires a public repo, a release whose tag equals the manifest version with `main.js`, `manifest.json` and `styles.css` attached, a README and a LICENSE, and a pull request to `obsidianmd/obsidian-releases`. The listing is reviewed by a bot and by people; the bot rejects some patterns outright, including `innerHTML`.

## Goals / Non-Goals

**Goals:** one command releases a version; the demo deploys itself; the plugin passes the automated review on the first try.

**Non-Goals:** npm publishing, signing, automated changelog generation, submitting to any other directory.

## Decisions

**Draft releases.** The workflow creates the release as a draft so the notes can be edited from the CHANGELOG before it goes public. Obsidian only sees published releases.

**Tag equals manifest version, checked in the workflow.** The Obsidian installer downloads `manifest.json` from the release matching the version, so a mismatch breaks installs silently. The workflow fails fast instead.

**Tests run in the release job.** A tag should never ship code that fails the suite, even if CI on the commit was green.

**SVG without innerHTML.** The helper builds elements with `createElementNS` and `setAttribute`. It is a few more lines and removes the only review-bot flag known in advance.

## Risks / Trade-offs

- [Pages enablement needs admin rights on the repo] -> Done once by the owner through the API or the settings page; documented in tasks.
- [Review feedback we cannot predict] -> Handled as follow-up tasks when the PR is reviewed.
