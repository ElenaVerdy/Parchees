import React, { useState } from 'react';
import Modal from 'react-modal';
import './Records.css';

Modal.setAppElement('#root');

export default function Records(props){
	const [tab, setTab] = useState(0);
    return (
		<Modal
			isOpen={props.isOpen}
			onRequestClose={props.setIsOpen.bind(null, false)}
			className={`modal records_modal`}
			closeTimeoutMS={300}
			contentLabel="Example Modal"
		>
			<div className="records_header">Доска почёта</div>
			<div className="records_main">
				<div className="shop_tabs flex-center">
					<div className={`pointer shop_tab${0 === tab ? ' shop_tab-selected' : ''}`} onClick={setTab.bind(null, 0)}>
						<div className="records_tab-icon records_tab-icon-rating flex-center">
							<div>Рейтинг</div>
						</div>
					</div>
					<div className={`pointer shop_tab${1 === tab ? ' shop_tab-selected' : ''}`} onClick={setTab.bind(null, 1)}>
						<div className="records_tab-icon records_tab-icon-chips flex-center">
							<div>Фишки</div>
						</div>
					</div>
				</div>
				{tab === 0 ? (
					<div className="records_main-wrapper">
						{props.topByRank.map((item, i) => {
							return (
								<div className={`records_record-wrapper${getRecordWrapperClass(i)} flex`}>
									<div className="records_num">{ i + 1 }</div>
									<div className='records_photo'><img src={ item.photo_50 } alt={ `${item.first_name} ${item.last_name}` } height="25" width="25"/></div>
									<div className='records_name flex-grow'>{ `${item.first_name} ${item.last_name}` }</div>
									<div className='lobby-header_rank'><div className="records_tab-icon records_tab-icon-rating flex-center">{ item.rating }</div></div>
								</div>
							)
						})}
					</div>
				) : null}
				{tab === 1 ? (
					<div className="records_main-wrapper">
						{props.topByChips.map((item, i) => {
							return (
								<div className={`records_record-wrapper${getRecordWrapperClass(i)} flex`}>
									<div className="records_num">{ i + 1 }</div>
									<div className='records_photo'><img src={ item.photo_50 } alt={ `${item.first_name} ${item.last_name}` } height="25" width="25"/></div>
									<div className='records_name flex-grow'>{ `${item.first_name} ${item.last_name}` }</div>
									<div className='lobby-header_chips'><div className="records_tab-icon records_tab-icon-chips flex-center">{ item.chips }</div></div>
								</div>
							)
						})}
					</div>
				) : null}
			</div>
			<button className="shop_close-btn btn-brown" onClick={props.setIsOpen.bind(this, false)}>закрыть</button>
		</Modal>
    );
}
function getRecordWrapperClass(index) {
	if (index === 0) return ' records_record-wrapper__gold';
	if (index === 1) return ' records_record-wrapper__silver';
	if (index === 2) return ' records_record-wrapper__bronze';
	return '';
}