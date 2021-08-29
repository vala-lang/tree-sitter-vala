tree-sitter-vala
----------------

## Workflow

You need the tree-sitter CLI. On Arch, install `tree-sitter`.

1. edit `grammar.js`
2. `tree-sitter generate`
3. `tree-sitter test`

You can use `tree-sitter parse <file>` to run the parser after regenerating.
