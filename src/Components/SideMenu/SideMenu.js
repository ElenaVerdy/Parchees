import React, { useState, useRef, useEffect } from 'react';
import './SideMenu.css';
import GameStart from '../GameStart/GameStart';
import ReactDice from '../ReactDice/ReactDice'
import CheatsBlock from "../CheatsBlock/CheatsBlock";

export default function SideMenu (props) {
    let { socket, tableId, gameOn, dice, disabled, canSkip, doublesStreak, disable } = props;
	const diceRef = useRef(null);
	const dictionary = {
        mainMenu: "Создай новый стол или присоединись к существующему!",
        throwDice: "Бросить кубик",
        otherPlayersMove: "Ход другого игрока",
        makeYourMove: "Ваш ход!",
        throwDiceTip: "Бросайте кубик!",
        waitingForOtherPlayers: "Ждем других игроков",
        pressReady: "Нажми готов",
        countDown1: "Игра начнется через 1 секунду!",
        countDown2: "Игра начнется через 2 секунды!",
        countDown3: "Игра начнется через 3 секунды!",
        countDown4: "Игра начнется через 4 секунды!",
        countDown5: "Игра начнется через 5 секунд!",
        finish: "Зкончить ход",
        double: "Дубль. @/3 "
    }

    const [ready, setReady] = useState(false);

    useEffect(() => {
        let diceElems = document.getElementsByClassName("die-container");
        if (!diceElems.length)
            return;
    
        props.activeDice.forEach((item, i) => {
            if (item && !disabled) 
                diceElems[i].classList.add("die-container_active");
            else 
                diceElems[i].classList.remove("die-container_active");
        });
    }, [ props.activeDice, disabled ]);

    useEffect(() => {
        diceRef && diceRef.current && diceRef.current.rollAll( dice );
    }, [ dice, disable ]); // может объебаться

    useEffect(() => {
        setReady(false)
    }, [ props.gameOn, props.tableId ]);

    let myTurn = props.turn === props.yourTurn;

    return (
        <div className="side-menu_container">
            {tableId ?
                (gameOn ?
                    <div>
                        {myTurn ?
                            (dice.length && !doublesStreak ?
                                <button
                                    className="btn-grey"
                                    disabled={disabled || !canSkip}
                                    onClick={() => { socket.emit("finish-turn", { tableId }); }}
                                >
                                    {dictionary.finish}
                                </button>
                            :
                                <button
                                    className="btn-grey"
                                    disabled={disabled || !canSkip}
                                    onClick={() => { socket.emit("roll-dice", { dice: [], tableId }); }}
                                >
                                    {dictionary.throwDice}
                                </button>
                            )
                        :
                            <button className="btn-grey" disabled>{dictionary.otherPlayersMove}</button>
                        }
                        <div className="side-menu_info">
                            {myTurn ?
                                (dice.length ?
                                    (doublesStreak ? dictionary.double.replace("@", doublesStreak) : "") + dictionary.makeYourMove
                                :
                                    dictionary.throwDiceTip
                                )
                            :
                                ""
                            }
                        </div>
                        <ReactDice
                            ref={diceRef}
                            rollDone={() => props.diceRolled()}
                        />
                        <CheatsBlock
                            userInfo={props.userInfo}
                            socket={socket}
                            tableId={tableId}
                            myTurn={myTurn}
                            canReroll={!!dice.length}
                            disable={props.disable}
                            showError={props.showError}
                            canThrow={!(dice.length && !doublesStreak) && canSkip}
                        />
                    </div>
                    :
                    <div>
                        <ReadyButton
                            clicked={ () => setReady(!ready) }
                            socket={socket}
                            tableId={tableId}
                            ready={ready}
                        />
                        <div className="side-menu_info">
                            {props.countDown === null ?
                                <span>{ready ? dictionary.waitingForOtherPlayers : dictionary.pressReady}</span>  
                            : 
                                <span>{dictionary["countDown" + props.countDown]}</span>
                            }
                        </div>
                    </div>
                )
            : 
                <div>
                    <GameStart socket={socket} userInfo={props.userInfo} />
                    <div className="side-menu_info">{dictionary.mainMenu}</div>
                </div>
            }
        </div>
    )
}

function ReadyButton({ ready, socket, tableId, clicked }) {
    const onClick = () => {
        clicked();
        socket.emit("ready", { tableId, socketId: socket.id, ready: !ready });
    }

    return (
        <button className="btn-grey" onClick={onClick}>{ready ? 'Не готов!' : 'Готов!'}</button>
    )
}