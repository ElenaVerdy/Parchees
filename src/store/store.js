import { configureStore } from '@reduxjs/toolkit'
import user from './modules/user'
import tables from './modules/tables'

export default configureStore({
    reducer: {
        user,
        tables
    }
})