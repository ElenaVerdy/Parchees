import React from 'react';
import './PlayerInfo.css';

export default function PlayerInfo (props) {
	let position;
	if (props.num === props.myNum) position = 'bottom-right';
	if ((props.myNum - props.num === -1) || (props.myNum === 4 && props.num === 1))
		position = 'bottom-left';
	if (Math.abs(props.myNum - props.num) === 2)
		position = 'top-left';
	if ((props.myNum - props.num === 1) || (props.myNum === 1 && props.num === 4))
		position = 'top-right';
    return (
		<div>
			<div className={`player-info player-info_${position}${props.playerLeft ? " disabled" : ""}`} >
				<div className="player-info_main">
					<div className="player-info_name"><span className={`player-info_chip-icon player-info_chip-icon_${props.num}`}></span>{props.playersInfo.name}</div>
					<div className='player-info_rank'>
						<div className="player-info_rank-number">{ props.playersInfo.rating }</div>
						<div className='icon player-info_rank-star'></div>
					</div>
				</div>
				<div className="player-info_img"><img width={50} height={50} src={props.playersInfo.photo_50} alt={ props.playersInfo.username }></img></div>
			</div> 
			<div className={`player-info_ready player-info_ready_${position} ${props.playersInfo.ready ? "player-info_ready-active" : ''} ${props.playerLeft ? " transparent" : ""}`}>
				<div className="player-info_fire"></div>
				<div>Готов!</div>
			</div>
		</div>
    )
}