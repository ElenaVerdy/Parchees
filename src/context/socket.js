
import React from 'react'
import io from 'socket.io-client'
import { ENDPOINT } from '../constants/constants'

export const socket = io.connect(ENDPOINT)
export const SocketContext = React.createContext()