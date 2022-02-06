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
  renderSquare(i) {
    return <Square value={i} onClick={() => this.handleClick(i)}>
    </Square>;
  }

  handleClick(value){
    console.log("hey, I've been clicked and I have value " + value)
  }

  render() {
    const status = 'Expressions will be displayed here';

    return (
      <div>
        <div className="status">{status}</div>
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

class Game extends React.Component {
  render() {
    return (
      <div className="game">
        <div className="game-board">
          <Board />
        </div>
        <div className="game-info">
          <div>{/* status */}</div>
          <ol>{/* TODO */}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
