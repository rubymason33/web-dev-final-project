import { useParams, useNavigate } from "react-router-dom";
import { Button, Alert } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import * as quizzesClient from "./client";
import * as questionsClient from "./Questions/client";
import * as attemptsClient from "./Attempts/client";

type Question = {
    _id: string;
    title: string;
    points: number;
    questionType: "Multiple Choice" | "True/False" | "Fill in the Blank";
    questionText: string;
    choices: { text: string; isCorrect: boolean }[];
    correctAnswer?: boolean;
    possibleAnswers?: string[];
    caseSensitive?: boolean;
};

type AttemptAnswer = {
    question: string;
    answer: any;
    isCorrect: boolean;
    pointsEarned: number;
};

type Attempt = {
    _id: string;
    student: string;
    quiz: string;
    startedAt: string;
    completedAt: string;
    score: number;
    totalPoints: number;
    answers: AttemptAnswer[];
    attemptNumber: number;
};

export default function QuizScoreView() {
    const { cid, qid } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useSelector((state: any) => state.accountReducer);
    const quizzesInStore = useSelector((state: any) => state.quizzesReducer.quizzes);
    const isStudent = currentUser?.role === "STUDENT";
    
    const [quiz, setQuiz] = useState<any>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [attempt, setAttempt] = useState<Attempt | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isStudent) {
            navigate(`/Kambaz/Courses/${cid}/Quizzes`);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Get quiz data
                const foundQuiz = quizzesInStore.find((q: any) => q._id === qid);
                let quizData;
                if (foundQuiz) {
                    quizData = foundQuiz;
                    setQuiz(foundQuiz);
                } else {
                    quizData = await quizzesClient.findQuizById(qid as string);
                    setQuiz(quizData);
                }

                // Get questions
                const questionsData = await questionsClient.getQuestionsForQuiz(qid as string);
                setQuestions(questionsData);

                // Get latest attempt
                const latestAttempt = await attemptsClient.getLatestAttempt(qid as string);
                if (!latestAttempt) {
                    setError("No attempts found for this quiz");
                    return;
                }

                // Check if attempt is completed
                if (!latestAttempt.completedAt) {
                    setError(`Attempt found but not completed.`);
                    return;
                }
                
                setAttempt(latestAttempt);

            } catch (error: any) {
                console.error("Error fetching score data:", error);
                if (error.response?.status === 404) {
                    setError("No completed attempts found for this quiz");
                } else {
                    setError(`Failed to load quiz data: ${error.message}`);
                }
            } finally {
                setLoading(false);
            }
        };

        if (qid) {
            fetchData();
        }
    }, [qid, quizzesInStore, isStudent, navigate, cid]);

    const renderQuestion = (question: Question, index: number) => {
        if (!attempt) return null;

        const attemptAnswer = attempt.answers.find(a => a.question === question._id);
        const userAnswer = attemptAnswer?.answer;
        const isCorrect = attemptAnswer?.isCorrect;
        const pointsEarned = attemptAnswer?.pointsEarned || 0;
        const showCorrectAnswers = quiz?.showCorrectAnswers !== "Never";

        return (
            <div key={question._id} className="border rounded mb-4 border-secondary">
                {/* Question Header */}
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light">
                    <div className="d-flex align-items-center">
                        <h5 className="mb-0 fw-bold">Question {index + 1}</h5>
                        {showCorrectAnswers && (
                            <span className={`ms-2 ${isCorrect ? 'text-success' : 'text-danger'}`}>
                                {isCorrect ? '✓' : '✗'}
                            </span>
                        )}
                    </div>
                    <span className="fw-bold fs-5">
                        {showCorrectAnswers ? `${pointsEarned}/${question.points}` : question.points} pts
                    </span>
                </div>

                {/* Question Content */}
                <div className="p-4">
                    <div className="mb-3" dangerouslySetInnerHTML={{ __html: question.questionText }} />

                    {question.questionType === "Multiple Choice" && (
                        <div>
                            {question.choices.map((choice, choiceIndex) => {
                                const isSelected = userAnswer === choice.text;
                                const isCorrectChoice = choice.isCorrect;
                                
                                return (
                                    <div key={choiceIndex} className="mb-2 d-flex align-items-center">
                                        <div className={`form-check ${isSelected ? 'fw-bold' : ''}`}>
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                checked={isSelected}
                                                disabled
                                                readOnly
                                            />
                                            <label className={`form-check-label ${
                                                showCorrectAnswers && isSelected && !isCorrect ? 'text-danger' : 
                                                showCorrectAnswers && isSelected && isCorrect ? 'text-success' : ''
                                            }`}>
                                                {choice.text}
                                            </label>
                                        </div>
                                        {isCorrectChoice && showCorrectAnswers && (
                                            <span className="ms-2 text-success fw-bold">✓</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {question.questionType === "True/False" && (
                        <div>
                            {[true, false].map((option) => {
                                const isSelected = userAnswer === option;
                                const isCorrectChoice = option === question.correctAnswer;
                                
                                return (
                                    <div key={option.toString()} className="mb-2 d-flex align-items-center">
                                        <div className={`form-check ${isSelected ? 'fw-bold' : ''}`}>
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                checked={isSelected}
                                                disabled
                                                readOnly
                                            />
                                            <label className={`form-check-label ${
                                                showCorrectAnswers && isSelected && !isCorrect ? 'text-danger' : 
                                                showCorrectAnswers && isSelected && isCorrect ? 'text-success' : ''
                                            }`}>
                                                {option ? "True" : "False"}
                                            </label>
                                        </div>
                                        {isCorrectChoice && showCorrectAnswers && (
                                            <span className="ms-2 text-success fw-bold">✓</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {question.questionType === "Fill in the Blank" && (
                        <div>
                            <input
                                type="text"
                                className={`form-control ${
                                    showCorrectAnswers && isCorrect ? 'border-success' : 
                                    showCorrectAnswers && !isCorrect ? 'border-danger' : ''
                                }`}
                                value={userAnswer || ""}
                                disabled
                                readOnly
                                style={{ 
                                    backgroundColor: showCorrectAnswers && isCorrect ? '#d4edda' : 
                                                    showCorrectAnswers && !isCorrect ? '#f8d7da' : '#f8f9fa'
                                }}
                            />
                            {showCorrectAnswers && !isCorrect && question.possibleAnswers && (
                                <div className="mt-2 text-success">
                                    <span className="fw-bold">
                                        Answer{question.possibleAnswers.length > 1 ? 's' : ''}: 
                                    </span>
                                    <span className="ms-1">{question.possibleAnswers.join(', ')}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return <div className="p-4">Loading quiz results...</div>;
    }

    if (error) {
        return (
            <div className="container-fluid p-4">
                <Alert variant="danger">{error}</Alert>
                <Button 
                    variant="primary"
                    onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes`)}
                >
                    Back to Quizzes
                </Button>
            </div>
        );
    }

    if (!quiz || !questions.length || !attempt) {
        return <div className="p-4">No data available</div>;
    }

    const percentage = Math.round((attempt.score / attempt.totalPoints) * 100);

    return (
        <div className="container-fluid p-4">
            {/* Header */}
            <div className="mb-4">
                <h1 className="mb-2">{quiz.title} - Results</h1>
                <p className="text-muted mb-0">
                    Completed: {new Date(attempt.completedAt).toLocaleDateString()} at {new Date(attempt.completedAt).toLocaleTimeString()}
                </p>
            </div>

            {/* Score Summary */}
            <div className="text-start mb-4 p-4 border rounded bg-light">
                <h3 className="fw-bold">Quiz Results</h3>
                <div className="mb-3">
                <h4>Score: {attempt.score} / {attempt.totalPoints} ({percentage}%)</h4>
             </div>
            </div>

            {/* Questions and Answers */}
            <div className="mb-4">
                <h3 className="mb-3">Your Answers</h3>
                {questions.map((question, index) => renderQuestion(question, index))}
            </div>

            {/* Back Button */}
            <div className="text-center">
                <Button 
                    variant="secondary"
                    onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes`)}
                >
                    Back to Quizzes
                </Button>
            </div>
        </div>
    );
}