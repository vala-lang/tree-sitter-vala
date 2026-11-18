export default grammar({
  name: 'vala',

  rules: {
    source_file: $ => repeat(choice(
      $.using_directive,
      $.namespace_member,
      $._statement,
      $._preprocessor_statement
    )),

    // taken from tree-sitter-c
    // http://stackoverflow.com/questions/13014947/regex-to-match-a-c-style-multiline-comment/36328890#36328890
    comment: $ => token(prec(1, choice(
      seq('//', /(\\(.|\r?\n)|[^\\\n])*/),
      seq(
        '/*',
        /[^*]*\*+([^/*][^*]*\*+)*/,
        '/'
      )
    ))),

    using_directive: $ => seq(
      'using',
      $.symbol,
      repeat(seq(',', $.symbol)),
      ';'
    ),

    symbol: $ => choice(
      seq($.symbol, '.', $.identifier),
      seq(optional('global::'), $.identifier)
    ),

    _identifier: $ => /[@A-Za-z_]\w*/,

    identifier: $ => choice(
      $._identifier,
      'if', 'switch', 'while', 'do', 'for', 'foreach', 'return',
      'throw', 'try', 'lock', 'unlock', 'delete', 'with', 'ref', 'value'
    ),

    namespace_member: $ => choice(
      seq(repeat($._attribute_list), $._namespace_member_declaration),
      seq(repeat1($._attribute_list), repeat1($._preprocessor_statement), $._namespace_member_declaration)
    ),

    _namespace_member_declaration: $ => choice(
      $.namespace_declaration,
      $.class_declaration,
      $.interface_declaration,
      $.struct_declaration,
      $.enum_declaration,
      $.errordomain_declaration,
      $.delegate_declaration,
      $.method_declaration,
      $.signal_declaration,
      $.field_declaration,
      $.constant_declaration
    ),

    _attribute_list: $ => seq(
      '[',
      $.attribute,
      repeat(seq(',', $.attribute)),
      ']'
    ),

    attribute: $ => seq(
      $.identifier,
      optional(seq('(', $.attribute_argument, repeat(seq(',', $.attribute_argument)), ')'))
    ),

    attribute_argument: $ => seq(
      $.identifier,
      '=',
      $._expression
    ),

    _expression: $ => choice(
        $._contained_expression,
        $.conditional_initializer_entry,
        $.initializer,
        $.yield_expression,
        $.lambda_expression,
        $.static_cast_expression,
        $._unary_expression,
        $.multiplicative_expression,
        $.arithmetic_expression,
        $.in_expression,
        $.bitshift_expression,
        $.dynamic_cast_expression,
        $.type_relational_expression,
        $.relational_expression,
        $.equality_expression,
        $.bitwise_and_expression,
        $.bitwise_xor_expression,
        $.bitwise_or_expression,
        $.logical_and_expression,
        $.logical_or_expression,
        $.null_coalescing_expression,
        $.ternary_expression,
        $.assignment_expression
    ),

    // expressions that never need to be wrapped in parentheses
    _contained_expression: $ => choice(
        seq('(', $._expression, ')'),
        $.tuple_expression,
        $.literal,
        $.array_creation_expression,
        $.object_creation_expression,
        $.this_access,
        $.base_access,
        $.value_access,
        $.member_access_expression,
        $.element_access_expression,
        $.method_call_expression,
        $.sizeof_expression,
        $.typeof_expression,
        $.postfix_expression,
    ),

    tuple_expression: $ => choice(
      seq('(', ')'),
      seq('(', $._expression, ',', repeat(seq($._expression, optional(','))), ')')
    ),

    // expressions that are contained by an operator to the left
    // for example:
    // if (!yield x())
    //      ^^^^^^^^^ -- we don't need parens here because of the '!' operator
    _left_contained_expression: $ => choice(
        $._contained_expression,
        $.yield_expression,
        $.static_cast_expression,
        $._unary_expression
    ),

    member_access_expression: $ => seq(
      optional(seq(
        choice($._contained_expression, $.unqualified_type),
        choice('.', '?.', '->'),
      )),
      optional('global::'),
      $.identifier,
      optional($.type_arguments)
    ),

    element_access_expression: $ => seq(
      $._contained_expression,
      repeat1($.element_access)
    ),

    element_access: $ => seq(
      optional('?'),
      '[',
      optional(choice($._expression, $.slice_expression)),
      repeat(seq(',', choice($._expression, $.slice_expression))),
      ']'
    ),

    slice_expression: $ => seq(
      optional($._expression),
      ':',
      optional($._expression)
    ),

    argument: $ => choice(
      seq('ref', $._expression),
      seq('out', $._expression),
      $._expression,
      seq($.identifier, ':', $._expression)
    ),

    method_call_expression: $ => seq(
      choice(
        seq('(', $._expression, ')'),
        seq($.member_access_expression, optional($.type_arguments)),
        $._contained_expression
      ),
      '(',
      optional(seq($.argument, repeat(seq(',', $.argument)))),
      ')'
    ),

    yield_expression: $ => seq('yield', $._expression),

    lambda_expression: $ => seq(
      choice(
        $.lambda_parameter,
        seq('(', optional(seq($.lambda_parameter, repeat(seq(',', $.lambda_parameter)))), ')')
      ),
      '=>',
      choice($._expression, $.block)
    ),

    lambda_parameter: $ => seq(optional(choice('ref', 'out')), $.identifier),

    postfix_expression: $ => prec.left(15, seq($._expression, choice('++', '--'))),
    static_cast_expression: $ => prec.right(14, seq('(', choice($.type, '!', 'owned'), ')', $._expression)),
    typeof_expression: $ => prec.right(14, seq('typeof', '(', $.type, ')')),
    sizeof_expression: $ => prec.right(14, seq('sizeof', '(', $.type, ')')),
    dereferencing_expression: $ => prec.right(14, seq('*', $._left_contained_expression)),
    addressof_expression: $ => prec.right(14, seq('&', $._left_contained_expression)),
    arithmetic_negation_expression: $ => prec.right(14, seq('-', $._left_contained_expression)),
    unary_plus_expression: $ => prec.right(14, seq('+', $._left_contained_expression)),
    prefix_expression: $ => prec.right(14, seq(choice('++', '--'), $._left_contained_expression)),
    bitwise_negation_expression: $ => prec.right(14, seq('~', $._left_contained_expression)),
    logical_negation_expression: $ => prec.right(14, seq(choice('!', 'not'), $._left_contained_expression)),
    _unary_expression: $ => prec.right(14, choice(
        $.dereferencing_expression,
        $.addressof_expression,
        $.arithmetic_negation_expression,
        $.unary_plus_expression,
        $.prefix_expression,
        $.bitwise_negation_expression,
        $.logical_negation_expression
    )),
    multiplicative_expression: $ => prec.left(13, seq($._expression, choice('*', '/', '%'), $._expression)),
    arithmetic_expression: $ => prec.left(12, choice(
      seq($._expression, choice('+', '-'), $._expression),
      seq($._contained_expression, repeat1($._preprocessor_statement), choice('+', '-'), $._contained_expression)
    )),
    bitshift_expression: $ => prec.left(11, seq($._expression, choice('<<', '>>'), $._expression)),
    in_expression: $ => prec.left(10, seq($._expression, optional('not'), 'in', $._expression)),
    dynamic_cast_expression: $ => prec.left(10, seq($._expression, 'as', $.type)),
    type_relational_expression: $ => prec.left(10, seq($._expression, 'is', optional('not'), $.type)),
    relational_expression: $ => prec.left(10, seq($._expression, choice('<', '<=', '>=', '>'), $._expression)),
    equality_expression: $ => prec.left(9, seq($._expression, choice('==', '!='), $._expression)),
    bitwise_and_expression: $ => prec.left(8, seq($._expression, '&', $._expression)),
    bitwise_xor_expression: $ => prec.left(7, seq($._expression, '^', $._expression)),
    bitwise_or_expression: $ => prec.left(6, choice(
      seq($._expression, '|', $._expression),
      seq($._contained_expression, repeat1($._preprocessor_statement), '|', $._contained_expression, repeat1($._preprocessor_statement))
    )),
    logical_and_expression: $ => prec.left(5, seq($._expression, choice('&&', 'and'), $._expression)),
    logical_or_expression: $ => prec.left(4, seq($._expression, choice('||', 'or'), $._expression)),
    null_coalescing_expression: $ => prec.left(3, seq($._expression, '??', $._expression)),
    ternary_expression: $ => prec.right(2, seq($._expression, '?', $._expression, ':', $._expression)),

    _assignment_operator: $ => choice('=', '+=', '-=', '|=', '&=', '^=', '/=', '*=', '%=', '<<=', '>>='),
    assignment_expression: $ => prec.right(1, seq(
      $._expression,
      $._assignment_operator,
      choice(
        $._expression,
        seq(repeat1($._preprocessor_statement), $._contained_expression)
      )
    )),

    this_access: $ => 'this',

    base_access: $ => 'base',

    value_access: $ => 'value',

    array_creation_expression: $ => seq(
      'new',
      choice(
        seq('(', 'unowned', $.type, ')'),
        $.type
      ),
      repeat1($.inline_array_type),
      optional($.initializer)
    ),

    object_creation_expression: $ => seq(
      optional('new'),
      $.type,
      optional(seq('.', $.identifier)),
      '(',
      optional(seq($.argument, repeat(seq(',', $.argument)))),
      ')',
      optional($.object_initializers)
    ),

    object_initializers: $ => seq(
      '{',
      optional(seq($.member_initializer, repeat(seq(',', $.member_initializer)), optional(',') /* support trailing comma */)),
      '}'
    ),

    member_initializer: $ => seq(
      $.identifier,
      '=',
      $._expression
    ),

    initializer: $ => seq(
      '{',
      repeat($._preprocessor_statement),
      optional(seq(
        $.argument,
        repeat(seq(',', repeat($._preprocessor_statement), $.argument)),
        optional(seq(',', repeat($._preprocessor_statement)))
      )),
      '}'
    ),

    conditional_initializer_entry: $ => token(prec(2,
      /\{[^{}]*#[\t ]*if[^\n]*\s*\}\s*,\s*\{[^{}]*#[\t ]*endif[^{}]*\}/
    )),

    conditional_if_separator: $ => token(prec(2, seq(
      /#[\t ]*else/,
      /\s*if[\t ]*\([^\n]*\)[\t ]*\{[^}]*#[\t ]*endif/
    ))),

    conditional_class_separator: $ => token(prec(2, seq(
      /#[\t ]*else/,
      /\s*[^\n]*class[^\n]*\{/,
      /\s*#[\t ]*endif/
    ))),

    boolean: $ => choice('true', 'false'),
    character: $ => /'(\S+|\s)'/,
    integer: $ => choice(/([1-9]\d*|0[0-7]*)([Uu][Ll]{1,2}|[Ll]{1,2}|[Uu])?/, /0[xX][A-Fa-f0-9]+([Uu][Ll]{1,2}|[Ll]{1,2}|[Uu])?/),
    null: $ => 'null',
    real: $ => /\d+(\.\d+)?([eE][+-]?\d+)?[FfDd]?/,
    regex: $ => token(prec(1, /\/([^\\\/\n]|\\.)+\/[gmxsui]*/)),
    string: $ => seq(
      '"',
      repeat(choice(
        token(prec(2, /[^"%\\]+/)),
        $.escape_sequence,
        /\\[^abefnrtv\\'"? xXuU]/,
        $.string_formatter,
        /%[^$#0\- +'I\d\\.hlqLjzZtdiouxXeEfFgGaAcsCSpnm%"]/
      )),
      token(prec(2, '"'))
    ),
    escape_sequence: $ => /\\([abefnrtv\\'"? ]|[0-7]{3}|[xX][A-Fa-f0-9]{1,2}|[uU][A-Fa-f0-9]{4,8})/,
    string_formatter: $ => /%\$?[#0\- +'I]?\d*(\.\d+)?(hh?|ll?|q|L|j|z|Z|t)?[diouxXeEfFgGaAcsCSpnm%]?/,
    template_string: $ => seq(
      '@"',
      repeat(choice(token(prec(2, /([^$"]+|\\")+/)), $.template_string_expression, '$$')),
      token(prec(2, '"'))
    ),
    template_string_expression: $ => choice(
      seq('$(', $._expression, ')'),
      seq('$', $.identifier)
    ),
    verbatim_string: $ => seq(
      '"""',
      repeat(choice(token(prec(2, /[^"]+/)), token(prec(1, '"')))),
      token(prec(2, '"""'))
    ),
    verbatim_template_string: $ => seq(
      '@"""',
      repeat(choice(
        token(prec(2, /([^$"]+|\\")+/)),
        token(prec(1, '"')),
        $.template_string_expression,
        '$$'
      )),
      token(prec(2, '"""'))
    ),

    literal: $ => choice(
        $.boolean,
        $.null,
        $.character,
        $.integer,
        $.real,
        $.regex,
        $.string,
        $.template_string,
        $.verbatim_string,
        $.verbatim_template_string
    ),

    type: $ => choice(
      seq(
        optional('dynamic'),
        optional(choice('unowned', 'owned', 'weak')),
        'var',
        optional('?')
      ),
      seq('void', repeat('*'), repeat($.array_type)),
      seq(
        optional('dynamic'),
        optional(choice('unowned', 'owned', 'weak')),
        '(',
        $.type,
        ')',
        repeat1($.array_type)
      ),
      seq(
        optional('dynamic'),
        optional(choice('unowned', 'owned', 'weak')),
        $.symbol,
        optional($.type_arguments),
        repeat('*'),
        optional('?'),
        repeat($.array_type)
      )
    ),

    unqualified_type: $ => seq(
      $.symbol,
      optional($.type_arguments)
    ),

    type_arguments: $ => seq(
      '<',
      $.type,
      repeat(seq(',', $.type)),
      '>'
    ),

    array_type: $ => seq(
      '[',
      optional($.array_size),
      optional(seq(':', $.type)),
      ']',
      optional('?')
    ),

    array_size: $ => seq(
      choice($._expression, ','),
      repeat(seq(',', optional($._expression)))
    ),

    member_declaration_modifier: $ => choice(
      'async',
      'class',
      'extern',
      'inline',
      'static',
      'abstract',
      'virtual',
      'override',
      'new',
      'volatile'
    ),

    access_modifier: $ => choice(
      'private',
      'protected',
      'internal',
      'public'
    ),

    namespace_declaration: $ => seq(
      'namespace',
      $.symbol,
      '{',
      repeat(choice($.using_directive, $.namespace_member, $._preprocessor_statement)),
      '}'
    ),

    type_declaration_modifier: $ => choice(
      'partial',
      'abstract',
      'extern',
      'static',
      'sealed'
    ),

    class_declaration: $ => seq(
      optional($.access_modifier),
      repeat($.type_declaration_modifier),
      'class',
      $.unqualified_type,
      optional(seq(':', $.type, repeat(seq(',', $.type)))),
      '{',
      repeat(choice($.class_member, $._preprocessor_statement, $.conditional_class_separator)),
      '}'
    ),

    class_member: $ => seq(
      repeat($._attribute_list),
      choice(
        $.class_declaration,
        $.interface_declaration,
        $.struct_declaration,
        $.enum_declaration,
        $.delegate_declaration,
        $.method_declaration,
        $.creation_method_declaration,
        $.signal_declaration,
        $.field_declaration,
        $.constant_declaration,
        $.property_declaration,
        $.constructor_declaration,
        $.destructor_declaration
      ),
    ),

    interface_declaration: $ => seq(
      optional($.access_modifier),
      repeat($.type_declaration_modifier),
      'interface',
      $.unqualified_type,
      optional(seq(':', $.type, repeat(seq(',', $.type)))),
      '{',
      repeat($.interface_member),
      '}'
    ),

    interface_member: $ => seq(
      repeat($._attribute_list),
      choice(
        $.class_declaration,
        $.interface_declaration,
        $.struct_declaration,
        $.enum_declaration,
        $.delegate_declaration,
        $.method_declaration,
        $.signal_declaration,
        $.field_declaration,
        $.constant_declaration,
        $.property_declaration
      )
    ),

    struct_declaration: $ => seq(
      optional($.access_modifier),
      repeat($.type_declaration_modifier),
      'struct',
      $.unqualified_type,
      optional(seq(':', $.type, repeat(seq(',', $.type)))),
      '{',
      repeat($.struct_member),
      '}'
    ),

    struct_member: $ => seq(
      repeat($._attribute_list),
      choice(
        $.method_declaration,
        $.creation_method_declaration,
        $.field_declaration,
        $.constant_declaration,
        $.property_declaration
      )
    ),

    enum_declaration: $ => seq(
      optional($.access_modifier),
      repeat($.type_declaration_modifier),
      'enum',
      $.symbol,
      '{',
      $.enum_value,
      repeat(seq(',', $.enum_value)),
      optional(choice(
        ',',    // support trailing ','
        seq(';', repeat(seq(
          repeat($._attribute_list),
          choice($.method_declaration, $.constant_declaration)
        )))
      )),
      '}'
    ),

    enum_value: $ => seq(
      repeat($._attribute_list),
      $.identifier,
      optional(seq('=', $._expression))
    ),

    errordomain_declaration: $ => seq(
      optional($.access_modifier),
      repeat($.type_declaration_modifier),
      'errordomain',
      $.symbol,
      '{',
      choice(
        seq(
          $.errorcode,
          repeat(seq(',', $.errorcode)),
          optional(choice(
            ',',
            seq(';', repeat(seq(repeat($._attribute_list), $.method_declaration)))
          ))
        ),
        repeat1(seq(repeat($._attribute_list), $.method_declaration))
      ),
      '}'
    ),

    errorcode: $ => seq(
      repeat($._attribute_list),
      $.identifier,
      optional(seq('=', $._expression))
    ),

    parameter: $ => seq(
      repeat($._attribute_list),
      choice(
        seq(
          optional('params'),
          optional(choice('out', 'ref')),
          $.type,
          $.identifier,
          optional($.inline_array_type),
          optional(seq('=', $._expression))
        ),
        '...'
      )
    ),

    creation_method_declaration: $ => seq(
      optional($.access_modifier),
      repeat($.member_declaration_modifier),
      $.symbol,
      '(',
      optional(seq($.parameter, repeat(seq(',', $.parameter)))),
      ')',
      optional(seq('throws', $.type)),
      optional(seq(choice('requires', 'ensures'), '(', $._expression, ')')),
      repeat(seq('requires', '(', $._expression, ')')),
      repeat(seq('ensures', '(', $._expression, ')')),
      choice($.block, ';')
    ),


    delegate_declaration_modifier: $ => choice(
      'async',
      'class',
      'extern',
      'inline',
      'abstract',
      'virtual',
      'override',
      'static'
    ),

    delegate_declaration: $ => seq(
      optional($.access_modifier),
      repeat($.delegate_declaration_modifier),
      'delegate',
      $.type,
      $.symbol,
      optional($.type_arguments),
      '(',
      optional(seq($.parameter, repeat(seq(',', $.parameter)))),
      ')',
      optional(seq('throws', $.type, repeat(seq(',', $.type)))),
      ';'
    ),

    method_declaration: $ => seq(
      optional($.access_modifier),
      repeat($.member_declaration_modifier),
      $.type,
      $.symbol,
      optional($.type_arguments),
      '(',
      optional(seq($.parameter, repeat(seq(',', $.parameter)))),
      ')',
      optional(seq('throws', $.type, repeat(seq(',', $.type)))),
      repeat(choice(
        seq('requires', '(', $._expression, ')'),
        seq('ensures', '(', $._expression, ')')
      )),
      choice($.block, ';')
    ),

    signal_declaration_modifier: $ => choice(
      'async',
      'extern',
      'inline',
      'abstract',
      'virtual',
      'override',
      'new'
    ),

    signal_declaration: $ => seq(
      optional($.access_modifier),
      repeat($.signal_declaration_modifier),
      'signal',
      $.type,
      $.symbol,
      '(',
      optional(seq($.parameter, repeat(seq(',', $.parameter)))),
      ')',
      choice($.block, ';')
    ),

    field_declaration: $ => seq(
      optional($.access_modifier),
      repeat($.member_declaration_modifier),
      $.type,
      choice($.identifier, $.cname_identifier),
      optional($.inline_array_type),
      optional(seq('=', $._expression)),
      ';'
    ),

    cname_identifier: $ => token(prec(1, /[0-9]+[A-Za-z_]\w*/)),

    constant_declaration: $ => seq(
      optional($.access_modifier),
      repeat($.member_declaration_modifier),
      'const',
      $.type,
      $.identifier,
      optional($.inline_array_type),
      optional(seq('=', $._expression)),
      ';'
    ),

    inline_array_type: $ => seq(
      '[',
      optional($.array_size),
      optional(seq(':', $.type)),
      ']'
    ),
    
    property_declaration: $ => seq(
      optional($.access_modifier),
      repeat($.member_declaration_modifier),
      $.type,
      $.symbol,
      optional(seq('throws', $.type, repeat(seq(',', $.type)))),
      '{',
      choice($.property_default, $.property_accessor),
      repeat(choice($.property_default, $.property_accessor)),
      '}'
    ),

    property_default: $ => seq('default', '=', $._expression, ';'),

    property_accessor: $ => seq(
      repeat($._attribute_list),
      optional($.access_modifier),
      choice(
        seq(optional(choice('owned', 'unowned')), 'get'),
        seq(optional('owned'), 'set', optional('construct')),
        seq('construct', optional('set'))
      ),
      choice(';', $.block)
    ),

    constructor_declaration_modifier: $ => choice(
      'async',
      'class',
      'extern',
      'inline',
      'static',
      'abstract',
      'virtual',
      'override'
    ),

    constructor_declaration: $ => seq(
      repeat($.constructor_declaration_modifier),
      'construct',
      $.block
    ),

    destructor_declaration: $ => seq(
      repeat($.constructor_declaration_modifier),
      '~',
      $.identifier,
      '(', ')',
      $.block
    ),

    local_declaration: $ => seq(
      $.type,
      choice(
        seq($.assignment, repeat(seq(',', $.assignment))),
        seq($.tuple_expression, '=', $._expression)
      ),
      ';'
    ),

    local_function_declaration: $ => seq(
        optional('static'),
        $.type,
        $.identifier,
        '(',
        optional(seq($.parameter, repeat(seq(',', $.parameter)))),
        ')',
        $.block
    ),

    assignment: $ => prec.dynamic(20, seq(
      $.identifier,
      optional($.inline_array_type),
      optional(seq('=', $._expression))
    )),

    block: $ => seq(
      '{',
      repeat(choice(
        $._statement,
        $.local_declaration,
        $.local_function_declaration,
        $.constant_declaration,
        $._preprocessor_statement,
        $.conditional_if_separator
      )),
      '}'
    ),

    _statement: $ => choice(
      $.if_statement,
      $._statement_without_if
    ),

    // resolves ambiguities with 'else if'
    _statement_without_if: $ => choice(
      $.block,
      $.empty_statement,
      $.expression_statement,
      $.return_statement,
      $.try_statement,
      $.while_statement,
      $.do_statement,
      $.for_statement,
      $.foreach_statement,
      $.break_statement,
      $.continue_statement,
      $.lock_statement,
      $.unlock_statement,
      $.delete_statement,
      $.throw_statement,
      $.yield_statement,
      $.switch_statement,
      $.with_statement
    ),

    empty_statement: $ => ';',

    expression_statement: $ => seq($._expression, ';'),

    return_statement: $ => seq('return', optional($._expression), ';'),

    if_statement: $ => seq(
      'if', '(', $._expression, ')',
      repeat($._preprocessor_statement),
      $._statement,
      repeat($.elseif_statement),
      optional($.else_statement)
    ),

    elseif_statement: $ => seq(
      'else', 'if', '(', $._expression, ')',
      $._statement
    ),

    else_statement: $ => choice(
      seq('else', $._statement_without_if),
      seq($.conditional_else_endif, $._statement)
    ),

    conditional_else_endif: $ => token(prec(2, /else\s*#[\t ]*endif/)),

    try_statement: $ => seq(
      'try',
      $.block,
      repeat($.catch_clause),
      optional($.finally_clause)
    ),

    catch_clause: $ => seq(
      'catch',
      optional(seq('(', $.type, $.identifier, ')')),
      $.block
    ),

    finally_clause: $ => seq(
      'finally', $.block
    ),

    while_statement: $ => seq(
      'while',
      '(',
      $._expression,
      ')',
      $._statement
    ),

    do_statement: $ => seq(
      'do',
      $._statement,
      'while',
      '(', $._expression, ')',
      ';'
    ),

    for_statement: $ => seq(
      'for',
      '(',
      optional(choice($.local_declaration, seq($._expression, ';'), ';')),
      optional($._expression),
      ';',
      optional(seq($._expression, repeat(seq(',', $._expression)))),
      ')',
      $._statement
    ),

    foreach_statement: $ => seq(
      'foreach',
      '(',
      $.type,
      $.identifier,
      'in',
      $._expression,
      ')',
      $._statement
    ),

    break_statement: $ => seq('break', ';'),

    continue_statement: $ => seq('continue', ';'),

    lock_statement: $ => seq(
      'lock', '(', $._expression, ')',
      choice($._statement, ';')
    ),

    unlock_statement: $ => prec(1, seq(
      'unlock', '(', $._expression, ')', ';'
    )),

    delete_statement: $ => seq(
      'delete', $._expression, ';'
    ),

    throw_statement: $ => seq(
      'throw', $._expression, ';'
    ),

    yield_statement: $ => seq(
      'yield',
      optional(seq('return', $._expression)),
      ';'
    ),

    switch_statement: $ => seq(
      'switch', '(', $._expression, ')',
      '{',
      repeat(choice($.switch_section, $._preprocessor_statement)),
      '}'
    ),

    switch_section: $ => seq(
      choice(
        seq('case', $._expression, repeat(seq(',', $._expression))),
        'default'
      ),
      ':',
      repeat(choice($._statement, $.local_declaration, $.constant_declaration, $._preprocessor_statement))
    ),

    with_statement: $ => seq(
      'with', '(',
      choice($._expression, seq($.type, $.assignment)),
      ')',
      $._statement
    ),

    // --- preprocessor

    _preprocessor_directive_start: $ => /#[\t ]*/,

    _preprocessor_statement: $ => seq(
      $._preprocessor_directive_start,
      choice(
        $.if_directive,
        $.elif_directive,
        $.else_directive,
        $.endif_directive
      )
    ),

    if_directive: $ => seq('if', field('expression', $._preprocessor_expression)),

    elif_directive: $ => seq('elif', field('expression', $._preprocessor_expression)),

    else_directive: $ => 'else',

    endif_directive: $ => 'endif',

    _preprocessor_expression: $ => choice(
      seq('(', $._preprocessor_expression, ')'),
      $.identifier,
      $.literal,
      prec.right(4, seq('!', $._preprocessor_expression)),
      prec.left(3, seq($._preprocessor_expression, choice('==', '!='), $._preprocessor_expression)),
      prec.left(2, seq($._preprocessor_expression, '&&', $._preprocessor_expression)),
      prec.left(1, seq($._preprocessor_expression, '||', $._preprocessor_expression))
    )
  },

  conflicts: $ => [
    [$.member_declaration_modifier, $.class_declaration],               // because both can start with 'class'
    [$.member_declaration_modifier, $.signal_declaration_modifier],     // both can start with 'new'
    [$.member_declaration_modifier, $.delegate_declaration_modifier],   // both can start with 'new'
    [$.member_declaration_modifier, $.delegate_declaration_modifier, $.signal_declaration_modifier],
    [$.member_declaration_modifier, $.type_declaration_modifier, $.delegate_declaration_modifier],
    [$.member_declaration_modifier, $.type_declaration_modifier, $.delegate_declaration_modifier, $.signal_declaration_modifier],
    [$.member_declaration_modifier, $.delegate_declaration_modifier, $.signal_declaration_modifier, $.constructor_declaration_modifier],
    [$.member_declaration_modifier, $.type_declaration_modifier, $.delegate_declaration_modifier, $.constructor_declaration_modifier],
    [$.member_declaration_modifier, $.type_declaration_modifier, $.delegate_declaration_modifier, $.signal_declaration_modifier, $.constructor_declaration_modifier],
    [$.array_creation_expression,
     $.object_creation_expression,
     $.member_declaration_modifier],                                    // because these all start with 'new'
    [$.member_declaration_modifier,
     $.delegate_declaration_modifier,
     $.constructor_declaration_modifier],                               // these all start with 'class'
    [$.symbol, $.member_access_expression],                             // disambiguate member access and static cast expressions
    [$.symbol, $.member_access_expression, $.lambda_parameter],         // tuple expressions and lambda parameter lists
    [$.member_access_expression, $.lambda_parameter],
    [$.type],                                                           // disambiguate between 'X as <type *> ...'  and '(X as <type>)* ...'
    [$.array_type],                                                     // when 'X[]? ...' could also be '(X[]) ? ...'
    [$.symbol, $.type],                                                 // for object creation expression
    [$.symbol, $.type, $.unqualified_type],                              // generic static member access
    [$.type, $.unqualified_type],
    [$._expression, $.method_call_expression],                          // 'X <' may be start of comparison or method call
    [$._contained_expression, $.method_call_expression],                // for ambiguity because of contained expressions
    [$._expression, $.element_access_expression],                       // because EAEs have a prefix that is a member access
    [$.element_access_expression],                                      // for ambiguity because of contained expressions
    [$.initializer, $.block],                                           // because {} is ambiguous in statement-expression contexts
    [$.if_statement],                                                   // because of ambiguity with nested if statements
    [$.switch_section],
    [$._expression, $._left_contained_expression],
    [$._expression, $._left_contained_expression, $.element_access_expression],
    [$.array_creation_expression],
    [$.lambda_parameter],
    [$.member_access_expression],
    [$.tuple_expression, $.object_creation_expression],
    [$.tuple_expression, $.argument],
    [$._left_contained_expression, $.method_call_expression],
    [$.empty_statement, $.lock_statement],
    [$.object_creation_expression],
    [$.creation_method_declaration],
    [$.identifier, $.if_statement],
    [$.identifier, $.switch_statement],
    [$.identifier, $.while_statement],
    [$.identifier, $.do_statement],
    [$.identifier, $.for_statement],
    [$.identifier, $.foreach_statement],
    [$.identifier, $.return_statement],
    [$.identifier, $.throw_statement],
    [$.identifier, $.lock_statement],
    [$.identifier, $.delete_statement],
    [$.identifier, $.with_statement],
    [$.identifier, $.lambda_parameter],
    [$.identifier, $.yield_statement],
    [$.identifier, $.argument, $.lambda_parameter],
    [$.identifier, $.argument],
    [$.identifier, $.value_access],
    [$.identifier, $.parameter],
    [$.identifier, $.elseif_statement]
  ],

  extras: $ => [
    /\s|\\\r?\n/,
    $.comment
  ],
});
