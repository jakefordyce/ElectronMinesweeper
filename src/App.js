import React from 'react';
//import logo from './logo.svg';
import './App.css';

/*
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}
*/

class App extends React.Component{
  constructor(props){
    super(props);
    this.state = { field: [], fieldSize: 10, numBombs: 10, gameStarted: false, gameEnded: false, gameTime: 0, flagsLeft: 10, cellsLeft: 0, leftClicked: false, rightClicked: false};
    //just weird react things that needs to happen with all functions
    this.startClick = this.startClick.bind(this);
    this.endClick = this.endClick.bind(this);
    this.resetClicks = this.resetClicks.bind(this);
    this.toggleCellFlagged = this.toggleCellFlagged.bind(this);
    this.startRevealCell = this.startRevealCell.bind(this);
    this.revealCell = this.revealCell.bind(this);
    this.startGame = this.startGame.bind(this);
    this.handleGridSizeChange = this.handleGridSizeChange.bind(this);
    this.handleBombsChange = this.handleBombsChange.bind(this);
    this.timer = this.timer.bind(this);
    this.endGame = this.endGame.bind(this);
    this.restartGame = this.restartGame.bind(this);
  }
  
  componentDidMount(){
    
  }
  
  componentWillUnmount(){
    clearInterval(this.state.intervalId);
  }
  
  timer(){
    var newTime = this.state.gameTime;
    newTime++;
    this.setState({gameTime: newTime});
  }
  
  startClick(event){
    if(event.button === 0){
      this.setState({leftClicked: true});
    }else if(event.button === 2){
      this.setState({rightClicked: true});
    }
  }
  
  endClick(event, rowNum, colNum){    
    const {leftClicked, rightClicked} = this.state;
        
    if(leftClicked && rightClicked){ //both buttons
      if(this.state.field[rowNum][colNum].revealed){
          this.startRevealCell(rowNum-1, colNum-1);
          this.startRevealCell(rowNum-1, colNum);
          this.startRevealCell(rowNum-1, colNum+1);
          this.startRevealCell(rowNum, colNum-1);
          this.startRevealCell(rowNum, colNum+1);
          this.startRevealCell(rowNum+1, colNum-1);
          this.startRevealCell(rowNum+1, colNum);
          this.startRevealCell(rowNum+1, colNum+1);
        }
    }else if(leftClicked && !rightClicked){ //left click
      this.startRevealCell(rowNum, colNum);
    }else if(!leftClicked && rightClicked){ //right click
      this.toggleCellFlagged(rowNum, colNum);
    }
    
    //reset click info
    this.setState({leftClicked: false, rightClicked: false});  
  }
  
  resetClicks(){
    this.setState({leftClicked: false, rightClicked: false});
  }
  
  //puts a flag on a cell.
  toggleCellFlagged(rowNum, colNum){       
    if(this.state.field[rowNum][colNum].revealed !== true && !this.state.gameEnded){ //ignore right clicks on cells that are already revealed.
      //get a new value that is the opposite of its current value
      var newValue = !this.state.field[rowNum][colNum].flagged;
      //need to make sure we have flags left before adding a flag
      var updateValue = false;
      
      if(newValue === true){ //trying to add a falg
        if(this.state.flagsLeft > 0){          
          this.setState({flagsLeft: this.state.flagsLeft -1});          
          updateValue = true;
        }        
      }else{ //removing a flag
        this.setState({flagsLeft: this.state.flagsLeft +1});
        updateValue = true;
      }
      
      if(updateValue === true){
        //copy the array since we can't modify it directly
        var newArray = this.state.field.map(f => f);    
        //update the new array
        newArray[rowNum][colNum].flagged = newValue;
        //and assign the new array back into the state
        var newCount = countCellsLeft(newArray, this.state.fieldSize)
        this.setState({field: newArray, cellsLeft: newCount});
        if(newCount === 0){
          this.endGame();
        }
      }
    }
  }
  
  //starts the process of revealing the clicked cell.
  startRevealCell(rowNum, colNum){    
    if(!this.state.gameEnded && rowNum >= 0 && rowNum < this.state.fieldSize && colNum >= 0 && colNum < this.state.fieldSize){
      if(this.state.field[rowNum][colNum].bomb && !this.state.field[rowNum][colNum].flagged){
        //this.state.field[rowNum][colNum].revealed = true;
        var newArray = this.state.field.map(f => f);
        newArray[rowNum][colNum].revealed = true;
        this.setState({field: newArray});
        this.endGame();
      }else{
        //not a bomb, reveal the cell
        this.revealCell(rowNum, colNum);
        
        //I'm lucky that I can get away with reading the field here after updating it in revealCell
        // since setState is async. It might be because the field is used as a prop and it needs to rerender when a prop is updated.
        var newCount = countCellsLeft(this.state.field, this.state.fieldSize);
        
        this.setState({cellsLeft: newCount});        
                
        if(newCount === 0){
          this.endGame();
        }
      }
    }    
  }
  
  endGame(){
    this.setState({gameEnded: true});
    //turn off the timer
    clearInterval(this.state.intervalId);
  }
  
  restartGame(event){
    this.setState({field: [], gameStarted: false, gameEnded: false, gameTime: 0})
  }
  
  //recursively reveals the cell and if blank the cells around it until we run out of adjacent empty cells.
  revealCell(rowNum, colNum){    
    //make sure cell being checked is within array bounds
    if(rowNum >= 0 && rowNum < this.state.fieldSize && colNum >= 0 && colNum < this.state.fieldSize){
      //skip if already revealed
      if(this.state.field[rowNum][colNum].revealed === false && this.state.field[rowNum][colNum].flagged === false){

        //reveal the current cell
        var newArray = this.state.field.map(f => f);
        newArray[rowNum][colNum].revealed = true;        
        this.setState({field: newArray});
        
        //if the cell doesn't have any nearby bombs we need to also reveal the cells around it.
        if(this.state.field[rowNum][colNum].nearby === 0){
          this.revealCell(rowNum-1, colNum-1);
          this.revealCell(rowNum-1, colNum);
          this.revealCell(rowNum-1, colNum+1);
          this.revealCell(rowNum, colNum-1);
          this.revealCell(rowNum, colNum+1);
          this.revealCell(rowNum+1, colNum-1);
          this.revealCell(rowNum+1, colNum);
          this.revealCell(rowNum+1, colNum+1);
        }
      }//revealed check
    }//array bounds check
  }
  
  startGame(event){    
    this.setState({field: createField(this.state.fieldSize, this.state.numBombs)});
    var flags = this.state.numBombs;
    var cells = this.state.fieldSize * this.state.fieldSize;    
    this.setState({gameStarted: true, flagsLeft: flags, cellsLeft: cells, gameTime: 0});
    //turn on our timer and track it so we can turn it off later.
    var intervalId = setInterval(this.timer, 1000);
    this.setState({intervalId: intervalId});
  };
  
  //handles the textbox for selecting the size of the grid.
  handleGridSizeChange(event){
    console.log(event.target.value);
    this.setState({fieldSize: event.target.value});
  }
  
  //handles the textbox for selecting the number of bombs.
  handleBombsChange(event){
    this.setState({numBombs: event.target.value});
  }
  
  render(){
    return (
      <div onMouseUp={(e) => this.resetClicks()} onContextMenu={(e) => e.preventDefault()}>
        <h1>Minesweeper</h1>
        {!this.state.gameStarted && <GameSetupArea start={this.startGame} size={this.state.fieldSize} changeSize={this.handleGridSizeChange} changeBombs={this.handleBombsChange} bombs={this.state.numBombs}/>}
        {this.state.gameStarted && !this.state.gameEnded && <GameInfo time={this.state.gameTime} flags={this.state.flagsLeft}/>}
        {this.state.gameEnded && <GameOverInfo time={this.state.gameTime} cells={this.state.cellsLeft} restart={this.restartGame}/>}
        {this.state.gameStarted && <PlayField field={this.state.field} clickStart={this.startClick} clickEnd={this.endClick}/>}
      </div>
    );
  }
}

function countCellsLeft(field, size){
  var count = size * size;  
  for(var i = 0; i < size; i++){
    for(var j = 0; j < size; j++){
      if(field[i][j].flagged || field[i][j].revealed){
        count--;
      }
    }
  }  
  return count;
}

//creates a 2 dimensional array of our game objects
function createField(size, bombs){
  var arr = [];
  
  //initialize array with default values
  for(var i = 0; i < size; i++){
    arr[i] = [];
    for(var j = 0; j < size; j++){
      arr[i][j] = {row: i, column: j, flagged: false, bomb: false, nearby: 0, revealed: false};      
    }
  }
  
  //apply bombs to random squares
  if(bombs < (size * size)){
    var bombsLeft = bombs;
    
    while(bombsLeft > 0){
      var bombRow = Math.floor(Math.random()* size);
      var bombCol = Math.floor(Math.random()* size);
      if(arr[bombRow][bombCol].bomb === false){        
        arr[bombRow][bombCol].bomb = true;
        bombsLeft--;
      }      
    }
  }
  
  //mark cells with number of nearby bombs
  for(var k = 0; k < size; k++){
    for(var l = 0; l < size; l++){
      var near = 0;
      
      for(var r = -1; r <= 1; r++){
        for(var c = -1; c <= 1; c++){
          if(k+r >= 0 && k+r < size && l+c >= 0 && l+c < size && (r !== 0 || c !== 0) ){
            near += arr[k+r][l+c].bomb ? 1 : 0;
          }
        }
      }
      
      arr[k][l].nearby = near;
    }
  }
  
  return arr;
}

function GameSetupArea(props){
  return(
    <div>
      <form onSubmit={props.start}>
        <label>Grid Size: </label>
        <input type="text" value={props.size} onChange={props.changeSize} />
        <label> Bombs: </label>
        <input type="text" value={props.bombs} onChange={props.changeBombs} />
        <input type="submit" value="Start" />
      </form>
    </div>);
}

function GameInfo(props){
  return (<div>
      <label>Time: </label>
      <label>{props.time}</label>
      <label> Flags: </label>
      <label>{props.flags}</label>
    </div>);
}

function GameOverInfo(props){
  var resultsText = '';
  var victory = false;
  if(props.cells === 0){
    resultsText = 'YOU WIN!';
    victory = true;
  }else{
    resultsText = 'YOU LOSE!';
  }
  
  return(<div>
      <h2>{resultsText}</h2>
      {victory && <h2>Score: {props.time}</h2>}
      <button onClick={(e) => props.restart(e)}>Restart</button>
    </div>);
}

//the entire field of all squares
function PlayField(props){
  //break our field into rows
  var fieldRows = props.field.map((row, index) => <FieldRow columns={props.field[index]} clickStart={props.clickStart} clickEnd={props.clickEnd} />);
  return (<div>{fieldRows}</div>);
}

//each row
function FieldRow(props){
  //setup the css columns for our row
  var divStyle = getCSSGridColumns(props.columns.length);
  //and break our row into individual cells
  var rowColumns = props.columns.map((row, index) => <FieldCell cell={props.columns[index]} clickStart={props.clickStart} clickEnd={props.clickEnd}/>);
  return (<div style={divStyle} className="field_row">{rowColumns}</div>);
}

//the cells in each row
function FieldCell(props){
  var cellText;
  var cellCssClass = 'cell_button';
  if(props.cell.flagged === true){ //if we have flagged the cell show that
    cellText = 'F';
    cellCssClass += ' unrevealed';
    cellCssClass += ' flagged';
  }else{
    if(props.cell.revealed === true){
      cellCssClass += ' revealed';
      if(props.cell.bomb === true){
        cellText = "B";
        cellCssClass += ' bomb';
      }else{
        if(props.cell.nearby > 0){ //if it has been revealed and it has nearby bombs we need to show the number of nearby bombs
          cellText = props.cell.nearby;  
        }else{ //no nearby bombs
          cellText = ' ';
        } 
      }
    }
    else{ //default cell that hasn't been flagged or revealed
      cellText = ' ';
      cellCssClass += ' unrevealed';
    }
  }
  return (<div>
      <button className={cellCssClass} onContextMenu={(e) => e.preventDefault()} onMouseUp={(e) => props.clickEnd(e, props.cell.row, props.cell.column)} onMouseDown={ (e) => props.clickStart(e)}>{cellText}</button>
    </div>);
}

//dynamically create our css grid
function getCSSGridColumns(colCount){
  var gridColumns = "";
  for (var i = 0; i < colCount; i++){
    gridColumns += " 30px";
  }
  
  var divStyle = {
    gridTemplateColumns: gridColumns
  };
  return divStyle;
}

export default App;
