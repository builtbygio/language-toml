# language-toml (Chevron)

TOML highlighter for Chevron. Tree-sitter is the default
(`@tree-sitter-grammars/tree-sitter-toml@0.7.0` via
`grammars/tree-sitter-toml.json`). The TextMate grammar in
`grammars/toml.cson` stays as the fallback.

Owned so the pin is not an archived `atom/*` remote.
Chevron loads this via `packageDependencies`.
