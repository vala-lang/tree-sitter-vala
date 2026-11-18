package tree_sitter_vala_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_vala "github.com/vala-lang/tree-sitter-vala/bindings/go"
)

func TestCanParseVala(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_vala.Language())
	if version := language.Version(); version != 13 {
		t.Fatalf("Expected parser ABI 13 for older clients, got %d", version)
	}
	parser := tree_sitter.NewParser()
	defer parser.Close()

	if err := parser.SetLanguage(language); err != nil {
		t.Fatalf("Error loading Vala grammar: %v", err)
	}

	tree := parser.Parse([]byte(`void main () { print ("hello"); }`), nil)
	if tree == nil {
		t.Fatal("Error parsing Vala source")
	}
	defer tree.Close()

	if root := tree.RootNode(); root.HasError() {
		t.Fatalf("Unexpected parse errors: %s", root.ToSexp())
	}
}
