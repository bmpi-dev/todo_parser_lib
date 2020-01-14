const Lexer = require('lex');

const row = 1;
let col = 1;
const indent = [0];
const lexer = module.exports = new Lexer(function(char) {
  throw new Error('Unexpected character at row ' + row + ', col ' + col + ': ' + char);
});

global.flag = 0; // 0 - doing, 1 - critical

module.exports.changeFlag = function changeFlag(flag) {
  global.flag = flag;
};

lexer.addRule(/^[\t ]*/gm, function(lexeme) {
  const indentation = lexeme.length;

  col += indentation;

  if (indentation > indent[0]) {
    indent.unshift(indentation);
    return 'INDENT';
  }

  const tokens = [];

  while (indentation < indent[0]) {
    tokens.push('DEDENT');
    indent.shift();
  }

  if (tokens.length) return tokens;
});

lexer.addRule(/\n+/gm, function(lexeme) {
  // col = 1;
  // row += lexeme.length;
  // return "NEWLINE";
});

lexer.addRule(/.*/gm, function(lexeme) {
  col += lexeme.length;
  const projectRe = /^.*:$/g;
  if (lexeme.length == 0) {
    // return "EMPTY"
  } else if (lexeme.trim().startsWith('> ')) {
    // return "COMMENT"
  } else if (lexeme.trim().endsWith(':') || lexeme.trim().includes(': ')) {
    // this is a project name, need keep it
    this.yytext = lexeme;
    return 'NAME';
  } else if (lexeme.trim().includes('@done') || lexeme.trim().includes('@cancelled')) {
    // return "DONE"
  } else if (projectRe.test(lexeme.trim())) {
    this.yytext = lexeme;
    return 'NAME';
  } else {
    // doing todo item
    if (global.flag == 0 && lexeme.trim().includes('@started')) {
      this.yytext = lexeme;
      return 'NAME';
    }
    // critical item but is not doing
    if (global.flag == 1 && lexeme.trim().includes('@critical') && !lexeme.trim().includes('started')) {
      this.yytext = lexeme;
      return 'NAME';
    }
  }
});

lexer.addRule(/$/gm, function() {
  col++;
  return 'EOF';
});
