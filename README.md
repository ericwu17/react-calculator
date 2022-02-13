# Why did I choose to build such a calculator?

When building this calculator, I really wanted the user to type an entire expression, and then press "evaluate", rather than having a calculator which can only handle a single number being displayed at a time. I always find it difficult to use calculators where I cannot see the entire expression being calculated (the input) alongside the result (the output).

It was necessary to add the four basic functions, and exponentiation is quite basic too. The trignometric functions and natural log are essential to any calculus course, and I added the `gcd` land `lcm` functions because I had just learned about the Euclidean Algorithm in my number theory class.

# How does this compute an expression?

After getting the user's expression as a string, the first action is to split the input into several chunks, with a number of an operator getting its own string. Parentheses are represented by nesting the chunks within other chunks. This organizational structure allows recursion to be used to calculate the entire expression.

# More information
[Explanatory video 1](https://www.loom.com/share/4e98f96dd5624362ab151dd37a66ffad)

[Explanatory video 2](https://www.loom.com/share/576838ba453b4a21a87e95c91c4f482f)

