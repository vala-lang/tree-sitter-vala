module.exports = grammar({
  name: 'vala',

  rules: {
    source_file: $ => seq(repeat($.using_directive), repeat($.namespace_member)),

    using_directive: $ => seq(
      'using',
      $.symbol,
      repeat(seq(',', $.symbol)),
      ';'
    ),

    symbol: $ => seq(optional('global::'), $.identifier, repeat(seq('.', $.identifier))),

    identifier: $ => /[A-Za-z_]\w*/,

    namespace_member: $ => seq(
      repeat($.attribute),
      choice(
        $.namespace_declaration,
        $.field_declaration
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
      $.expression
    ),

    expression: $ => choice(
        $.assignment_expression,
        $.arithmetic_expression,
        $.literal,
        $.multiplicative_expression,
        $.symbol
    ),

    assignment_operator: $ => choice('=', '+=', '-=', '|=', '&=', '^=', '/=', '*=', '%=', '<<=', '>>='),
    assignment_expression: $ => prec.left(0, seq($.expression, $.assignment_operator, $.expression)),

    arithmetic_expression: $ => prec.left(0, seq($.expression, choice('+', '-'), $.expression)),
    multiplicative_expression: $ => prec.left(1, seq($.expression, choice('*', '/'), $.expression)),

    character: $ => /'\S'/,
    integer: $ => /[1-9]\d*|0[0-7]*/,
    real: $ => /\d+(\.\d+)?([eE][+-]?\d+)?/,
    regex: $ => /\/([^\\\/\n]|\\[\\\/A-z0|\[\]^$?.(){}+\-*])+\/[gmxsu]*/,
    string: $ => /".*"/,
    template_string: $ => seq(
      /@"[^\n]*/,
      repeat(seq(
        optional(seq('$(', $.expression, ')')),
        /[^\n]*/
      )),
      '"'
    ),
    verbatim_string: $=> /"""(.|\n)*"""/,

    literal: $ => choice(
        'true',
        'false',
        'null',
        $.character,
        $.integer,
        $.real,
        $.regex,
        $.string,
        $.template_string,
        $.verbatim_string
    ),

    type: $ =>
      choice(
        seq('void', repeat('*')),
        seq(
          optional('dynamic'),
          optional('unowned'),
          $.symbol,
          optional($.type_arguments),
          optional('*'),
          optional('?'),
          repeat($.array_type)
        )
      ),

    type_weak: $ =>
      choice(
        seq('void', repeat('*')),
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
      ),

    type_arguments: $ => seq(
      '<',
      $.type,
      repeat(seq(',', $.type)),
      '>'
    ),

    array_type: $ =>
      seq(
        '[',
        optional($.array_size),
        ']',
        optional('?')
      ),

    array_size: $ => seq(
      $.expression,
      repeat(seq(',', $.expression))
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

    field_declaration: $ => seq(
      optional($.access_modifier),
      repeat($.member_declaration_modifier),
      $.type_weak,
      $.identifier,
      optional(seq('=', $.expression)),
      ';'
    )
  }
});
