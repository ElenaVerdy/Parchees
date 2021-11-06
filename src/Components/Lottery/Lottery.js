import React, { useState, useEffect, useRef, useContext } from 'react'
import { SocketContext } from '../../context/socket'
import { useSelector } from 'react-redux'
import Modal from 'react-modal'
import './Lottery.css'
import ReactDice from '../ReactDice/ReactDice'
import 'react-dice-complete/dist/react-dice-complete.css'

Modal.setAppElement('#root')

export default function Lottery (props){
    const socket = useContext(SocketContext)

    const diceRef = useRef(null)
    const user = useSelector(state => state.user)

    useEffect(() => {
        socket.on('lottery-rolled', ({ dice }) => {
            setDice(dice)
            diceRef && diceRef.current && diceRef.current.rollAll(dice)
        })

        return () => socket.off('lottery-rolled')
    })

    useEffect(() => setDice([]), [props.isOpen])
    const [dice, setDice] = useState([])
    const [disabled, setDisabled] = useState(false)

    function rollDice () {
        socket.emit('lottery-roll', { buy: !!user.timeToLottery })
        setDisabled(true)
    }


    const timerStr = function (time) {
        const hrs = time > 60 * 60 ? time / 60 / 60 ^ 0 : 0
        const min = time > 60 ? (time - hrs * 60 * 60) / 60 ^ 0 : 0
        const sec = time - hrs * 60 * 60 - min * 60

        return `00${hrs}`.slice(-2) + ':' + `00${min}`.slice(-2) + ':' + `00${sec}`.slice(-2)
    }

    return (
        <Modal
            isOpen={props.isOpen}
            onRequestClose={props.setIsOpen.bind(null, false)}
            className={'modal lottery_modal'}
            closeTimeoutMS={300}
            contentLabel="Example Modal"
        >
            <div onClick={props.setIsOpen.bind(null, false)} className="abs-top-right"></div>
            <div className="lottery_header">Ежедневная лотерея</div>
            <div className="lottery_main">
                <div className="lottery_container">
                    {props.lottery && props.lottery.map((row, i) => (
                        <div className="lottery_row" key={i}>
                            <div className={'lottery_item lottery_item-left'}>{i + 1}</div>
                            {row.map((item, index) => (
                                <div className={`lottery_item ${+item ? 'lottery_item-chips' : ('cheat-block__' + item)}${(!disabled && dice[0] === i + 1 && dice[1] === index + 1) ? ' lottery_item-prize' : ''}`} key={index}>
                                    {+item ? item : ''}
                                </div>
                            ))}
                        </div>
                    ))}
                    <div className="lottery_row">
                        <div className={'lottery_item lottery_item-left lottery_item-bottom'}></div>
                        {props.lottery && props.lottery.map((row, i) => (
                            <div className={'lottery_item lottery_item-bottom'} key={i}>{i + 1}</div>
                        ))}
                    </div>
                </div>
                <div className="lottery_left-container">
                    <div className="lottery_gift-line flex-center">500 в подарок</div>
                    {user.timeToLottery ? null : <button className="btn-grey" disabled={disabled} onClick={() => {
                        disabled || rollDice()
                    }}>Бросить бесплатно</button>}
                    {user.timeToLottery ?
                        <button className="btn-grey" disabled={disabled || !user.money} onClick={() => {
                            disabled || rollDice()
                        }}>
							Бросить за <div className="lottery-price flex-center">
                                <div className="shop_item-price-icon"></div>
                                <div className="shop_item-price-number">1</div>
                            </div>
                        </button>
                        : null}
                    <div className="side-menu_info">{user.timeToLottery ? timerStr(user.timeToLottery) : 'Проверь свою удачу'}</div>
                    <ReactDice numDice={2}
                        rollTime={1}
                        ref={diceRef}
                        dotColor={'#272727'}
                        faceColor={'#ffffff'}
                        disableIndividual={true}
                        rollDone={() => setDisabled(false)}
                        disableRandom={true} />
                </div>
            </div>
            <button className="shop_close-btn btn-brown" onClick={props.setIsOpen.bind(this, false)}>закрыть</button>
        </Modal>
    )
}