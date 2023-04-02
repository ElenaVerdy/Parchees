import './CheatsBlock.css'

import React, { useEffect, useState } from 'react'

import Modal from 'react-modal'
import ReactTooltip from 'react-tooltip'
import { cheats } from '../../metadata.json'
import { useSelector } from 'react-redux'

export default function CheatsBlock (props) {
    const user = useSelector(state => state.user)

    const [toBuyIndex, setToBuyIndex] = useState(0)
    const [wantToBuy, setWantToBuy] = useState(false)
    const [luckOn, setluckOn] = useState(false)

    const chooseCheat = (index) => {
        const ch = cheats[index]

        if (!validateCheat(ch)) {
            return
        }

        setToBuyIndex(index)
        setWantToBuy(!user[ch.id])
        if (user[ch.id]) {
            usedItem(ch, false)
        }
    }

    useEffect(() => {
        if (!props.myTurn && luckOn) {
            setluckOn(false)
        }
    }, [props.myTurn, luckOn])

    const usedItem = (cheat, buy) => {
        if (buy && user.money < cheat.price) {
            props.showError('Недостаточно монеток!')
            setWantToBuy(false)

            return
        }

        if (cheat.id === 'luck') {
            setluckOn(true)
            props.useItem({ tableId: props.tableId, cheatId: cheat.id, buy })
        } else if (['skip', 'reroll'].includes(cheat.id)) {
            props.useItem({ tableId: props.tableId, cheatId: cheat.id, buy })
        } else if (['shield', 'flight', 'free_shortcuts', 'no_shortcuts', 'cat'].includes(cheat.id)) {
            userChoosesChip()
                .then(id => {
                    if (!id) {
                        return
                    }

                    const player = +id[16]
                    const num = +id[21]

                    if (!player || !num) {
                        return
                    }

                    if (!validateChipCheat()) {
                        return
                    }

                    props.useItem({ tableId: props.tableId, cheatId: cheat.id, buy, player, num })
                })
        } else {
            throw new Error('wrong cheat.id')
        }

        setWantToBuy(false)
    }

    const userChoosesChip = () => {
        let click

        document.dispatchEvent(new Event('drop-selected-chip'))

        return new Promise((resolve, reject) => {
            Array.from(document.getElementsByClassName('game_chip')).forEach(elem => elem.classList.add('game-cheat_chip-to-select'))
            click = event => {
                const target = event.target

                if (target.classList.contains('game_chip')) {
                    resolve(target.id)
                } else if (target.classList.contains('game_chip-cheat')) {
                    resolve(target.parentElement.id)
                } else {
                    reject()
                }
            }

            document.addEventListener('click', click)
            props.disable(true)
        })
            .catch(() => {})
            .finally(() => {
                Array.from(document.getElementsByClassName('game_chip')).forEach(elem => elem.classList.remove('game-cheat_chip-to-select'))
                document.removeEventListener('click', click)
                props.disable(false)
            })
    }

    const validateCheat = (cheat) => {
        let err = ''

        err || (!props.myTurn && (err = 'Читы можно использовать только в свой ход!'))
        err || ((cheat.id === 'luck' && luckOn) && (err = 'Чит уже активирован'))
        err || ((cheat.id === 'luck' && !luckOn && !props.canThrow) && (err = 'Вы не можете бросить кубик. Нет смысла тратить чит.'))
        err || ((cheat.id === 'skip' && props.canThrow) && (err = 'Сначала бросьте кубик.'))

        return err ? props.showError(err) : true
    }

    const validateChipCheat = () => {
        let err = ''

        err || (!props.myTurn && (err = 'Ваш ход уже закончился'))

        return err ? props.showError(err) : true
    }

    return (
        <div className="cheat-block_wrapper">
            {cheats.map((i, index) => (
                <div key={i.id} className={`cheat-block pointer${i.id === 'luck' && luckOn ? ' cheat-block_active' : ''}`} data-tip data-for={`cheat-block_tooltip-${i.id}`} onClick={chooseCheat.bind(null, index)}>
                    <ReactTooltip id={`cheat-block_tooltip-${i.id}`} className={'cheat-block_tooltip'} place="bottom" effect="solid" arrowColor="white">
                        <div>
                            <div className="cheat-block_tooltip-title">
                                {i.title}
                            </div>
                            {user[i.id] ? <div className="cheat-block_tooltip-qty">{`У вас есть: ${user[i.id]}`}</div> : null}
                            <div className="cheat-block_tooltip-description">
                                {i.description}
                            </div>
                            <div className="cheat-block_tooltip-price flex-center">
                                <div className="chear-block_tooltip-price-icon"></div>
                                <div className="chear-block_tooltip-price-number">{i.price}</div>
                            </div>
                        </div>
                    </ReactTooltip>
                    {user[i.id] ? <div className="cheat-block_qty">
                        {user[i.id]}
                    </div> : null}
                    <div className={`cheat-block_icon ${i.iconClass}`}>
                    </div>
                </div>
            ))}
            <Modal
                isOpen={wantToBuy}
                onRequestClose={() => setWantToBuy(false)}
                className="modal cheat-block-buy-modal"
                closeTimeoutMS={500}
                contentLabel="Example Modal">
                <div className="modal-header">покупка</div>
                <div className="app_modal-error_text">
                    <span>{'Купить и использовать '}</span><b>{ cheats[toBuyIndex].title }</b><span>{' за '}</span>
                    <span className={`cheat-block_modal-${cheats[toBuyIndex].currency}`}>{cheats[toBuyIndex].price}</span>
                </div>
                <div className="flex-center">
                    <button className="cheat-block_buy-modal_btn bg-green" onClick={() => usedItem(cheats[toBuyIndex], true)}>ок</button>
                    <button className="cheat-block_buy-modal_btn btn-brown" onClick={setWantToBuy.bind(null, false)}>закрыть</button>
                </div>
            </Modal>
        </div>
    )
}
