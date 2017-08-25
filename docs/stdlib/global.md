# Lib: Global

The global standard library contains functions for general use.  
There is no need to import this library since all exports of it are accessible via the [global variable operator](../operators/global-variable.md).  

## Exports

#### Functions

- `filepath()`  
  Gets the path to the current script.  

- `mainpath()`  
  Gets the path to the entry script.  

- `print(args*)`  
  Prints arguments to standard output.  
  All arguments are formatted with `format()`.  

- `printerr(args*)`  
  Equivalent to `print()` but outputs to standard error.  

- `input()`  
  Gets one line of input from standard input.  

- `format(item)`  
  Formats an item to a string.  
  Used for `print()` and `printerr()`.  

- `type(item)`  
  Gets the type of an item.  

- `array(size[, filler])`  
  Creates an array with length of `size`.  

  If `filler` is provided and is not a function, the array will be filled with that value.  
  Otherwise, `null` is used.  

  If `filler` is provided an is a function, that function will be called with the current index and should return with the value for that index.  

  An error is thrown if `size` is invalid.  

- `dict(entries)`  
  Creates a dictionary from entries.  
  Entries should be an array where each element is an array of key-value pairs.  
  An error is thrown if the structure is incorrect.  

- `regexp(source[, flags])`  
  Creates a regexp from a string.  
  If `flags` is provided, the regular expression will have those flags.  
  An error is thrown if the syntax is invalid.  

- `char(codepoint)`  
  Gets the character at a codepoint.  
  An error is thrown if the codepoint is out of range.  

- `random(regexp)`  
  Generates a random string that matches a regexp.  

- `error(type, message)`  
  Creates an error.  
  Both `type` and `message` should be strings.  

- `exit([code])`  
  Exits the process with an exit code.  
  Defaults to 0.  
