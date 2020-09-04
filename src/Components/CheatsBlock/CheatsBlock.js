import React from 'react';
import './CheatsBlock.css';
import { cheats } from "../../metadata.json";
import ReactTooltip from 'react-tooltip';
import Modal from 'react-modal';

export default function CheatsBlock (props) {
	const [toBuyIndex, setToBuyIndex] = React.useState(0);
	const [wantToBuy, setWantToBuy] = React.useState(false);

	const chooseCheat = (index) => {
		let ch = cheats[index];
		if (disableCheat(ch.id)) return;
		setToBuyIndex(index);
		setWantToBuy(!props.userInfo[ch.id]);
		if (props.userInfo[ch.id]) {
			usedItem(ch, false);
		}
	}

	const usedItem = (cheat, buy) => {
		switch (cheat.id) {
			case 'skip':
			case 'reroll':
			case 'runaway':
			case 'free_shortcuts':
				props.socket.emit("use-item", { tableId: props.tableId, cheatId: cheat.id, buy });
				break;

			case 'shield':
			case 'flight':
				userChoosesChip()
				.then(id => {
					if (!id) return;
					let player = +id[16];
					let num = +id[21];
					if (!player || !num) return;
					props.socket.emit("use-item", { tableId: props.tableId, cheatId: cheat.id, buy, player, num });
				})
				break;

			case 'no_shortcuts':
			case 'move_back':
				console.log('one opponent');
				break;

			default:
				throw new Error('wrong cheat.id');
		}

		setWantToBuy(false);
	}
	const userChoosesChip = () => {
		let click;
		return new Promise((resolve, reject) => {
			Array.from(document.getElementsByClassName('game_chip')).forEach(elem => elem.classList.add('game_chip-to-be-selected'));
			click = event => event.target.classList.contains('game_chip') ? resolve(event.target.id) : reject();
			document.addEventListener('click', click);
		})
		.catch(() => {})
		.finally(() => {
			Array.from(document.getElementsByClassName('game_chip')).forEach(elem => elem.classList.remove('game_chip-to-be-selected'));
			document.removeEventListener('click', click);
		})
	}
	const disableCheat = (cheatId) => {
		if (cheatId !== 'reroll') return !props.myTurn;
		return !props.canReroll;
	};
    return (
		<div className="cheat-block_wrapper">
			{cheats.map((i, index) => (
				<div key={i.id} className={`cheat-block pointer${disableCheat(i.id) ? ' disabled' : ''}`} data-tip data-for={`cheat-block_tooltip-${i.id}`} onClick={chooseCheat.bind(null, index)}>
					<ReactTooltip id={`cheat-block_tooltip-${i.id}`} className={`cheat-block_tooltip`} place="bottom" effect="solid" arrowColor="white" data-event={i.id}>
						<div>
							<div className="cheat-block_tooltip-title">
								{i.title}
							</div>
							{props.userInfo[i.id] ? <div className="cheat-block_tooltip-qty">{`У вас есть: ${props.userInfo[i.id]}`}</div> : null}
							<div className="cheat-block_tooltip-description">
								{i.description}
							</div>
							<div className="cheat-block_tooltip-price flex-center">
								<div className="chear-block_tooltip-price-icon"></div>
								<div className="chear-block_tooltip-price-number">{i.price}</div>
							</div>
						</div>
					</ReactTooltip>
					{props.userInfo[i.id] ? <div className="cheat-block_qty">
						{props.userInfo[i.id]}
					</div> : null}
					<div className={`cheat-block_icon ${i.iconClass}`}>
					</div>
				</div>
			))}
			<Modal
				isOpen={wantToBuy}
				onRequestClose={() => setWantToBuy(false)}
				className="modal cheat-block-buy-modal"
				closeTimeoutMS={500}
				contentLabel="Example Modal">
					<div className="modal-header">покупка</div>
					<div className="app_modal-error_text">
						<span>{"Купить и использовать "}</span><b>{ cheats[toBuyIndex].title }</b><span>{" за "}</span>
						<span className={`cheat-block_modal-${cheats[toBuyIndex].currency}`}>{cheats[toBuyIndex].price}</span>
					</div>
					<div className="flex-center">
						<button className="cheat-block_buy-modal_btn bg-green" onClick={() => usedItem(cheats[toBuyIndex], true)}>ок</button>
						<button className="cheat-block_buy-modal_btn btn-brown" onClick={setWantToBuy.bind(null, false)}>закрыть</button>
					</div>
			</Modal>
		</div>
    )
}
