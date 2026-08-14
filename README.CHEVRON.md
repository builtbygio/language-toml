# language-toml (Chevron)

TextMate-only bundled grammar (no tree-sitter). Owned so the pin is not
an archived `atom/*` remote.

Chevron loads this via `packageDependencies`. Do not add a tree-sitter
grammar here without updating `src/load-tree-sitter-language.js` and
the official `tree-sitter@0.25` contract.
