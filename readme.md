[![Build Status](https://travis-ci.com/bmpi-dev/todo_parser_lib.svg?branch=master)](https://travis-ci.com/bmpi-dev/todo_parser_lib)

# TODO++ parser #

*.todo -> json -> html (use lex and jison to parse yaml like format txt to json ast).

todo txt format see test/test_data.

## Installation ##

```bash
npm install -g todo-plus-parser
```

## Getting Started ##

## parse html with special dir

```bash
todo-plus-parser -i "./todos/" -o "./out.html"
```

## enable debug

```bash
todo-plus-parser -i "./todos/" -o "./out.html" -d true
```