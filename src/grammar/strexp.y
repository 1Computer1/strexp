%start PROGRAM

%right SHORT_LAMBDA
%left 'then'
%right ASSIGN_OPERATOR
%left '|>' '<|'
%right '?' ':'
%left '||' '??'
%left '&&'
%left '&' MATCH_AT
%left '==' '!='
%left '+' '-'
%left 'in'
%left '<' '>'
%right '$' '@' '%' 'void'
%left '::' '?::'
%left '.' '~' '?.' '?~'
%nonassoc '(' ')' '?('
%nonassoc IF_WITHOUT_ELSE
%nonassoc 'else'

{{
    const error = require('../struct/Errors');
    const StrexpRegExp = require('../struct/types/StrexpRegExp');

    const arr = a => Array.isArray(a) ? a : a === null ? [] : [a];

    const params = nodes => {
        let seenNames = new Set();
        let seenOpt = false;
        let seenRest = false;

        for (const node of nodes) {
            if (seenNames.has(node.tree[0])) {
                throw error(node, 'REDECLARATION', node.tree[0]);
            }

            if (node.tree[0] !== '_') seenNames.add(node.tree[0]);

            if (!seenRest) {
                if (node.name === 'paramRest') {
                    seenRest = true;
                    continue;
                }
            } else {
                throw error(node, 'REST_PARAM_NOT_LAST');
            }

            if (node.tree[1] !== undefined) {
                seenOpt = true;
                continue;
            }

            if (seenOpt && node.tree[1] === undefined) {
                throw error(node, 'NON_OPTIONAL_AFTER');
            }
        }

        return nodes;
    };

    const cases = (nodes, noSwitch) => {
        let seenDefault = false;

        for (const node of nodes) {
            if (noSwitch && node.name === 'case') {
                throw error(node, 'SWITCH_NO_CASE');
            }

            if (node.name === 'caseDefault') {
                seenDefault = true;
                continue;
            }

            if (seenDefault) {
                throw error(node, 'DEFAULT_NOT_LAST');
            }
        }

        return nodes;
    };

    const pos = n => {
        const o = Object.assign({}, n._$);
        o.filepath = parser.filepath;
        return o;
    };

    exports.parseSource = (source, filepath) => {
        parser.filepath = filepath;
        return exports.parse(source);
    };
}}

%%

PROGRAM
    : STATEMENT_LIST EOF
        { return $1; }
    | EOF
        { return []; }
    ;

STATEMENT_LIST
    : STATEMENT -> [$1]
    | STATEMENT_LIST STATEMENT
        {{
            $$ = $1;
            if ($2) $$.push($2);
        }}
    ;

STATEMENT
    : DECLARE_STATEMENT
    | IMPORT_STATEMENT
    | IMPORT_LIB_STATEMENT
    | EXPORT_DECLARE_STATEMENT
    | NON_DECLARE_STATEMENT
    ;

NON_DECLARE_STATEMENT
    : VOID_IMPORT_STATEMENT
    | VOID_IMPORT_LIB_STATEMENT
    | EXPORT_STATEMENT
    | EXPORT_IMPORT_STATEMENT
    | IF_STATEMENT
    | IF_DECLARE_STATEMENT
    | UNLESS_STATEMENT
    | UNLESS_DECLARE_STATEMENT
    | FOR_STATEMENT
    | FOR_DECLARE_STATEMENT
    | LOOP_STATEMENT
    | WHILE_STATEMENT
    | UNTIL_STATEMENT
    | THROW_STATEMENT
    | TRY_STATEMENT
    | RETURN_STATEMENT
    | BREAK_STATEMENT
    | CONTINUE_STATEMENT
    | EXPRESSION_STATEMENT
    | BLOCK_STATEMENT
    | ELLIPSES_STATEMENT
    | ';' -> null
    ;

DECLARE_STATEMENT
    : 'let' IDENTIFIER ';'
        {{
            $$ = {
                name: 'declare',
                pos: pos(this),
                tree: [$2, undefined, $1]
            };
        }}
    | 'let' IDENTIFIER '=' EXPRESSION ';'
        {{
            $$ = {
                name: 'declare',
                pos: pos(this),
                tree: [$2, $4, $1]
            };
        }}
    | 'const' IDENTIFIER '=' EXPRESSION ';'
        {{
            $$ = {
                name: 'declare',
                pos: pos(this),
                tree: [$2, $4, $1]
            };
        }}
    ;

IDENTIFY_DECLARE
    : LET_OR_CONST IDENTIFIER
        {{
            $$ = {
                name: 'declare',
                pos: pos(this),
                tree: [$2, undefined, $1]
            };
        }}
    ;

IMMEDIATE_DECLARE
    : LET_OR_CONST IDENTIFIER '=' EXPRESSION
        {{
            $$ = {
                name: 'declare',
                pos: pos(this),
                tree: [$2, $4, $1]
            };
        }}
    ;

OF_DECLARE
    : LET_OR_CONST IDENTIFIER 'of' EXPRESSION
        {{
            $$ = {
                name: 'declare',
                pos: pos(this),
                tree: [$2, $4, $1]
            };
        }}
    ;

LET_OR_CONST
    : 'let'
    | 'const'
    | '.' -> 'let'
    | '!' -> 'const'
    ;

IMPORT_STATEMENT
    : 'import' EXPRESSION 'as' IDENTIFIER ';'
        {{
            $$ = {
                name: 'import',
                pos: pos(this),
                tree: [$2, $4]
            };
        }}
    | 'import' EXPRESSION 'with' IMPORT_LIST ';'
        {{
            $$ = {
                name: 'import',
                pos: pos(this),
                tree: [$2, $4]
            };
        }}
    | 'import' 'from' EXPRESSION ';'
        {{
            $$ = {
                name: 'import',
                pos: pos(this),
                tree: [$3, undefined]
            };
        }}
    ;

IMPORT_LIB_STATEMENT
    : 'import' STD_OR_MOD IDENTIFIER ';'
        {{
            $$ = {
                name: 'importLib',
                pos: pos(this),
                tree: [$3, $3, $2]
            };
        }}
    | 'import' STD_OR_MOD LIB_NAME IMPORT_TAIL ';'
        {{
            $$ = {
                name: 'importLib',
                pos: pos(this),
                tree: [$3, $4, $2]
            };
        }}
    | 'import' 'from' STD_OR_MOD LIB_NAME ';'
        {{
            $$ = {
                name: 'importLib',
                pos: pos(this),
                tree: [$4, undefined, $3]
            };
        }}
    ;

LIB_NAME
    : IDENTIFIER
    | STRING
    ;

IMPORT_TAIL
    : 'as' IDENTIFIER -> $2
    | 'with' IMPORT_LIST -> $2
    ;

VOID_IMPORT_STATEMENT
    : 'void' 'import' EXPRESSION ';'
        {{
            $$ = {
                name: 'voidImport',
                pos: pos(this),
                tree: [$3]
            };
        }}
    ;

VOID_IMPORT_LIB_STATEMENT
    : 'void' 'import' STD_OR_MOD IDENTIFIER ';'
        {{
            $$ = {
                name: 'voidImportLib',
                pos: pos(this),
                tree: [$4, $3]
            };
        }}
    ;

STD_OR_MOD
    : '::' -> 'std'
    | ':' -> 'mod'
    ;

IMPORT_LIST
    : IMPORT_ITEM -> [$1]
    | IMPORT_LIST ',' IMPORT_ITEM
        {{
            $$ = $1;
            $$.push($3);
        }}
    ;

IMPORT_ITEM
    : IDENTIFIER -> [$1, $1]
    | IDENTIFIER 'as' IDENTIFIER -> [$1, $3]
    ;

EXPORT_STATEMENT
    : 'export' EXPRESSION 'as' IDENTIFIER ';'
        {{
            $$ = {
                name: 'export',
                pos: pos(this),
                tree: [$2, $4]
            };
        }}
    | 'export' IDENTIFIER ';'
        {{
            $$ = {
                name: 'export',
                pos: pos(this),
                tree: [{
                    name: 'variable',
                    pos: pos(this),
                    tree: [$2]
                }, $2]
            };
        }}
    ;

EXPORT_DECLARE_STATEMENT
    : 'export' IMMEDIATE_DECLARE ';'
        {{
            $$ = {
                name: 'exportDeclare',
                pos: pos(this),
                tree: [$2, undefined]
            };
        }}
    | 'export' IMMEDIATE_DECLARE 'as' IDENTIFIER ';'
        {{
            $$ = {
                name: 'exportDeclare',
                pos: pos(this),
                tree: [$2, $4]
            };
        }}
    ;

EXPORT_IMPORT_STATEMENT
    : 'export' 'import' EXPRESSION 'as' IDENTIFIER ';'
        {{
            $$ = {
                name: 'exportImport',
                pos: pos(this),
                tree: [$3, $5]
            };
        }}
    | 'export' 'import' EXPRESSION 'with' IMPORT_LIST ';'
        {{
            $$ = {
                name: 'exportImport',
                pos: pos(this),
                tree: [$3, $5]
            };
        }}
    | 'export' 'import' 'from' EXPRESSION ';'
        {{
            $$ = {
                name: 'exportImport',
                pos: pos(this),
                tree: [$4, undefined]
            };
        }}
    ;

IF_STATEMENT
    : 'if' '(' EXPRESSION ')' NON_DECLARE_STATEMENT 'else' NON_DECLARE_STATEMENT
        {{
            $$ = {
                name: 'if',
                pos: pos(this),
                tree: [$3, arr($5), arr($7)]
            };
        }}
    | 'if' '(' EXPRESSION ')' NON_DECLARE_STATEMENT %prec IF_WITHOUT_ELSE
        {{
            $$ = {
                name: 'if',
                pos: pos(this),
                tree: [$3, arr($5), []]
            };
        }}
    ;

IF_DECLARE_STATEMENT
    : 'if' '(' OF_DECLARE ')' NON_DECLARE_STATEMENT 'else' NON_DECLARE_STATEMENT
        {{
            $$ = {
                name: 'ifDeclare',
                pos: pos(this),
                tree: [$3, arr($5), arr($7)]
            };
        }}
    | 'if' '(' OF_DECLARE ')' NON_DECLARE_STATEMENT %prec IF_WITHOUT_ELSE
        {{
            $$ = {
                name: 'ifDeclare',
                pos: pos(this),
                tree: [$3, arr($5), []]
            };
        }}
    ;

UNLESS_STATEMENT
    : 'unless' '(' EXPRESSION ')' NON_DECLARE_STATEMENT 'else' NON_DECLARE_STATEMENT
        {{
            $$ = {
                name: 'unless',
                pos: pos(this),
                tree: [$3, arr($5), arr($7)]
            };
        }}
    | 'unless' '(' EXPRESSION ')' NON_DECLARE_STATEMENT %prec IF_WITHOUT_ELSE
        {{
            $$ = {
                name: 'unless',
                pos: pos(this),
                tree: [$3, arr($5), []]
            };
        }}
    ;

UNLESS_DECLARE_STATEMENT
    : 'unless' '(' OF_DECLARE ')' NON_DECLARE_STATEMENT 'else' NON_DECLARE_STATEMENT
        {{
            $$ = {
                name: 'unlessDeclare',
                pos: pos(this),
                tree: [$3, arr($5), arr($7)]
            };
        }}
    | 'unless' '(' OF_DECLARE ')' NON_DECLARE_STATEMENT %prec IF_WITHOUT_ELSE
        {{
            $$ = {
                name: 'unlessDeclare',
                pos: pos(this),
                tree: [$3, arr($5), []]
            };
        }}
    ;

FOR_STATEMENT
    : 'for' '(' EXPRESSION ')' NON_DECLARE_STATEMENT
        {{
            $$ = {
                name: 'for',
                pos: pos(this),
                tree: [undefined, $3, arr($5)]
            };
        }}
    | 'for' '(' IDENTIFY_DECLARE ':' EXPRESSION ')' NON_DECLARE_STATEMENT
        {{
            $$ = {
                name: 'for',
                pos: pos(this),
                tree: [$3, $5, arr($7)]
            };
        }}
    ;

FOR_DECLARE_STATEMENT
    : 'for' '(' OF_DECLARE ')' NON_DECLARE_STATEMENT
        {{
            $$ = {
                name: 'forDeclare',
                pos: pos(this),
                tree: [undefined, $3, arr($5)]
            };
        }}
    | 'for' '(' IDENTIFY_DECLARE ':' OF_DECLARE ')' NON_DECLARE_STATEMENT
        {{
            $$ = {
                name: 'forDeclare',
                pos: pos(this),
                tree: [$3, $5, arr($7)]
            };
        }}
    ;

LOOP_STATEMENT
    : 'loop' BLOCK_STATEMENT
        {{
            $$ = {
                name: 'loop',
                pos: pos(this),
                tree: [$2]
            };
        }}
    ;

WHILE_STATEMENT
    : 'while' '(' EXPRESSION ')' NON_DECLARE_STATEMENT
        {{
            $$ = {
                name: 'while',
                pos: pos(this),
                tree: [$3, arr($5)]
            };
        }}
    ;

UNTIL_STATEMENT
    : 'until' '(' EXPRESSION ')' NON_DECLARE_STATEMENT
        {{
            $$ = {
                name: 'until',
                pos: pos(this),
                tree: [$3, arr($5)]
            };
        }}
    ;

THROW_STATEMENT
    : 'throw' EXPRESSION ';'
        {{
            $$ = {
                name: 'throw',
                pos: pos(this),
                tree: [$2]
            };
        }}
    ;

TRY_STATEMENT
    : 'try' BLOCK_STATEMENT
        {{
            $$ = {
                name: 'try',
                pos: pos(this),
                tree: [$2]
            };
        }}
    | 'try' BLOCK_STATEMENT 'catch' BLOCK_STATEMENT
        {{
            $$ = {
                name: 'try',
                pos: pos(this),
                tree: [$2, undefined, $4]
            };
        }}
    | 'try' BLOCK_STATEMENT 'catch' '(' IDENTIFY_DECLARE ')' BLOCK_STATEMENT
        {{
            $$ = {
                name: 'try',
                pos: pos(this),
                tree: [$2, $5, $7]
            };
        }}
    ;

RETURN_STATEMENT
    : 'return' EXPRESSION ';'
        {{
            $$ = {
                name: 'return',
                pos: pos(this),
                tree: [$2]
            };
        }}
    | 'return' ';'
        {{
            $$ = {
                name: 'return',
                pos: pos(this),
                tree: [null]
            };
        }}
    ;

BREAK_STATEMENT
    : 'break' ';'
        {{
            $$ = {
                name: 'break',
                pos: pos(this),
                tree: []
            };
        }}
    ;

CONTINUE_STATEMENT
    : 'continue' ';'
        {{
            $$ = {
                name: 'continue',
                pos: pos(this),
                tree: []
            };
        }}
    ;

BLOCK_STATEMENT
    : '{' STATEMENT_LIST '}' -> $2
    ;

ELLIPSES_STATEMENT
    : '...'
        {{
            $$ = {
                name: 'ellipses',
                pos: pos(this),
                tree: []
            };
        }}
    ;

EXPRESSION_STATEMENT
    : EXPRESSION ';' -> $1
    ;

EXPRESSION
    : LITERAL
    | SYMBOL
    | VARIABLE
    | ASSIGN
    | DOT
    | DOT_SAFE
    | TILDE
    | TILDE_SAFE
    | MATCH
    | MATCH_AT
    | CONCAT
    | CONCAT_COERCE
    | INTERPOLATE
    | PIPE
    | INFIX
    | BIND
    | BIND_SAFE
    | SELF
    | GROUP
    | EQUAL
    | INEQUAL
    | IN
    | AND
    | OR
    | OR_WEAK
    | CONDITIONAL
    | SWITCH
    | SWITCH_DECLARE
    | DO
    | THEN
    | VOID
    | ARRAY
    | DICTIONARY
    | LAMBDA
    | LAMBDA_CALL
    | LAMBDA_CALL_SAFE
    ;

LITERAL
    : STRING
    | REGEXP
    | 'null' -> null
    ;

STRING
    : QUOTE CHARACTERS QUOTE -> $2
    | QUOTE QUOTE -> ''
    ;

REGEXP
    : '/' CHARACTERS '/'
        {{
            const flags = yytext.match(/\/([a-zA-Z]*)$/);
            $$ = StrexpRegExp.buildRegExp({ pos: pos(this) }, $2, flags ? flags[1] : '');
        }}
    | '/' '/' -> /(?:)/
    ;

CHARACTERS
    : CHARACTER
    | CHARACTERS CHARACTER -> $1 + $2
    ;

CHARACTER
    : SOURCE_CHARACTER
    | ESCAPE_CHARACTER
    ;

ESCAPE_CHARACTER
    : SINGLE_ESCAPE
        {{
            $$ = {
                '0': '\0',
                'b': '\b',
                'f': '\f',
                'n': '\n',
                'r': '\r',
                't': '\t',
                'v': '\v',
                '\'': '\'',
                '\\': '\\'
            }[yytext[1]] || yytext[1];
        }}
    | HEX_ESCAPE
        {{
            const num = parseInt(yytext.slice(2), 16);
            $$ = String.fromCharCode(num);
        }}
    ;

SYMBOL
    : '$' IDENTIFIER
        {{
            $$ = {
                name: 'symbol',
                pos: pos(this),
                tree: [$2]
            };
        }}
    ;

VARIABLE
    : IDENTIFIER
        {{
            $$ = {
                name: 'variable',
                pos: pos(this),
                tree: [$1]
            };
        }}
    | '@' IDENTIFIER
        {{
            $$ = {
                name: 'variable',
                pos: pos(this),
                tree: [$1 + $2]
            };
        }}
    ;

ASSIGN
    : IDENTIFIER ASSIGN_OPERATOR EXPRESSION
        {{
            $$ = {
                name: 'assign',
                pos: pos(this),
                tree: [$1, $2 === '='
                    ? $3
                    : {
                        name: {
                            '+': 'concat',
                            '-': 'concatCoerce',
                            '&': 'match'
                        }[$2[0]],
                        pos: pos(this),
                        tree: [{
                            name: 'variable',
                            pos: pos(this),
                            tree: [$1]
                        }, $3]
                    }
                ]
            };
        }}
    | TILDE ASSIGN_OPERATOR EXPRESSION
        {{
            $$ = {
                name: 'assign',
                pos: pos(this),
                tree: [$1, $2 === '='
                    ? $3
                    : {
                        name: {
                            '+': 'concat',
                            '-': 'concatCoerce',
                            '&': 'match'
                        }[$2[0]],
                        pos: pos(this),
                        tree: [$1, $3]
                    }
                ]
            };
        }}
    ;

ASSIGN_OPERATOR
    : '='
    | '+='
    | '-='
    | '&='
    ;

DOT
    : EXPRESSION '.' IDENTIFIER
        {{
            $$ = {
                name: 'dot',
                pos: pos(this),
                tree: [$1, $3]
            };
        }}
    ;

DOT_SAFE
    : EXPRESSION '?.' IDENTIFIER
        {{
            $$ = {
                name: 'dotSafe',
                pos: pos(this),
                tree: [$1, $3]
            };
        }}
    ;

TILDE
    : EXPRESSION '~' IDENTIFIER
        {{
            $$ = {
                name: 'tilde',
                pos: pos(this),
                tree: [$1, $3]
            };
        }}
    ;

TILDE_SAFE
    : EXPRESSION '?~' IDENTIFIER %prec TILDE_QQ
        {{
            $$ = {
                name: 'tildeSafe',
                pos: pos(this),
                tree: [$1, $3]
            };
        }}
    ;

CONCAT
    : EXPRESSION '+' EXPRESSION
        {{
            $$ = {
                name: 'concat',
                pos: pos(this),
                tree: [$1, $3]
            };
        }}
    ;

CONCAT_COERCE
    : EXPRESSION '-' EXPRESSION
        {{
            $$ = {
                name: 'concatCoerce',
                pos: pos(this),
                tree: [$1, $3]
            };
        }}
    ;

INTERPOLATE
    : '%' STRING
        {{
            $$ = {
                name: 'interpolate',
                pos: pos(this),
                tree: [$2]
            };
        }}
    ;

MATCH
    : EXPRESSION '&' EXPRESSION
        {{
            $$ = {
                name: 'match',
                pos: pos(this),
                tree: [$1, $3]
            };
        }}
    ;

MATCH_AT
    : EXPRESSION '&' '~' IDENTIFIER EXPRESSION
        {{
            $$ = {
                name: 'matchAt',
                pos: pos(this),
                tree: [$1, $5, $4]
            };
        }}
    ;

PIPE
    : EXPRESSION '|>' EXPRESSION
        {{
            $$ = {
                name: 'pipe',
                pos: pos(this),
                tree: [$1, $3]
            };
        }}
    | EXPRESSION '<|' EXPRESSION
        {{
            $$ = {
                name: 'pipe',
                pos: pos(this),
                tree: [$3, $1]
            };
        }}
    ;

INFIX
    : EXPRESSION '<' EXPRESSION '>' EXPRESSION
        {{
            $$ = {
                name: 'infix',
                pos: pos(this),
                tree: [$1, $3, $5]
            };
        }}
    ;

BIND
    : EXPRESSION '::' '(' BIND_ARGS_LIST ')'
        {{
            $$ = {
                name: 'bind',
                pos: pos(this),
                tree: [$1, $4]
            };
        }}
    ;

BIND_SAFE
    : EXPRESSION '?::' '(' BIND_ARGS_LIST ')'
        {{
            $$ = {
                name: 'bindSafe',
                pos: pos(this),
                tree: [$1, $4]
            };
        }}
    ;


BIND_ARGS_LIST
    : BIND_ARG -> [$1]
    | BIND_ARGS_LIST ',' BIND_ARG
        {{
            $$ = $1;
            $$.push($3);
        }}
    ;

BIND_ARG
    : ARG
    | '?' -> undefined
    ;

SELF
    : '^'
        {{
            $$ = {
                name: 'self',
                pos: pos(this),
                tree: []
            };
        }}
    ;

GROUP
    : '(' EXPRESSION ')' -> $2
    ;

EQUAL
    : EXPRESSION '==' EXPRESSION
        {{
            $$ = {
                name: 'equal',
                pos: pos(this),
                tree: [$1, $3]
            };
        }}
    ;

INEQUAL
    : EXPRESSION '!=' EXPRESSION
        {{
            $$ = {
                name: 'inequal',
                pos: pos(this),
                tree: [$1, $3]
            };
        }}
    ;

IN
    : EXPRESSION 'in' EXPRESSION
        {{
            $$ = {
                name: 'in',
                pos: pos(this),
                tree: [$3, $1]
            };
        }}
    ;

AND
    : EXPRESSION '&&' EXPRESSION
        {{
            $$ = {
                name: 'and',
                pos: pos(this),
                tree: [$1, $3]
            };
        }}
    ;

OR
    : EXPRESSION '||' EXPRESSION
        {{
            $$ = {
                name: 'or',
                pos: pos(this),
                tree: [$1, $3]
            };
        }}
    ;

OR_WEAK
    : EXPRESSION '??' EXPRESSION
        {{
            $$ = {
                name: 'orWeak',
                pos: pos(this),
                tree: [$1, $3]
            };
        }}
    ;

CONDITIONAL
    : EXPRESSION '?' EXPRESSION ':' EXPRESSION
        {{
            $$ = {
                name: 'conditional',
                pos: pos(this),
                tree: [$1, $3, $5]
            };
        }}
    ;

SWITCH
    : 'switch' '{' SWITCH_ENTRIES '}'
        {{
            $$ = {
                name: 'switch',
                pos: pos(this),
                tree: [undefined, cases($3, true)]
            };
        }}
    | 'switch' '(' EXPRESSION ')' '{' SWITCH_ENTRIES '}'
        {{
            $$ = {
                name: 'switch',
                pos: pos(this),
                tree: [$3, cases($6)]
            };
        }}
    ;

SWITCH_ENTRIES
    : SWITCH_ENTRY -> [$1]
    | SWITCH_ENTRIES SWITCH_ENTRY
        {{
            $$ = $1;
            if ($2) $$.push($2);
        }}
    ;

SWITCH_ENTRY
    : CASE
    | CASE_WHEN
    | CASE_DECLARE
    | CASE_DEFAULT
    | ';' -> null
    ;

CASE
    : CASE_ITEMS '=>' BLOCK_STATEMENT
        {{
            $$ = {
                name: 'case',
                pos: pos(this),
                tree: [$1, $3]
            };
        }}
    | CASE_ITEMS '=>' EXPRESSION ';'
        {{
            $$ = {
                name: 'case',
                pos: pos(this),
                tree: [$1, [{
                    name: 'return',
                    pos: pos(this),
                    tree: [$3]
                }]]
            };
        }}
    ;

CASE_ITEMS
    : CASE_ITEM -> [$1]
    | CASE_ITEMS '|' CASE_ITEM
        {{
            $$ = $1;
            $$.push($3);
        }}
    ;

CASE_ITEM
    : EXPRESSION
        {{
            $$ = {
                name: 'item',
                pos: pos(this),
                tree: [$1]
            };
        }}
    | '*' EXPRESSION
        {{
            $$ = {
                name: 'itemSplat',
                pos: pos(this),
                tree: [$2]
            };
        }}
    ;

CASE_WHEN
    : 'when' EXPRESSION '=>' BLOCK_STATEMENT
        {{
            $$ = {
                name: 'caseWhen',
                pos: pos(this),
                tree: [$2, $4]
            };
        }}
    | 'when' EXPRESSION '=>' EXPRESSION ';'
        {{
            $$ = {
                name: 'caseWhen',
                pos: pos(this),
                tree: [$2, [{
                    name: 'return',
                    pos: pos(this),
                    tree: [$4]
                }]]
            };
        }}
    ;

CASE_DECLARE
    : 'when' '(' OF_DECLARE ')' '=>' BLOCK_STATEMENT
        {{
            $$ = {
                name: 'caseDeclare',
                pos: pos(this),
                tree: [$3, $6]
            };
        }}
    | 'when' '(' OF_DECLARE ')' '=>' EXPRESSION ';'
        {{
            $$ = {
                name: 'caseDeclare',
                pos: pos(this),
                tree: [$3, [{
                    name: 'return',
                    pos: pos(this),
                    tree: [$6]
                }]]
            };
        }}
    ;

CASE_DEFAULT
    : 'default' '=>' BLOCK_STATEMENT
        {{
            $$ = {
                name: 'caseDefault',
                pos: pos(this),
                tree: [undefined, $3]
            };
        }}
    | 'default' '=>' EXPRESSION ';'
        {{
            $$ = {
                name: 'caseDefault',
                pos: pos(this),
                tree: [undefined, [{
                    name: 'return',
                    pos: pos(this),
                    tree: [$3]
                }]]
            };
        }}
    ;

DO
    : 'do' BLOCK_STATEMENT
        {{
            $$ = {
                name: 'do',
                pos: pos(this),
                tree: [$2]
            };
        }}
    ;

THEN
    : EXPRESSION 'then' EXPRESSION
        {{
            $$ = {
                name: 'then',
                pos: pos(this),
                tree: [$1, $3]
            };
        }}
    ;

VOID
    : 'void' EXPRESSION
        {{
            $$ = {
                name: 'void',
                pos: pos(this),
                tree: [$2]
            };
        }}
    ;

ARRAY
    : '[' ARRAY_ITEMS ']'
        {{
            $$ = {
                name: 'array',
                pos: pos(this),
                tree: [$2]
            };
        }}
    | '[' ARRAY_ITEMS ',' ']'
        {{
            $$ = {
                name: 'array',
                pos: pos(this),
                tree: [$2]
            };
        }}
    | '[' ']'
        {{
            $$ = {
                name: 'array',
                pos: pos(this),
                tree: [[]]
            };
        }}
    ;

ARRAY_ITEMS
    : ARRAY_ITEM -> [$1]
    | ARRAY_ITEMS ',' ARRAY_ITEM
        {{
            $$ = $1;
            $$.push($3);
        }}
    ;

ARRAY_ITEM
    : EXPRESSION
        {{
            $$ = {
                name: 'item',
                pos: pos(this),
                tree: [$1]
            };
        }}
    | '*' EXPRESSION
        {{
            $$ = {
                name: 'itemSplat',
                pos: pos(this),
                tree: [$2]
            };
        }}
    ;

DICTIONARY
    : '{' DICTIONARY_ITEMS '}'
        {{
            $$ = {
                name: 'dictionary',
                pos: pos(this),
                tree: [$2]
            };
        }}
    | '{' DICTIONARY_ITEMS ',' '}'
        {{
            $$ = {
                name: 'dictionary',
                pos: pos(this),
                tree: [$2]
            };
        }}
    | '{' '}'
        {{
            $$ = {
                name: 'dictionary',
                pos: pos(this),
                tree: [[]]
            };
        }}
    ;

DICTIONARY_ITEMS
    : DICTIONARY_ENTRY -> [$1]
    | DICTIONARY_ITEMS ',' DICTIONARY_ENTRY
        {{
            $$ = $1;
            $$.push($3);
        }}
    ;

DICTIONARY_ENTRY
    : KEY_VALUE_ENTRY
        {{
            $$ = {
                name: 'entry',
                pos: pos(this),
                tree: [$1, undefined]
            };
        }}
    | PRIVATE KEY_VALUE_ENTRY
        {{
            $$ = {
                name: 'entry',
                pos: pos(this),
                tree: [$2, $1]
            };
        }}
    ;

PRIVATE
    : 'private'
    | '?' -> 'private'
    ;

KEY_VALUE_ENTRY
    : EXPRESSION '=>' EXPRESSION
        {{
            $$ = {
                name: 'entryComputed',
                pos: pos(this),
                tree: [$1, $3]
            };
        }}
    | IDENTIFIER ':' EXPRESSION
        {{
            $$ = {
                name: 'entryLiteral',
                pos: pos(this),
                tree: [$1, $3]
            };
        }}
    | '::' IDENTIFIER
        {{
            $$ = {
                name: 'entryShorthand',
                pos: pos(this),
                tree: [$2, {
                    name: 'variable',
                    pos: pos(this),
                    tree: [$2]
                }]
            };
        }}
    ;

LAMBDA
    : PARAM_BODY '->' BLOCK_STATEMENT
        {{
            $$ = {
                name: 'lambda',
                pos: pos(this),
                tree: [params($1), $3]
            };
        }}
    | PARAM_BODY '->' EXPRESSION %prec SHORT_LAMBDA
        {{
            $$ = {
                name: 'lambda',
                pos: pos(this),
                tree: [params($1), [{
                    name: 'return',
                    pos: pos(this),
                    tree: [$3]
                }]]
            };
        }}
    | '{' EXPRESSION '}'
        {{
            $$ = {
                name: 'lambda',
                pos: pos(this),
                tree: [[
                    {
                        name: 'param',
                        pos: pos(this),
                        tree: ['it', undefined, 'const']
                    }
                ], [{
                    name: 'return',
                    pos: pos(this),
                    tree: [$2]
                }]]
            };
        }}
    ;

PARAM_BODY
    : '(' PARAM_LIST ')' -> $2
    | '(' PARAM_LIST ',' ')' -> $2
    | '(' ')' -> []
    ;

PARAM_LIST
    : PARAM -> [$1]
    | PARAM_LIST ',' PARAM
        {{
            $$ = $1;
            $$.push($3);
        }}
    ;

PARAM
    : LET_OR_CONST IDENTIFIER
        {{
            $$ = {
                name: 'param',
                pos: pos(this),
                tree: [$2, undefined, $1]
            };
        }}
    | LET_OR_CONST IDENTIFIER '=' EXPRESSION
        {{
            $$ = {
                name: 'param',
                pos: pos(this),
                tree: [$2, $4, $1]
            };
        }}
    | LET_OR_CONST IDENTIFIER '*'
        {{
            $$ = {
                name: 'paramRest',
                pos: pos(this),
                tree: [$2, Infinity, $1]
            };
        }}
    | LET_OR_CONST IDENTIFIER '*' EXPRESSION
        {{
            $$ = {
                name: 'paramRest',
                pos: pos(this),
                tree: [$2, $4, $1]
            };
        }}
    ;

LAMBDA_CALL
    : EXPRESSION '(' ARGS_LIST ')'
        {{
            $$ = {
                name: 'call',
                pos: pos(this),
                tree: [$1, $3]
            };
        }}
    | EXPRESSION '(' ')'
        {{
            $$ = {
                name: 'call',
                pos: pos(this),
                tree: [$1, []]
            };
        }}
    ;

LAMBDA_CALL_SAFE
    : EXPRESSION '?(' ARGS_LIST ')'
        {{
            $$ = {
                name: 'callSafe',
                pos: pos(this),
                tree: [$1, $3]
            };
        }}
    | EXPRESSION '?(' ')'
        {{
            $$ = {
                name: 'callSafe',
                pos: pos(this),
                tree: [$1, []]
            };
        }}
    ;

ARGS_LIST
    : ARG -> [$1]
    | ARGS_LIST ',' ARG
        {{
            $$ = $1;
            $$.push($3);
        }}
    ;

ARG
    : EXPRESSION
        {{
            $$ = {
                name: 'arg',
                pos: pos(this),
                tree: [$1]
            };
        }}
    | '*' EXPRESSION
        {{
            $$ = {
                name: 'argSplat',
                pos: pos(this),
                tree: [$2]
            };
        }}
    ;
