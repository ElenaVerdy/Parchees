import React from 'react'
import { connect } from 'react-redux'
import { SocketContext } from '../../context/socket'
import './Tables.css'


class Tables extends React.Component {
    constructor (props, context){
        super(props, context)

        this.socket = this.context
    }

    componentDidMount () {
        this.socket.emit('get-tables-request')
        this.timer = setInterval(()=>{
            this.socket.emit('get-tables-request')
        }, 1000)
    }
    componentWillUnmount () {
        clearInterval(this.timer)
    }
    render (){
        return (
            <div className="tables_container">
                <div className="tables_list">
                    <div className="tables_row tables_row-header">
                        <div className="tables_players table_players-header">игроки</div>
                        <div className="tables_bet">ставка</div>
                        <div className="tables_rank">&#9733;</div>
                    </div>
                    {this.props.tables.map(t => {
                        return (
                            <div className="tables_row tables_row-body" key={t.tableId}>
                                <div className="tables_players">
                                    <div className="tables_join-button" onClick={() => {
                                        this.socket.emit('connect-to-request', {...this.props.user, id: t.tableId})
                                    }}>играть</div>
                                    {t.players.map((player, index) => (<div className="tables_player-icon" key={`${t.playerId}_pl${index}`}>
                                        <img width={40} height={40} src={player.photo_50} alt={player.username} />
                                    </div>))}
                                    <div className="tables_player-icon table-join-icon" onClick={() => {
                                        this.socket.emit('connect-to-request', {...this.props.user, id: t.tableId})
                                    }}></div>
                                </div>
                                <div className="tables_bet">{ t.bet }</div>
                                <div className="tables_rank">{ t.rating }</div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
}

Tables.contextType = SocketContext;

const mapStateToProps = (state) => ({
    user: state.user,
    tables: state.tables.tables
})

export default connect(mapStateToProps)(Tables)