import React from 'react';
import './GameFinished.css';

export default function GameFinished(props) {
	return (
		<div className={"game-finished_main-container"}>
			<div onClick={() => {props.close()}} className="game-finished_close">×</div>
			<table className="game_finished_table">
				<thead className="game_finished_table-header">
					<tr>
						<td className="game_finished_tr_winner" />
						<td className="game_finished_tr_name">Имя</td>
						<td className="game_finished_tr_rank">Ранк</td>
						<td className="game_finished_tr_rank-delta"></td>
					</tr>
				</thead>
				<tbody>
					{props.results.map((res, i) => {
						return (<tr key={i}>
							<td className="game_finished_tr_winner">
								{res.isWinner ? 
									<div className="game-finished_medal_container">
										<div className="game-finished_medal" data-num={1} />
										<div className="game-finished_medal-tape" /> 
									</div> 
								: ""}
							</td>
							<td className="game_finished_tr_name">{res.name}</td>
							<td className="game_finished_tr_rank">{res.rank}</td>
							<td className="game_finished_tr_rank-delta">{res.deltaRank}</td>
						</tr>)
					})}
				</tbody>
			</table>
		</div>
	)
}
