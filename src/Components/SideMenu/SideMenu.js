import React from 'react';
import './SideMenu.css';
import ReactDice from "react-dice-complete";
import 'react-dice-complete/dist/react-dice-complete.css'

export default class SideMenu extends React.Component {
	constructor(props) {
        super(props);
        this.dictionary = {
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
            ready: false,
            doublesStreak: 0
		}
	}
	componentDidUpdate(prevProps, prevState) {
        if (prevProps.dice !== this.props.dice && this.props.dice.length) {
            this.props.disable(true);
            this.ReactDice.rollAll(this.props.dice);
        }
        if (prevProps.gameOn && !this.props.gameOn) {
            this.setState({ready: false})
        }
	}
    rollAll () {
        this.ReactDice.rollAll();
    }
  	render() {
        return (
            <div className="side-menu_container">
                {this.props.tableId ?
                    (this.props.gameOn ?
                        <div>
                            {this.props.turn === this.props.yourTurn ? 
                                ( this.props.dice.length && !this.props.doublesStreak ? 
                                    <button disabled={this.props.disabled} onClick={() => {this.props.socket.emit("finish-turn", {tableId: this.props.tableId})}}>{this.dictionary.finish}</button>
                                    : <button disabled={this.props.disabled} onClick={() => {
                                        this.props.socket.emit("roll-dice", {dice:[], tableId: this.props.tableId})
                                    }}>{this.dictionary.throwDice}</button>)
                                : <button disabled className="side-menu_other-players-turn">{this.dictionary.otherPlayersMove}</button>}
                            <div className="side-menu_info">
                                {this.props.turn === this.props.yourTurn ? 
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
                                       rollDone={()=>{setTimeout(() => this.props.disable(false), 200)}} />
                        </div>
                        : <div>
                            {this.state.ready ? 
                            <button onClick={() => {this.props.socket.emit("ready", {tableId: this.props.tableId, socketId: this.props.socket.id, ready: false}); this.setState({ready: false})}}>Не готов!</button>:
                            <button onClick={() => {this.props.socket.emit("ready", {tableId: this.props.tableId, socketId: this.props.socket.id, ready: true}); this.setState({ready: true})}}>Готов!</button>}
                            <div className="side-menu_info">
                                
                                {this.props.countDown === null ? 
                                <span>{this.state.ready ? this.dictionary.waitingForOtherPlayers : this.dictionary.pressReady}</span>  
                                : 
                                <span>{this.dictionary["countDown" + this.props.countDown]}</span>}

                            </div>
                        </div>)
                    : <div>
                        <button onClick={() => {this.props.socket.emit("new-table", this.props.userInfo)}}>Новая игра!</button>
                        <div className="side-menu_info">Создай новый стол или присоединись к существующему!</div>
                    </div>
            }
            </div>
        )
    }
}