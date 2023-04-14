import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export const fetchRatingsFromVK = createAsyncThunk(
    'user/fetchRatingsFromVKStatus',

    async ({ byRank, byChips }) => {
        return await new Promise((resolve) => {
            resolve({ topByRank: byRank, topByChips: byChips })
        })
    }
)

export const ratingsSlice = createSlice({
    name: 'ratings',

    initialState: {
        topByRank: [],
        topByChips: []
    },

    extraReducers: {
        [fetchRatingsFromVK.fulfilled] (state, { payload }) {
            state.topByRank = payload.topByRank
            state.topByChips = payload.topByChips
        }
    }
})

export default ratingsSlice.reducer