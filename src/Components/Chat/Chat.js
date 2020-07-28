import React from 'react';
import './Chat.css';

export default class Chat extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			inputText: '',
			blockBtn: false,
			msgsMain: [],
			msgsRoom: [],
			selectedRoom: 'main'
		};
		this.sendMsg = sendMsg.bind(this);
		this.talkTo = talkTo.bind(this);
	}
	componentDidUpdate(prevProps, prevState) {
		if (prevProps.roomId && !this.props.roomId && this.state.selectedRoom !== 'main')
			this.setState({selectedRoom: 'main'});
	}
	render() {
		return (
			<div className={`chat_container`}>
				<div className="chat_header flex-sb">
					<div className="flex">
						<div className="chat_header_name">чат</div>
						<div className={`margin-lr-5${this.state.selectedRoom !== 'main' ? ' disabled' : ''}`} onClick={() => this.setState({selectedRoom: 'main'})}>общий</div>
						{this.props.roomId ? <div className="chat_room-game flex">
							<div className="margin-lr-5">/</div>
							<div className={`margin-lr-5${this.state.selectedRoom === 'main' ? ' disabled' : ''}`} onClick={() => this.setState({selectedRoom: 'room'})}>стол</div>
						</div> : null}
					</div>
				</div>
				<div className="chat_body-container">
					<div className={`chat-body chat-body-main${this.state.selectedRoom !== 'main' ? ' hidden' : ''}`}>
						{this.state.msgsMain.map(item => messege({...item, talkTo: this.talkTo}))}
					</div>
					<div className={`chat-body chat-body-room${this.state.selectedRoom !== 'room' ? ' hidden' : ''}`}>
						{this.state.msgsRoom.map(item => messege({...item, talkTo: this.talkTo}))}
					</div>
				</div>
				<div className="chat_input-wrapper flex-sb">
					<input id="chat_input"
						   type="text"
						   className="chat_input"
						   value={this.state.inputText}
						   placeholder="Введите сообщение"
						   onChange={(e) => this.setState({inputText: e.target.value})}
						   onKeyUp={e => e.keyCode === 13 && this.sendMsg()}
					/>
					<div className={`chat_send-btn${this.state.blockBtn ? ' disabled' : ''}`} onClick={this.sendMsg}></div>
				</div>
			</div>
		)
	};
}

function messege(props) {
	return (
		<div className="chat_messege p-tb-5" key={props.timestamp}>
			<span className="chat_messege_author" onClick={() => {props.talkTo(props.player.name)}}>{props.player.name}: </span><span className="chat_messege_text">{props.text}</span>
		</div>
	)
}

function sendMsg() {
	if (!this.state.inputText.trim() || this.state.blockBtn) return;
	let tmp = this.state[this.state.selectedRoom === 'main' ? 'msgsMain' : 'msgsRoom'];
	tmp.unshift({player: {id: 'id123123123', name: 'Сахьянова Елена'}, text: this.state.inputText });
	this.setState({[this.state.selectedRoom === 'main' ? 'msgsMain' : 'msgsRoom']: tmp, inputText: '', blockBtn: true});
	setTimeout(() => {
		this.setState({blockBtn: false});
	}, 1000);
}

function talkTo(name) {
	if (~this.state.inputText.indexOf(name + ',')) return;
	this.setState({inputText: (name + ', ' + this.state.inputText)});
	document.getElementById("chat_input").focus();
	
}