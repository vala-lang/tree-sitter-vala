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

    symbol: $ => prec.left(
      seq(
        $.symbol_part,
        repeat(seq('.', $.symbol_part))
      )
    ),

    symbol_part: $ => choice(
      seq('global::', $.identifier),
      $.identifier
    ),

    identifier: $ => /[A-z]\w*/,

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

    expression: $ => prec.left(
      choice(
        // $.lambda_expression,
        seq(
          $.conditional_expression,
          optional(
            seq(
              $.assignment_operator,
              $.expression
            )
          )
        )
      )
    ),

    assignment_operator: $ => choice('=', '+=', '-=', '|=', '&=', '^=', '/=', '*=', '%=', '<<=', '>>='),

    conditional_expression: $ => prec.right(
      seq(
        $.coalescing_expression,
        optional(
          seq(
            '?',
            $.expression,
            ':',
            $.expression
          )
        )
      )
    ),

    coalescing_expression: $ => prec.right(
      seq(
        $.conditional_or_expression,
        optional(seq(
          '??',
          $.coalescing_expression
        ))
      )
    ),

    conditional_or_expression: $ => prec.left(
      seq(
        $.conditional_and_expression,
        optional(
          seq(
            '||',
            $.conditional_and_expression
          )
        )
      )
    ),

    conditional_and_expression: $ => prec.left(
      seq(
        $.in_expression,
        optional(seq(
          '&&',
          $.in_expression
        ))
      )
    ),

    in_expression: $ => prec.right(
      seq(
        $.inclusive_or_expression,
        optional(seq(
          'in',
          $.inclusive_or_expression
        ))
      )
    ),

    inclusive_or_expression: $ => prec.left(
      seq(
        $.exclusive_or_expression,
        optional(seq(
          '|',
          $.exclusive_or_expression
        ))
      )
    ),

    exclusive_or_expression: $ => prec.left(
      seq(
        $.and_expression,
        optional(seq(
          '^',
          $.and_expression
        ))
      )
    ),

    and_expression: $ => prec.left(
      seq(
        $.equality_expression,
        optional(seq(
          '&',
          $.equality_expression
        ))
      )
    ),

    equality_expression: $ => prec.left(
      seq(
        $.relational_expression,
        repeat(seq(
          choice('==', '!='),
          $.relational_expression
        ))
      )
    ),

    relational_expression: $ => prec.left(
      seq(
        $.shift_expression,
        repeat(choice(
          seq(
            choice('<', '<=', '>', '>='),
            $.shift_expression
          ),
          seq('is', $.type),
          seq('as', $.type)
        ))
      )
    ),

    type: $ => prec.left(
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
      )
    ),

    type_weak: $ => prec.left(
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

    shift_expression: $ => prec.left(
      seq(
        $.additive_expression,
        repeat(seq(
          choice('<<', '>>'),
          $.additive_expression
        ))
      )
    ),

    additive_expression: $ => prec.left(
      seq(
        $.multiplicative_expression,
        repeat(seq(
          choice('+', '-'),
          $.multiplicative_expression
        ))
      )
    ),

    multiplicative_expression: $ => prec.left(
      seq(
        $.unary_expression,
        repeat(seq(
          choice('*', '/', '%'),
          $.unary_expression
        ))
      )
    ),

    unary_expression: $ => prec.right(
      choice(
        seq($.unary_operator, $.unary_expression),
        seq('(', choice('owned', 'void', 'dynamic', '!', 'type'), ')', $.unary_expression),
        $.primary_expression
      )
    ),

    unary_operator: $ => choice( '+', '-', '!', '~', '++', '--', '*', '&', '(owned)', '(void)', '(dynamic)', '(!)'),

    primary_expression: $ => prec.left(
      seq(
        choice(
          $.literal,
          $.initializer,
          $.tuple,
          // $.open_regex_literal,
          $.this_access,
          $.base_access,
          $.object_or_array_creation_expression,
          $.yield_expression,
          $.sizeof_expression,
          $.simple_name
        ),
        repeat(
          choice(
            $.member_access,
            $.pointer_member_access,
            $.method_call,
            $.element_access,
            $.post_increment_expression,
            $.post_decrement_expression
          )
        )
      )
    ),

    literal: $ => choice(
      'true',
      'false',
      'null',
      $.integer_literal,
      $.real_literal,
      $.character_literal,
      $.regex_literal,
      $.string_literal,
      $.template_string_literal,
      $.verbatim_string_literal
    ),

    integer_literal: $ => /[1-9]\d*|0[0-7]*/,

    real_literal: $ => /\d+(\.\d+)?([eE][+-]?\d+)?/,

    character_literal: $ => /'\S'/,

    regex_literal: $ => /\/([^\\\/\n]|\\[\\\/A-z0|\[\]^$?.(){}+\-*])+\/[gmxsu]*/,

    string_literal: $ => /".*"/,

    template_string_literal: $ => seq(
      /@"[^\n]*/,
      repeat(seq(
        optional(seq('$(', $.expression, ')')),
        /[^\n]*/
      )),
      '"'
    ),

    verbatim_string_literal: $ => /"""(.|\n)*"""/,

    initializer: $ => seq(
      '{',
      $.argument,
      repeat(seq(',', $.argument)),
      '}'
    ),

    argument: $ => prec.left(1,
      choice(
        seq('ref', $.expression),
        seq('out', $.expression),
        $.expression,
        seq(
          $.identifier,
          optional(seq(':', $.expression))
        )
      )
    ),

    tuple: $ => seq(
      '(',
      $.expression,
      repeat(seq(',', $.expression)),
      ')'
    ),

    this_access: $ => 'this',

    base_access: $ => 'base',

    object_or_array_creation_expression: $ => seq(
      'new',
      $.member,
      choice(
        $.object_creation_expression,
        $.array_creation_expression
      )
    ),

    object_creation_expression: $ => seq(
      '(',
      optional(seq(
        $.argument,
        repeat(seq(
          ',',
          $.argument
        ))
      )),
      ')',
      optional($.object_initializer)
    ),

    object_initializer: $ => seq(
      '{',
      $.member_initializer,
      repeat(seq(',', $.member_initializer)),
      '}'
    ),

    member_initializer: $ => seq(
      $.identifier,
      '=',
      $.expression
    ),

    array_creation_expression: $ => seq(
      repeat(seq('[', ']')),
      optional(seq('[', $.array_size, ']')),
      $.initializer
    ),

    array_size: $ => seq(
      $.expression,
      repeat(seq(',', $.expression))
    ),

    yield_expression: $ => seq(
      'yield',
      optional(seq($.base_access, '.')),
      $.member,
      $.method_call
    ),

    method_call: $ => seq(
      '(',
      optional(seq($.argument, repeat(seq(',', $.argument)))),
      ')',
      optional($.object_initializer)
    ),

    sizeof_expression: $ => seq(
      'sizeof',
      '(',
      $.type,
      ')'
    ),

    typeof_expression: $ => seq(
      'typeof',
      '(',
      $.type,
      ')'
    ),

    simple_name: $ => prec.left(2,
      seq(
        choice(
          seq('global::', $.identifier),
          $.identifier
        ),
        optional($.type_arguments)
      )
    ),

    member_access: $ => prec.left(
      seq(
        '.',
        $.identifier,
        optional($.type_arguments)
      )
    ),

    pointer_member_access: $ => prec.left(
      seq(
        '->',
        $.identifier,
        optional($.type_arguments)
      )
    ),

    element_access: $=> prec.right(
      seq(
        '[',
        choice(
          ':',
          seq($.expression, repeat(seq(',', $.expression)))
        )
      )
    ),

    post_increment_expression: $ => '++',

    post_decrement_expression: $ => '--',

    member: $ => seq(
      $.identifier,
      optional($.type_arguments)
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
