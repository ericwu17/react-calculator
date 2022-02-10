import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


function Button(props) {
	if(props.size == 1){
		return (
			<button className="button"
				onClick={() => props.onClick()}
			>
				{props.value}
			</button>
		)
	}
	else if (props.size == 2){
		return (
			<button className="doublebutton"
				onClick={() => props.onClick()}
			>
				{props.value}
			</button>
		)
	}

}



function DisplayPanel(props){
	let expression = "→ " + props.expression
	let result = "= " + props.result
	
	expression = expression.replaceAll("s", "sin").replaceAll("c", "cos").replaceAll("t", "tan")
		.replaceAll("l", "ln").replaceAll("m", "lcm").replaceAll("d", "gcd")
	return(
		<div className = "displaypanel">
			<div className="expression-text">{expression}</div>
			<div className="result-text">{result}</div>
		</div>
		
	)

}

function HelpSection(props){
	return <div className="helpsection">
		<h1 className="header">
			Welcome to the calculator!
		</h1>
		This calculator supports basic arithmetic, computing the greatest common divisor/lowest common multiple of integers, as well as some additional scientific features! Simply enter your expression and then press <code>GO</code>. Press <code>CL</code> to clear the calculator or <code>←</code> to backspace.
		<h3>
			Negative Numbers
		</h3>
		You can use the subtract key to indicate negative numbers, but only at the beginning of a parenthetical block. For example, <code>-5*(-3+2)</code> is valid but <code>5*-6</code> is not. Instead try <code>5*(-6)</code>.
		<h3>
			Order of Operations
		</h3>
		This calculator evaluates the innermost parentheses first, and then does the following operations from left to right:
		<ol>
			<li>Exponentiation</li>
			<li>Multiplication and Division</li>
			<li>Addition and Subtraction</li>
		</ol>
		Note that exponential towers are evaluated from left to right, rather the standard order of from top to bottom. So <code>3^2^0</code> evaluates to <code>1</code> rather than <code>3</code>.
		<h3>
			Division by zero and domain errors
		</h3>
		Following Javascript's way of handling numbers, <code>1/0</code> on this calculator results in <code>Infinity</code>. <code>-1/0</code> results in <code>-Infinity</code>, as does <code>1/(-0)</code>. Curiously, <code>1/sin(π)</code>, <code>1/sin(2π)</code>, and <code>1/sin(3π)</code> all give different big numbers.
		<br/><br/>
		<code>ln(0)</code> gives <code>-Infinity</code>, perhaps as expected. <code>ln(-1)</code> gives <code>NaN</code>

		<h3>
			<code>gcd()</code> and <code>lcm()</code> Functions
		</h3>
		The <code>gcd()</code> and <code>lcm()</code> functions expect two non-zero integral inputs, separated by a comma. 
		If you enter a non-integral value, the functions will round the number down the to nearest integer, so <code>gcd(7/3,5)</code> is equivalent to <code>gcd(2,5)</code>.
	</div>
}


class Calculator{
	// this will be the class which handles all the algorithmic computations


	
	calculate(expression){
		if (!expression){
			return ">Your result will be displayed here<"
		}

		//firstly, we check to see if parenthesis placement is valid, 
		//since splitExpressionIntoChunks requires valid parenthesis placement in order to work
		if(!this.hasValidParenthesisPlacement(expression)){
			return "Hey, it looks like there's a mismatched parenthesis somewhere :("
		}
		
		
		let chunks = this.splitExpressionIntoChunks(expression)
		


		//we now check to see whether there is an invalid number somwhere such as "." or "24.123.2"
		let res = this.findInvalidNumber(chunks)
		if(res){
			return 'Hey, "' + res + '" is an invalid number!'
		}


		//Now we ensure the functions (sin, cos, tan, ln, gcd, lcm) are always immediately followed by a chunk
		if(!this.hasValidFunctionPlacement(chunks)){
			return "Please ensure that all functions are followed by parentheses!"
		}
		//now we would like to check for the correct placement of commas
		if(!this.hasValidCommaPlacement(chunks)){
			return "Check your commas, please!"
		}
		//now we convert gcd to a binary operation, so ["g" ["2", "3"], "+", "5"] becomes [["2", "g", "5"], "+", "5"]
		chunks = this.binaryFunctionToInfixNotation(chunks)



		console.log("Initial chunks: " + JSON.stringify(chunks))
		//now we want to replace leading negative signs with {"-1", "*"}
		chunks = this.processNegativeSigns(chunks)


		//now we want to eliminate the possibility of operators being next to each other, or at the end of the chunkstring,  (if an operator is missing between two numbers then we assume multiplication, we'll do that later)
		//i.e. we don't want something like [3,*,-, 6] or [*]
		//this function also gets rid of expressions containing empty parenthesis such as "3*5-()"
		console.log("chunks: " + JSON.stringify(chunks))
		if(!this.hasValidOperatorPlacement(chunks)){
			return "Hey, check your operators; one of them is misplaced!"
		}



		

		

		
		//now we convert all numbers in the form of strings to the form of floats. Also converts pi and e to their respective numbers.
		chunks = this.convertNumbersFromStringsToFloats(chunks)
		
		//and also add implicit multiplication to the chunks
		chunks = this.addImplicitMultiplication(chunks)
		console.log("Immediately before computation: " + JSON.stringify(chunks))
		


		return this.compute(chunks).toFixed(6).replace(/\.?0*$/,'') //round to 6 decimal places and trim trailing zeros and decimal point

	}

	findGCD(A,B){
		//if a and b are not integers, we make them integers
		A = Math.abs(parseInt(A))
		B = Math.abs(parseInt(B))
		if(A == 0 || B == 0){
			return 0
		}
		
		let q, r
		let a = Math.max(A,B)
		let b = Math.min(A,B)
		//without loss of generality, let a < b

		while (true){
			q = parseInt(a/b)
			r = a % b
			a = b; b = r
			if (b == 0){
				return a
			}
		}
	}

	findLCM(A,B){
		//if a and b are not integers, we make them integers
		A = Math.abs(parseInt(A))
		B = Math.abs(parseInt(B))
		if(A == 0 || B == 0){
			return 0
		}
		
		return A*B/this.findGCD(A,B)
	}




	binaryFunctionToInfixNotation(chunks, operatorToInsert){
		//["g" ["2", "3"], "+", "5"] becomes [["2", "g", "5"], "+", "5"] through this function
		//if operatorToInsert is not null, that means this chunk immediately follows a gcd or lcm function. So we need to insert operatorToInsert which could be "d" or "m"

		let newChunks = []
		if(operatorToInsert){
			let firstHalf = chunks.slice(0, chunks.indexOf(","))
			let secondHalf = chunks.slice(chunks.indexOf(",") + 1, chunks.length)
			return [this.binaryFunctionToInfixNotation(firstHalf), operatorToInsert, this.binaryFunctionToInfixNotation(secondHalf)]
		}
		
		let lastElem = ""
		for (let elem of chunks) {
			if(Array.isArray(elem)) {
				if (lastElem == "d" || lastElem == "m"){
					newChunks.pop()
					newChunks.push(this.binaryFunctionToInfixNotation(elem, lastElem))
				} else {
					newChunks.push(this.binaryFunctionToInfixNotation(elem))
				}

			} else {
				newChunks.push(elem)
			}

			lastElem = elem
		}

		return newChunks
	}

	hasValidCommaPlacement(chunks, thisChunkShouldHaveComma){
		//all chunks should contain exactly zero or one commas
		let commaCount = 0
		let lastChunkWasBinaryFunction = false
		for (let elem of chunks){
			if(Array.isArray(elem)){
				if(!this.hasValidCommaPlacement(elem, lastChunkWasBinaryFunction)){
					return false
				}
			}
			if(elem == ","){
				commaCount += 1
			}
			if(elem == "d" || elem == "m"){
				lastChunkWasBinaryFunction = true
			} else {
				lastChunkWasBinaryFunction = false
			}
		}

		if(thisChunkShouldHaveComma){
			return commaCount == 1
		} else {
			return commaCount == 0
		}

		
	}

	hasValidFunctionPlacement(chunks){
		let lastChunkWasFunction = false
		for (let elem of chunks) {
			if (Array.isArray(elem)){
				if(!this.hasValidFunctionPlacement(elem)){
					return false
				}
			} else {
				if(lastChunkWasFunction){
					return false
				}
			}
			lastChunkWasFunction = "sctldm".includes(elem)
			

		}
		return !lastChunkWasFunction
	}

	compute(chunks){
		//this function evaluates a set of chunks, working recursively

		let newChunks = []

		//first we do anything inside parenthesis
		for (let chunk of chunks){
			if (Array.isArray(chunk)){
				newChunks.push(this.compute(chunk))
			} else{
				newChunks.push(chunk)
			}
		}

		//then we repeatedly call simplifyOnce
		while(newChunks.length > 1){
			console.log("simplyfying once " +JSON.stringify(newChunks))
			newChunks = this.simplifyOnce(newChunks)
		}
		return newChunks[0]
	}

	simplifyOnce(chunks){
		//this function assumes that its input is already "flattened", meaning it assumes that there are no chunks inside the input.


		//this function takes in something like [2+3/4-1*6]
		//and returns [2+0.75-1*6]
		
		//the function first evaluates any single-input function (sin, cos, tan, ln)
		//the function then evaluates any double-input function (lcm, gcd)
		//if there are none:it performs the exponentiation there is (looking left to right), 
		//if there are none:it performs the first multiplication or division there is (looking left to right), 
		//and if there are none: it does the first addition/subtraction

		//if the chunk already has length 1, then it simply returns the chunk


		for (let i = 0; i < chunks.length; i += 1){
			if(chunks[i] == "s"){
				return (chunks.slice(0,i)
				.concat([   Math.sin(chunks[i+1])   ])
				.concat(chunks.slice(i+2,chunks.length)))
			}
			if(chunks[i] == "c"){
				return (chunks.slice(0,i)
				.concat([   Math.cos(chunks[i+1])   ])
				.concat(chunks.slice(i+2,chunks.length)))
			}
			if(chunks[i] == "t"){
				return (chunks.slice(0,i)
				.concat([   Math.tan(chunks[i+1])   ])
				.concat(chunks.slice(i+2,chunks.length)))
			}
			if(chunks[i] == "l"){
				return (chunks.slice(0,i)
				.concat([   Math.log(chunks[i+1])   ])
				.concat(chunks.slice(i+2,chunks.length)))
			}
		}




		
		for (let i = 0; i < chunks.length; i += 1){
			if(chunks[i] == "d"){
				return (chunks.slice(0,i-1)
				.concat([   this.findGCD(chunks[i-1],chunks[i+1])   ])
				.concat(chunks.slice(i+2,chunks.length)))
			}
			if(chunks[i] == "m"){
				return (chunks.slice(0,i-1)
				.concat([   this.findLCM(chunks[i-1],chunks[i+1])   ])
				.concat(chunks.slice(i+2,chunks.length)))
			}
		}


		for (let i = 0; i < chunks.length; i += 1){
			if(chunks[i] == "^"){
				return (chunks.slice(0,i-1)
				.concat([   Math.pow(chunks[i-1],chunks[i+1])   ])
				.concat(chunks.slice(i+2,chunks.length)))
			}
		}

		for (let i = 0; i < chunks.length; i += 1){
			if(chunks[i] == "*"){
				return (chunks.slice(0,i-1)
				.concat([chunks[i-1]*chunks[i+1]])
				.concat(chunks.slice(i+2,chunks.length)))
			}
			if(chunks[i] == "/"){
				return (chunks.slice(0,i-1)
				.concat([chunks[i-1]/chunks[i+1]])
				.concat(chunks.slice(i+2,chunks.length)))
			}
		}

		for (let i = 0; i < chunks.length; i += 1){
			if(chunks[i] == "+"){
				return (chunks.slice(0,i-1)
				.concat([chunks[i-1]+chunks[i+1]])
				.concat(chunks.slice(i+2,chunks.length)))
			}
			if(chunks[i] == "-"){
				return (chunks.slice(0,i-1)
				.concat([chunks[i-1]-chunks[i+1]])
				.concat(chunks.slice(i+2,chunks.length)))
			}
		}

		return chunks
	}

	addImplicitMultiplication(chunks){
		let newChunks = []
		for(let i = 0; i < chunks.length; i += 1){
			if(Array.isArray(chunks[i])){
				newChunks.push(this.addImplicitMultiplication(chunks[i]))
			}
			else {
				newChunks.push(chunks[i])
			}

			let thisChunkIsAValue = typeof(chunks[i]) === 'number' || Array.isArray(chunks[i])
			let nextChunkIsAValue = typeof(chunks[i+1]) === 'number' || Array.isArray(chunks[i+1]) || "sctl".includes(chunks[i+1])  //if the next chunk is sin, cos, tan, or ln
			//In the case [3, "s", [4]] (3sin(4)) we want to insert multiplication before "s" but not after
			
			if (thisChunkIsAValue && nextChunkIsAValue){
				console.log("implicit multiplication at: " + i)
				//insert a multiplication sign here
				newChunks.push("*")
			}
		}
		return newChunks
	}

	convertNumbersFromStringsToFloats(chunks){
		let newChunks = []
		for (let chunk of chunks){
			if (Array.isArray(chunk)){
				newChunks.push(this.convertNumbersFromStringsToFloats(chunk))
			} else if (chunk.includes(".") || chunk.includes("1") || chunk.includes("2") || chunk.includes("3")
			|| chunk.includes("4") || chunk.includes("5")  || chunk.includes("6") || chunk.includes("7")
			|| chunk.includes("8") || chunk.includes("9")  || chunk.includes("0")
			){ //sorry, I couldn't think of a better way to write this if statement.
				newChunks.push(parseFloat(chunk))
			} else if (chunk == "e"){
				newChunks.push(Math.E)
			} else if (chunk == "π"){
				newChunks.push(Math.PI)
			}
			else {
				newChunks.push(chunk)
			}
			
			
		}
		return newChunks
	}

	findInvalidNumber(chunks) {
		//console.log("seeing if there's an invalid number in" + JSON.stringify(chunks))
		for (let elem of chunks){
			if (Array.isArray(elem)){
				let res = this.findInvalidNumber(elem)
				if(res){
					return res
				}
				continue
			}
			
			if (!elem.includes(".")){
				continue
			}
			//by this point we know the chunk is a string containing "."
			if (elem == ".") {
				return elem
			}
			if (elem.split(".").length - 1 > 1){
				return elem
			}
			
		}
	}

	hasValidOperatorPlacement(chunks){
		let lastChunkWasOperator = true
		for (let chunk of chunks){
			if (Array.isArray(chunk) && !this.hasValidOperatorPlacement(chunk)){
				return false
			}
			let chunkIsOperator = "+-*/^,".includes(chunk)
			if (chunkIsOperator && lastChunkWasOperator) {
				return false
			}
			lastChunkWasOperator = chunkIsOperator
		}
		if(lastChunkWasOperator){
			return false
		}
		return true
	}

	processNegativeSigns(chunks) {
		let newChunks = []
		for (let chunk of chunks) {
			if(Array.isArray(chunk)){
				newChunks.push(this.processNegativeSigns(chunk))
			} else {
				newChunks.push(chunk)
			}
		}

		//console.log("Processing negative signs on: " + JSON.stringify(newChunks))

		if(chunks[0] == "-"){
			return ["-1", "*"].concat(newChunks.slice(1, chunks.length))
		}
		return newChunks

	}

	hasValidParenthesisPlacement(expression){
		let howDeepIntoParens = 0
		for (let char of expression){
			if (char == "("){
				howDeepIntoParens += 1
			} 
			if (char == ")"){
				howDeepIntoParens -= 1
			}
			if (howDeepIntoParens < 0){
				//you cannot have a closing parenthesis before an opening one
				return false
			}
			//console.log(howDeepIntoParens)
		}
		if (howDeepIntoParens != 0){
			// the number of opening and closing parens must match
			return false
		}
		if (expression.includes("()")){
			return false
		}

		return true
	}

	splitExpressionIntoChunks(expression){
		//we will split the expression into different chunks
		//for example, 
			// "(5+3)*1.2" -> [["5", "+", "3"], "*", "1.2"]
			// "(32+5*2)+*8" -> [["32", "+", "5", "*", "2"], "+", "*", "8"] //this expression is invalid, but this function just blindly converts to chunks
			


		//console.log("Chunking: " + expression)

		let chunks = []


		for (let index = 0; index < expression.length; index += 1){
			let char = expression[index]
			if (char == "("){
				//when we see an opening parenthesis, we want to perform a recursive call to this function
				let startIndex = index
				let depth = 1
				while(depth > 0){
					index += 1
					char = expression[index]
					if (char == "("){
						depth += 1
					} 
					if (char == ")"){
						depth -= 1
					}
				}
				let substring = expression.slice(startIndex + 1, index)
				chunks.push(this.splitExpressionIntoChunks(substring))
			} else if ("0123456789.".includes(char)){
				let startIndex = index
				while("0123456789.".includes(char)){
					index += 1
					char = expression[index]
				}
				let substring = expression.slice(startIndex, index)
				chunks.push(substring)
				index -= 1
			} else{
				chunks.push(char)
			}
			
			
			
		}

		return chunks
	}

}


class Board extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			expression: "",
			result: ">Your result will be displayed here<",
		}
		this.calculator = new Calculator()
	}

	renderButton(displayValue, clickValue, size) {
		if(!size){
			size = 1
		} 
		return <Button value={displayValue} onClick={() => this.handleClick(clickValue)} size={size}>
		</Button>
		
		
		
	}

	handleClick(value) {
		//console.log("hey, I've been clicked and I have value " + value)
		if (value == "GO") {
			let newResult = this.calculator.calculate(this.state.expression)
			this.setState({ result: newResult })
			return
		}
		if (value == "←") {
			let newExpression = this.state.expression.slice(0, this.state.expression.length - 1)
			this.setState({ expression: newExpression })
			return
		}
		if (value == "CL") {
			this.setState({ expression: "", result: ">Your result will be displayed here<"})
			return
		}


		let newExpression = this.state.expression + value
		this.setState({ expression: newExpression })
	}


	render() {
		return (
			<div>
				<DisplayPanel expression={this.state.expression} result={this.state.result}></DisplayPanel>

				<div className="buttons-row">
					{this.renderButton("7", "7")}
					{this.renderButton("8", "8")}
					{this.renderButton("9", "9")}
					{this.renderButton("+", "+")}
					{this.renderButton("←", "←")}
				</div>
				<div className="buttons-row">
					{this.renderButton("4", "4")}
					{this.renderButton("5", "5")}
					{this.renderButton("6", "6")}
					{this.renderButton("-", "-")}
					{this.renderButton("CL", "CL")}
				</div>
				<div className="buttons-row">
					{this.renderButton("1", "1")}
					{this.renderButton("2", "2")}
					{this.renderButton("3", "3")}
					{this.renderButton("*", "*")}
					{this.renderButton("GO", "GO")}
				</div>
				<div className="buttons-row">
					{this.renderButton(".", ".")}
					{this.renderButton("0", "0")}
					{this.renderButton("^", "^")}
					{this.renderButton("/", "/")}
					{this.renderButton(",", ",")}
				</div>
				<div className="buttons-row">
					{this.renderButton("(", "(")}
					{this.renderButton(")", ")")}
					{this.renderButton("sin", "s(", 2)}

					{this.renderButton("gcd", "d(", 2)}
				</div>
				<div className="buttons-row">
					{this.renderButton("cos", "c(", 2)}

					{this.renderButton("tan", "t(", 2)}

					{this.renderButton("lcm", "m(", 2)}
				</div>
				<div className="buttons-row">
					{this.renderButton("e", "e", 2)}

					{this.renderButton("π", "π", 2)}

					{this.renderButton("ln", "l(", 2)}
				</div>
				<HelpSection></HelpSection>
			</div>
			
		)
	}
}


// ========================================

ReactDOM.render(
	<Board />,
	document.getElementById('root')
);
