import React from 'react';
import './Tables.css';


export default class Game extends React.Component {
    componentDidMount() {
        this.props.socket.emit("get-tables-request");
        this.timer = setInterval(()=>{
            this.props.socket.emit("get-tables-request");
		}, 1000)
    }
    componentWillUnmount() {
        clearInterval(this.timer);
    }
    render(){
        return (
            <div className="tables_container">
                <div className="tables_list">
                    <table>
                        <thead>
                            <tr className="tables_row-header">
                                <td className="tables_players table_players-header">игроки</td>
                                <td className="tables_bet">ставка</td>
                                <td className="tables_rank">&#9733;</td>
                            </tr>
                        </thead>
                        <tbody>
                            {this.props.tables.map(t => {
                                return (
                                    <tr className="tables_row" key={t.tableId}>
                                        <td className="tables_players">
                                            <div className="tables_join-button" onClick={() => {this.props.socket.emit("connect-to-request", {...this.props.userInfo, id: t.tableId})}}>играть</div>
                                            {t.players.map((player, index) => (<div className="tables_player-icon" key={`${t.playerId}_pl${index}`}>
                                                <img width={40} height={40} src={player.photo_50} alt={player.username} />
                                            </div>))}
                                            <div className="tables_player-icon table-join-icon" onClick={() => {this.props.socket.emit("connect-to-request", {...this.props.userInfo, id: t.tableId})}}></div>
                                        </td>
                                        <td className="tables_bet">123</td>
                                        <td className="tables_rank">123</td>
                                    </tr>
                                )  
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}