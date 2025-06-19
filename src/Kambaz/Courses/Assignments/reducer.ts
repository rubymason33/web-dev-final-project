import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

const initialState = {
    assignments: [],
};

const assignmentsSlice = createSlice({
    name: "assignments",
    initialState,
    reducers: {
        setAssignments: (state, action) => {
            state.assignments = action.payload;
        },
        addAssignment: (state, { payload: assignment }) => {
            const newAssignment: any = {
                _id: uuidv4(),
                course: assignment.course,
                title: assignment.title,
                description: assignment.description,
                points: assignment.points,
                modules: assignment.modules,
                assignmentGroup: assignment.assignmentGroup,
                displayGradeAs: assignment.displayGradeAs,
                submissionType: assignment.submissionType,
                onlineEntryOptions: assignment.onlineEntryOptions,
                assignTo: assignment.assignTo,
                dueDate: assignment.dueDate,
                availableFrom: assignment.availableFrom,
                availableUntil: assignment.availableUntil
            };
            state.assignments = [...state.assignments, newAssignment] as any;
        },
        deleteAssignment: (state, { payload: assignmentId }) => {
            state.assignments = state.assignments.filter(
                (a: any) => a._id !== assignmentId
            );
        },
        updateAssignment: (state, { payload: assignment }) => {
            state.assignments = state.assignments.map((a: any) =>
                a._id === assignment._id ? assignment : a
            ) as any;
        },
    },
});

export const { addAssignment, deleteAssignment, updateAssignment, setAssignments } = assignmentsSlice.actions;
export default assignmentsSlice.reducer;
