import React, { useState } from 'react';
import Modal from 'react-modal';
import './Shop.css'
import { cheats, money } from "../../metadata.json";

Modal.setAppElement('#root');

export default function Shop(props){
	const tabs = ['Читы', 'Фишки', 'Поле', 'Денюшки'];
	const [tab, setTab] = useState(0);
    return (
		<Modal
			isOpen={props.shopIsOpen}
			onRequestClose={props.setShopIsOpen.bind(null, false)}
			className={`modal shop_modal`}
			closeTimeoutMS={300}
			contentLabel="Example Modal"
		>
			<div onClick={props.setShopIsOpen.bind(null, false)} className="abs-top-right"></div>
			<div className="shop_header">Магазин</div>
			<div className="shop_main">
				<div className="shop_tabs flex-center">
					{tabs.map((item, i) => (<div className={`pointer shop_tab${i === tab ? ' shop_tab-selected' : ''}`} onClick={setTab.bind(null, i)} key={i}>{ item }</div>))}
				</div>
				{tab === 0 ? (
					<div className="shop_items-wrapper flex-sb">
						{cheats.map(ch => (
							<div className="shop_item" key={ch.id}>
								<div className="shop_item-title">{ch.title}</div>
								{props.userInfo[ch.id] ? <div className="shop_item-qty">{props.userInfo[ch.id]}</div> : null}
								<div className={`shop_item-icon ${ch.iconClass}`}></div>
								<div className="shop_item-description">{ch.description}</div>
								<div className="shop_item-price flex-center">
									<div className="shop_item-price-icon"></div>
									<div className="shop_item-price-number">{ch.price}</div>
								</div>
								<button className={`shop_item-buy${ch.price > props.userInfo.money ? ' disabled' : ''}`} onClick={buy.bind(null, props.userInfo, ch.id, props.socket)}>купить</button>
							</div>
						))}
					</div>
				) : null}
				{tab === 1 || tab === 2 ? (
					<div className="shop_items-wrapper flex-center">
						<div className="shop_placeholder">Скоро...</div>
						<div className="shop_timer"></div>
					</div>
				) : null}
				{tab === 3 ? (
					<div className="shop_items-wrapper flex-sb">
						{money.map(item => (
							<div className="shop_item" key={item.id}>
								<div className="shop_item-title">{item.title}</div>
								<div className={`shop_item-money-icon ${item.iconClass}`}></div>
								<div className="shop_item-description">{item.description}</div>
								<div className="shop_item-price flex-center">
									<div className="shop_item-price-number">{item.priceText}</div>
								</div>
								<button className={`shop_item-buy`} onClick={buyVK.bind(null, props.userInfo, item.id, props.socket)}>купить</button>
							</div>
						))}
					</div>
				) : null}
			</div>
			<button className="shop_close-btn btn-brown" onClick={props.setShopIsOpen.bind(this, false)}>закрыть</button>
		</Modal>
    );
}
function buy(userInfo, id, socket) {
	const ch = cheats.find(item => item.id === id);
	if (ch.price > userInfo.money) return;

	socket.emit('buy-item', { id });
}

function buyVK(userInfo, id, socket) {
	let VK = window.VK;
	if (!VK) return;

	VK.callMethod('showOrderBox', { type: 'item', item: id });

	VK.addCallback('onOrderSuccess', function(order_id) {
		console.log('succ');
	});
	VK.addCallback('onOrderFail', function() {
		console.log('fail');
	});
	VK.addCallback('onOrderCancel', function() {
		console.log('cancel');
	});
}
