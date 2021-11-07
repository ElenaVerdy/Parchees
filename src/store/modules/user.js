import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { IS_DEBUG, VK_ACCESS_TOKEN } from '../../constants/constants'

const VK = window.VK

const getRandomNumber = () => {
    const number = Math.random()

    if (number < 0.25) {
        return 1
    }

    if (number < 0.5) {
        return 2
    }

    if (number < 0.75) {
        return 3
    }

    return 4
}

export const fetchUserFromVK = createAsyncThunk(
    'user/fetchUserFromVKStatus',

    async () => {
        return await new Promise((resolve) => {
            if (!IS_DEBUG) {
                VK.init(function () {
                    VK.api('users.get', { access_token: VK_ACCESS_TOKEN, fields: 'photo_50,photo_100' }, (res) => {
                        const data = res && res.response && res.response[0]

                        if (!data) {
                            throw new Error('can not fetch user data')
                        }

                        resolve(data)
                    })
                }, function () {
                    console.log('bad')
                }, '5.103')
            } else {
                resolve({
                    photo_50: 'https://sun9-12.userapi.com/c851016/v851016587/119cab/ai0uN_RKSXc.jpg?ava=1',
                    photo_100: 'https://sun1-92.userapi.com/c848416/v848416727/1ba95e/I05FuH5Kb-o.jpg?ava=1',
                    first_name: 'Lindsey',
                    last_name: 'Stirling',
                    id: `123123123${getRandomNumber()}`
                })
            }
        })
    }
)

export const userSlice = createSlice({
    name: 'user',

    initialState: {
    },

    reducers: {
        setUser (state, { payload }) {
            Object.assign(state, payload)
        },

        decrementLotteryTimer (state) {
            state.timeToLottery = state.timeToLottery - 1
        }
    },

    extraReducers: {
        // Add reducers for additional action types here, and handle loading state as needed
        [fetchUserFromVK.fulfilled]: (state, { payload }) => {
            Object.assign(state, { ...payload, vk_id: payload.id })
        }
    }
})

export const { setUser, decrementLotteryTimer } = userSlice.actions
export default userSlice.reducer