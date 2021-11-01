module.exports = grammar({
  name: 'vala',

  word: $ => $.identifier,

  rules: {
    source_file: $ => seq(repeat($.using_directive), repeat(choice($.namespace_member, $._statement))),

    // taken from tree-sitter-c
    // http://stackoverflow.com/questions/13014947/regex-to-match-a-c-style-multiline-comment/36328890#36328890
    comment: $ => token(choice(
      seq('//', /(\\(.|\r?\n)|[^\\\n])*/),
      seq(
        '/*',
        /[^*]*\*+([^/*][^*]*\*+)*/,
        '/'
      )
    )),

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

    identifier: $ => /[@A-Za-z_]\w*/,

    namespace_member: $ => seq(
      repeat($.attribute),
      choice(
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
      )
    ),

    attribute: $ => seq(
      '[',
      $.identifier,
      optional(seq('(', $.attribute_argument, repeat(seq(',', $.attribute_argument)), ')')),
      ']'
    ),

    attribute_argument: $ => seq(
      $.identifier,
      '=',
      $._expression
    ),

    _expression: $ => choice(
        seq('(', $._expression, ')'),
        $._contained_expression,
        $.initializer,
        $.yield_expression,
        $.lambda_expression,
        $.static_cast_expression,
        $.unary_expression,
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
        $.literal,
        $.array_creation_expression,
        $.object_creation_expression,
        $.this_access,
        $.base_access,
        $.member_access_expression,
        $.element_access_expression,
        $.method_call_expression,
        $.sizeof_expression,
        $.typeof_expression,
        $.postfix_expression,
    ),

    member_access_expression: $ => seq(
      optional(seq(
        choice(
          $._contained_expression,
          seq('(', $._expression, ')')
        ),
        choice('.', '?.', '->'),
      )),
      $.identifier
    ),

    element_access_expression: $ => seq(
      choice(
        $._contained_expression,
        seq('(', $._expression, ')'),
      ),
      repeat1($.element_access)
    ),

    element_access: $ => seq(
      '[',
      $._expression,
      repeat(seq(',', $._expression)),
      ']'
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
        $.identifier,
        seq('(', $.identifier, repeat(seq(',', $.identifier)), ')')
      ),
      '=>',
      choice($._expression, $.block)
    ),

    postfix_expression: $ => prec.left(15, seq($._expression, choice('++', '--'))),
    static_cast_expression: $ => prec.right(14, seq('(', choice($.type, '!'), ')', $._expression)),
    typeof_expression: $ => prec.right(14, seq('typeof', '(', $.type, ')')),
    sizeof_expression: $ => prec.right(14, seq('sizeof', '(', $.type, ')')),
    unary_expression: $ => prec.right(14, seq(choice('!', '~', '++', '--', '-', '*', '&'), $._expression)),
    multiplicative_expression: $ => prec.left(13, seq($._expression, choice('*', '/', '%'), $._expression)),
    arithmetic_expression: $ => prec.left(12, seq($._expression, choice('+', '-'), $._expression)),
    bitshift_expression: $ => prec.left(11, seq($._expression, choice('<<', '>>'), $._expression)),
    in_expression: $ => prec.left(10, seq($._expression, optional('not'), 'in', $._expression)),
    dynamic_cast_expression: $ => prec.left(10, seq($._expression, 'as', $.type)),
    type_relational_expression: $ => prec.left(10, seq($._expression, 'is', $.type)),
    relational_expression: $ => prec.left(10, seq($._expression, choice('<', '<=', '>=', '>'), $._expression)),
    equality_expression: $ => prec.left(9, seq($._expression, choice('==', '!='), $._expression)),
    bitwise_and_expression: $ => prec.left(8, seq($._expression, '&', $._expression)),
    bitwise_xor_expression: $ => prec.left(7, seq($._expression, '^', $._expression)),
    bitwise_or_expression: $ => prec.left(6, seq($._expression, '|', $._expression)),
    logical_and_expression: $ => prec.left(5, seq($._expression, '&&', $._expression)),
    logical_or_expression: $ => prec.left(4, seq($._expression, '||', $._expression)),
    null_coalescing_expression: $ => prec.left(3, seq($._expression, '??', $._expression)),
    ternary_expression: $ => prec.right(2, seq($._expression, '?', $._expression, ':', $._expression)),

    _assignment_operator: $ => choice('=', '+=', '-=', '|=', '&=', '^=', '/=', '*=', '%=', '<<=', '>>='),
    assignment_expression: $ => prec.right(1, seq($._expression, $._assignment_operator, $._expression)),

    this_access: $ => 'this',

    base_access: $ => 'base',

    array_creation_expression: $ => seq(
      'new',
      $.type,
      $.inline_array_type,
      $.initializer
    ),

    object_creation_expression: $ => seq(
      'new',
      $.unqualified_type,
      '(',
      optional(seq($.argument, repeat(seq(',', $.argument)))),
      ')',
      optional($.object_initializers)
    ),

    object_initializers: $ => seq(
      '{',
      optional(seq($.member_initializer, repeat(seq(',', $.member_initializer)))),
      '}'
    ),

    member_initializer: $ => seq(
      $.identifier,
      '=',
      $._expression
    ),

    initializer: $ => seq(
      '{',
      optional(seq($.argument, repeat(seq(',', $.argument)))),
      '}'
    ),

    boolean: $ => choice('true', 'false'),
    character: $ => /'\S'/,
    integer: $ => choice(/[1-9]\d*|0[0-7]*/, /0[xX][A-Fa-f0-9]+/),
    null: $ => 'null',
    real: $ => /\d+(\.\d+)?([eE][+-]?\d+)?/,
    regex: $ => /\/([^\\\/\n]|\\[\\\/A-z0|\[\]^$?.(){}+\-*])+\/[gmxsu]*/,
    string: $ => /"([^"]+|\\")*"/,
    template_string: $ => seq(
      '@"',
      repeat(choice(/([^$"]+|\\")+/, $.template_string_expression)),
      '"'
    ),
    template_string_expression: $ => choice(
      seq('$(', $._expression, ')'),
      seq('$', $.identifier)
    ),
    verbatim_string: $=> /"""(.|\n)*"""/,

    literal: $ => choice(
        $.boolean,
        $.null,
        $.character,
        $.integer,
        $.real,
        $.regex,
        $.string,
        $.template_string,
        $.verbatim_string
    ),

    type: $ => choice(
      'var',
      seq('void', repeat('*')),
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
        optional('*'),
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
      ']',
      optional('?')
    ),

    array_size: $ => seq(
      $._expression,
      repeat(seq(',', $._expression))
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
      'new'
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
      repeat($.using_directive),
      repeat($.namespace_member),
      '}'
    ),

    type_declaration_modifier: $ => choice(
      'abstract',
      'extern',
      'static'
    ),

    class_declaration: $ => seq(
      optional($.access_modifier),
      repeat($.type_declaration_modifier),
      'class',
      $.unqualified_type,
      optional(seq(':', $.type, repeat(seq(',', $.type)))),
      '{',
      repeat($.class_member),
      '}'
    ),

    class_member: $ => seq(
      repeat($.attribute),
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
        $.property_declaration
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
      repeat($.attribute),
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
      repeat($.attribute),
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
          repeat($.attribute),
          choice($.method_declaration, $.constant_declaration)
        )))
      )),
      '}'
    ),

    enum_value: $ => seq(
      repeat($.attribute),
      $.identifier,
      optional(seq('=', $._expression))
    ),

    errordomain_declaration: $ => seq(
      optional($.access_modifier),
      repeat($.type_declaration_modifier),
      'errordomain',
      $.symbol,
      '{',
      $.errorcode,
      repeat(seq(',', $.errorcode)),
      optional(choice(
        ',',    // support trailing ','
        seq(';', repeat($.method_declaration))
      )),
      '}'
    ),

    errorcode: $ => seq(
      repeat($.attribute),
      $.identifier,
      optional(seq('=', $._expression))
    ),

    parameter: $ => seq(
      repeat($.attribute),
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
      choice($.block, ';')
    ),

    delegate_declaration_modifier: $ => seq(
      'async',
      'class',
      'extern',
      'inline',
      'abstract',
      'virtual',
      'override'
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
      optional(seq('throws', $.type)),
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
      optional(seq('throws', $.type)),
      optional(seq(choice('requires', 'ensures'), '(', $._expression, ')')),
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
      $.identifier,
      optional($.inline_array_type),
      optional(seq('=', $._expression)),
      ';'
    ),

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

    inline_array_type: $ => seq('[', optional($.integer), ']'),
    
    property_declaration: $ => seq(
      optional($.access_modifier),
      repeat($.member_declaration_modifier),
      $.type,
      $.symbol,
      '{',
      repeat(choice(seq('default', '=', $._expression, ';'), $.property_accessor)),
      '}'
    ),

    property_accessor: $ => seq(
      repeat($.attribute),
      optional($.access_modifier),
      choice(
        seq(optional('owned'), 'get'),
        seq(optional('owned'), 'set', optional('construct')),
        seq('construct', optional('set'))
      ),
      choice(';', $.block)
    ),

    local_declaration: $ => seq(
      $.type,
      $.identifier,
      optional($.inline_array_type),
      optional(seq('=', $._expression)),
      ';'
    ),

    block: $ => seq('{', repeat(choice($._statement, $.local_declaration)), '}'),

    _statement: $ => choice(
      $.if_statement,
      $._statement_without_if
    ),

    // resolves ambiguities with 'else if'
    _statement_without_if: $ => choice(
      $.block,
      ';',
      seq($._expression, ';'),
      $.return_statement,
      $.try_statement,
      $.while_statement,
      $.do_statement,
      $.for_statement,
      $.foreach_statement,
      $.break_statement,
      $.continue_statement,
      $.lock_statement,
      $.delete_statement,
      $.throw_statement,
      $.yield_statement,
      $.switch_statement
    ),

    return_statement: $ => seq('return', optional($._expression), ';'),

    if_statement: $ => seq(
      'if', '(', $._expression, ')',
      $._statement,
      repeat($.elseif_statement),
      optional($.else_statement)
    ),

    elseif_statement: $ => seq(
      'else', 'if', '(', $._expression, ')',
      $._statement
    ),

    else_statement: $ => seq(
      'else',
      $._statement_without_if
    ),

    try_statement: $ => seq(
      'try',
      $.block,
      repeat($.catch_clause),
      optional($.finally_clause)
    ),

    catch_clause: $ => seq(
      'catch', '(', $.type, $.identifier, ')',
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
      choice(
        $.local_declaration,
        seq($._expression, ';')
      ),
      $._expression,
      ';',
      $._expression,
      repeat(seq(',', $._expression)),
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
      $._statement
    ),

    delete_statement: $ => seq(
      'delete', $._expression, ';'
    ),

    throw_statement: $ => seq(
      'throw', $._expression, ';'
    ),

    yield_statement: $ => seq(
      'yield', 'return', $._expression, ';'
    ),

    switch_statement: $ => seq(
      'switch', '(', $._expression, ')',
      '{',
      repeat($.switch_section),
      '}'
    ),

    switch_section: $ => seq(
      choice(
        seq('case', $._expression),
        'default'
      ),
      ':',
      repeat(choice($._statement, $.local_declaration))
    )
  },

  conflicts: $ => [
    [$.member_declaration_modifier, $.class_declaration],               // because both can start with 'class'
    [$.member_declaration_modifier, $.type_declaration_modifier],       // because both share 'extern'
    [$.member_declaration_modifier, $.object_creation_expression],      // because OCEs can appear in the main block
    [$.member_declaration_modifier, $.signal_declaration_modifier],     // both can start with 'new'
    [$.member_declaration_modifier,
     $.type_declaration_modifier,
     $.signal_declaration_modifier],                                    // ambiguity between all three
    [$.member_declaration_modifier, $.delegate_declaration_modifier],   // both can start with 'new'
    [$.array_creation_expression, $.member_declaration_modifier],       // because both can start with 'new ('
    [$.array_creation_expression,
     $.object_creation_expression,
     $.member_declaration_modifier],                                    // because these all start with 'new'
    [$.symbol, $.member_access_expression],                             // disambiguate member access and static cast expressions
    [$.symbol, $.member_access_expression, $.lambda_expression],        // head of lambda expression may be head of symbol or MA
    [$.type],                                                           // disambiguate between 'X as <type *> ...'  and '(X as <type>)* ...'
    [$.array_type],                                                     // when 'X[]? ...' could also be '(X[]) ? ...'
    [$._expression, $.method_call_expression],                          // 'X <' may be start of comparison or method call
    [$._contained_expression, $.method_call_expression],                // for ambiguity because of contained expressions
    [$._expression, $.element_access_expression],                       // because EAEs have a prefix that is a member access
    [$.element_access_expression],                                      // for ambiguity because of contained expressions
    [$.initializer, $.block],                                           // because {} is ambiguous in statement-expression contexts
    [$.if_statement]                                                    // because of ambiguity with nested if statements
  ],

  extras: $ => [
    /\s|\\\r?\n/,
    $.comment,
  ],
});
