import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// class Square extends React.Component {
//   render() {
//     return (
//       <button className="square">
//         {/* TODO */}
//       </button>
//     );
//   }
// }
function Square(props){
  return(
    <button className="square"
      onClick={() => props.onClick()}
    > 
      {props.value}
    </button>
  )
}


class Board extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      expression: "→"
    }
  }
  
  renderSquare(i) {
    return <Square value={i} onClick={() => this.handleClick(i)}>
    </Square>;
  }

  handleClick(value){
    console.log("hey, I've been clicked and I have value " + value)
    let newExpression = this.state.expression + value
    this.setState({expression: newExpression})
  }

  

  render() {

    return (
      <div>
        <div className="status">{this.state.expression}</div>
        <div className="buttons-row">
          {this.renderSquare("0")}
          {this.renderSquare("1")}
          {this.renderSquare("2")}
          {this.renderSquare("+")}
        </div>
        <div className="buttons-row">
          {this.renderSquare("3")}
          {this.renderSquare("4")}
          {this.renderSquare("5")}
          {this.renderSquare("-")}
        </div>
        <div className="buttons-row">
          {this.renderSquare("6")}
          {this.renderSquare("7")}
          {this.renderSquare("8")}
          {this.renderSquare("*")}
        </div>
        <div className="buttons-row">
          {this.renderSquare("(")}
          {this.renderSquare(")")}
          {this.renderSquare(".")}
          {this.renderSquare("/")}
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
