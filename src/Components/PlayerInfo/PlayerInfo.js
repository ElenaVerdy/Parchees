import React from 'react';
import './PlayerInfo.css';

export default function PlayerInfo (props) {
    return (
		<div>
			<div className={'player-info player-info_' + props.num + (props.playerLeft ? "disabled" : "")}>
				<div className="player-info_main">
					<div className="player-info_name"><span className={`player-info_chip-icon player-info_chip-icon_${props.num}`}></span>{props.playersInfo.name}</div>
					<div className='player-info_rank'>
						<div className='icon player-info_rank-star'>&#9733;</div>
						<div className="player-info_rank-number">{ props.playersInfo.rank }</div>
					</div>
				</div>
				<div className="player-info_img"><img width={50} height={50} src={props.playersInfo.photo_50}></img></div>
			</div> 
			<div className={`player-info_ready player-info_ready_${props.num} ${props.playersInfo.ready ? "player-info_ready-active" : ''}`}>
				<div className="player-info_fire"></div>
				<div>Готов!</div>
			</div>
		</div>
    )
}