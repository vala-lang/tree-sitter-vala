[
  (block)
  (class_declaration)
  (interface_declaration)
  (struct_declaration)
  (enum_declaration)
  (errordomain_declaration)
  (namespace_declaration)
  (switch_statement)
  (switch_section)
  (property_declaration)
] @indent.begin

((if_statement
  . (_) @indent.begin)
  (#set! indent.start_at_same_line))

((elseif_statement
  . (_) @indent.begin)
  (#set! indent.start_at_same_line))

[
  (object_initializers)
  (initializer)
  (ternary_expression)
] @indent.begin

((parameter) @indent.begin
  (#set! indent.immediate)
  (#set! indent.start_at_same_line))

(method_call_expression) @indent.begin

(method_call_expression
  ")" @indent.branch)

(object_creation_expression) @indent.begin

(object_creation_expression
  ")" @indent.branch)

((if_statement
  [
    (expression_statement)
    (return_statement)
    (throw_statement)
    (break_statement)
    (continue_statement)
  ] @indent.begin)
  (#set! indent.immediate)
  (#set! indent.start_at_same_line))

((if_statement
  (foreach_statement) @indent.begin)
  (#set! indent.immediate)
  (#set! indent.start_at_same_line))

((elseif_statement
  [
    (expression_statement)
    (return_statement)
    (throw_statement)
    (break_statement)
    (continue_statement)
  ] @indent.begin)
  (#set! indent.immediate)
  (#set! indent.start_at_same_line))

((else_statement
  [
    (expression_statement)
    (return_statement)
    (throw_statement)
    (break_statement)
    (continue_statement)
  ] @indent.begin)
  (#set! indent.immediate)
  (#set! indent.start_at_same_line))

((for_statement
  [
    (expression_statement)
    (return_statement)
    (throw_statement)
    (break_statement)
    (continue_statement)
  ] @indent.begin)
  (#set! indent.immediate)
  (#set! indent.start_at_same_line))

((foreach_statement
  [
    (expression_statement)
    (return_statement)
    (throw_statement)
    (break_statement)
    (continue_statement)
  ] @indent.begin)
  (#set! indent.immediate)
  (#set! indent.start_at_same_line))

((while_statement
  [
    (expression_statement)
    (return_statement)
    (throw_statement)
    (break_statement)
    (continue_statement)
  ] @indent.begin)
  (#set! indent.immediate)
  (#set! indent.start_at_same_line))

((do_statement
  [
    (expression_statement)
    (return_statement)
    (throw_statement)
    (break_statement)
    (continue_statement)
  ] @indent.begin)
  (#set! indent.immediate)
  (#set! indent.start_at_same_line))

([
  "["
] @indent.begin
  (#set! indent.immediate))

[
  "}"
  "]"
] @indent.branch @indent.end

(comment) @indent.auto
