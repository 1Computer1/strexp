# string

The string data type represents text.  
Either single or double quotes are usable for strings.  
Using backticks will create a raw string.  

## Syntax

```
'[characters]'
"[characters]"
`[characters]`
```

## Escape characters

Escape characters are done by prefixing a character with a backslash.  
Invalid escape characters will insert only the character.  
Raw strings only have one escape character for the backtick.  

- `\0`
- `\b`
- `\f`
- `\n`
- `\r`
- `\t`
- `\v`
- `\'`
- `\"`
- `` \` ``

A hexadecimal escape with a digit char code can be used.  

```
'\u0010'
```

## Members

#### Properties

- `length`  
  The length of the string.  

#### Methods

- `at(index)`  
  Gets the character at the index.  

- `concat(*strings)`  
  Concatenates strings with the current string.  
  Returns a new string.  

- `upper()`  
  Returns the string all uppercased.  

- `lower()`  
  Returns the string all lowercased.  

- `match(regexp)`  
  Matches against a regular expression and returns a match object.   

  `match(string)`  
  Matches against a string for one-to-one matching.  
  Returns a match object.  

- `replace(regexp, replaceWith)`  
  `replace(string, replaceWith)`  
  Replaces the match with a string.  
  The following replacers are available:  

  - `$$` - Inserts a `$`
  - `$&` - Inserts the match
  - `` $` `` - Inserts the portion before the match
  - `$'` - Inserts the portion after the match
  - `$n` - Inserts capture group *n*

  Returns a new string.  

  `replace(regexp, dict)`  
  `replace(string, dict)`  
  Replaces the match with the corresponding entry in the dictionary.  
  Returns a new string.  

  `replace(regexp, function)`  
  `replace(string, function)`  
  Replaces the match with the return value of the callback function.  
  The arguments passed in are the full match, capture groups, the offset of the match, then the input string.  

  ```
  'x1y2z3'.replace(/(\w)(\d)/g, (!match, !1, !2, !offset, !input) -> {
      ...
  });
  ```

- `charcode_at(index)`  
  Gets the char code at the index.  

- `codepoint_at(index)`  
  Gets the codepoint at the index.  

- `join(array)`  
  Joins an array with the string.  
  All elements of the array must be strings.  

- `split(string)`  
  `split(regexp)`  
  Splits the string by the regexp or character(s).  
  Returns an array.  

- `slice(start[, end])`  
  Slices the string from the start index to the end index.  
  The end index by default is the length of the string.  

- `regexp()`  
  Creates a new regexp from the string.  
