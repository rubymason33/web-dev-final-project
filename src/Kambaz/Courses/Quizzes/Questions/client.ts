import axios from "axios";
const axiosWithCredentials = axios.create({ withCredentials: true });
const REMOTE_SERVER = import.meta.env.VITE_REMOTE_SERVER;
const API_BASE = `${REMOTE_SERVER}/api`;

export const getQuestionsForQuiz = async (quizId: string) =>
    axiosWithCredentials.get(`${API_BASE}/quizzes/${quizId}/questions`).then(res => res.data);

export const createQuestion = async (quizId: string, question: any) =>
    axiosWithCredentials.post(`${API_BASE}/quizzes/${quizId}/questions`, question).then(res => res.data);

export const updateQuestion = async (questionId: string, updates: any) =>
    axiosWithCredentials.put(`${API_BASE}/questions/${questionId}`, updates).then(res => res.data);

export const deleteQuestion = async (questionId: string) =>
    axiosWithCredentials.delete(`${API_BASE}/questions/${questionId}`).then(res => res.data);
