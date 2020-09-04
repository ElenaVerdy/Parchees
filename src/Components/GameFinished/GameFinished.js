import React from 'react';
import './GameFinished.css';

export default function GameFinished(props) {
	return (
		<div className={"game-finished_main-container"}>
			<div onClick={() => {props.close()}} className="abs-top-right"></div>
			<table className="game_finished_table">
				<thead className="game_finished_table-header">
					<tr>
						<td className="game_finished_td game_finished_tr_winner" />
						<td className="game_finished_td game_finished_tr_name">Имя</td>
						<td className="game_finished_td game_finished_tr_chips"></td>
						<td className="game_finished_td game_finished_tr_rank">Ранк</td>
						<td className="game_finished_td game_finished_tr_rank-delta"></td>
					</tr>
				</thead>
				<tbody>
					{props.results.map((res, i) => {
						return (<tr key={i}>
							<td className="game_finished_td game_finished_tr_winner">
								{res.isWinner ? 
									<div className="game-finished_medal_container">
										<div className="game-finished_medal" data-num={1} />
										<div className="game-finished_medal-tape" /> 
									</div> 
								: ""}
							</td>
							<td className="game_finished_td game_finished_tr_name">{res.name}</td>
							<td className="game_finished_td game_finished_tr_chips">{`${res.deltaChips < 0 ? '' : '+'}${res.deltaChips}`}</td>
							<td className="game_finished_td game_finished_tr_rank">{res.rating}</td>
							<td className="game_finished_td game_finished_tr_rank-delta">{`(${res.deltaRank < 0 ? '' : '+'}${res.deltaRank})`}</td>
						</tr>)
					})}
				</tbody>
			</table>
			<div className="flex game_finished_btn-wrapper">
				<button className="btn-brown game_finished_btn" onClick={props.toTables}>к столам</button>
				<button className="btn-brown game_finished_btn" onClick={props.close}>закрыть</button>
			</div>
		</div>
	)
}
