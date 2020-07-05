import React from 'react';
import './CountDown.css';

export default class CountDown extends React.Component {
  constructor(props){
	super(props)
	this.givenTime = 30;
    this.state = {
      	time: 0
	}
		this.resetTimer = this.resetTimer.bind(this)
		this.tick = this.tick.bind(this);
	}
	componentDidUpdate(prevProps) {
		if (!prevProps.disabled && this.props.disabled) {
			clearTimeout(this.timer);
		}
		if (prevProps.disabled && !this.props.disabled) {
			this.timer = setTimeout(this.tick, 1000);
		}
		if (prevProps.dice !== this.props.dice) {
			if (this.props.dice[0] && this.props.dice[1]) {
				this.resetTimer()
			}
		}

	}
	componentDidMount() {
		this.restart(15);
	}
	componentWillUnmount() {
		clearTimeout(this.timer);
	}
  	restart(seconds) {
	    this.setState({
			time: seconds || this.givenTime
		})
    	this.timer = setTimeout(this.tick, 1000);
  	}
  	resetTimer() {
    	this.setState({time: this.givenTime})
	}
	tick() {
		this.setState({time: (this.state.time === 0 ? 0: this.state.time - 1)});
		this.timer = setTimeout(this.tick, 1000);
	
		if (!this.state.time && this.props.myTimer) {
			this.props.timedOut();
		}
	}
  render() {
    return(
      <div className={`countdown countdown_player${this.props.playerNum}`}>
        <div className="countdown_timer-icon" /><div className="countdown_timer">{"00:" + ("0" + this.state.time).slice(-2)}</div>
      </div>
    )
  }
}