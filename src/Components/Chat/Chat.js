import React from 'react'

import { connect } from 'react-redux'

import './Chat.css'

class Chat extends React.Component {
    constructor (props){
        super(props)
        this.state = {
            inputText: '',
            blockBtn: false,
            msgsMain: [],
            msgsRoom: [],
            selectedRoom: 'main'
        }

        this.sendMsg = sendMsg.bind(this)
        this.talkTo = talkTo.bind(this)
    }
    componentDidMount () {
        this.props.socket.on('new-msg', newMsg.bind(this))
        this.props.socket.emit('get-common-msgs')
    }
    componentDidUpdate (prevProps) {
        if (prevProps.roomId && !this.props.roomId && this.state.selectedRoom !== 'main') {
            this.setState({ selectedRoom: 'main', msgsRoom: [] })
        }

        if (!prevProps.roomId && this.props.roomId) {
            this.setState({ selectedRoom: 'room' })
        }
    }
    render () {
        return (
            <div className={'chat_container'}>
                <div className="chat_header flex-sb">
                    <div className="flex">
                        <div className="chat_header_name">чат</div>
                        <div className={`pointer margin-lr-5${this.state.selectedRoom !== 'main' ? ' disabled' : ''}`} onClick={() => this.setState({selectedRoom: 'main'})}>общий</div>
                        {this.props.roomId ? <div className="chat_room-game flex">
                            <div className="margin-lr-5">/</div>
                            <div className={`pointer margin-lr-5${this.state.selectedRoom === 'main' ? ' disabled' : ''}`} onClick={() => this.setState({selectedRoom: 'room'})}>стол</div>
                        </div> : null}
                    </div>
                </div>
                <div className="chat_body-container">
                    <div className={`chat-body chat-body-main${this.state.selectedRoom !== 'main' ? ' hidden' : ''}`}>
                        {this.state.msgsMain.map((item, i) => messege({...item, i, talkTo: this.talkTo}))}
                    </div>
                    <div className={`chat-body chat-body-room${this.state.selectedRoom !== 'room' ? ' hidden' : ''}`}>
                        {this.state.msgsRoom.map((item, i) => messege({...item, i, talkTo: this.talkTo}))}
                    </div>
                </div>
                <div className="chat_input-wrapper flex-sb">
                    <input
                        id="chat_input"
                        type="text"
                        className="chat_input"
                        value={this.state.inputText}
                        placeholder="Введите сообщение"
                        onChange={(e) => this.setState({inputText: e.target.value})}
                        onKeyUp={e => e.keyCode === 13 && this.sendMsg()}
                    />
                    <div className={`pointer chat_send-btn${this.state.blockBtn ? ' disabled' : ''}`} onClick={this.sendMsg}></div>
                </div>
            </div>
        )
    }
}

function messege (props) {
    return (
        <div className="chat_messege p-tb-5" key={props.i}>
            <span className="chat_messege_author" onClick={() => {
                props.talkTo(props.player.name)
            }}>{props.player.name}: </span><span className="chat_messege_text">{props.text}</span>
        </div>
    )
}

function sendMsg () {
    if (!this.state.inputText.trim() || this.state.blockBtn) {
        return
    }

    this.props.socket.emit('send-msg', {
        player: {
            id: this.props.user.id,
            name: this.props.user.name
        },
        text: this.state.inputText,
        room: this.state.selectedRoom ==='main' ? 'main' : this.props.roomId
    })

    this.setState({ inputText: '', blockBtn: true })
    setTimeout(() => this.setState({blockBtn: false}), 1000)
}

function newMsg ({ old, room, player, text, vk_id }) {
    if (Array.isArray(old)) {
        if (room === 'main') {
            this.setState({ msgsMain: old })
        }

        if (room === this.props.roomId) {
            this.setState({ msgsRoom: old })
        }
    } else {
        const tmp = this.state[room === 'main' ? 'msgsMain' : 'msgsRoom']

        tmp.unshift({ player, text })
        this.setState({[room === 'main' ? 'msgsMain' : 'msgsRoom']: tmp })
        if (room !== 'main') {
            const event = new Event(`messege-from-${vk_id}`)

            event.text = text
            document.dispatchEvent(event)
        }
    }
}

function talkTo (name) {
    if (~this.state.inputText.indexOf(name + ',')) {
        return
    }

    this.setState({inputText: (name + ', ' + this.state.inputText)})
    document.getElementById('chat_input').focus()
}

const mapStateToProps = (state) => ({
    user: state.user
})

export default connect(mapStateToProps)(Chat)