# let and const

The `let` and `const` statements are declaration statements.  
They are used to declare new variables within a scope.  

## Syntax

```coffeescript
let <identifier> [= expression];
const <identifier> = <expression>;
```

The character `.` is a shorthand for the keyword `let`.  
Similarly, `!` is a shorthand for `const`.  

## Block scoping

All variables are block scoped in Strexp.  
Which means that variables can only be accessed within their scope or lower.  

```coffeescript
let x = '10';

if ('1' + '1' & '11') {
    let y = '20';
}

# Will error, 'y' is not defined in this scope
@print(y);
```

## const

When `const` is used, the variable cannot be reassigned.  
Properties of it can still be changed, such as dictionary entries or array indices.  
