import React, { useState, useEffect } from 'react';
import './CheatsBlock.css';
import { cheats } from "../../metadata.json";
import ReactTooltip from 'react-tooltip';
import Modal from 'react-modal';

export default function CheatsBlock (props) {
	const [toBuyIndex, setToBuyIndex] = useState(0);
	const [wantToBuy, setWantToBuy] = useState(false);
	const [luckOn, setluckOn] = useState(false);

	const chooseCheat = (index) => {
		let ch = cheats[index];
		if (!validateCheat(ch)) return;
		setToBuyIndex(index);
		setWantToBuy(!props.userInfo[ch.id]);
		if (props.userInfo[ch.id]) {
			usedItem(ch, false);
		}
	};
	useEffect(() => {
		if (!props.myTurn && luckOn) setluckOn(false);
	}, [props.myTurn, luckOn]);
	const usedItem = (cheat, buy) => {
		switch (cheat.id) {
			case 'luck':
				setluckOn(true);
			case 'skip':
			case 'reroll':
				props.socket.emit("use-item", { tableId: props.tableId, cheatId: cheat.id, buy });
				break;
				
			case 'shield':
			case 'flight':
			case 'free_shortcuts':
			case 'no_shortcuts':
			case 'cat':
				userChoosesChip()
				.then(id => {
					if (!id) return;
					let player = +id[16];
					let num = +id[21];
					if (!player || !num) return;
					if (!validateChipCheat()) return;
					props.socket.emit("use-item", { tableId: props.tableId, cheatId: cheat.id, buy, player, num });
				})
				break;

			default:
				throw new Error('wrong cheat.id');
		}

		setWantToBuy(false);
	}
	const userChoosesChip = () => {
		let click;
		return new Promise((resolve, reject) => {
			Array.from(document.getElementsByClassName('game_chip')).forEach(elem => elem.classList.add('game-cheat_chip-to-select'));
			click = event => event.target.classList.contains('game_chip') ? resolve(event.target.id) : reject();
			document.addEventListener('click', click);
			props.disable(true);
		})
		.catch(() => {})
		.finally(() => {
			Array.from(document.getElementsByClassName('game_chip')).forEach(elem => elem.classList.remove('game-cheat_chip-to-select'));
			document.removeEventListener('click', click);
			props.disable(false);
		})
	}
	const validateCheat = (cheat) => {
		let err = ''
		err || (!props.myTurn && (err = 'Читы можно использовать только в свой ход!'));
		err || ((cheat.id === 'luck' && luckOn) && (err = 'Чит уже активирован'));
		err || ((cheat.id === 'luck' && !luckOn && !props.canThrow) && (err = 'Вы не можете бросить кубик. Нет смысла тратить чит.'))
		err || (((cheat.id === 'skip' || cheat.id === 'reroll') && props.canSkip) && (err = 'Вы можете бросить кубик или закончить ход без читов'));
		return err ? props.showError(err) : true;
	}
	const validateChipCheat = () => {
		let err = ''
		err || (!props.myTurn && (err = 'Ваш ход уже закончился'));
		return err ? props.showError(err) : true;
	}
    return (
		<div className="cheat-block_wrapper">
			{cheats.map((i, index) => (
				<div key={i.id} className={`cheat-block pointer${i.id === 'luck' && luckOn ? ' cheat-block_active' : ''}`} data-tip data-for={`cheat-block_tooltip-${i.id}`} onClick={chooseCheat.bind(null, index)}>
					<ReactTooltip id={`cheat-block_tooltip-${i.id}`} className={`cheat-block_tooltip`} place="bottom" effect="solid" arrowColor="white">
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
