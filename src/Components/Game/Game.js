import React from 'react';
import './Game.css';
import CountDown from '../CountDown/CountDown';
import PlayerInfo from '../PlayerInfo/PlayerInfo'

export default class Game extends React.Component {

    constructor(props) {
        super(props);
        
        this.cellSize = 45;

        this.state = {
            dice: [],
            chips: [],
            chipsToMove: [],
            selectedChip: null,
            cellsToMove: []
        }
        this.scheme = createScheme();
        this.socket = this.props.socket;

        this.moveChipToCell = moveChipToCell.bind(this);
        
        this.getChipsToMove = getChipsToMove.bind(this);
        this.getPossibleMoves = getPossibleMoves.bind(this);

        this.getPlayerFromCell = getPlayerFromCell.bind(this);
        this.updateDiceActive = updateDiceActive.bind(this);
        this.returnChipsToBase = returnChipsToBase.bind(this);
        this.chipCanMove = chipCanMove.bind(this);

        this.state.chips = defaultChipsPositions(this.props.playersOrder);
        
    }
    
    componentDidMount() {
        this.socket.on('removed', () => {console.log('removed')});
		this.socket.on("cheat-updated", data => {
            if (['flight', 'shield', 'free_shortcuts', 'no_shortcuts'].indexOf(data.cheatId) !== -1) {
                this.state.chips[data.player][data.num][data.cheatId] = data.on;
                this.setState({ dice: this.state.dice.slice(), selectedChip: null });
            }
        })
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.gameOn === true && this.props.gameOn === false) {
            this.setState({
                dice: [],
                chips: defaultChipsPositions(this.props.playersOrder),
                selectedChip: null
            });
            this.scheme = createScheme();
            setTimeout(() => this.props.playersOrder.map( i => this.returnChipsToBase(i)), 1000);
        }
        if (prevProps.moveData !== this.props.moveData && this.props.moveData)
            performMove.call(this,
                             this.state.chips[this.props.moveData.playerNum][this.props.moveData.num],
                             this.props.moveData.diceNum,
                             this.props.moveData.position,
                             this.props.moveData.flight);

        if (prevProps.playersInfo !== this.props.playersInfo) {
            if (this.props.gameOn && prevProps.playersInfo.length === this.props.playersInfo.length) {
                let playerLeft = prevProps.playersInfo.find((pl, i) => {return pl.left !== this.props.playersInfo[i].left});

                let playerLeftIndex = prevProps.playersInfo.indexOf(playerLeft);

                if (playerLeftIndex !== -1) {
                    this.returnChipsToBase(this.props.playersOrder[playerLeftIndex]);
                }
            } else {
                this.setState({ chips: defaultChipsPositions(this.props.playersOrder) })
            }
        }

        if (prevProps.dice !== this.props.dice) {
            this.setState({dice: this.props.dice.slice()});
        }

        if (prevState.dice !== this.state.dice) {
            let chipsToMove = this.getChipsToMove();
            this.setState({chipsToMove: chipsToMove.map(i => i.num)}, () => {
                this.updateDiceActive();
                this.props.setCanSkip(chipsToMove.every(chip => chip.canSkip));
            });
        }
        
        if (prevProps.turn !== this.props.turn) {
            this.setState({selectedChip: null});
            if (this.props.turn === this.props.yourTurn) {
                this.socket.emit("reset-timer", {
                    tableId: this.props.tableId,
                    turn: this.props.turn
                });
            }
        }

        if (prevState.selectedChip !== this.state.selectedChip) {
            if (this.state.selectedChip) {
                let chip = this.state.chips[this.props.playersOrder[this.props.turn]][this.state.selectedChip.num];
                let cellsToMove = this.getPossibleMoves(chip, this.state.dice[0]).map(cell => ({ ...cell, diceNum: 0 }))
                    .concat(this.getPossibleMoves(chip, this.state.dice[1]).map(cell => ({ ...cell, diceNum: 1 })))
                    .concat(getFreeShortcuts.call(this, chip));
                
                this.setState({ cellsToMove });
            } else {
                this.setState({ cellsToMove: [] })
            }
        }
        if (prevState.cellsToMove !== this.state.cellsToMove) {

            Array.from(document.getElementsByClassName("game_cell-move")).forEach(elem => {
                elem.removeAttribute("data-dice-num");
                elem.classList.remove("game_cell-move");
                elem.classList.remove("game_cell-move-free");
            });

            this.state.cellsToMove.forEach(cell => {
                const elem = document.getElementById(cell.id);
                if (!elem)
                    console.log("some weird shit", this.state.cellsToMove)
                else {
                    elem.classList.add("game_cell-move");
                    elem.setAttribute("data-dice-num", cell.diceNum);
                    if (cell.diceNum === false) elem.classList.add("game_cell-move-free");
                }
            })
        }
        if (prevProps.disabled !== this.props.disabled) {
            this.updateDiceActive();
        }
    }
  	render(){
        let chargedChipsNums = [
            null,
            this.scheme["game_start-cell_player1"].chips.length > 1 ? this.scheme["game_start-cell_player1"].chips.length : '',
            this.scheme["game_start-cell_player2"].chips.length > 1 ? this.scheme["game_start-cell_player2"].chips.length : '',
            this.scheme["game_start-cell_player3"].chips.length > 1 ? this.scheme["game_start-cell_player3"].chips.length : '',
            this.scheme["game_start-cell_player4"].chips.length > 1 ? this.scheme["game_start-cell_player4"].chips.length : '',
        ];
		return (
			<div className={`game_container game_container-player${this.props.playersOrder[this.props.yourTurn]}`}>
                {this.props.playersOrder.map((i, index) => (
                    <React.Fragment key={i}>
                        <PlayerInfo playerLeft={this.props.playersInfo[index].left} num={i} playersInfo={this.props.playersInfo[index]} myNum={this.props.playersOrder[this.props.yourTurn]}/>
                        {this.props.playersOrder[this.props.turn] === i ?
                            <CountDown playerNum={i} dice={this.state.dice} myTimer={this.props.turn === this.props.yourTurn} myNum={this.props.playersOrder[this.props.yourTurn]} />
                            : ""}
                    </React.Fragment>
                ))}
                <div className="game_board" onClick={(event) => {
                    if (this.props.disabled)
                        return;

                    if (!event.target.classList.contains("game_cell-move") || this.props.yourTurn !== this.props.turn)
                        return;

                    this.socket.emit("chip-moved", {tableId: this.props.tableId, 
                                                    yourTurn: this.props.yourTurn, 
                                                    chipNum: this.state.selectedChip.num,
                                                    targetId: event.target.id,
                                                    diceNum: str2bool(event.target.getAttribute("data-dice-num"))})

                    
                }}>
                    {/*1 row*/}
                    <div className="game_space game_space4"></div>
                    <div className="game_cell game_cell-start" id="game_start-cell_player3" data-charged-chips={chargedChipsNums[3]}></div>
                    <div className="game_cell game_cell_player3" data-number="1" id="game_cell25"></div>
                    <div className="game_cell game_cell_player3" data-number="12" id="game_cell24"></div>
                    <div className="game_cell game_cell_player3" data-number="11" id="game_cell23"></div>
                    <div className="game_space game_space5 b-l-1"></div>

                    {/*2 row*/}
                    <div className="game_space game_space4"></div>
                    <div className="game_space game_space1 b-t-1"></div>
                    <div className="game_cell game_cell_player3" data-number="2" id="game_cell26"></div>
                    <div className="game_cell game_cell-finish game_cell-finish_player3 b-l-1 b-t-1" id="game_cell-finish_player3_1"></div>
                    <div className="game_cell game_cell_player3" data-number="10" id="game_cell22"></div>
                    <div className="game_cell game_cell-safe-house" id="game_cell-safe-house1"></div>
                    <div className="game_space game_space4 b-l-1"></div>

                    {/*3 row*/}
                    <div className="game_space game_space5"></div>
                    <div className="game_cell game_cell_player3" data-number="3" id="game_cell27"></div>
                    <div className="game_cell game_cell-finish game_cell-finish_player3 b-l-1" id="game_cell-finish_player3_2"></div>
                    <div className="game_cell game_cell_player3" data-number="9" id="game_cell21"></div>
                    <div className="game_space game_space1 b-l-1 b-t-1"></div>
                    <div className="game_space game_space4"></div>

                    {/*4 row*/}
                    <div className="game_space game_space5"></div>
                    <div className="game_cell game_cell_player3" data-number="4" id="game_cell28"></div>
                    <div className="game_cell game_cell-finish game_cell-finish_player3 b-l-1" id="game_cell-finish_player3_3"></div>
                    <div className="game_cell game_cell_player3" data-number="8" id="game_cell20"></div>
                    <div className="game_space game_space5 b-l-1"></div>

                    {/*5 row*/}
                    <div className="game_space game_space1"></div>
                    <div className="game_cell game_cell-safe-house" id="game_cell-safe-house2"></div>
                    <div className="game_space game_space3 b-l-1"></div>
                    <div className="game_cell game_cell_player3" data-number="5" id="game_cell29"></div>
                    <div className="game_cell game_cell-finish game_cell-finish_player3 b-l-1" id="game_cell-finish_player3_4"></div>
                    <div className="game_cell game_cell_player3" data-number="7" id="game_cell19"></div>
                    <div className="game_space game_space4 b-l-1"></div>
                    <div className="game_cell game_cell-start b-r-1" id="game_start-cell_player4"  data-charged-chips={chargedChipsNums[4]}></div>

                    {/*6 row*/}
                    <div className="game_cell game_cell_player2" data-number="11" id="game_cell35"></div>
                    <div className="game_cell game_cell_player2" data-number="10" id="game_cell34"></div>
                    <div className="game_cell game_cell_player2" data-number="9" id="game_cell33"></div>
                    <div className="game_cell game_cell_player2" data-number="8" id="game_cell32"></div>
                    <div className="game_cell game_cell_player2" data-number="7" id="game_cell31"></div>
                    <div className="game_cell" data-number="6" id="game_cell30"></div>
                    <div className="game_cell game_cell_cant-stand game_cell_arrow arrow arrow-left"></div>
                    <div className="game_cell" data-number="6" id="game_cell18"></div>
                    <div className="game_cell game_cell_player4" data-number="5" id="game_cell17"></div>
                    <div className="game_cell game_cell_player4" data-number="4" id="game_cell16"></div>
                    <div className="game_cell game_cell_player4" data-number="3" id="game_cell15"></div>
                    <div className="game_cell game_cell_player4" data-number="2" id="game_cell14"></div>
                    <div className="game_cell game_cell_player4 b-r-1" data-number="1" id="game_cell13"></div>

                    {/*7 row */}
                    <div className="game_cell game_cell_player2" data-number="12" id="game_cell36"></div>
                    <div className="game_cell game_cell-finish game_cell-finish_player2 b-t-1 b-l-1" id="game_cell-finish_player2_1"></div>
                    <div className="game_cell game_cell-finish game_cell-finish_player2 b-t-1" id="game_cell-finish_player2_2"></div>
                    <div className="game_cell game_cell-finish game_cell-finish_player2 b-t-1" id="game_cell-finish_player2_3"></div>
                    <div className="game_cell game_cell-finish game_cell-finish_player2 b-t-1" id="game_cell-finish_player2_4"></div>
                    <div className="game_cell game_cell_cant-stand game_cell_arrow arrow arrow-down"></div>
                    <div className="game_cell game_cell_cant-stand game_cell_center arrow arrows-crossing" ></div>
                    <div className="game_cell game_cell_cant-stand game_cell_arrow arrow arrow-up"></div>
                    <div className="game_cell game_cell-finish game_cell-finish_player4 b-t-1 b-l-1" id="game_cell-finish_player4_4"></div>
                    <div className="game_cell game_cell-finish game_cell-finish_player4 b-t-1" id="game_cell-finish_player4_3"></div>
                    <div className="game_cell game_cell-finish game_cell-finish_player4 b-t-1" id="game_cell-finish_player4_2"></div>
                    <div className="game_cell game_cell-finish game_cell-finish_player4 b-t-1" id="game_cell-finish_player4_1"></div>
                    <div className="game_cell game_cell_player4 b-r-1" data-number="12" id="game_cell12"></div>

                    {/*8 row*/}
                    <div className="game_cell game_cell_player2" data-number="1" id="game_cell37"></div>
                    <div className="game_cell game_cell_player2" data-number="2" id="game_cell38"></div>
                    <div className="game_cell game_cell_player2" data-number="3" id="game_cell39"></div>
                    <div className="game_cell game_cell_player2" data-number="4" id="game_cell40"></div>
                    <div className="game_cell game_cell_player2" data-number="5" id="game_cell41"></div>
                    <div className="game_cell" data-number="6" id="game_cell42"></div>
                    <div className="game_cell game_cell_cant-stand game_cell_arrow arrow arrow-right"></div>
                    <div className="game_cell" data-number="6" id="game_cell6"></div>
                    <div className="game_cell game_cell_player4" data-number="7" id="game_cell7"></div>
                    <div className="game_cell game_cell_player4" data-number="8" id="game_cell8"></div>
                    <div className="game_cell game_cell_player4" data-number="9" id="game_cell9"></div>
                    <div className="game_cell game_cell_player4" data-number="10" id="game_cell10"></div>
                    <div className="game_cell game_cell_player4 b-r-1" data-number="11" id="game_cell11"></div>

                    {/*9 row*/}
                    <div className="game_cell game_cell-start" id="game_start-cell_player2" data-charged-chips={chargedChipsNums[2]}></div>
                    <div className="game_space game_space4 b-t-1 b-l-1"></div>
                    <div className="game_cell game_cell_player1" data-number="7" id="game_cell43"></div>
                    <div className="game_cell game_cell-finish game_cell-finish_player1 b-t-1 b-l-1" id="game_cell-finish_player1_4"></div>
                    <div className="game_cell game_cell_player1" data-number="5" id="game_cell5"></div>
                    <div className="game_space game_space3 b-t-1 b-l-1"></div>
                    <div className="game_cell game_cell-safe-house" id="game_cell-safe-house0"></div>
                    <div className="game_space game_space1 b-t-1 b-l-1"></div>

                    {/*10 row*/}
                    <div className="game_space game_space1 b-t-1"></div>
                    <div className="game_space game_space4"></div>
                    <div className="game_cell game_cell_player1" data-number="8" id="game_cell44"></div>
                    <div className="game_cell game_cell-finish game_cell-finish_player1 b-l-1" id="game_cell-finish_player1_3"></div>
                    <div className="game_cell game_cell_player1" data-number="4" id="game_cell4"></div>
                    <div className="game_space game_space3 b-l-1"></div>
                    <div className="game_space game_space1 b-t-1"></div>
                    <div className="game_space game_space1"></div>

                    {/*11 row*/}
                    <div className="game_space game_space5"></div>
                    <div className="game_cell game_cell_player1" data-number="9" id="game_cell45"></div>
                    <div className="game_cell game_cell-finish game_cell-finish_player1 b-l-1" id="game_cell-finish_player1_2"></div>
                    <div className="game_cell game_cell_player1" data-number="3" id="game_cell3"></div>
                    <div className="game_space game_space5 b-l-1"></div>

                    {/*12 row*/}
                    <div className="game_space game_space4"></div>
                    <div className="game_cell game_cell-safe-house" id="game_cell-safe-house3" ></div>
                    <div className="game_cell game_cell_player1" data-number="10" id="game_cell46"></div>
                    <div className="game_cell game_cell-finish game_cell-finish_player1 b-l-1" id="game_cell-finish_player1_1"></div>
                    <div className="game_cell game_cell_player1" data-number="2" id="game_cell2"></div>
                    <div className="game_space game_space5 b-l-1"></div>

                    {/*13 row*/}
                    <div className="game_space game_space4"></div>
                    <div className="game_space game_space1 b-t-1"></div>
                    <div className="game_cell game_cell_player1 b-b-1" data-number="11" id="game_cell47"></div>
                    <div className="game_cell game_cell_player1 b-b-1" data-number="12" id="game_cell48"></div>
                    <div className="game_cell game_cell_player1 b-b-1" data-number="1" id="game_cell1"></div>
                    <div className="game_cell game_cell-start b-b-1" id="game_start-cell_player1" data-charged-chips={chargedChipsNums[1]}></div>
                    <div className="game_space game_space4 b-l-1"></div>

                    {[1, 2, 3, 4].map(k => (
                            <React.Fragment key={k}>
                                <div className={`game_arrow-body game_arrow-body_player${k}`} />
                                <div className={`game_arrow-end game_arrow-end_player${k}`} />
                            </React.Fragment>
                        )
                    )}
                    {this.props.playersOrder.map((i, index) => {
                        let playerLeft = this.props.playersInfo[index].left;
                        return (
                        <React.Fragment key={`game_chip-base_player${i}`}>
                            <div className={`game_chip-base game_chip-base_player${i}${playerLeft ? ' disabled' : ''}`}>
                                {[1, 2, 3, 4].map(k => (
                                    <div className={`game_chip-base_chip-space game_chip-base_chip-space_player${i}_num${k}`}
                                         id={`game_chip-base_chip-space_player${i}_num${k}`}
                                         key={`game_chip-base_chip-space_player${i}_num${k}`}/>
                                ))}
                            </div>
                            {[1, 2, 3, 4].map(k => {
                                let additionalClassName = "";

                                if (this.props.playersOrder[this.props.turn] === i && this.state.chipsToMove.indexOf(k) !== -1) {
                                    additionalClassName += " game_chip_can-move";
                                    additionalClassName += this.state.turn === this.props.yourTurn ? " game_chip_can-move_hoverable" : "";
                                }

                                if (this.state.selectedChip && this.state.selectedChip.id === `game_chip_player${i}_num${k}`) {
                                    additionalClassName += " game_chip-selected";
                                }
                                
                                if (this.props.yourTurn === this.props.turn) {
                                    if (this.state.cellsToMove.find(elem => (elem.id === this.state.chips[i][k].position) && !this.state.chips[i][k].shield &&
                                        +this.getPlayerFromCell(this.state.chips[i][k].position) !== this.props.playersOrder[this.props.turn])) {
                                            additionalClassName += " game_chip-can-be-eaten";
                                        }
                                }
                                additionalClassName += playerLeft ? ' disabled' : '';

                                return (
                                <div className={`game_chip game_chip_player${i}${additionalClassName}`} 
                                    id={`game_chip_player${i}_num${k}`}
                                    key={`game_chip_player${i}_num${k}`}
                                    onClick={(event) => {
                                        if (this.props.disabled || this.props.yourTurn !== this.props.turn)
                                            return;

                                        if (this.state.selectedChip && this.state.selectedChip.id === `game_chip_player${i}_num${k}`) {
                                            this.setState({ selectedChip: null });
                                            return;
                                        }
                                        if (~this.scheme['game_start-cell_player' + i].chips.indexOf(`game_chip_player${i}_num${k}`)
                                                && document.getElementById('game_start-cell_player' + i).classList.contains('game_cell-move')) {
                                                this.socket.emit("chip-moved", {
                                                    tableId: this.props.tableId,
                                                    yourTurn: this.props.yourTurn,
                                                    chipNum: this.state.selectedChip.num,
                                                    targetId: ('game_start-cell_player' + i),
                                                    diceNum: str2bool(document.getElementById('game_start-cell_player' + i).getAttribute("data-dice-num"))
                                                });
                                            return;
                                        }
                                        let targetChip = event.target;
                                        if (targetChip.classList.contains('game_chip-cheat'))
                                            targetChip = targetChip.parentElement;
                                        if (targetChip.classList.contains("game_chip_can-move")) {
                                            this.setState({ selectedChip: {id: `game_chip_player${i}_num${k}`, num: k }});
                                        } else if (targetChip.classList.contains("game_chip-can-be-eaten") && !this.state.chips[i][k].shield) {
                                            this.socket.emit("chip-moved", {
                                                tableId: this.props.tableId,
                                                yourTurn: this.props.yourTurn,
                                                chipNum: this.state.selectedChip.num,
                                                targetId: this.state.chips[i][k].position,
                                                diceNum: str2bool(document.getElementById(this.state.chips[i][k].position).getAttribute("data-dice-num"))
                                            });
                                        }
                                    }}
                                >
                                    {this.props.gameOn ? <React.Fragment>
                                        {this.state.chips[i][k].shield ? <div className="game_chip-cheat game_chip-shield"></div> : null}
                                        {this.state.chips[i][k].flight ? <div className="game_chip-cheat game_chip-flight"></div> : null}
                                        {this.state.chips[i][k].free_shortcuts ? <div className="game_chip-cheat game_chip-free_shortcuts"></div> : null}
                                    </React.Fragment> : null}
                                </div>
                                )}
                            )}
                        </React.Fragment>
                    )})}
                </div>
				
			</div>
		);
    }
}
function updateDiceActive() {
    let dice = [false, false];
    if (this.state.chipsToMove.length) {
        let chips = this.state.chips[this.props.playersOrder[this.props.turn]].slice();
        dice = this.state.dice.map(d => chips.some(chip => this.getPossibleMoves(chip, d).length));
    }
    this.props.setActiveDice(dice);
}
function getFreeShortcuts(chip) {
    let res = []
    if (!chip.free_shortcuts) return [];
    let start = this.scheme[chip.position];
    if (start.links.for1) res.push({ id: start.links.for1, diceNum: false });
    if (start.links.for3) res.push({ id: start.links.for3, diceNum: false });

    return res;
}
function returnChipsToBase(playerNum) {
    [1, 2, 3, 4].forEach( k => {
        let chip = this.state.chips[playerNum][k];
        let cellId = `game_chip-base_chip-space_player${playerNum}_num${k}`;
        this.moveChipToCell(chip, cellId, true);
    })
}
function moveChipToCell(chip, cellId, isBase = false, isLast = false, diceNum = null) {
    let board = document.getElementsByClassName("game_board")[0];
    let cellElem = document.getElementById(cellId);
    let chipElem = document.getElementById(chip.id);
    if (!board || !cellElem || !chipElem) return;
    let cellSize = this.cellSize;
    let transform = board.style.transform;
    board.style.transform = 'none';
    let cellCoords = cellElem.getBoundingClientRect();
    let boardCoords = board.getBoundingClientRect();
    board.style.transform = transform;
    this.scheme[chip.position].chips.splice(this.scheme[chip.position].chips.indexOf(chip.id), 1);
    setTimeout(() => {
        chipElem.style.top = cellCoords.top - boardCoords.top + (isBase ? 0 : cellSize * 0.1 ) + (this.props.playersOrder[this.props.yourTurn] === 1 ? 1 : 0) +"px";
        chipElem.style.left = cellCoords.left - boardCoords.left + (isBase ? 0 : cellSize * 0.1 ) + (this.props.playersOrder[this.props.yourTurn] === 1 ? 1 : 0) + "px";
    }, isBase ? 100 : 0)

    chip.position = cellId;
    chip.isAtBase = isBase;

    if (this.scheme[cellId].chips.length && (+this.getPlayerFromCell(cellId) !== +chip.player)) {
        let chipId = this.scheme[cellId].chips[0];
        let [player, num] = [chipId[16], chipId[21]];
        
        this.moveChipToCell(this.state.chips[player][num], `game_chip-base_chip-space_player${player}_num${num}`, true);
    }

    if (isLast) {
        if (diceNum || diceNum === false) {
            diceNum && (this.state.dice[diceNum] = undefined);
            setTimeout(() => {
                this.props.disable(false);
                this.props.moveMade();
                this.setState({dice: this.state.dice.slice(), selectedChip: null});
            }, 200);
        } else {
            this.setState({selectedChip: null});
        }
    }
    this.scheme[cellId].chips.push(chip.id);
}

function buildRoute(chip, cellId, diceNum) {
    
    let scheme = this.scheme;
    let result = [];
    
    let dice = this.state.dice[diceNum];
    let chipCell = scheme[chip.position];
    let currentPlayer = '' + chip.player;
    
    if (diceNum === false) {
        if (!chip.free_shortcuts) return [];

        if (chipCell.links.for1 === cellId) return [ chipCell.links.for1 ];
        if (chipCell.links.for3 === cellId) return [ chipCell.links.for3 ];
    }

    if (!chip.no_shortcuts && dice === 1 && chipCell.links.for1 && chipCell.links.for1 === cellId) {
        return [chipCell.links.for1];
    }    

    if (!chip.no_shortcuts && dice === 3 && chipCell.links.for3 && chipCell.links.for3 === cellId) {
        return [chipCell.links.for3];
    } 

    if (dice === 6 && chipCell.links.for6 && chipCell.links.for6 === cellId) {
        return [chipCell.links.for6];
    }

    let route = [];

    if (!chip.isAtBase) {
        let current = chipCell;
        let canMove = true;
        let toFinish = cellId.indexOf('game_cell-finish') !== -1;

        if (current.isSH) {
            if (scheme[current.links.outOfSH].chip) {
                return [];
            } else {
                route.push(current.links.outOfSH);
                current = scheme[current.links.outOfSH];
            } 
        }

        for (let i = 1; i <= dice; i++) {
            if (toFinish)
                current = scheme[(current.links["toFinish" + currentPlayer]) || current.links.next];
            else
                current = scheme[current.links.next];
            
            if (!current) return [];

            route.push(current.id)
            
            if (current.chip && i !== dice) {
                return []
            } else if (current.chip && i === dice) {
                if (this.getPlayerFromCell(current.id) === currentPlayer)
                    return [];
            }
        }
        
        if (canMove) {
            if (!chip.no_shortcuts && current.links.end && current.links.end === cellId) 
                route.push(current.links.end);
            
            if (current.links.toSH && current.links.toSH === cellId)
                route.push(current.links.toSH);

            result = route;
        }
    }
    return result;
}

function createScheme() {
    let ret = {};

    for (let i = 1; i <= 48; i++) {
        let k      = {};
        k.chips    = [];
        let id     = "game_cell" + i;
        let links  = {};
        links.next = "game_cell" + (i === 48 ? 1 : (i + 1));
        k.links    = links;
        k.id       = id;
        ret[id]    = k;

        if (i % 12 === 0) {
            let n = (60 - i) / 12;

            k.links["toFinish" + n] = `game_cell-finish_player${n}_1`; 

            [1, 2, 3, 4].forEach(k => {
                let finish = {
                    isFinish: true,
                    id: `game_cell-finish_player${n}_${k}`,
                    chips: [],
                    links: { next: (k === 4 ? null : `game_cell-finish_player${n}_${k + 1}`) }
                };
                ret[finish.id] = finish;
            })
        }
        if (i % 12 === 1) {
            let n;

            switch (i) {
                case 1:
                    n = 1;
                    break;
                case 13:
                    n = 4;
                    break;
                case 25:
                    n = 3;
                    break;
                case 37:
                    n = 2;
                    break;
                default:
                    break;
            
            }
            let start = {
                isStart: true,
                id:("game_start-cell_player" + n),
                chips: []
            };
            start.links = { next: id };

            ret[start.id] = start;

            [1, 2, 3, 4].forEach(k => {
                let base = { id: `game_chip-base_chip-space_player${n}_num${k}`, chips: [], isBase: true};
                base.links = {for6: start.id}
                ret[base.id] = base;
            });

        }
        if (i % 12 === 2) {
            links.end = "game_cell" + (i + 7);
        }
        if (i % 12 === 6) {
            links.for1 = "game_cell" + (i === 42 ? 6 : i + 12);
            links.for3 = "game_cell" + (i + 24 > 48 ? i - 24 : i + 24);
        }
        if (i % 12 === 10) {
            links.toSH = "game_cell-safe-house" + ((i - 10) / 12);
            let sh = { isSH: true, chips: [], id:("game_cell-safe-house" + ((i - 10) / 12)), links: { outOfSH: id } };
            ret[sh.id] = sh;
        }

    }

    return ret;
}

function getChipsToMove() {
    if (this.props.playersOrder.length === 0 || (!this.state.dice[0] && !this.state.dice[1]) || this.props.turn !== this.props.yourTurn) 
        return [];

    let dice = this.state.dice.slice();

    let player = this.props.playersOrder[this.props.turn];

    let chips = this.state.chips[player].slice();

    chips = chips.filter(chip => {
        chip.canSkip = true;
        return dice.some(d => {
            let possible = this.getPossibleMoves(chip, d);
            chip.canSkip = chip.canSkip && possible.every(item => item.canSkip);
            return possible.length !== 0;
        }) || getFreeShortcuts.call(this, chip).length;
    });

    return chips;
}
function chipCanMove(chip, cellId) {
    if (!cellId) return false;
    let toBeEatenId = this.scheme[cellId].chips[0];
    if (!toBeEatenId) return true;
    let toBeEaten = this.state.chips[toBeEatenId[16]][toBeEatenId[21]];
    if (toBeEaten.player !== chip.player && !toBeEaten.shield) return true;
    return false;
}
function getPossibleMoves(chip, dice) {

    if (!chip || !dice)
        return [];

    let scheme = this.scheme;
    let chipCell = scheme[chip.position];
    let currentPlayer = '' + chip.player;
    let result = [];
    if (!chip.no_shortcuts && dice === 1 && this.chipCanMove(chip, chipCell.links.for1))
        result.push({ id: chipCell.links.for1 });

    if (!chip.no_shortcuts && dice === 3 && this.chipCanMove(chip, chipCell.links.for3))
        result.push({ id: chipCell.links.for3 });

    if (dice === 6 && chipCell.links.for6)
        result.push({ id: chipCell.links.for6 });

    if (!chip.isAtBase) {
        let current = chipCell;
        let canMove = true;

        if (current.isSH) {
            if (scheme[current.links.outOfSH].chips.length && !chip.flight)
                return [];
            else
                current = scheme[current.links.outOfSH];
        }

        for (let i = 1; i <= dice; i++) {
            let toFinish = scheme[current.links["toFinish" + currentPlayer]];
            if (toFinish && !toFinish.chips.length) {
                if (i === dice) result.push({ id: toFinish.id });
                for (let k = i + 1; k <= dice; k++) {
                    toFinish = scheme[toFinish.links.next];
                    if (!toFinish || (toFinish.chips.length && !chip.flight))
                        break;

                    if (k === dice && toFinish && !toFinish.chips.length) result.push({ id: toFinish.id });
                }
            }
            current = scheme[current.links.next];
            if (!current) {
                canMove = false;
                break;
            }
            if (current.chips.length && i !== dice && !chip.flight) {
                canMove = false;
                break;
            } else if (current.chips.length && i === dice) {
                if (!this.chipCanMove(chip, current.id)) {
                    canMove = false;
                    break;
                }
            }
        }

        if (canMove) {
            result.push({ id: current.id });

            if (!chip.no_shortcuts && current.links.end && this.chipCanMove(chip, current.links.end))
                result.push({ id: current.links.end });

            if (current.links.toSH && !scheme[current.links.toSH].chips.length)
                result.push({ id: current.links.toSH });
        }
        if (!chipCell.isFinish) {
            let cellsToFinish = getCellsToFinish(scheme, this.props.playersOrder[this.props.turn], chip.position);

            result.forEach(cell => {
                if (scheme[cell.id].isFinish) return;
                if (getCellsToFinish(scheme, this.props.playersOrder[this.props.turn], cell.id) > cellsToFinish) cell.canSkip = true;
            })
        }
    }

    return result;
}
function getCellsToFinish(scheme, playerNum, position) {
    let preFinishCell = "game_cell" + (60 - playerNum * 12);
    let current = scheme[position];
    let ret = 0;
    if (current.isSH)
        current = scheme[current.links.outOfSH];

    while (current.id !== preFinishCell) {
        current = scheme[current.links.next];
        ret++;
    }
    return ret;
}
function performMove(chip, diceNum, finalCellId, flight) {
    let route = flight ? [finalCellId] : buildRoute.call(this, chip, finalCellId, diceNum);
    this.props.disable(true);
    if (diceNum === 'test')
        route = ['game_start-cell_player1', finalCellId];

    for (let i = 0; i < route.length; i++) {
        setTimeout(() => {
            this.moveChipToCell(chip, route[i], false, i === route.length - 1, diceNum);
        }, i * 250);
    }
}

function getPlayerFromCell(cellId) {
    let chipId = this.scheme[cellId].chips[0];

    if (!chipId)
        return null;

    return chipId[16];
}

function defaultChipsPositions(playersOrder) {
    let ret = {};

    playersOrder.forEach(player => {
        ret[player] = [];
        [1, 2, 3, 4].forEach((i) => {
            ret[player][i] = {
                player,
                num: i,
                isAtBase: true, 
                id: `game_chip_player${player}_num${i}`,
                position: `game_chip-base_chip-space_player${player}_num${i}`
            };
        });
    })

    return ret;
}
function str2bool(str) {
    if (str === 'true') return true;
    if (str === 'false') return false;
    return str;
}