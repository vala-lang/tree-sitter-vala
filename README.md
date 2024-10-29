tree-sitter-vala
----------------

## Workflow

You need the tree-sitter CLI. On Arch, install `tree-sitter`.

1. edit `grammar.js`
2. `tree-sitter generate`
3. `tree-sitter test`

You can use `tree-sitter parse <file>` and `tree-sitter highlight <file>` after
regenerating.

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
