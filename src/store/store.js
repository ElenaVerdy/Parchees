import { configureStore } from '@reduxjs/toolkit'
import user from './modules/user'
import tables from './modules/tables'
import ratings from './modules/ratings'
import thunk from 'redux-thunk'

export default configureStore({
    reducer: {
        user,
        tables,
        ratings
    },

    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(thunk)
})