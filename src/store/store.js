import { configureStore } from '@reduxjs/toolkit'
import user from './modules/user'
import tables from './modules/tables'
import thunk from 'redux-thunk';

export default configureStore({
    reducer: {
        user,
        tables
    },

    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(thunk)
})