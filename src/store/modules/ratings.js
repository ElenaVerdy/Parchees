import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { IS_DEBUG, VK_ACCESS_TOKEN } from '../../constants/constants'
const VK = window.VK


export const fetchRatingsFromVK = createAsyncThunk(
    'user/fetchRatingsFromVKStatus',

    async ({ byRank, byChips }) => {
        return await new Promise((resolve) => {
            if (!IS_DEBUG) {
                const userIds = byRank.concat(byChips).map(i => i.vk_id).join(',')

                VK.api('users.get', {
                    access_token: VK_ACCESS_TOKEN,
                    fields: 'photo_50,photo_100',
                    user_ids: userIds
                }, (res) => {
                    const respData = res && res.response

                    const topByRank = byRank.map(item => {
                        return { ...respData.find(i => item.vk_id === i.id), ...item }
                    })

                    const topByChips = byChips.map(item => {
                        return { ...respData.find(i => item.vk_id === i.id), ...item }
                    })

                    resolve({ topByRank, topByChips })
                })
            } else {
                resolve({ topByRank: byRank, topByChips: byChips })
            }
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