import React from 'react';
import Modal from 'react-modal';
import './GameStart.css'

Modal.setAppElement('#root');

export default function GameStart(props){
	const bets = [100, 200, 300, 500, 1000, 1500, 2000, 2500]
	const [modalIsOpen, setIsOpen] = React.useState(false);
	const [selectedBet, setBet] = React.useState(3);
    return (
		<div>
			<button onClick={setIsOpen.bind(this, true)}>Новая игра!</button>
			<Modal
				isOpen={modalIsOpen}
				onRequestClose={setIsOpen.bind(this, false)}
				className="game-start_modal"
    	        overlayClassName="game-start_overlay"
				contentLabel="Example Modal"
			>
				<div onClick={() => {console.log(123); setIsOpen.bind(this, false)()}} className="abs-top-right"></div>
				<div className="game-start_header">выбирите ставку</div>
				<div className="game-start_bets-container">
					{bets.map((bet, index) => (
						<div className={`game-start_bet ${selectedBet === index ? 'game-start_bet-selected' : ''}`} 
							key={bet} onClick={setBet.bind(this, index)}>{bet}</div>
					))}
				</div>
				<button className="game_start_btn" onClick={() => {props.startGame(bets[selectedBet])}}>начать</button>
			</Modal>
		</div>
    );
}
