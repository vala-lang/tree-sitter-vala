package tree_sitter_vala_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_vala "github.com/vala-lang/tree-sitter-vala/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_vala.Language())
	if language == nil {
		t.Errorf("Error loading Vala grammar")
	}
}
