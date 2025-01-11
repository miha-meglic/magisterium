export const state = () => ({
    counter: 0
})

export const getters = {
    getCounter(state: { counter: any }) {
        return state.counter
    }
}

export const mutations = {
    increment(state: { counter: number }) {
        state.counter++
    }
}

export const actions = {
    async fetchCounter(state: {counter: any}) {
        // make request
        const res = { data: 10 };
        state.counter = res.data;
        return res.data;
    }
}
