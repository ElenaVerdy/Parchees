import React from 'react';
import './LobbyHeader.css';

export default class LobbyHeader extends React.Component {
	constructor(props){
		super(props);
		this.state = {};
	}
	render() {
		let userInfo = this.props.userInfo;
		console.log(userInfo)
		return(
			<div className='lobby-header'>
				<div className="lobby-header_right">
					<div className='lobby-header_photo'><img src={ userInfo.photo_100 } alt={userInfo.name} height="70" width="70"/></div>
					<div>
						<div className='lobby-header_name'>{ userInfo.name }</div>
						<div className='lobby-header_rank'><div className='icon lobby-header_rank-star'>&#9733;</div><div className="lobby-header_rank-number">{ userInfo.rating }</div></div>
						<div className='lobby-header_bank'><div className='icon lobby-header_dollar-sign'>&#36;</div><div className="lobby-header_dollar-number">{ userInfo.chips }</div></div>
					</div>
				</div>
				<div className='lobby-header_left'>
					<button className="btn-small">с компьютером</button>
					<button className="btn-small">играть с другом</button>
				</div>
			</div>
		)
	}
}