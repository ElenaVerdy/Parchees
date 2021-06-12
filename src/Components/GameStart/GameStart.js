import React, { useEffect, useState, useMemo } from 'react';
import Modal from 'react-modal';
import './GameStart.css'

Modal.setAppElement('#root');

export default function GameStart(props){
	const [ modalIsOpen, setIsOpen ] = useState(false);
	const bets = useMemo(() => [100, 300, 500, 1000, 2500, 5000, 10000, 25000], []);
	const [ selectedBet, setBet ] = useState(3);

	useEffect(() => {
		let maxIndex = bets.findIndex(i => i > props.userInfo.chips);

		if (maxIndex === 0) {
			maxIndex = null;
		} else if (maxIndex === -1) {
			maxIndex = 7;
		} else {
			maxIndex -= 1;
		}

		setBet(maxIndex);
	}, [ props.userInfo.chips, bets ]);

	const startGame = () => {
		props.socket.emit("new-table", { ...props.userInfo, bet: bets[selectedBet] });
	}

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
				<button className="game_start_btn btn-brown" onClick={ startGame }>начать</button>
			</Modal>
		</div>
    );
}
