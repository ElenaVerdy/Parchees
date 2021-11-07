import React from 'react'
import Tables from '../Tables/Tables'
import LobbyHeader from '../LobbyHeader/LobbyHeader'
import './Lobby.css'

export default function Lobby () {
    return(
        <div className='lobby-container'>
            <LobbyHeader />
            <Tables />
        </div>
    )
}