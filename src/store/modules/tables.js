import { createSlice } from '@reduxjs/toolkit'

export const tablesSlice = createSlice({
    name: 'tables',

    initialState: {
        tables: [],
        playersInGame: 0,
        playersInMenu: 0
    },

    reducers: {
        setTables (state, { payload }) {
            Object.assign(state, payload)
        }
    }
})

export const { setTables } = tablesSlice.actions
export default tablesSlice.reducer