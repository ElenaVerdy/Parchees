import React from 'react';
import './SideMenu.css';
import GameStart from '../GameStart/GameStart';
// import ReactDice from "react-dice-complete";
import ReactDice from '../ReactDice/ReactDice'
import CheatsBlock from "../CheatsBlock/CheatsBlock";

export default class SideMenu extends React.Component {
	constructor(props) {
        super(props);
        this.dictionary = {
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

		this.state = {
            ready: false
		}
	}
	componentDidUpdate(prevProps, prevState) {
        if (prevProps.dice !== this.props.dice && this.props.dice.length) {
            this.props.disable(true);
            this.ReactDice.rollAll(this.props.dice);
        }
        if (prevProps.activeDice !== this.props.activeDice) {
            let diceElems = document.getElementsByClassName("die-container");
            if (!diceElems.length)
                return;
        
            this.props.activeDice.forEach((item, i) => {
            if (item && !this.props.disabled) 
                diceElems[i].classList.add("die-container_active");
            else 
                diceElems[i].classList.remove("die-container_active");
            });
        }
        if ((prevProps.gameOn && !this.props.gameOn) || (prevProps.tableId !== this.props.tableId)) {
            this.setState({ready: false});
        }
	}
  	render() {
        let myTurn = this.props.turn === this.props.yourTurn;
        return (
            <div className="side-menu_container">
                {this.props.tableId ?
                    (this.props.gameOn ?
                        <div>
                            {myTurn ?
                                (this.props.dice.length && !this.props.doublesStreak ?
                                    <button className="btn-grey" disabled={this.props.disabled || !this.props.canSkip}
                                            onClick={() => { this.props.disabled || !this.props.canSkip || this.props.socket.emit("finish-turn", {tableId: this.props.tableId}); }}>
                                        {this.dictionary.finish}
                                    </button>
                                    : <button className="btn-grey" disabled={this.props.disabled || !this.props.canSkip} onClick={() => {
                                        if (this.props.disabled) return;
                                        this.props.socket.emit("roll-dice", {dice:[], tableId: this.props.tableId})
                                    }}>{this.dictionary.throwDice}</button>)
                                : <button className="btn-grey" disabled>{this.dictionary.otherPlayersMove}</button>}
                            <div className="side-menu_info">
                                {myTurn ? 
                                (this.props.dice.length ? 
                                    (this.props.doublesStreak ? 
                                        this.dictionary.double.replace("@", this.props.doublesStreak) : "") + this.dictionary.makeYourMove 
                                        : this.dictionary.throwDiceTip)
                                : ""
                            }
                            </div>
                            <ReactDice numDice={2}
                                       rollTime={1}
                                       ref={dice => this.ReactDice = dice}
                                       dotColor={"#272727"}
                                       faceColor={"#ffffff"}
                                       disableIndividual={true}
                                       rollDone={() => this.props.diceRolled()}
                                       disableRandom={true} />
                            <CheatsBlock userInfo={this.props.userInfo}
                                         socket={this.props.socket}
                                         tableId={this.props.tableId}
                                         myTurn={myTurn}
                                         canReroll={!!this.props.dice.length}
                                         disable={this.props.disable}
                                         showError={this.props.showError}
                                         canThrow={!(this.props.dice.length && !this.props.doublesStreak) && this.props.canSkip}
                            />
                        </div>
                        : <div>
                            {this.state.ready ? 
                            <button className="btn-grey" onClick={() => {this.props.socket.emit("ready", {tableId: this.props.tableId, socketId: this.props.socket.id, ready: false}); this.setState({ready: false})}}>Не готов!</button>:
                            <button className="btn-grey" onClick={() => {this.props.socket.emit("ready", {tableId: this.props.tableId, socketId: this.props.socket.id, ready: true}); this.setState({ready: true})}}>Готов!</button>}
                            <div className="side-menu_info">
                                {this.props.countDown === null ? 
                                <span>{this.state.ready ? this.dictionary.waitingForOtherPlayers : this.dictionary.pressReady}</span>  
                                : 
                                <span>{this.dictionary["countDown" + this.props.countDown]}</span>}
                            </div>
                        </div>)
                    : <div>
                        <GameStart startGame={(bet) => {this.props.socket.emit("new-table", { ...this.props.userInfo, bet })}} userInfo={this.props.userInfo} ></GameStart>
                        <div className="side-menu_info">{this.dictionary.mainMenu}</div>
                    </div>
            }
            </div>
        )
    }
}
