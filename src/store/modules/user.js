import { createSlice } from '@reduxjs/toolkit'

export const userSlice = createSlice({
    name: 'user',

    initialState: {
    },

    reducers: {
        setUser (state, { payload }) {
            state = Object.assign(state, payload)
        },

        decrementLotteryTimer (state) {
            state.timeToLottery = state.timeToLottery - 1
        }
    }
})

export const { setUser, decrementLotteryTimer } = userSlice.actions
export default userSlice.reducer