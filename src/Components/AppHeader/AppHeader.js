import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux'

import './AppHeader.css';
import Shop from '../Shop/Shop';
import Lottery from '../Lottery/Lottery';
import Records from '../Records/Records';
import Rules from '../Rules/Rules';

export default function AppHeader(props){
	const user = useSelector(state => state.user)

	const [shopIsOpen, setShopIsOpen] = useState(false);
	const [recordsIsOpen, setRecordsIsOpen] = useState(false);
	const [rulesOpen, setRulesOpen] = useState(props.justInstalled);
	const [lotteryIsOpen, setLotteryIsOpen] = useState(false);
	const [lastBet, setLastBet] = useState(false);
	const [lastRating, setLastRating] = useState(false);
	const [shopTab, setShopTab] = useState(0);
	const openShopWithTab = (tab) => {
		setShopTab(tab);
		setShopIsOpen(true);
	}

	useEffect(() => {
		if (props.bet) setLastBet(props.bet);
		if (props.avgRating) setLastRating(props.avgRating);
	}, [props.bet, props.avgRating])

    return (
		<div className="app-header flex-sb">
			<Shop shopIsOpen={shopIsOpen} setShopIsOpen={setShopIsOpen.bind(this)} userInfo={user} socket={props.socket} tab={shopTab} setTab={setShopTab} />
			<Lottery isOpen={lotteryIsOpen} setIsOpen={setLotteryIsOpen} lottery={props.lotteryField} userInfo={user} socket={props.socket} ></Lottery>
			<Records isOpen={recordsIsOpen} setIsOpen={setRecordsIsOpen} userInfo={user} topByRank={props.topByRank} topByChips={props.topByChips} ></Records>
			<Rules isOpen={rulesOpen} setIsOpen={setRulesOpen}></Rules>
			<div className="app-header_left flex-center">
				<div className="app-header_btn-wrapper pointer" onClick={openShopWithTab.bind(this, 0)}><div className="app-header_btn app-header_shop-btn"></div></div>
				<div className="app-header_btn-wrapper pointer" onClick={setRecordsIsOpen.bind(this, true)}><div className="app-header_btn app-header_records-btn"></div></div>
				<div className="app-header_btn-wrapper pointer" onClick={setLotteryIsOpen.bind(this, true)}>
					<div className="app-header_btn app-header_dice-btn"></div>
					{user.timeToLottery ? null : <div className="app-header_btn-lottery-sign"></div>}
				</div>
				<div className="app-header_btn-wrapper pointer" onClick={openShopWithTab.bind(this, 3)} >
					<div className="app-header_chips flex-center">
						<div className="app-header_chips-number">{ user.chips }</div>
						<div className="app-header_chips-add"></div>
					</div>
				</div>
				<div className="app-header_btn-wrapper pointer" onClick={openShopWithTab.bind(this, 3)} >
					<div className="app-header_money flex-center">
						<div className="app-header_money-number">{ user.money }</div>
						<div className="app-header_money-add"></div>
					</div>
				</div>
			</div>
			<div className="app-header_right flex-center">
				<div className="app-header_btn-wrapper pointer"><div className="app-header_btn app-header_question" onClick={setRulesOpen.bind(null, true)}></div></div>
				{/* <div className="app-header_btn-wrapper pointer"><div className="app-header_btn app-header_sound-btn"></div></div> */}
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
