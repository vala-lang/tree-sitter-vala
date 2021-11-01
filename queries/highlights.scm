; highlights.scm

(comment) @comment
(type) @type
(oce_type) @type ; unqualified types appearing within object creation expressions
(access_modifier) @keyword
(attribute) @attribute
(method_declaration (symbol (identifier) @function))
(creation_method_declaration (symbol (identifier) @constructor))
(method_call_expression (member_access_expression (identifier) @function))
(parameter (identifier) @variable.parameter)
(property_declaration (symbol (identifier) @property))
(this_access) @variable.builtin
(boolean) @constant.builtin
(character) @constant
(integer) @number
(null) @constant.builtin
(real) @number
(regex) @constant
(string) @string
(template_string) @string
(template_string_expression) @string.special
(verbatim_string) @string

[
 "as"
 "async"
 "catch"
 "class"
 "const"
 "construct"
 "dynamic"
 "else"
 "extern"
 "finally"
 "get"
 "if"
 "in"
 "is"
 "namespace"
 "new"
 "not"
 "out"
 "override"
 "ref"
 "return"
 "set"
 "sizeof"
 "try"
 "typeof"
 "unowned"
 "virtual"
 "weak"
] @keyword

[
 "="
 "+"
 "+="
 "-"
 "-="
 "|"
 "|="
 "&"
 "&="
 "^"
 "^="
 "/"
 "/="
 "*"
 "*="
 "%"
 "%="
 "<<"
 "<<="
 ">>"
 ">>="
 "."
 "?."
 "->"
 "!"
 "~"
 "??"
 "?"
 ":"
 "<"
 ">"
 "||"
 "&&"
] @operator

[
 ","
 ";"
] @punctuation.delimiter

[
 "("
 ")"
 "{"
 "}"
 "["
 "]"
] @punctuation.bracket
