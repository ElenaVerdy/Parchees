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
            cellsToMove: [],
            scheme: createScheme(),
            gameFinished: false
        }
        this.socket = this.props.socket;
        
        this.moveChipToCell = moveChipToCell.bind(this);
        
        this.getChipsToMove = getChipsToMove.bind(this);
        this.getPossibleMoves = getPossibleMoves.bind(this);

        this.getPlayerFromCell = getPlayerFromCell.bind(this);
        this.buildRoute = buildRoute.bind(this);
        this.performMove = performMove.bind(this);
        this.updateDiceActive = updateDiceActive.bind(this);
        this.timedOut = timedOut.bind(this);
        this.returnChipsToBase = returnChipsToBase.bind(this);

        this.state.chips = defaultChipsPositions(this.props.playersOrder);
        
    }
    
    componentDidMount() {
        this.socket.on("player-made-move", (data) => {
            if (data.error) {
                console.error(data.error)
            } else {
                if (!data.position) console.log("no destination from server hmm")
                if (data.diceNum === 7)
                    this.moveChipToCell(this.state.chips[1][1], data.position, false, true);
                this.performMove(this.state.chips[data.playerNum][data.num], data.diceNum, data.position);
            }
        });
        this.socket.on('removed', () => {console.log('removed')})
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.gameOn === true && this.props.gameOn === false) {
            this.setState({
                dice: [],
                chips: defaultChipsPositions(this.props.playersOrder),
                selectedChip: null
            });

            setTimeout(() => this.props.playersOrder.map( i => this.returnChipsToBase(i)), 1000);
        }

        if (prevProps.playersInfo !== this.props.playersInfo) {
            if (this.props.gameOn) {
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
            this.setState({chipsToMove: this.getChipsToMove().map(i => i.num)}, () => {
                this.updateDiceActive();
            });
        }
        
        if (prevProps.turn !== this.props.turn) {
            this.setState({selectedChip: null})
        }

        if (prevState.selectedChip !== this.state.selectedChip) {
            if (this.state.selectedChip) {
                let chip = this.state.chips[this.props.playersOrder[this.props.turn]][this.state.selectedChip.num];
                let cellsToMove = this.getPossibleMoves(chip, this.state.dice[0]).map(id => ({ diceNum: 0, id }));

                cellsToMove = cellsToMove.concat(this.getPossibleMoves(chip, this.state.dice[1]).map(id => ({ diceNum: 1, id })));
                
                this.setState({cellsToMove});
            } else {
                this.setState({cellsToMove: []})
            }
        }
        if (prevState.cellsToMove !== this.state.cellsToMove) {

            Array.from(document.getElementsByClassName("game_cell-move")).forEach(elem => {
                elem.removeAttribute("data-dice-num");
                elem.classList.remove("game_cell-move");
            });

            this.state.cellsToMove.forEach(elem => {
                if (!document.getElementById(elem.id))
                    console.log("some weird shit", this.state.cellsToMove)
                else {
                    document.getElementById(elem.id).classList.add("game_cell-move");
                    document.getElementById(elem.id).setAttribute("data-dice-num", elem.diceNum);
                }
            })
        }
        if (prevProps.disabled !== this.props.disabled) {
            this.updateDiceActive();
        }
    }
  	render(){
        let chargedChipsNums = [ ,
            this.state.scheme["game_start-cell_player1"].chips.length > 1 ? this.state.scheme["game_start-cell_player1"].chips.length : '',
            this.state.scheme["game_start-cell_player2"].chips.length > 1 ? this.state.scheme["game_start-cell_player2"].chips.length : '',
            this.state.scheme["game_start-cell_player3"].chips.length > 1 ? this.state.scheme["game_start-cell_player3"].chips.length : '',
            this.state.scheme["game_start-cell_player4"].chips.length > 1 ? this.state.scheme["game_start-cell_player4"].chips.length : '',
        ]
		return (
			<div className="game_container">
                <div className="game_board" onClick={(event) => {
                    if (this.props.disabled)
                        return;

                    if (!event.target.classList.contains("game_cell-move") || this.props.yourTurn !== this.props.turn)
                        return;
                        
                    this.props.disable(true);
                    this.socket.emit("chip-moved", {tableId: this.props.tableId, 
                                                    yourTurn: this.props.yourTurn, 
                                                    chipNum: this.state.selectedChip.num,
                                                    targetId: event.target.id,
                                                    diceNum: event.target.getAttribute("data-dice-num")})

                    
                }}>
                    {/*1 row*/}
                    <div className="game_space game_space4"></div>
                    <div className="game_cell game_cell-start" id="game_start-cell_player3" data-charged-chips={chargedChipsNums[3]}></div>
                    <div className="game_cell game_cell_player3" data-number="1" id="game_cell25"></div>
                    <div className="game_cell game_cell_player3" data-number="12" id="game_cell24"></div>
                    <div className="game_cell game_cell_player3" data-number="11" id="game_cell23"></div>
                    <div className="game_space game_space5"></div>

                    {/*2 row*/}
                    <div className="game_space game_space5"></div>
                    <div className="game_cell game_cell_player3" data-number="2" id="game_cell26"></div>
                    <div className="game_cell game_cell-finish game_cell-finish_player3" id="game_cell-finish_player3_1"></div>
                    <div className="game_cell game_cell_player3" data-number="10" id="game_cell22"></div>
                    <div className="game_cell game_cell-safe-house" id="game_cell-safe-house1"></div>
                    <div className="game_space game_space4"></div>

                    {/*3 row*/}
                    <div className="game_space game_space5"></div>
                    <div className="game_cell game_cell_player3" data-number="3" id="game_cell27"></div>
                    <div className="game_cell game_cell-finish game_cell-finish_player3" id="game_cell-finish_player3_2"></div>
                    <div className="game_cell game_cell_player3" data-number="9" id="game_cell21"></div>
                    <div className="game_space game_space5"></div>

                    {/*4 row*/}
                    <div className="game_space game_space5"></div>
                    <div className="game_cell game_cell_player3" data-number="4" id="game_cell28"></div>
                    <div className="game_cell game_cell-finish game_cell-finish_player3" id="game_cell-finish_player3_3"></div>
                    <div className="game_cell game_cell_player3" data-number="8" id="game_cell20"></div>
                    <div className="game_space game_space5"></div>

                    {/*5 row*/}
                    <div className="game_space game_space1"></div>
                    <div className="game_cell game_cell-safe-house" id="game_cell-safe-house2"></div>
                    <div className="game_space game_space3"></div>
                    <div className="game_cell game_cell_player3" data-number="5" id="game_cell29"></div>
                    <div className="game_cell game_cell-finish game_cell-finish_player3" id="game_cell-finish_player3_4"></div>
                    <div className="game_cell game_cell_player3" data-number="7" id="game_cell19"></div>
                    <div className="game_space game_space4"></div>
                    <div className="game_cell game_cell-start" id="game_start-cell_player4"  data-charged-chips={chargedChipsNums[4]}></div>

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
                    <div className="game_cell game_cell_player4" data-number="1" id="game_cell13"></div>

                    {/*7 row */}
                    <div className="game_cell game_cell_player2" data-number="12" id="game_cell36"></div>
                    <div className="game_cell game_cell-finish game_cell-finish_player2" id="game_cell-finish_player2_1"></div>
                    <div className="game_cell game_cell-finish game_cell-finish_player2" id="game_cell-finish_player2_2"></div>
                    <div className="game_cell game_cell-finish game_cell-finish_player2" id="game_cell-finish_player2_3"></div>
                    <div className="game_cell game_cell-finish game_cell-finish_player2" id="game_cell-finish_player2_4"></div>
                    <div className="game_cell game_cell_cant-stand game_cell_arrow arrow arrow-down"></div>
                    <div className="game_cell game_cell_cant-stand game_cell_center arrow arrows-crossing" ></div>
                    <div className="game_cell game_cell_cant-stand game_cell_arrow arrow arrow-up"></div>
                    <div className="game_cell game_cell-finish game_cell-finish_player4" id="game_cell-finish_player4_4"></div>
                    <div className="game_cell game_cell-finish game_cell-finish_player4" id="game_cell-finish_player4_3"></div>
                    <div className="game_cell game_cell-finish game_cell-finish_player4" id="game_cell-finish_player4_2"></div>
                    <div className="game_cell game_cell-finish game_cell-finish_player4" id="game_cell-finish_player4_1"></div>
                    <div className="game_cell game_cell_player4" data-number="12" id="game_cell12"></div>

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
                    <div className="game_cell game_cell_player4" data-number="11" id="game_cell11"></div>

                    {/*9 row*/}
                    <div className="game_cell game_cell-start" id="game_start-cell_player2" data-charged-chips={chargedChipsNums[2]}></div>
                    <div className="game_space game_space4"></div>
                    <div className="game_cell game_cell_player1" data-number="7" id="game_cell43"></div>
                    <div className="game_cell game_cell-finish game_cell-finish_player1" id="game_cell-finish_player1_4"></div>
                    <div className="game_cell game_cell_player1" data-number="5" id="game_cell5"></div>
                    <div className="game_space game_space3"></div>
                    <div className="game_cell game_cell-safe-house" id="game_cell-safe-house0"></div>
                    <div className="game_space game_space1"></div>

                    {/*10 row*/}
                    <div className="game_space game_space5"></div>
                    <div className="game_cell game_cell_player1" data-number="8" id="game_cell44"></div>
                    <div className="game_cell game_cell-finish game_cell-finish_player1" id="game_cell-finish_player1_3"></div>
                    <div className="game_cell game_cell_player1" data-number="4" id="game_cell4"></div>
                    <div className="game_space game_space5"></div>

                    {/*11 row*/}
                    <div className="game_space game_space5"></div>
                    <div className="game_cell game_cell_player1" data-number="9" id="game_cell45"></div>
                    <div className="game_cell game_cell-finish game_cell-finish_player1" id="game_cell-finish_player1_2"></div>
                    <div className="game_cell game_cell_player1" data-number="3" id="game_cell3"></div>
                    <div className="game_space game_space5"></div>

                    {/*12 row*/}
                    <div className="game_space game_space4"></div>
                    <div className="game_cell game_cell-safe-house" id="game_cell-safe-house3" ></div>
                    <div className="game_cell game_cell_player1" data-number="10" id="game_cell46"></div>
                    <div className="game_cell game_cell-finish game_cell-finish_player1" id="game_cell-finish_player1_1"></div>
                    <div className="game_cell game_cell_player1" data-number="2" id="game_cell2"></div>
                    <div className="game_space game_space5"></div>

                    {/*13 row*/}
                    <div className="game_space game_space5"></div>
                    <div className="game_cell game_cell_player1" data-number="11" id="game_cell47"></div>
                    <div className="game_cell game_cell_player1" data-number="12" id="game_cell48"></div>
                    <div className="game_cell game_cell_player1" data-number="1" id="game_cell1"></div>
                    <div className="game_cell game_cell-start" id="game_start-cell_player1" data-charged-chips={chargedChipsNums[1]}></div>
                    <div className="game_space game_space4"></div>

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
                            <PlayerInfo playerLeft={playerLeft} num={i} playersInfo={this.props.playersInfo[index]}/>
                            {this.props.playersOrder[this.props.turn] === i ?
                                <CountDown playerNum={i} timedOut={this.timedOut} disabled={this.props.disabled} dice={this.state.dice} myTimer={this.props.turn === this.props.yourTurn} />
                                : ""}
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
                                    if (this.state.cellsToMove.find(elem => (elem.id === this.state.chips[i][k].position) && 
                                        +this.getPlayerFromCell(this.state.chips[i][k].position) !== this.props.playersOrder[this.props.turn])) {
                                            additionalClassName += " game_chip-can-be-eaten";
                                        }
                                }
                                additionalClassName += playerLeft ? ' disabled' : '';

                                return (
                                <div className={`game_chip game_chip_player${i}${additionalClassName}`} 
                                    id={`game_chip_player${i}_num${k}`}
                                    key={`game_chip_player${i}_num${k}`}
                                    data-player={i}
                                    data-num={k}
                                    onClick={(event) => {
                                        if (this.props.disabled || this.props.yourTurn !== this.props.turn)
                                            return;
                                        
                                        if (this.state.selectedChip && this.state.selectedChip.id === `game_chip_player${i}_num${k}`) {
                                            this.setState({ selectedChip: null });
                                            return;
                                        }
                                        if (~this.state.scheme['game_start-cell_player' + i].chips.indexOf(`game_chip_player${i}_num${k}`)
                                                && document.getElementById('game_start-cell_player' + i).classList.contains('game_cell-move')) {
                                                this.socket.emit("chip-moved", {
                                                    tableId: this.props.tableId,
                                                    yourTurn: this.props.yourTurn,
                                                    chipNum: this.state.selectedChip.num,
                                                    targetId: ('game_start-cell_player' + i),
                                                    diceNum: document.getElementById('game_start-cell_player' + i).getAttribute("data-dice-num")
                                                });
                                            return;
                                        }
                                        if (event.target.classList.contains("game_chip_can-move")) {
                                            this.setState({ selectedChip: {id: `game_chip_player${i}_num${k}`, num: k }});
                                        } else if (event.target.classList.contains("game_chip-can-be-eaten")) {
                                            this.socket.emit("chip-moved", {
                                                tableId: this.props.tableId,
                                                yourTurn: this.props.yourTurn,
                                                chipNum: this.state.selectedChip.num,
                                                targetId: this.state.chips[i][k].position,
                                                diceNum: document.getElementById(this.state.chips[i][k].position).getAttribute("data-dice-num")
                                            });
                                        }
                                    }}
                                />
                                )}
                            )}
                        </React.Fragment>
                    )})}
                </div>
				
			</div>
		);
    }
}
function timedOut () {
    if (this.props.disabled)
        return;

    this.props.socket.emit("finish-turn", {tableId: this.props.tableId});
}
function updateDiceActive() {
    let diceElems = document.getElementsByClassName("die-container");
    if (!diceElems.length)
        return;

    let dice = [undefined, undefined];

    if (this.state.chipsToMove.length) {
        let chips = this.state.chips[this.props.playersOrder[this.props.turn]].slice();

        dice = this.state.dice.map(d => chips.some(chip => this.getPossibleMoves(chip, d).length))
    }
    
    dice.forEach((item, i) => {
        if (item && !this.props.disabled) 
            diceElems[i].classList.add("die-container_active")
        else 
            diceElems[i].classList.remove("die-container_active");
    })
}

function returnChipsToBase(playerNum) {
    [1, 2, 3, 4].map( k => {
        let chip = this.state.chips[playerNum][k];
        let cellId = `game_chip-base_chip-space_player${playerNum}_num${k}`;
        this.moveChipToCell(chip, cellId, true);
    })
}
function moveChipToCell(chip, cellId, isBase = false, isLast = false, diceNum = null) {

    let board = document.getElementsByClassName("game_board")[0];
    let cellElem = document.getElementById(cellId);
    let chipElem = document.getElementById(chip.id);
    let cellSize = this.cellSize;

    let cellCoords = cellElem.getBoundingClientRect();
    let boardCoords = board.getBoundingClientRect();
    
    this.state.scheme[chip.position].chips.splice(this.state.scheme[chip.position].chips.indexOf(chip.id), 1);

    setTimeout(() => {
        chipElem.style.top = cellCoords.top - boardCoords.top + (isBase ? 0 : cellSize * 0.1 ) + "px";
        chipElem.style.left = cellCoords.left - boardCoords.left + (isBase ? 0 : cellSize * 0.1 ) + "px";
    }, isBase ? 100 : 0)

    chip.position = cellId;
    chip.isAtBase = isBase;

    if (this.state.scheme[cellId].chips.length && this.getPlayerFromCell(cellId) != chip.player) {
        let eatenChipElem = document.getElementById(this.state.scheme[cellId].chips[0]);
        let [player, num] = [eatenChipElem.getAttribute("data-player"), eatenChipElem.getAttribute("data-num")];
        
        this.moveChipToCell(this.state.chips[player][num], `game_chip-base_chip-space_player${player}_num${num}`, true);
    }

    if (isLast) {
        if (diceNum) {
            this.state.dice[diceNum] = undefined;
            this.props.disable(false);
            this.setState({dice: this.state.dice.slice(), selectedChip: null});
        } else {
            this.setState({selectedChip: null});
        }
    }

    this.state.scheme[cellId].chips.push(chip.id);
    this.setState({scheme: Object.assign({}, this.state.scheme)})
}

function buildRoute(chip, cellId, diceNum) {
    
    let scheme = this.state.scheme;
    let result = [];
    
    let dice = this.state.dice[diceNum];
    let chipCell = scheme[chip.position];
    let currentPlayer = document.getElementById(chip.id).getAttribute("data-player");
    
    if (dice === 1 && chipCell.links.for1 && chipCell.links.for1 === cellId) {
        return [chipCell.links.for1];
    }    

    if (dice === 3 && chipCell.links.for3 && chipCell.links.for3 === cellId) {
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
            if (current.links.end && current.links.end === cellId) 
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
            let n;

            switch (i) {
                case 48:
                    n = 1;
                    break;
                case 12:
                    n = 4;
                    break;
                case 24:
                    n = 3;
                    break;
                case 36:
                    n = 2;
                    break;
                default:
                    break;
            }
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
    if (this.props.playersOrder.length === 0 || (!this.state.dice[0] && !this.state.dice[1])) 
        return [];
    
    let dice = this.state.dice.slice();
    
    let player = this.props.playersOrder[this.props.turn];

    let chips = this.state.chips[player].slice();

    chips = chips.filter(chip => {
        return dice.some(d => {return (this.getPossibleMoves(chip, d)).length !== 0})
    });
    
    return chips; 

}
function getPossibleMoves(chip, dice) {

    if (!chip || !dice)
        return [];

    let scheme = this.state.scheme;
        
    let chipCell = scheme[chip.position];
    let currentPlayer = document.getElementById(chip.id).getAttribute("data-player");
    let result = [];

    if (dice === 1 && chipCell.links.for1 && this.getPlayerFromCell(chipCell.links.for1) !== currentPlayer)    
        result.push(chipCell.links.for1);

    if (dice === 3 && chipCell.links.for3 && this.getPlayerFromCell(chipCell.links.for3) !== currentPlayer) 
        result.push(chipCell.links.for3);

    if (dice === 6 && chipCell.links.for6)
        result.push(chipCell.links.for6);

    if (!chip.isAtBase) {
        let current = chipCell;
        let canMove = true;

        if (current.isSH) {
            if (scheme[current.links.outOfSH].chips.length)
                return [];
            else 
                current = scheme[current.links.outOfSH];
        }

        for (let i = 1; i <= dice; i++) {
            let toFinish = scheme[current.links["toFinish" + currentPlayer]];
            if (toFinish && !toFinish.chips.length) {
                for (let k = i + 1; k <= dice; k++) {
                    toFinish = scheme[toFinish.links.next];
                    if (!toFinish || toFinish.chips.length)
                        break;
                }
                if (toFinish) result.push(toFinish.id);
            }
            current = scheme[current.links.next];
            if (!current) {
                canMove = false;
                break;
            }
            if (current.chips.length && i !== dice) {
                canMove = false;
                break;
            } else if (current.chips.length && i === dice) {
                if (this.getPlayerFromCell(current.id) === currentPlayer) {
                    canMove = false;
                    break;
                }
            }
        }

        if (canMove) {
            result.push(current.id);

            if (current.links.end && this.getPlayerFromCell(current.links.end) !== currentPlayer)
                result.push(current.links.end);

            if (current.links.toSH && !scheme[current.links.toSH].chip)
                result.push(current.links.toSH);
        }
    }
    
    return result;
}

function performMove(chip, diceNum, finalCellId) {
    let route = this.buildRoute(chip, finalCellId, diceNum);

    for (let i = 0; i < route.length; i++) {
        setTimeout(() => {
            this.moveChipToCell(chip, route[i], false, i === route.length - 1, diceNum);
        }, i * 250) 
    }
}

function getPlayerFromCell(cellId) {
    let chipId = this.state.scheme[cellId].chips[0];

    let chipElem = document.getElementById(chipId);
    if (chipElem === null)
        return null;

    return chipElem.getAttribute("data-player");
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
            }
        })
        
    })

    return ret;
}