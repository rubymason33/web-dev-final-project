import axios from "axios";

const axiosWithCredentials = axios.create({ withCredentials: true });
const REMOTE_SERVER = import.meta.env.VITE_REMOTE_SERVER;
const API_BASE = `${REMOTE_SERVER}/api`;

export const startQuizAttempt = async (quizId: string) => {
    const response = await axiosWithCredentials.post(`${API_BASE}/quizzes/${quizId}/attempts`);
    return response.data;
};

export const getAttemptById = async (attemptId: string) => {
    const response = await axiosWithCredentials.get(`${API_BASE}/quiz-attempts/${attemptId}`);
    return response.data;
};

export const saveAnswer = async (attemptId: string, questionId: string, answer: any) => {
    const response = await axiosWithCredentials.put(`${API_BASE}/quiz-attempts/${attemptId}/answer`, {
        questionId,
        answer
    });
    return response.data;
};

export const submitQuizAttempt = async (attemptId: string, answers: any[]) => {
    const response = await axiosWithCredentials.post(`${API_BASE}/quiz-attempts/${attemptId}/submit`, {
        answers
    });
    return response.data;
};

export const getAttemptsForQuiz = async (quizId: string) => {
    const response = await axiosWithCredentials.get(`${API_BASE}/quizzes/${quizId}/attempts`);
    return response.data;
};

export const getLatestAttempt = async (quizId: string) => {
    const response = await axiosWithCredentials.get(`${API_BASE}/quizzes/${quizId}/latest-attempt`);
    return response.data;
};