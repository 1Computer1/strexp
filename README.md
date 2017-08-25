# Strexp

An esoteric language without numbers.  
Why? For the fun of it!  

Inspired by the [REGEXPL](http://zuu.dk/index.php?page=regexpl) esolang.  

## Usage

#### Installation

`$ npm i -g 1computer1/strexp`  
Requires Node 8 to use.  

#### CLI

`$ strexp path/to/file.str`  
`$ strexp -c "@print('code here');"`  

#### JavaScript

```js
const strexp = require('strexp');
strexp.runFile('path/to/file.str');
strexp.runCode('@print("code here");');
```

## Documentation

See the documentation (unfinished) [here](./docs/README.md).  
See test folder or src/stdlib for code examples.  
