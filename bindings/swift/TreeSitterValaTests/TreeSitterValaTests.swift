import XCTest
import SwiftTreeSitter
import TreeSitterVala

final class TreeSitterValaTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_vala())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Vala grammar")
    }
}
