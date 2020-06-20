import React from 'react';
import './Tables.css';


export default class Game extends React.Component {
    constructor(props) {
        super(props);
    }
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
                            <tr className="tables_row tables_row-header">
                                <td className="tables_name">Стол</td>
                                <td className="tables_bet">Ставка</td>
                                <td className="tables_rank">&#9733;</td>
                                <td className="tables_players">Игроки</td>
                            </tr>
                        </thead>
                        <tbody>
                            {this.props.tables.map(t => {
                                return (
                                    <tr className="tables_row" key={t.tableId} onClick={() => {console.log(t);this.props.socket.emit("connect-to-request", {id: t.tableId})}}>
                                        <td className="tables_name">{t.tableId}</td>
                                        <td className="tables_bet">123</td>
                                        <td className="tables_rank">123</td>
                                        <td className="tables_players">123</td>
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