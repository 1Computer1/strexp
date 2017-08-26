# Function Syntax

## Syntax

#### Parameter

```
<let/const> <identifier> [= expression]
<let/const> <identifier> [* expression]
```

#### Long form

```
([params]) -> {
    <statements>
}
```

#### Short form

```
([params]) -> <expression>
```

#### Quick form

In this form, one required parameter is declared, named `it`.  

```
{ <expression> }
```

## Parameters

Parameters are the names of the values that will be passed in to the function.  
Each paramater must be prefixed by either `let` or `const` (or the equivalent shorthands, `.` and `!`).  

```
# Takes params 'a' and 'b'
# Can be written as `(!a, !b) -> a + b`
const f = (!a, !b) -> {
    return a + b;
};

# Returns '12'
f('1', '2');
```

## Optional parameters

Optional parameters have default values, so values are not required to be passed in.  
The defaults are only evaluated if the values are not passed in.  
This is done with `=` after the name then an expression.  

```
const f = (!a, !b = '3') -> {
    return a + b;
};

# Returns '13'
f('1');

# Returns '14'
f('1', '4');
```

## Rest parameters

One rest parameter can appear at the end of the parameter list.  
They take all values past them and places it into an array.  
This is done by suffixing the parameter name with `*`.  

```
const f = (!a*) -> {
    return a;
};

# Returns ['1', '2', '3', '4']
f('1', '2', '3', '4');
```

A maximum can be specified by adding an expression after the `*`.  
The expression must evaluate to a string containing an integer.  

```
# Allow only 3
const f = (!a* '3') -> {
    return a;
};

# Will error, too many arguments
f('1', '2', '3', '4');
```
