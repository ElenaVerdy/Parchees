import React from 'react';
import './AppHeader.css';
import Shop from '../Shop/Shop';

export default function AppHeader(props){
	const [shopIsOpen, setShopIsOpen] = React.useState(false);
    return (
		<div className="app-header flex-sb">
			<Shop shopIsOpen={shopIsOpen} setShopIsOpen={setShopIsOpen.bind(this)} userInfo={props.userInfo} socket={props.socket} />
			<div className="app-header_left flex-center">
				<div className="app-header_btn-wrapper pointer" onClick={setShopIsOpen.bind(this, true)}><div className="app-header_btn app-header_shop-btn"></div></div>
				<div className="app-header_btn-wrapper pointer"><div className="app-header_btn app-header_records-btn"></div></div>
				<div className="app-header_btn-wrapper pointer"><div className="app-header_btn app-header_dice-btn"></div></div>
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
				<div className={`app-header_btn-wrapper pointer${props.tableId ? '' : ' app-header_btn-wrapper-hidden'}`}><div className="app-header_btn app-header_leave-btn" onClick={props.toTables} /></div>
			</div>
		</div>
    );
}
