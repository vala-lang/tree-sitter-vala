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

    symbol: $ => seq(optional('global::'), $.identifier, repeat(seq('.', $.identifier))),

    identifier: $ => /@?[A-Za-z_]\w*/,

    namespace_member: $ => seq(
      repeat($.attribute),
      choice(
        $.namespace_declaration,
        $.class_declaration,
        $.method_declaration,
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
        $.literal,
        seq('(', $._expression, ')'),
        $.object_creation_expression,
        $.this_access,
        $.initializer,
        // --- expressions that have a precedence
        $.member_access_expression,
        $.method_call_expression,
        $.postfix_expression,
        $.static_cast_expression,
        $.typeof_expression,
        $.sizeof_expression,
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

    member_access_expression: $ => prec.right(
      seq(
        optional(seq(
          choice(
            $.this_access,
            $.member_access_expression,
            seq('(', $._expression, ')')
          ),
          choice('.', '?.', '->'),
        )),
        $.identifier
      ),
    ),

    argument: $ => choice(
      seq('ref', $._expression),
      seq('out', $._expression),
      $._expression,
      seq($.identifier, ':', $._expression)
    ),

    method_call_expression: $ => prec.right(15,
      seq(
        choice(
          seq('(', $._expression, ')'),
          seq($.member_access_expression, optional($.type_arguments))
        ),
        '(',
        optional(seq($.argument, repeat(seq(',', $.argument)))),
        ')'
      )
    ),

    postfix_expression: $ => prec.left(14, seq($._expression, choice('++', '--'))),
    static_cast_expression: $ => prec.right(13, seq('(', choice($.type, '!'), ')', $._expression)),
    typeof_expression: $ => prec.right(13, seq('typeof', '(', $.type, ')')),
    sizeof_expression: $ => prec.right(13, seq('sizeof', '(', $.type, ')')),
    unary_expression: $ => prec.right(13, seq(choice('!', '~', '++', '--', '-', '*', '&'), $._expression)),
    multiplicative_expression: $ => prec.left(12, seq($._expression, choice('*', '/', '%'), $._expression)),
    arithmetic_expression: $ => prec.left(11, seq($._expression, choice('+', '-'), $._expression)),
    bitshift_expression: $ => prec.left(10, seq($._expression, choice('<<', '>>'), $._expression)),
    in_expression: $ => prec.left(9, seq($._expression, optional('not'), 'in', $._expression)),
    dynamic_cast_expression: $ => prec.left(9, seq($._expression, 'as', $.type)),
    type_relational_expression: $ => prec.left(9, seq($._expression, 'is', $.type)),
    relational_expression: $ => prec.left(9, seq($._expression, choice('<', '<=', '>=', '>'), $._expression)),
    equality_expression: $ => prec.left(8, seq($._expression, choice('==', '!='), $._expression)),
    bitwise_and_expression: $ => prec.left(7, seq($._expression, '&', $._expression)),
    bitwise_xor_expression: $ => prec.left(6, seq($._expression, '^', $._expression)),
    bitwise_or_expression: $ => prec.left(5, seq($._expression, '|', $._expression)),
    logical_and_expression: $ => prec.left(4, seq($._expression, '&&', $._expression)),
    logical_or_expression: $ => prec.left(3, seq($._expression, '||', $._expression)),
    null_coalescing_expression: $ => prec.left(2, seq($._expression, '??', $._expression)),
    ternary_expression: $ => prec.right(1, seq($._expression, '?', $._expression, ':', $._expression)),

    _assignment_operator: $ => choice('=', '+=', '-=', '|=', '&=', '^=', '/=', '*=', '%=', '<<=', '>>='),
    assignment_expression: $ => prec.right(0, seq($._expression, $._assignment_operator, $._expression)),

    this_access: $ => 'this',

    oce_type: $ => seq(
      $.symbol,
      optional($.type_arguments),
    ),

    object_creation_expression: $ => seq(
      'new',
      $.oce_type,
      '(',
      optional(seq($.argument, repeat(seq(',', $.argument)))),
      ')'
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

    type: $ => prec.right(
      choice(
        seq('void', repeat('*')),
        seq(
          optional('dynamic'),
          optional('unowned'),
          optional('weak'),
          '(',
          $.type,
          ')',
          repeat1($.array_type)
        ),
        seq(
          optional('dynamic'),
          optional('unowned'),
          optional('weak'),
          $.symbol,
          optional($.type_arguments),
          optional('*'),
          optional('?'),
          repeat($.array_type)
        )
      )
    ),

    type_arguments: $ => seq(
      '<',
      $.type,
      repeat(seq(',', $.type)),
      '>'
    ),

    array_type: $ => prec.right(
      seq(
        '[',
        optional($.array_size),
        ']',
        optional('?')
      )
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
      optional(seq($.type_declaration_modifier, repeat(seq(',', $.type_declaration_modifier)))),
      'class',
      $.type,
      optional(seq(':', $.type, repeat(seq(',', $.type)))),
      '{',
      repeat($.class_member),
      '}'
    ),

    class_member: $ => seq(
      repeat($.attribute),
      choice(
        $.class_declaration,
        $.method_declaration,
        $.creation_method_declaration,
        $.field_declaration,
        $.constant_declaration,
        $.property_declaration
      ),
    ),

    parameter: $ => seq(
      optional(choice('out', 'ref')),
      $.type,
      $.identifier,
      optional(seq('=', $._expression))
    ),

    creation_method_declaration: $ => seq(
      optional($.access_modifier),
      optional(seq($.member_declaration_modifier, repeat(seq(',', $.member_declaration_modifier)))),
      $.symbol,
      '(',
      optional(seq($.parameter, repeat(seq(',', $.parameter)))),
      ')',
      optional(seq('throws', $.type)),
      optional(seq(choice('requires', 'ensures'), '(', $._expression, ')')),
      choice($.block, ';')
    ),

    method_declaration: $ => seq(
      optional($.access_modifier),
      optional(seq($.member_declaration_modifier, repeat(seq(',', $.member_declaration_modifier)))),
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

    field_declaration: $ => seq(
      optional($.access_modifier),
      optional(seq($.member_declaration_modifier, repeat(seq(',', $.member_declaration_modifier)))),
      $.type,
      $.identifier,
      optional(seq('=', $._expression)),
      ';'
    ),

    constant_declaration: $ => seq(
      optional($.access_modifier),
      optional(seq($.member_declaration_modifier, repeat(seq(',', $.member_declaration_modifier)))),
      'const',
      $.type,
      $.identifier,
      optional($.inline_array_type),
      optional(seq('=', $._expression)),
      ';'
    ),

    inline_array_type: $ => seq('[', $.integer, ']'),
    
    property_declaration: $ => seq(
      optional($.access_modifier),
      optional(seq($.member_declaration_modifier, repeat(seq(',', $.member_declaration_modifier)))),
      $.type,
      $.symbol,
      '{',
      repeat(choice(seq('default', '=', $._expression), $.property_accessor)),
      '}'
    ),

    property_accessor: $ => seq(
      repeat($.attribute),
      optional($.access_modifier),
      choice('get', seq('set', optional('construct')), seq('construct', 'set')),
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
      $.block,
      ';',
      seq($._expression, ';'),
      $.return_statement,
      $.if_statement
      // TODO - for, while, foreach, return, try
    ),

    return_statement: $ => seq('return', optional($._expression), ';'),

    if_statement: $ => seq(
      'if', '(', $._expression, ')',
      choice(
        seq($._expression, ';'),
        $.block
      ),
      repeat($.elseif_statement),
      optional($.else_statement)
    ),

    elseif_statement: $ => seq(
      'else', 'if', '(', $._expression, ')',
      choice(
        seq($._expression, ';'),
        $.block
      )
    ),

    else_statement: $ => seq(
      'else',
      choice(
        seq($._expression, ';'),
        $.block
      )
    )
  },

  conflicts: $ => [
    [$.member_declaration_modifier, $.class_declaration],               // because both can start with 'class'
    [$.member_declaration_modifier, $.type_declaration_modifier],       // because both share 'extern'
    [$.member_declaration_modifier, $.object_creation_expression],      // because OCEs can appear in the main block
    [$.symbol, $.member_access_expression],                             // disambiguate member access and static cast expressions
    [$.initializer, $.block],                                           // because {} is ambiguous in statement-expression contexts
  ],

  extras: $ => [
    /\s|\\\r?\n/,
    $.comment,
  ],
});
