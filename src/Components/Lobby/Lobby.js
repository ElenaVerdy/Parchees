import React from 'react'
import Tables from '../Tables/Tables'
import LobbyHeader from '../LobbyHeader/LobbyHeader'
import './Lobby.css'

export default function Lobby (props) {
    return(
        <div className='lobby-container'>
            <LobbyHeader />
            <Tables socket={props.socket} />
        </div>
    )
}