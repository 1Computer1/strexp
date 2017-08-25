# Global Variable

The operator `@` allows access to global variables.  
Global variables are built-in variables available in all script files.  
All global variables are also accesible via the [global](../stdlib/global.md) standard library.  

## Syntax

```coffeescript
@ <identifier>
```

## Example

```coffeescript
# Prints '1'
@print('1');
```

```coffeescript
# Prints 'array'
const array = [];
const type = @type(array);
@print(type);
```
