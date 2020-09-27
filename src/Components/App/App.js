import React from 'react';
import Modal from 'react-modal';
import io from "socket.io-client";
import './App.css';
import './common.css'
import Game from "../Game/Game"
import Loading from "../Loading/Loading"
import Lobby from "../Lobby/Lobby"
import SideMenu from "../SideMenu/SideMenu"
import Chat from "../Chat/Chat"
import GameFinished from "../GameFinished/GameFinished"
import AppHeader from "../AppHeader/AppHeader"
import cloneDeep from 'lodash.clonedeep'

let debug = window.location.href === "http://192.168.1.67:3000/";
const ENDPOINT = debug ? "http://192.168.1.67:8000/" : "https://parcheesi.herokuapp.com/";
const VK = window.VK;
const access_token = 'dfc81daadfc81daadfc81daa51dfba9a4cddfc8dfc81daa812a9735657f3387f235945d';
const init = function() {
	return new Promise((resolve, reject) => {
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
				first_name: 'Lindsey' + (Math.random() * 12 ^ 0),
				last_name: "Stirling",
				id: 123123123//(Math.random() * 123456789 ^ 0)
			});
		}
	})
}

const socket = io.connect(ENDPOINT);
export default class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			userInfo: {},
			tables: [],
			tableId: null,
			bet: null,
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
			actionCount: 0,
			canSkip: false,
			loading: true,
			topByRank: [],
			topByChips: []
		}
		this.socket = socket;
		this.handleGameStart = handleGameStart.bind(this);
		this.handleNextTurn = handleNextTurn.bind(this);
		this.diceRolled = diceRolled.bind(this);
		this.endGame = endGame.bind(this);
		this.disable = disable.bind(this);
		this.logAction = logAction.bind(this);
		this.timers = [];
	}

	componentDidMount() {
		init().then(userInfo => {
			this.setState({ userInfo });
			this.socket.emit("init", userInfo);
		});
		this.socket.on("request-auth", () => {
			if (this.state.userInfo.id) return this.socket.emit("init", { ...this.state.userInfo }); // Math.random() * 1000000 ^ 0 });
		});
		this.socket.on("init-finished", data => {
			debug || initRatings.call(this, data);
			this.setState({ userInfo: { ...this.state.userInfo, ...data}, loading: false });
			this.socket.emit("get-lottery-field");
		});
		this.socket.on("update-user-info", data => this.setState({ userInfo: { ...this.state.userInfo, ...data } }))
		this.socket.on("connect-to", data => {
			this.setState({ tableId: data.id, bet: data.bet });
		});
		this.socket.on("err", data => this.setState({ error: data.text }));
		this.socket.on("update-tables", data => {this.setState({ tables: data })})		
		this.socket.on("update-players", data => {
			if (this.state.gameOn && !data.players) {
				let playersInfo = cloneDeep(this.state.playersInfo);
				playersInfo[data.playerLeftIndex].left = true;

				this.setState({ playersInfo });
			} else if (data.afterWin || (!this.state.gameOn && data.players)) {
				let playersOrder = getPlayersOrder(data.players.length);
				this.setState({
					playersInfo: data.players, 
					playersOrder,
					yourTurn: data.players.indexOf(data.players.find(pl => pl.id === this.socket.id))
				});
			}
		});
		this.socket.on("all-players-ready", handleAllPlayersReady.bind(this));
		this.socket.on("game-start", this.handleGameStart);
		this.socket.on("lottery-field", data => this.setState({lotteryField: data.field}));
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
		if (prevState.tableId && !this.state.tableId)
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
		if (prevState.error !== this.state.error && this.state.error)
			console.log(this.state.error);

		if (prevState.userInfo.timeToLottery !== this.state.userInfo.timeToLottery) {
			clearTimeout(this.lotteryTimeout);
			if (this.state.userInfo.timeToLottery) this.lotteryTimeout = setTimeout(() => {
				let userInfo = { ...this.state.userInfo };
				userInfo.timeToLottery--;
				this.setState({ userInfo })
			}, 1000);
		}
	}

  	render() {
		return (
			<div id="main-container" className="main-container">
				{this.state.loading ? <div className="loading"><Loading></Loading></div> :
				<div className="App">
					<AppHeader tableId={this.state.tableId}
							   toTables={toTables.bind(this)}
							   userInfo={this.state.userInfo}
							   socket={this.socket}
							   avgRating={avgRating.call(this)}
							   bet={this.state.bet}
							   lotteryField={this.state.lotteryField}
							   topByRank={this.state.topByRank}
							   topByChips={this.state.topByChips}
					/>
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
									showError={error => this.setState({ error })}
							/>
							<Chat roomId={this.state.tableId} socket={this.socket} userInfo={this.state.userInfo}></Chat>

						</div>
						<div className="App_main-container">
							{this.state.tableId ? <Game tableId={this.state.tableId}
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
								<GameFinished results={this.state.gameResults}
											  close={() => {this.setState({gameFinishedModal: false, gameResults: []})}}
											  toTables={toTables.bind(this)}
								/>
							</div>
						</div>
					</div>
				</div>}
				{this.state.error ? 
					<Modal
						isOpen={!!this.state.error}
						onRequestClose={() => this.setState({ error: '' })}
						className="modal app_modal-error"
						closeTimeoutMS={500}
						contentLabel="Example Modal">
							<div className="modal-header">Ой-ой-ой!</div>
							<div className="app_modal-error_text">{this.state.error}</div>
							<button className="modal-close-btn btn-brown" onClick={() => this.setState({ error: '' })}>закрыть</button>
					</Modal> : null}
			</div>
		);
	}
}
function avgRating() {
	return this.state.playersInfo.length ? (this.state.playersInfo.reduce((sum, cur) => sum + cur.rating, 0) / this.state.playersInfo.length ^ 0) : 0;
}
function toTables() {
	socket.emit('leave-table', { tableId: this.state.tableId });
	this.setState({
		tableId: null,
		bet: null,
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
		actionCount: 0,
		canSkip: false
	});
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
		actionCount: this.state.actionCount + 1,
		doAfterDisable: []
	});
}
function handleGameStart(data) {
	this.setState({
		gameFinishedModal: false,
		gameOn: true, 
		turn: data.turn, 
		dice: [],
		playersInfo: data.players,
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

function initRatings(data) {
	VK.api("users.get", { access_token, fields: 'photo_50,photo_100', user_ids: data.topByRank.concat(data.topByChips).map(i => i.vk_id).join(',') }, (res) => {
		const respData = res && res.response;
		console.log(data)
		let topByRank = data.topByRank.map(item => {
			return { ...respData.find(i => item.vk_id === i.id), ...item };
		});
		let topByChips = data.topByChips.map(item => {
			return { ...respData.find(i => item.vk_id === i.id), ...item };
		});
		this.setState({ topByRank, topByChips });
		delete data.topByRank;
		delete data.topByChips;
	});
}
