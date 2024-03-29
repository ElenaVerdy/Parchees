import React from 'react'
import { useSelector } from 'react-redux'
import './LobbyHeader.css'

export default function LobbyHeader () {
    const user = useSelector(state => state.user)
    const inGame = useSelector(state => state.tables.playersInGame)
    const inMenu = useSelector(state => state.tables.playersInMenu)

    return(
        <div className='lobby-header'>
            <div className="lobby-header_right">
                <div className='lobby-header_photo'><img src={ user.photo_100 } alt={user.name} height="70" width="70"/></div>
                <div>
                    <div className='lobby-header_name'>{ user.name }</div>
                    <div className='lobby-header_rank'><div className='icon lobby-header_rank-star'></div><div className="lobby-header_rank-number">{ user.rating }</div></div>
                </div>
            </div>
            <div className='lobby-header_left'>
                <button className="btn-grey btn-grey-small">с компьютером</button>
                <div className="lobby-header_left_counts">В игре: <span>{ inGame }</span></div>
                <div className="lobby-header_left_counts">В меню: <span>{ inMenu }</span></div>
            </div>
        </div>
    )
}