import React from 'react';
import Modal from 'react-modal';
import './GameStart.css'

Modal.setAppElement('#root');

export default function GameStart(props){
	const bets = [100, 200, 300, 500, 1000, 1500, 2000, 2500];
	const [modalIsOpen, setIsOpen] = React.useState(false);
	const [selectedBet, setBet] = React.useState(3);
    return (
		<div>
			<button className="btn-grey" onClick={setIsOpen.bind(this, true)}>Новая игра!</button>
			<Modal
				isOpen={modalIsOpen}
				onRequestClose={setIsOpen.bind(this, false)}
				closeTimeoutMS={500}
				className="modal game-start_modal"
				contentLabel="Example Modal"
			>
				<div onClick={setIsOpen.bind(this, false)} className="abs-top-right"></div>
				<div className="game-start_header">выбирите ставку</div>
				<div className="game-start_bets-container">
					{bets.map((bet, index) => (
						<div className={`pointer game-start_bet ${selectedBet === index ? 'game-start_bet-selected' : ''}`} 
							key={bet} onClick={setBet.bind(this, index)}>{bet}</div>
					))}
				</div>
				<button className="game_start_btn btn-brown" onClick={() => {props.startGame(bets[selectedBet])}}>начать</button>
			</Modal>
		</div>
    );
}
