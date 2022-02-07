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

class Calculator{
	// this will be the class which handles all the algorithmic computations


	constructor(){
		//no constructor needed, this class is only a collection of functions.
	}
	calculate(expression){
		console.log("Hey, I'm calculating the expression: " + expression)

		//firstly, we check to see if parenthesis placement is valid, 
		//since splitExpressionIntoChunks requires valid parenthesis placement in order to work
		if(!this.hasValidParenthesisPlacement(expression)){
			return "Hey, it looks like there's a mismatched parenthesis somewhere :("
		}
		
		
		let chunks = this.splitExpressionIntoChunks(expression)
		console.log("here are the chunks I got for the expression: ")
		console.log(JSON.stringify(chunks))

		
		
		




		return "RESULT"
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
			


		console.log("Chunking: " + expression)

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
			result: "17",
		}
		this.calculator = new Calculator()
	}

	renderSquare(i, isdoublebutton) {
		if (!isdoublebutton) {
			return <Button value={i} onClick={() => this.handleClick(i)}>
			</Button>;
		} else {
			return <DoubleButton value={i} onClick={() => this.handleClick(i)}>
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
			this.setState({ expression: ""})
			return
		}


		let newExpression = this.state.expression + value
		this.setState({ expression: newExpression })
	}



	render() {

		return (
			<div>
				<div className="expression-text">{"→ " + this.state.expression}</div>
				<div className="result-text">{"= " + this.state.result}</div>
				<div className="buttons-row">
					{this.renderSquare("7")}
					{this.renderSquare("8")}
					{this.renderSquare("9")}
					{this.renderSquare("+")}
					{this.renderSquare("←")}
				</div>
				<div className="buttons-row">
					{this.renderSquare("4")}
					{this.renderSquare("5")}
					{this.renderSquare("6")}
					{this.renderSquare("-")}
					{this.renderSquare("CL")}
				</div>
				<div className="buttons-row">
					{this.renderSquare("1")}
					{this.renderSquare("2")}
					{this.renderSquare("3")}
					{this.renderSquare("*")}
				</div>
				<div className="buttons-row">
					{this.renderSquare("0", true)}

					{this.renderSquare(".")}
					{this.renderSquare("/")}
				</div>
				<div className="buttons-row">
					{this.renderSquare("GO", true)}

					{this.renderSquare("(")}
					{this.renderSquare(")")}
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
