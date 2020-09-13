import React from 'react';
import './Loading.css';

export default class Lobby extends React.Component {
	constructor(props){
		super(props);

		this.state = {};
	}
	render() {
		return(
			<div className='loading_container'>
				<div className='loading_header'>идёт загрузка...</div>
				<div className='loading_field'>
				</div>
			</div>
		)
	}
}