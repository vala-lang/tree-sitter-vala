; highlights.scm

(comment) @comment
(type) @type
(oce_type) @type ; unqualified types appearing within object creation expressions
(access_modifier) @keyword
(attribute) @attribute
(method_declaration (symbol (identifier) @function))
(creation_method_declaration (symbol (identifier) @constructor))
(parameter (identifier) @variable.parameter)
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
 "class"
 "construct"
 "dynamic"
 "else"
 "extern"
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
 "typeof"
 "unowned"
 "virtual"
 "weak"
] @keyword
