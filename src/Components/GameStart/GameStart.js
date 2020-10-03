import React, { useEffect } from 'react';
import Modal from 'react-modal';
import './GameStart.css'

Modal.setAppElement('#root');

export default function GameStart(props){
	const bets = React.useMemo(() => [100, 300, 500, 1000, 2500, 5000, 10000, 25000], []);
	const [modalIsOpen, setIsOpen] = React.useState(false);
	const [selectedBet, setBet] = React.useState(3);
	useEffect(() => {
		let maxIndex = bets.findIndex(i => i > props.userInfo.chips);
		maxIndex = maxIndex === 0 ? null : (maxIndex === -1 ? 7 : maxIndex - 1);
		setBet(maxIndex);
	}, [props.userInfo.chips, bets])
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
				<div className="game-start_header">выберите ставку</div>
				<div className="game-start_bets-container">
					{bets.map((bet, index) => (
						<div className={`game-start_bet ${selectedBet === index ? 'game-start_bet-selected' : ''} ${props.userInfo.chips < bet ? 'disabled' : 'pointer'}`} 
							key={bet} onClick={() => props.userInfo.chips >= bet && setBet(index)}>{bet}</div>
					))}
				</div>
				<button className="game_start_btn btn-brown" onClick={() => {props.startGame(bets[selectedBet])}}>начать</button>
			</Modal>
		</div>
    );
}
