import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentUser: null,
};
const accountSlice = createSlice({
    name: "account",
    initialState,
    reducers: {
        setCurrentUser: (state, action) => {
            state.currentUser = action.payload;
        },
        logout: (state) => {
            state.currentUser = null;
        },
    },
});

export const { setCurrentUser, logout } = accountSlice.actions;
export default accountSlice.reducer;

