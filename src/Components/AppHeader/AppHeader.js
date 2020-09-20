import React, { useEffect, useState } from 'react';
import './AppHeader.css';
import Shop from '../Shop/Shop';
import Lottery from '../Lottery/Lottery';

export default function AppHeader(props){
	const [shopIsOpen, setShopIsOpen] = useState(false);
	const [lotteryIsOpen, setLotteryIsOpen] = useState(false);
	const [lastBet, setLastBet] = useState(false);
	const [lastRating, setLastRating] = useState(false);

	useEffect(() => {
		if (props.bet) setLastBet(props.bet);
		if (props.avgRating) setLastRating(props.avgRating);
	}, [props.bet, props.avgRating])
    return (
		<div className="app-header flex-sb">
			<Shop shopIsOpen={shopIsOpen} setShopIsOpen={setShopIsOpen.bind(this)} userInfo={props.userInfo} socket={props.socket} />
			<Lottery isOpen={lotteryIsOpen} setIsOpen={setLotteryIsOpen} lottery={props.lotteryField} userInfo={props.userInfo} socket={props.socket} ></Lottery>
			<div className="app-header_left flex-center">
				<div className="app-header_btn-wrapper pointer" onClick={setShopIsOpen.bind(this, true)}><div className="app-header_btn app-header_shop-btn"></div></div>
				<div className="app-header_btn-wrapper pointer"><div className="app-header_btn app-header_records-btn"></div></div>
				<div className="app-header_btn-wrapper pointer" onClick={setLotteryIsOpen.bind(this, true)}>
					<div className="app-header_btn app-header_dice-btn"></div>
					{props.userInfo.timeToLottery ? null : <div className="app-header_btn-lottery-sign"></div>}
				</div>
				<div className="app-header_btn-wrapper pointer">
					<div className="app-header_chips flex-center">
						<div className="app-header_chips-number">{ props.userInfo.chips }</div>
						<div className="app-header_chips-add"></div>
					</div>
				</div>
				<div className="app-header_btn-wrapper pointer">
					<div className="app-header_money flex-center">
						<div className="app-header_money-number">{ props.userInfo.money }</div>
						<div className="app-header_money-add"></div>
					</div>
				</div>
			</div>
			<div className="app-header_right flex-center">
				<div className="app-header_btn-wrapper pointer"><div className="app-header_btn app-header_music-btn"></div></div>
				<div className="app-header_btn-wrapper pointer"><div className="app-header_btn app-header_sound-btn"></div></div>
				<div className={`app-header_btn-wrapper pointer${props.tableId ? '' : ' app-header_btn-wrapper-hidden'}`}>
				<div className="flex-center">
					<div className="app-header_chips flex-center">
						<div className="app-header_chips-number"> {lastBet} </div>
					</div>
					<div className="app-header_star flex-center">
						<div className="app-header_chips-number"> {lastRating} </div>
					</div>
					<div className="app-header_btn app-header_leave-btn" onClick={props.toTables} />
				</div>
				</div>
			</div>
		</div>
    );
}
