const Parser = require('jison').Parser;

const grammar = {
  'bnf': {
    'todo-plus': [
      ['todo-list EOF', 'return $1;'],
      ['EOF', 'return null'],
    ],
    'todo-list': [
      ['todo', '$$ = $1 == null ? null : [$1];'],
      ['todo-list todo',
        'if ($1 == null) { $$ = $2; } ' +
        'else { if ($2 == null) { $$ == $1; } ' +
        'else { $$ = [].concat($1).concat($2); } };'],
    ],
    'todo': [
      ['item', '$$ = {name: $1, todo: []};'],
      ['item INDENT todo-list DEDENT', '$$ = $3 == null ? $3 : {name: $1, todo: $3};'],
      ['item INDENT DEDENT', '$$ = null;'],
      // ['INDENT DEDENT', '$$ = null'],
    ],
    'item': [
      ['NAME', '$$ = yytext;'],
    ],
  },
};

module.exports = new Parser(grammar);
