import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux'

import Modal from 'react-modal';

import './GameStart.css'

Modal.setAppElement('#root');

export default function GameStart(props){
	const user = useSelector(state => state.user)

	const [ modalIsOpen, setIsOpen ] = useState(false);
	const bets = useMemo(() => [100, 300, 500, 1000, 2500, 5000, 10000, 25000], []);
	const [ selectedBet, setBet ] = useState(3);

	useEffect(() => {
		let maxIndex = bets.findIndex(i => i > user.chips);

		if (maxIndex === 0) {
			maxIndex = null;
		} else if (maxIndex === -1) {
			maxIndex = 7;
		} else {
			maxIndex -= 1;
		}

		setBet(maxIndex);
	}, [ user.chips, bets ]);

	const startGame = () => {
		props.socket.emit("new-table", { ...user, bet: bets[selectedBet] });
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
						<div className={`game-start_bet ${selectedBet === index ? 'game-start_bet-selected' : ''} ${user.chips < bet ? 'disabled' : 'pointer'}`} 
							key={bet} onClick={() => user.chips >= bet && setBet(index)}>{bet}</div>
					))}
				</div>
				<button className="game_start_btn btn-brown" onClick={ startGame }>начать</button>
			</Modal>
		</div>
    );
}
