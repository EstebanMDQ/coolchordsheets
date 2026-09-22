# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-09-21

### Added

- Obsidian plugin rendering `chordsheet` code blocks as iReal Pro style charts in reading mode and live preview.
- Plain text grammar: header keys, bar lines with repeats and counts, `%` repeat bars, section labels, endings, coda, segno, fine and jump markers, free text markers, comments, time signature tokens.
- Timing by spacing inside a bar, with tab and `_` holds and an uneven bar marker.
- Chord symbol parsing with iReal Pro spellings and long form aliases, slash chords, accidentals as glyphs.
- CSS grid layout with columns aligned across rows, print stylesheet, three settings applied through CSS.
- Standalone browser build (`dist/coolchordsheets.js` and `.css`) that renders `pre.chordsheet` elements on any page.
