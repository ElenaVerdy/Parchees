import React from 'react'
import Modal from 'react-modal'
import io from 'socket.io-client'
import './App.css'
import './common.css'
import Game from '../Game/Game'
import Loading from '../Loading/Loading'
import Lobby from '../Lobby/Lobby'
import SideMenu from '../SideMenu/SideMenu'
import Chat from '../Chat/Chat'
import GameFinished from '../GameFinished/GameFinished'
import AppHeader from '../AppHeader/AppHeader'
import cloneDeep from 'lodash.clonedeep'

import { connect } from 'react-redux'
import { setUser, decrementLotteryTimer } from '../../store/modules/user'

import {
    IS_DEBUG,
    ENDPOINT,
    VK_ACCESS_TOKEN
} from '../../constants/constants'


const VK = window.VK
const init = function () {
    return new Promise((resolve) => {
        if (!IS_DEBUG) {
            VK.init(function () {
                VK.api('users.get', { access_token: VK_ACCESS_TOKEN, fields: 'photo_50,photo_100' }, (res) => {
                    const data = res && res.response && res.response[0]

                    if (!data) {
                        throw new Error('can not fetch user data')
                    }

                    resolve(data)
                })
            }, function () {
                console.log('bad')
            }, '5.103')
        } else {
            resolve({
                photo_50: 'https://sun9-12.userapi.com/c851016/v851016587/119cab/ai0uN_RKSXc.jpg?ava=1',
                photo_100: 'https://sun1-92.userapi.com/c848416/v848416727/1ba95e/I05FuH5Kb-o.jpg?ava=1',
                first_name: 'Lindsey',
                last_name: 'Stirling',
                id: `123123123${Math.random() > .5 ? 1 : 0}`
            })
        }
    })
}

const socket = io.connect(ENDPOINT)

class App extends React.Component {
    constructor (props) {
        super(props)

        this.state = {
            tables: [],
            playersInGame: 0,
            playersInMenu: 0,
            tableId: null,
            bet: null,
            playersInfo: [],
            playersOrder: [],
            doublesStreak: 0,
            gameOn: false,
            yourTurn: null,
            countDown: null,
            turn: null,
            dice: [],
            activeDice: [],
            disabled: false,
            gameFinishedModal: false,
            gameResults: [],
            moveData: null,
            actionCount: 0,
            canSkip: false,
            loading: true,
            topByRank: [],
            topByChips: [],
            justInstalled: false
        }

        this.doAfterDisable = {}
        this.socket = socket
        this.handleNextTurn = handleNextTurn.bind(this)
        this.diceRolled = diceRolled.bind(this)
        this.endGame = endGame.bind(this)
        this.disable = disable.bind(this)
        this.logAction = logAction.bind(this)
        this.timers = []
    }

    componentDidMount () {
        init().then(userInfo => {
            this.props.setUser(userInfo)

            this.socket.emit('init', { ...userInfo, vk_id: userInfo.id })
        })

        this.socket.on('request-auth', () => {
            if (this.props.user.id) {
                return this.socket.emit('init', this.props.user)
            }
        })

        this.socket.on('init-finished', data => {
            const {
                topByRank,
                topByChips,
                justInstalled,
                ...user
            } = data

            if (!IS_DEBUG) {
                initRatings.call(this, { topByRank, topByChips })
            }

            this.props.setUser({ ...this.props.user, ...user})
            this.setState({ loading: false, justInstalled })

            this.socket.emit('get-lottery-field')
        })

        this.socket.on('update-user-info', data => this.props.setUser({ ...this.props.user, ...data }))
        this.socket.on('connect-to', data => {
            this.setState({ tableId: data.id, bet: data.bet })
        })

        this.socket.on('err', data => this.setState({ error: data.text }))
        this.socket.on('removed', () => {
            toTables.call(this)
            this.setState({ error: 'Вы были удалены из игры за бездействие.' })
        })

        this.socket.on('update-tables', ({ availableTables, playersInMenu, playersInGame }) => {
            this.setState({
                tables: availableTables,
                playersInMenu,
                playersInGame
            })
        })

        this.socket.on('update-players', data => {
            if (this.state.gameOn && !data.players) {
                const playersInfo = cloneDeep(this.state.playersInfo)

                playersInfo[data.playerLeftIndex].left = true

                this.setState({ playersInfo })
            } else if (data.afterWin || (!this.state.gameOn && data.players)) {
                const playersOrder = getPlayersOrder(data.players.length)

                this.setState({
                    playersInfo: data.players,
                    playersOrder,
                    yourTurn: data.players.indexOf(data.players.find(pl => pl.id === this.socket.id))
                })
            }
        })

        this.socket.on('all-players-ready', handleAllPlayersReady.bind(this))
        this.socket.on('game-start', handleGameStart.bind(this))
        this.socket.on('lottery-field', data => this.setState({lotteryField: data.field}))
        this.socket.on('next-turn', data => {
            if (this.state.disabled || data.actionCount !== this.state.actionCount) {
                this.logAction('next-turn', data)
            } else {
                this.handleNextTurn(data)
            }
        })

        this.socket.on('player-won', data => {
            if (data.error) {
                return console.error(data.error)
            }

            if (this.state.disabled || data.actionCount !== this.state.actionCount) {
                this.logAction('player-won', data)
            } else {
                this.endGame(data)
            }
        })

        this.socket.on('dice-rolled', data => {
            if (data.error) {
                return console.error(data.error)
            }

            if (this.state.disabled || data.actionCount !== this.state.actionCount) {
                this.logAction('dice-rolled', data)
            } else {
                this.diceRolled(data)
            }
        })

        this.socket.on('player-made-move', data => {
            if (data.error) {
                return console.error(data.error)
            }

            if (this.state.disabled || data.actionCount !== this.state.actionCount) {
                this.logAction('player-made-move', data)
            } else {
                this.setState({ moveData: data })
            }
        })
    }
    componentDidUpdate (prevProps, prevState) {
        if (prevState.tableId && !this.state.tableId) {
            this.socket.emit('get-tables-request')
        }

        if ((prevState.disabled && !this.state.disabled) || (prevState.actionCount !== this.state.actionCount)) {
            if (!this.doAfterDisable[this.state.actionCount]) {
                return
            }

            const action = this.doAfterDisable[this.state.actionCount]

            delete this.doAfterDisable[this.state.actionCount]
            switch (action.name) {
            case 'next-turn':
                this.handleNextTurn(action.data)
                break

            case 'player-won':
                this.endGame(action.data)
                break

            case 'dice-rolled':
                this.diceRolled(action.data)
                break

            case 'player-made-move':
                this.setState({ moveData: action.data })
                break

            default:
                console.log('check actions out!')
                break
            }
        }

        if (prevState.error !== this.state.error && this.state.error) {
            console.log(this.state.error)
        }

        if (prevProps.user.timeToLottery !== this.props.user.timeToLottery) {
            clearTimeout(this.lotteryTimeout)

            if (this.props.user.timeToLottery) {
                this.lotteryTimeout = setTimeout(() => {
                    this.props.decrementLotteryTimer()
                }, 1000)
            }
        }
    }

    render () {
        return (
            <div id="main-container" className="main-container">
                {this.state.loading ? <div className="loading"><Loading></Loading></div> :
                    <div className="App">
                        <AppHeader
                            tableId={this.state.tableId}
                            toTables={toTables.bind(this)}
                            socket={this.socket}
                            avgRating={avgRating.call(this)}
                            bet={this.state.bet}
                            lotteryField={this.state.lotteryField}
                            topByRank={this.state.topByRank}
                            topByChips={this.state.topByChips}
                            justInstalled={this.state.justInstalled}
                        />
                        <div className="App_main">
                            <div className="App_main-offside">
                                <SideMenu
                                    socket={this.socket}
                                    tableId={this.state.tableId}
                                    gameOn={this.state.gameOn}
                                    countDown={this.state.countDown}
                                    yourTurn={this.state.yourTurn}
                                    turn={this.state.turn}
                                    dice={this.state.dice}
                                    activeDice={this.state.activeDice}
                                    doublesStreak={this.state.doublesStreak}
                                    disable={this.disable}
                                    disabled={this.state.disabled}
                                    diceRolled={() => {
                                        this.setState({actionCount: this.state.actionCount + 1, disabled: false})
                                    }}
                                    canSkip={this.state.canSkip}
                                    showError={error => this.setState({ error })}
                                />
                                <Chat roomId={this.state.tableId} socket={this.socket}></Chat>

                            </div>
                            <div className="App_main-container">
                                {this.state.tableId ?
                                    <Game
                                        tableId={this.state.tableId}
                                        socket={this.socket}
                                        playersInfo={this.state.playersInfo}
                                        playersOrder={this.state.playersOrder}
                                        yourTurn={this.state.yourTurn}
                                        gameOn={this.state.gameOn}
                                        turn={this.state.turn}
                                        dice={this.state.dice}
                                        disable={this.disable}
                                        disabled={this.state.disabled}
                                        setActiveDice={activeDice => {
                                            this.setState({activeDice})
                                        }}
                                        moveMade={() => this.setState({ moveData: null, actionCount: this.state.actionCount + 1 })}
                                        moveData={this.state.moveData}
                                        setCanSkip={(canSkip) => this.setState({ canSkip })}
                                    />
                                    :
                                    <Lobby tables={this.state.tables}
                                        socket={this.socket}
                                        userInfo={this.props.user}
                                        inGame={this.state.playersInGame}
                                        inMenu={this.state.playersInMenu}
                                    />
                                }
                                <div className={`App_game-finished_container${this.state.gameFinishedModal ? ' App_game-finished_container_shown' : ''}`}>
                                    <GameFinished results={this.state.gameResults}
                                        close={() => {
                                            this.setState({gameFinishedModal: false, gameResults: []})
                                        }}
                                        toTables={toTables.bind(this)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>}
                {this.state.error ?
                    <Modal
                        isOpen={!!this.state.error}
                        onRequestClose={() => this.setState({ error: '' })}
                        className="modal app_modal-error"
                        closeTimeoutMS={500}
                        contentLabel="Example Modal">
                        <div className="modal-header">Ой-ой-ой!</div>
                        <div className="app_modal-error_text">{this.state.error}</div>
                        <button className="modal-close-btn btn-brown" onClick={() => this.setState({ error: '' })}>закрыть</button>
                    </Modal> : null}
            </div>
        )
    }
}
function avgRating () {
    return this.state.playersInfo.length ? (this.state.playersInfo.reduce((sum, cur) => sum + cur.rating, 0) / this.state.playersInfo.length ^ 0) : 0
}

function toTables () {
    socket.emit('leave-table', { tableId: this.state.tableId })
    this.doAfterDisable = {}
    this.setState({
        tableId: null,
        bet: null,
        playersInfo: [],
        playersOrder: [],
        doublesStreak: 0,
        gameOn: false,
        yourTurn: null,
        countDown: null,
        turn: null,
        dice: [],
        activeDice: [],
        disabled: false,
        gameFinishedModal: false,
        gameResults: [],
        moveData: null,
        actionCount: 0,
        canSkip: false
    })
}

function diceRolled (data) {
    this.setState({ doublesStreak: data.doublesStreak, dice: data.dice })
}

function logAction (name, data) {
    this.doAfterDisable[data.actionCount] = { name, data }
}

function endGame (data) {
    this.setState({
        gameFinishedModal: true,
        gameOn: false,
        turn: null,
        dice: [],
        disabled: false,
        gameResults: data.results,
        actionCount: this.state.actionCount + 1
    })

    this.doAfterDisable = {}
}

function handleGameStart (data) {
    this.setState({
        gameFinishedModal: false,
        gameOn: true,
        turn: data.turn,
        dice: [],
        playersInfo: data.players,
        gameResults: [],
        actionCount: 1
    })
}

function handleNextTurn (data) {
    this.setState({turn: data.turn, dice: [], actionCount: data.actionCount + 1})
}

function handleAllPlayersReady (data) {
    if (data.cancel) {
        this.timers.map(t => clearTimeout(t))
        this.setState({countDown: null})
    } else {
        for (let i = 5; 0 <= i; i--) {
            this.timers[i] = setTimeout(() => {
                if (this.state.countDown || i === 5) {
                    this.setState({countDown: i})
                }
            }, 5000 - i * 1000)
        }
    }
}

function disable (bool) {
    this.setState({disabled: bool})
}

function getPlayersOrder (num) {
    let playersOrder = []

    switch (num) {

    case 1:
        playersOrder = [1]
        break

    case 2:
        playersOrder = [1, 3]
        break

    case 3:
        playersOrder = [1, 2, 3]
        break

    case 4:
        playersOrder = [1, 2, 3, 4]
        break

    default:
        break
    }

    return playersOrder
}

function initRatings (data) {
    const userIds = data.topByRank.concat(data.topByChips).map(i => i.vk_id).join(',')

    VK.api('users.get', {
        access_token: VK_ACCESS_TOKEN,
        fields: 'photo_50,photo_100',
        user_ids: userIds
    }, (res) => {
        const respData = res && res.response

        const topByRank = data.topByRank.map(item => {
            return { ...respData.find(i => item.vk_id === i.id), ...item }
        })

        const topByChips = data.topByChips.map(item => {
            return { ...respData.find(i => item.vk_id === i.id), ...item }
        })

        this.setState({ topByRank, topByChips })
    })
}


const mapStateToProps = (state) => ({
    user: state.user
})

const mapDispatchToProps = {
    setUser,
    decrementLotteryTimer,
    socketEmit: {
        type: 'socket/'
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)