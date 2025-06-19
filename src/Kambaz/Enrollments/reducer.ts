import { createSlice } from "@reduxjs/toolkit";

// source for info on interfaces
// https://prismic.io/blog/typescript-interfaces
interface Enrollment {
    _id: string;
    user: string;
    course: string;
    role: string;
    section: string;
    lastActivity: string;
    totalActivity: string;
}

interface EnrollmentsState {
    enrollments: Enrollment[];
}

const initialState: EnrollmentsState = {
    enrollments: [],
};

const enrollmentsSlice = createSlice({
    name: "enrollments",
    initialState,
    reducers: {
        setEnrollments: (state, action) => {
            state.enrollments = action.payload;
        },
    },
});

export const { setEnrollments } = enrollmentsSlice.actions;
export default enrollmentsSlice.reducer;
