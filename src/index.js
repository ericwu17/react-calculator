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
	constructor(){
		
	}
	calculate(expression){
		console.log("Hey, I'm calculating the expression: " + expression)
		return "RESULT"
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
