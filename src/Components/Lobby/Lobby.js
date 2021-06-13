import React from 'react'
import Tables from '../Tables/Tables'
import LobbyHeader from '../LobbyHeader/LobbyHeader'
import './Lobby.css'

export default class Lobby extends React.Component {
    constructor (props){
        super(props)

        this.state = {}
    }
    render () {
        return(
            <div className='lobby-container'>
                <LobbyHeader { ...this.props }/>
                <Tables tables={this.props.tables} socket={this.props.socket} />
            </div>
        )
    }
}