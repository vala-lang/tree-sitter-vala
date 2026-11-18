tree-sitter-vala
----------------

## Workflow

Install the development dependencies with `npm install`. The generator is pinned
to tree-sitter CLI 0.24.7 because it supports ABI 13, preserving compatibility
with older Tree-sitter clients. Newer clients can also load this parser.

1. edit `grammar.js`
2. `npm run generate`
3. `node_modules/.bin/tree-sitter test`

You can use `node_modules/.bin/tree-sitter parse <file>` and
`node_modules/.bin/tree-sitter highlight <file>` after regenerating.

The checked-in generated files are retained so consumers can build all bindings
without installing the CLI. Only regenerate them when changing the grammar.
The Makefile and CMake builds compile these files directly. Their optional
`generate` and `ts-generate` targets also default to ABI 13; for example,
`make generate TS=./node_modules/.bin/tree-sitter`. CMake searches for the local
CLI automatically. Keep ABI 13 when updating the generator or generated files.

## Neovim integration

For a working neovim integration you need to install this grammar with

```
:TSInstall vala
```

And you need to install the [vala.vim](https://github.com/vala-lang/vala.vim) plugin to recognize the filetype.

For [vim-plug](https://github.com/junegunn/vim-plug) this would be:

```
Plug 'vala-lang/vala.vim'
```

Then install with

```
:PlugUpdate
```

For other plugin mangers consider the install steps will be different.
