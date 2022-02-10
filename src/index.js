import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


function Button(props) {
	return (
		<button className="button"
			onClick={() => props.onClick()}
		>
			{props.value}
		</button>
	)
}

function DoubleButton(props) {
	return (
		<button className="doublebutton"
			onClick={() => props.onClick()}
		>
			{props.value}
		</button>
	)
}

function DisplayPanel(props){
	let expression = "→ " + props.expression
	let result = "= " + props.result
	
	let prettyPrint = true
	if(prettyPrint){
		//do something to format it better
	}

	return(
		<div className = "displaypanel">
			<div className="expression-text">{expression}</div>
			<div className="result-text">{result}</div>
		</div>
		
	)

}

class Calculator{
	// this will be the class which handles all the algorithmic computations


	constructor(){
		//no constructor needed, this class is only a collection of functions.
	}
	calculate(expression){

		//firstly, we check to see if parenthesis placement is valid, 
		//since splitExpressionIntoChunks requires valid parenthesis placement in order to work
		if(!this.hasValidParenthesisPlacement(expression)){
			return "Hey, it looks like there's a mismatched parenthesis somewhere :("
		}
		
		
		let chunks = this.splitExpressionIntoChunks(expression)
		console.log("Initial chunks: " + JSON.stringify(chunks))

		//now we want to replace leading negative signs with {"-1", "*"}
		chunks = this.processNegativeSigns(chunks)

		console.log("chunks after processing negative signs:" + JSON.stringify(chunks))

		//now we want to eliminate the possibility of operators being next to each other, or at the end of the chunkstring,  (if an operator is missing between two numbers then we assume multiplication, we'll do that later)
		//i.e. we don't want something like [3,*,-, 6] or [*]
		//this function also gets rid of expressions containing empty parenthesis such as "3*5-()"
		if(!this.hasValidOperatorPlacement(chunks)){
			return "Hey, check your operators; one of them is misplaced!"
		}
		

		//Now we ensure the functions (sin, cos, tan, ln, gcd, lcm) are always immediately followed by a chunk
		if(!this.hasValidFunctionPlacement(chunks)){
			return "Please ensure that all functions are followed by parentheses!"
		}
		

		//we now check to see whether there is an invalid number somwhere such as "." or "24.123.2"
		let res = this.findInvalidNumber(chunks)
		if(res){
			return 'Hey, "' + res + '" is an invalid number!'
		}

		//now we would like to check for the correct placement of commas	
		if(!this.hasValidCommaPlacement(chunks)){
			return "Check your commas, please!"
		}

		return "All good so far"

		//now we convert all numbers in the form of strings to the form of floats, and also add implicit multiplication to the chunks
		const parsedChunks = this.addImplicitMultiplication(this.convertNumbersFromStringsToFloats(chunks))
		console.log(JSON.stringify(parsedChunks))
		//console.log(JSON.stringify(this.simplifyOnce(parsedChunks)))
		




		return this.compute(parsedChunks).toFixed(6).replace(/\.?0*$/,'') //round to 6 decimal places and trim trailing zeros and decimal point

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
		//this function takes in something like [2+3/4-1*6]
		//and returns [2+0.75-1*6]
		
		//it performs the first multiplication or division there is (looking left to right), 
		//and if there is none, it does the first addition/subtraction

		//if the chunk already has length 1, then it simply returns the chunk

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

			let thisChunkIsAValue = !(typeof(chunks[i]) === 'string' || chunks[i] === undefined)
			let nextChunkIsAValue = !(typeof(chunks[i+1]) === 'string' || chunks[i+1] === undefined)
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
				continue
			}
			if ("+-*/".includes(chunk)){
				newChunks.push(chunk)
				continue
			}
			//by this point we know the chunk is a number
			newChunks.push(parseFloat(chunk))
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
			return ["-1", "*"].concat(chunks.slice(1, chunks.length))
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

	renderButton(displayValue, clickValue, isdoublebutton) {
		if (!isdoublebutton) {
			return <Button value={displayValue} onClick={() => this.handleClick(clickValue)}>
			</Button>;
		} else {
			return <DoubleButton value={displayValue} onClick={() => this.handleClick(clickValue)}>
			</DoubleButton>;
		}
	}

	handleClick(value) {
		//console.log("hey, I've been clicked and I have value " + value)
		if (value == "GO") {
			//run this after validating the input
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
					{this.renderButton("sin", "s(", true)}

					{this.renderButton("gcd", "d(", true)}
				</div>
				<div className="buttons-row">
					{this.renderButton("cos", "c(", true)}

					{this.renderButton("tan", "t(", true)}

					{this.renderButton("lcm", "m(", true)}
				</div>
				<div className="buttons-row">
					{this.renderButton("e", "e", true)}

					{this.renderButton("π", "π", true)}

					{this.renderButton("ln", "l(", true)}
				</div>
			</div>
		);
	}
}


// ========================================

ReactDOM.render(
	<Board />,
	document.getElementById('root')
);
