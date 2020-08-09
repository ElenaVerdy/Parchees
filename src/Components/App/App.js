import React from 'react';
import './App.css';
import './common.css'
import Game from "../Game/Game"
import Lobby from "../Lobby/Lobby"
import io from "socket.io-client";
import SideMenu from "../SideMenu/SideMenu"
import Chat from "../Chat/Chat"
import GameFinished from "../GameFinished/GameFinished"
import cloneDeep from 'lodash.clonedeep'

let debug = window.location.href === "http://192.168.1.67:3000/";
const ENDPOINT = debug ? "http://192.168.1.67:8000/" : "https://parcheesi.herokuapp.com/";
const VK = window.VK;
const access_token = 'dfc81daadfc81daadfc81daa51dfba9a4cddfc8dfc81daa812a9735657f3387f235945d';
const init = new Promise((resolve, reject) => {
	if (!debug) {
		VK.init(function() {
			VK.api("users.get", { access_token, fields: 'photo_50,photo_100' }, (res) => {
				const data = res && res.response && res.response[0];
				if (!data) throw new Error('can not fetch user data');
				resolve(data);
			});
		}, function() {
			console.log("bad")
		}, '5.103');
	} else {
		resolve({
			photo_50: 'https://sun9-12.userapi.com/c851016/v851016587/119cab/ai0uN_RKSXc.jpg?ava=1',
			photo_100: 'https://sun1-92.userapi.com/c848416/v848416727/1ba95e/I05FuH5Kb-o.jpg?ava=1',
			first_name: 'Lindsey',
			last_name: "Stirling",
			id: 123123123
		});
	}
})

const socket = io.connect(ENDPOINT);
export default class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			tables: [],
			connectedToTable: false,
			tableId: null,
			playersInfo: [],
			playersOrder: [],
			doublesStreak: 0,
			gameOn: false,
			yourTurn: null,
			countDown: null,
			turn: null,
			dice: [],
			activeDice: [],
			disabled: false,
			gameFinishedModal: false,
			gameResults: [],
			doAfterDisable: {},
			moveData: null,
			userInfo: {},
			actionCount: 0,
			canSkip: false,
			loading: true
		}
		this.socket = socket;
		this.handleAllPlayersReady = handleAllPlayersReady.bind(this);
		this.handleGameStart = handleGameStart.bind(this);
		this.handleNextTurn = handleNextTurn.bind(this);
		this.diceRolled = diceRolled.bind(this);
		this.endGame = endGame.bind(this);
		this.disable = disable.bind(this);
		this.logAction = logAction.bind(this);
		this.timers = [];
	}
	
	componentDidMount() {
		init.then(userInfo => {
			this.setState({ userInfo });
			this.socket.emit("init", userInfo);
		});
		this.socket.on("init-finished", data => {
			console.log('finished', data)
			this.setState({ userInfo: { ...this.state.userInfo, ...data}, loading: false });
		})
		this.socket.on("connect-to", data => {
			this.setState({ connectedToTable: true, tableId: data.id });
		})
		this.socket.on("err", data => console.error(data));
		this.socket.on("update-tables", data => {this.setState({ tables: data })})		
		this.socket.on("update-players", data => {
			if (this.state.gameOn && !data.players) {
				let playersInfo = cloneDeep(this.state.playersInfo);
				playersInfo[data.playerLeftIndex].left = true;

				this.setState({ playersInfo });
			} else if (!this.state.gameOn && data.players) {
				let playersOrder = getPlayersOrder(data.players.length);
				this.setState({
					playersInfo: data.players, 
					playersOrder,
					yourTurn: data.players.indexOf(data.players.find(pl => pl.id === this.socket.id))
				});
			} 
		});
		this.socket.on("all-players-ready", this.handleAllPlayersReady);
		this.socket.on("game-start", this.handleGameStart);
		this.socket.on("next-turn", data => {
			if (this.state.disabled || data.actionCount !== this.state.actionCount)
				this.logAction('next-turn', data);
			else
				this.handleNextTurn(data);
		});
		this.socket.on("player-won", data => {
			if (data.error) return console.error(data.error);
			if (this.state.disabled || data.actionCount !== this.state.actionCount)
				this.logAction('player-won', data);
			else
				this.endGame(data);
		});
		this.socket.on("dice-rolled", data => {
			if (data.error) return console.error(data.error);
            if (this.state.disabled || data.actionCount !== this.state.actionCount)
				this.logAction('dice-rolled', data);
			else
				this.diceRolled(data);
		});
		this.socket.on("player-made-move", data => {
			if (data.error) return console.error(data.error);
			if (this.state.disabled || data.actionCount !== this.state.actionCount)
				this.logAction('player-made-move', data);
			else
				this.setState({ moveData: data });
		});
	}
	componentDidUpdate(prevProps, prevState) {
		if (prevState.connectedToTable !== this.state.connectedToTable && !this.state.connectedToTable) 
			this.socket.emit("get-tables-request");

		if ((prevState.disabled && !this.state.disabled) || (prevState.actionCount !== this.state.actionCount)) {
			if (!this.state.doAfterDisable[this.state.actionCount]) return;
			let action = this.state.doAfterDisable[this.state.actionCount];
			switch (action.name) {
				case 'next-turn':
					this.handleNextTurn(action.data);
					break;

				case 'player-won':
					this.endGame(action.data);
					break;

				case 'dice-rolled':
					this.diceRolled(action.data);
					break;

				case 'player-made-move':
					this.setState({ moveData: action.data });
					break;

				default:
					console.log('check actions out!');
					break;
			}
		}
	}

  	render() {
		return (
			<div className="main-container">
				{this.state.loading ? <div className="loading"></div> :
				<div className="App">
					<div className="App_header">
					</div>
					<div className="App_main">
						<div className="App_main-offside">
							<SideMenu socket={this.socket}
									tableId={this.state.tableId}
									gameOn={this.state.gameOn}
									countDown={this.state.countDown}
									yourTurn={this.state.yourTurn}
									turn={this.state.turn} 
									dice={this.state.dice}
									activeDice={this.state.activeDice}
									doublesStreak={this.state.doublesStreak}
									disable={this.disable}
									disabled={this.state.disabled} 
									userInfo={this.state.userInfo}
									diceRolled={() => this.setState({actionCount: this.state.actionCount + 1, disabled: false})}
									canSkip={this.state.canSkip}
							/>
							<Chat roomId={this.state.tableId} socket={this.socket} userInfo={this.state.userInfo}></Chat>

						</div>
						<div className="App_main-container">
							{this.state.connectedToTable ? <Game tableId={this.state.tableId}
																socket={this.socket}
																playersInfo={this.state.playersInfo}
																playersOrder={this.state.playersOrder}
																yourTurn={this.state.yourTurn}
																gameOn={this.state.gameOn}
																turn={this.state.turn}
																dice={this.state.dice}
																disable={this.disable}
																disabled={this.state.disabled}
																logAction={this.logAction}
																setActiveDice={activeDice => {this.setState({activeDice})}}
																moveMade={() => this.setState({ moveData: null, actionCount: this.state.actionCount + 1 })}
																moveData={this.state.moveData}
																setCanSkip={(canSkip) => this.setState({ canSkip })}
															/>
												: <Lobby tables={this.state.tables}
														socket={this.socket}
														userInfo={this.state.userInfo}
													/>
							}
							<div className={`App_game-finished_container${this.state.gameFinishedModal ? " App_game-finished_container_shown" : ""}`}>
								<GameFinished results={this.state.gameResults} close={() => {this.setState({gameFinishedModal: false, gameResults: []})}} />
							</div>
						</div>
					</div>
				</div>}
			</div>
		);
	}
}
function diceRolled(data) {
	let tmp = 0;
	if (data.dice[0] === data.dice[1])
		tmp = this.state.doublesStreak === 2 ? 0 : this.state.doublesStreak + 1;

	this.setState({ doublesStreak: tmp, dice: data.dice });
}
function logAction(name, data) {
	let doAfterDisable = this.state.doAfterDisable;
	doAfterDisable[data.actionCount] = { name, data };
	this.setState({ doAfterDisable });
}
function endGame(data) {
	this.setState({
		gameFinishedModal: true, 
		gameOn: false,
		turn: null,
		dice: [],
		disabled: false,
		gameResults: data.results,
		actionCount: this.state.actionCount + 1
	});
}
function handleGameStart(data) {
	this.setState({
		turn: data.turn, 
		gameOn: true, 
		dice: [], 
		playersInfo: data.players,
		gameFinishedModal: false,
		gameResults: [],
		actionCount: 1
	});
}
function handleNextTurn(data) {
	this.setState({turn: data.turn, dice: [], actionCount: data.actionCount + 1});
}
function handleAllPlayersReady(data) {
	if (data.cancel) {
		this.timers.map(t => clearTimeout(t));
		this.setState({countDown: null});
	} else {
		for (let i = 5; 0 <= i; i--) {
			this.timers[i] = setTimeout(() => {
				if (this.state.countDown || i === 5)
					this.setState({countDown: i});
			}, 5000 - i * 1000)
		}
	}
}

function disable(bool) {
	this.setState({disabled: bool});
}

function getPlayersOrder(num) {
    let playersOrder = [];
    
    switch (num) {

        case 1:
            playersOrder = [1];
            break;
        
        case 2:
            playersOrder = [1, 3];
            break;

        case 3:
            playersOrder = [1, 2, 3];
            break;

        case 4:
            playersOrder = [1, 2, 3, 4];
            break;

        default:
            break;
    }
        
    return playersOrder;
}
