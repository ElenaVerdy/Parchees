import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './Components/App/App'

import store from './store/store'
import { Provider } from 'react-redux'
import { SocketContext, socket } from './context/socket'

ReactDOM.render(
    <React.StrictMode>
        <SocketContext.Provider value={socket}>
            <Provider store={store}>
                <App />
            </Provider>
        </SocketContext.Provider>
    </React.StrictMode>,
    document.getElementById('root')
)
