hex                     [A-Za-z0-9]
id_s                    [A-Za-z0-9_]
id_c                    [A-Za-z0-9_@$%^]*

%x STRR
%x STRS
%x STRD
%x RGX
%x CMT

%%

\s+                     /* ignore whitespace */
"###"                   this.begin('CMT');
<CMT>"###"              this.popState();
<CMT>[^]                /* ignore comments */
"#".*                   /* ignore comments */

"continue"              return 'continue';
"default"               return 'default';
"private"               return 'private';
"export"                return 'export';
"return"                return 'return';
"import"                return 'import';
"switch"                return 'switch';
"unless"                return 'unless';
"break"                 return 'break';
"catch"                 return 'catch';
"const"                 return 'const';
"throw"                 return 'throw';
"until"                 return 'until';
"while"                 return 'while';
"else"                  return 'else';
"from"                  return 'from';
"loop"                  return 'loop';
"null"                  return 'null';
"then"                  return 'then';
"void"                  return 'void';
"when"                  return 'when';
"with"                  return 'with';
"for"                   return 'for';
"let"                   return 'let';
"try"                   return 'try';
"as"                    return 'as';
"do"                    return 'do';
"if"                    return 'if';
"in"                    return 'in';
"of"                    return 'of';

"..."                   return '...';
"?::"                   return '?::';
"->"                    return '->';
"=>"                    return '=>';
"|>"                    return '|>';
"<|"                    return '<|';
"+="                    return '+=';
"-="                    return '-=';
"&="                    return '&=';
"!="                    return '!=';
"=="                    return '==';
"??"                    return '??';
"?."                    return '?.';
"?~"                    return '?~';
"?("                    return '?(';
"&&"                    return '&&';
"||"                    return '||';
"::"                    return '::';
"!"                     return '!';
"@"                     return '@';
"$"                     return '$';
"%"                     return '%';
"^"                     return '^';
"&"                     return '&';
"?"                     return '?';
"|"                     return '|';
","                     return ',';
"."                     return '.';
":"                     return ':';
";"                     return ';';
"~"                     return '~';
"+"                     return '+';
"-"                     return '-';
"*"                     return '*';
"="                     return '=';
"<"                     return '<';
">"                     return '>';
"("                     return '(';
")"                     return ')';
"["                     return '[';
"]"                     return ']';
"{"                     return '{';
"}"                     return '}';

"/"                     return this.begin('RGX'), '/';
<RGX>"/"[A-Za-z]*       return this.popState(), '/';
<RGX>.                  return 'SOURCE_CHARACTER';

"`"                     return this.begin('STRR'), 'QUOTE';
<STRR>"`"               return this.popState(), 'QUOTE';
<STRR>"\\`"             return 'SINGLE_ESCAPE';
<STRR>.                 return 'SOURCE_CHARACTER';

"\""                    return this.begin('STRD'), 'QUOTE';
<STRD>"\""              return this.popState(), 'QUOTE';
<STRD>"\\u"{hex}{4}     return 'HEX_ESCAPE';
<STRD>"\\".             return 'SINGLE_ESCAPE';
<STRD>.                 return 'SOURCE_CHARACTER';

"'"                     return this.begin('STRS'), 'QUOTE';
<STRS>"'"               return this.popState(), 'QUOTE';
<STRS>"\\u"{hex}{4}     return 'HEX_ESCAPE';
<STRS>"\\".             return 'SINGLE_ESCAPE';
<STRS>.                 return 'SOURCE_CHARACTER';

{id_s}{id_c}            return 'IDENTIFIER';
<<EOF>>                 return 'EOF';
