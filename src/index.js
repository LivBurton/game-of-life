import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {ButtonToolbar, ButtonGroup, Dropdown, DropdownButton} from 'react-bootstrap';
// below may not be needed?
import * as serviceWorker from './serviceWorker';
// selectBox is being passed through 2 child components. Needs creating on the Main component
class Box extends React.Component {
	// selectBox is inside the render method so use this.props.selectBox within arrow function to pass the props:
	selectBox = () => {
		this.props.selectBox(this.props.row, this.props.col);
	}
	render() {
		return (<div className={this.props.boxClass} id={this.props.id} onClick={this.selectBox}/>);
	}
}

// ----------GRID--------------------------
class Grid extends React.Component {
	render() {
		const width = (this.props.cols * 14);
		var rowsArr = [];
		var boxClass = "";
		// nested for loops would often be done with a .map stuck with this method for now as used to it
		for (var i = 0; i < this.props.rows; i++) {
			for (var j = 0; j < this.props.cols; j++) {
				let boxId = i + "_" + j;
				// ternary operator below checks if true then box on, if false then box off
				boxClass = this.props.gridFull[i][j]
					? "box on"
					: "box off";
				rowsArr.push(<Box boxClass={boxClass} key={boxId} boxId={boxId} row={i} col={j}
					// selectBox is a function
					selectBox={this.props.selectBox}/>);
			}
		}
		return (<div className="grid" style={{
				width: width
			}}>
			{rowsArr}
		</div>);
	}
}

// -------------BUTTONS------------------------
// uses Bootstrap to style the buttons
class Buttons extends React.Component{

  handleSelect = (evt) => {
      // this evt is going to be the eventKey 1, 2 or 3 shown on the button
      this.props.gridSize(evt);
  }

  render(){
    return(
      <div className="center">
        <ButtonToolbar>
          <button className="btn btn-primary mr-2" onClick={this.props.playButton}>
            Play
          </button>
          <button className="btn btn-primary mr-2" onClick={this.props.pauseButton}>
            Pause
          </button>
          <button className="btn btn-primary mr-2" onClick={this.props.clear}>
            Clear
          </button>
          <button className="btn btn-primary mr-2" onClick={this.props.slow}>
            Slow
          </button>
          <button className="btn btn-primary mr-2" onClick={this.props.fast}>
            Fast
          </button>
          <button className="btn btn-primary mr-2" onClick={this.props.seed}>
            Seed
          </button>
          <DropdownButton
            title="Grid Size"
            id="size-menu"
            onSelect={this.handleSelect}
            >
            <Dropdown.Item eventKey="1">20x10</Dropdown.Item>
            <Dropdown.Item eventKey="2">50x30</Dropdown.Item>
            <Dropdown.Item eventKey="3">70x50</Dropdown.Item>
          </DropdownButton>
        </ButtonToolbar>
      </div>
    );
  }
}

// -------------MAIN-------------------------------------
class Main extends React.Component {
	constructor() {
		super();
		this.speed = 100;
		this.rows = 30;
		this.cols = 50;
		this.state = {
			// pass the state variables as props into the <Grid/> component
			generation: 0,
			gridFull: Array(this.rows).fill().map(() => Array(this.cols).fill(false))
		}
	}
	// update the selected box and set to true
	selectBox = (row, col) => {
		// arrayClone is a helper function as will be called a few times. created outside of componenet so "this" is not required
		let gridCopy = arrayClone(this.state.gridFull);
		// find the exact square that was clicked and set it to the opposite:
		gridCopy[row][col] = !gridCopy[row][col];
		this.setState({gridFull: gridCopy});
	}

	seed = () => {
		let gridCopy = arrayClone(this.state.gridFull);
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				// randomy choose if square turned on or not
				// random number between 0 and 4. If it equals 1 then...
				if (Math.floor(Math.random() * 4) === 1) {
					gridCopy[i][j] = true;
				}
			}
		}
		this.setState({gridFull: gridCopy});
	}

	playButton = () => {
    clearInterval(this.intervalId);
    this.intervalId = setInterval(this.play, this.speed);
  }

  pauseButton = () => {
    clearInterval(this.intervalId);
  }

  fast = () =>{
    this.speed = 100;
    this.playButton();
  }
  slow = () =>{
    this.speed = 1000;
    this.playButton();
  }
  clear = () =>{
    // could refacter the below as call a couple of times so could call a function or create once and refer to both times (copied from above)
    var grid = Array(this.rows).fill().map(() => Array(this.cols).fill(false));
    this.setState({
      gridFull: grid,
      generation: 0
    });
  }
  // passing in a number 1, 2 or 3 into gridSize here:
  gridSize = (size) => {
    switch (size){
      case "1":
      this.cols = 20;
      this.rows = 10;
      break;
      case "2":
      this.cols = 50;
      this.rows = 30;
      break;
      default:
      this.cols = 70;
      this.rows = 50;
      }
    this.clear();
  }

  play = () => {
    // want 2 copies of the grid
    // check what the grid is currently like then change the squares on the clone, then set the state using the clone
    let g = this.state.gridFull;
    let g2 = arrayClone(this.state.gridFull);

    for (let i = 0; i < this.rows; i++) {
		  for (let j = 0; j < this.cols; j++) {
        // let count keeping total of the number of neighbours
        let count = 0;
		    if (i > 0) if (g[i - 1][j]) count++;
		    if (i > 0 && j > 0) if (g[i - 1][j - 1]) count++;
		    if (i > 0 && j < this.cols - 1) if (g[i - 1][j + 1]) count++;
		    if (j < this.cols - 1) if (g[i][j + 1]) count++;
		    if (j > 0) if (g[i][j - 1]) count++;
		    if (i < this.rows - 1) if (g[i + 1][j]) count++;
		    if (i < this.rows - 1 && j > 0) if (g[i + 1][j - 1]) count++;
		    if (i < this.rows - 1 && j < this.cols - 1) if (g[i + 1][j + 1]) count++;
		    if (g[i][j] && (count < 2 || count > 3)) g2[i][j] = false;
		    if (!g[i][j] && count === 3) g2[i][j] = true;
		  }
		}
    this.setState({
      gridFull: g2,
      generation: this.state.generation +1
    });
  }

	componentDidMount() {
		this.seed();
    this.playButton();
	}

	render() {
		return (<div>
			<h1>The Game of Life</h1>
      <Buttons
        playButton={this.playButton}
        pauseButton={this.pauseButton}
        slow={this.slow}
        fast={this.fast}
        clear={this.clear}
        seed={this.seed}
        gridSize={this.gridSize}
        />
			<Grid
        gridFull={this.state.gridFull}
        rows={this.rows}
        cols={this.cols}
				// selectBox is a function
				selectBox={this.selectBox}
        />
			<h2>Generations: {this.state.generation}</h2>
		</div>);
	}
}

// ------------------HELPER CLONE FUNCTION------------------
function arrayClone(arr) {
	// parse for data received as JSON (deserialises a JSON string into JS object. JSON.stringify to create string out of object or array. Needs to be a deep clone as a nested array cf other method. Here clones all of the arrays.
	return JSON.parse(JSON.stringify(arr));
}

// -------------------RENDER <MAIN/>------------------------
ReactDOM.render(<Main/>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
