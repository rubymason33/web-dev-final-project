import axios from "axios";

const axiosWithCredentials = axios.create({ withCredentials: true });
const REMOTE_SERVER = import.meta.env.VITE_REMOTE_SERVER;
const API_BASE = `${REMOTE_SERVER}/api`;

export const getQuestionsForQuiz = async (quizId: string) => {
    const res = await axiosWithCredentials.get(`${API_BASE}/quizzes/${quizId}/questions`);
    return res.data;
};

export const createQuestion = async (quizId: string, question: any) => {
    const res = await axiosWithCredentials.post(`${API_BASE}/quizzes/${quizId}/questions`, question);
    return res.data;
};

export const updateQuestion = async (questionId: string, updates: any) => {
    const res = await axiosWithCredentials.put(`${API_BASE}/questions/${questionId}`, updates);
    return res.data;
};

export const deleteQuestion = async (questionId: string) => {
    const res = await axiosWithCredentials.delete(`${API_BASE}/questions/${questionId}`);
    return res.data;
};

export const getQuestionById = async (questionId: string) => {
    const res = await axiosWithCredentials.get(`${API_BASE}/questions/${questionId}`);
    return res.data;
};
