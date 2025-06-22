import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button, Form, Alert, Modal } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import * as quizzesClient from "./client";
import * as questionsClient from "./Questions/client";
import * as attemptsClient from "./Attempts/client";
import { FaPencil } from "react-icons/fa6";
import { AiOutlineExclamationCircle } from "react-icons/ai";

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

export default function QuizTaker() {
    const { cid, qid } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useSelector((state: any) => state.accountReducer);
    const quizzesInStore = useSelector((state: any) => state.quizzesReducer.quizzes);
    const isFaculty = currentUser?.role === "FACULTY";
    const isPreview = location.pathname.includes('/preview');
    const isStudent = currentUser?.role === "STUDENT";
    
    const [quiz, setQuiz] = useState<any>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<{ [key: string]: any }>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);
    const [gradedAnswers, setGradedAnswers] = useState<{ [key: string]: { isCorrect: boolean; pointsEarned: number } }>({});
    const [startTime] = useState(new Date());
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [accessCodeInput, setAccessCodeInput] = useState("");
    const [accessCodeRequired, setAccessCodeRequired] = useState(false);
    const [accessCodeVerified, setAccessCodeVerified] = useState(false);
    const [attemptId, setAttemptId] = useState<string | null>(null);

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const isFirstQuestion = currentQuestionIndex === 0;

    const goToNextQuestion = () => {
        if (!isLastQuestion) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const goToPreviousQuestion = () => {
        if (!isFirstQuestion) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const goToQuestion = (index: number) => {
        setCurrentQuestionIndex(index);
    };

    useEffect(() => {
        if (isPreview && !isFaculty) {
            navigate(`/Kambaz/Courses/${cid}/Quizzes`);
        }
        if (!isPreview && !isStudent) {
            navigate(`/Kambaz/Courses/${cid}/Quizzes`);
        }
    }, [isPreview, isFaculty, isStudent, navigate, cid]);

    // Fetch quiz and questions
    useEffect(() => {
        const fetchQuizData = async () => {
            try {
                const foundQuiz = quizzesInStore.find((q: any) => q._id === qid);
                
                let quizData;
                if (foundQuiz) {
                    quizData = foundQuiz;
                    setQuiz(foundQuiz);
                    console.log("Found quiz in store:", foundQuiz);
                } else {
                    console.log("Quiz not in store, fetching from API...");
                    quizData = await quizzesClient.findQuizById(qid as string);
                    setQuiz(quizData);
                    console.log("Fetched quiz from API:", quizData);
                }
                
                console.log("Fetching questions for quiz:", qid);
                const questionsData = await questionsClient.getQuestionsForQuiz(qid as string);
                setQuestions(questionsData);
                console.log("Fetched questions:", questionsData);
                
                const total = questionsData.reduce((sum: number, q: Question) => sum + q.points, 0);
                setTotalPoints(total);
                
                if (quizData && quizData.accessCode && !isPreview) {
                    setAccessCodeRequired(true);
                } else if (!isPreview && isStudent && quizData) {
                    // Access code not required, proceed normally
                }
            } catch (error) {
                console.error("Error fetching quiz data:", error);
                // If there's an error fetching data, redirect back to quizzes
                navigate(`/Kambaz/Courses/${cid}/Quizzes`);
            }
        };

        if (qid && quizzesInStore) {
            fetchQuizData();
        }
    }, [qid, quizzesInStore, isPreview, isStudent, navigate, cid]);

    const verifyAccessCode = () => {
        if (accessCodeInput === quiz.accessCode) {
            setAccessCodeVerified(true);
            setAccessCodeRequired(false);
        } else {
            alert("Incorrect access code. Please try again.");
        }
    };

    useEffect(() => {
        const startInitialAttempt = async () => {
            if (!isPreview && isStudent && quiz && !quiz.accessCode && !attemptId) {
                try {
                    const attempt = await attemptsClient.startQuizAttempt(qid as string);
                    setAttemptId(attempt._id);
                } catch (error) {
                    console.error("Error starting quiz attempt:", error);
                    // If we can't start the attempt, redirect back
                    navigate(`/Kambaz/Courses/${cid}/Quizzes`);
                }
            }
        };

        if (quiz && !accessCodeRequired) {
            startInitialAttempt();
        }
    }, [quiz, isPreview, isStudent, qid, accessCodeRequired, attemptId, navigate, cid]);

    useEffect(() => {
        const startAttempt = async () => {
            if (!isPreview && isStudent && quiz && accessCodeVerified) {
                try {
                    const attempt = await attemptsClient.startQuizAttempt(qid as string);
                    setAttemptId(attempt._id);
                } catch (error) {
                    console.error("Error starting quiz attempt:", error);
                    // If we can't start the attempt, redirect back
                    navigate(`/Kambaz/Courses/${cid}/Quizzes`);
                }
            }
        };

        if (accessCodeVerified) {
            startAttempt();
        }
    }, [accessCodeVerified, isPreview, isStudent, quiz, qid, navigate, cid]);

    const handleAnswerChange = (questionId: string, answer: any) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));

        if (!isPreview && attemptId) {
            attemptsClient.saveAnswer(attemptId, questionId, answer).catch(error => {
                console.error("Auto-save failed:", error);
            });
        }
    };

    const gradeQuiz = () => {
        let totalScore = 0;
        const graded: { [key: string]: { isCorrect: boolean; pointsEarned: number } } = {};

        questions.forEach(question => {
            const userAnswer = answers[question._id];
            let isCorrect = false;
            let pointsEarned = 0;

            switch (question.questionType) {
                case "Multiple Choice": {
                    const correctChoice = question.choices.find(choice => choice.isCorrect);
                    isCorrect = !!correctChoice && userAnswer === correctChoice?.text;
                    break;
                }
                    
                case "True/False":
                    isCorrect = userAnswer === question.correctAnswer;
                    break;
                    
                case "Fill in the Blank":
                    if (userAnswer && question.possibleAnswers) {
                        const studentAnswer = question.caseSensitive ? userAnswer : userAnswer.toLowerCase();
                        const possibleAnswers = question.caseSensitive 
                            ? question.possibleAnswers 
                            : question.possibleAnswers.map(a => a.toLowerCase());
                        isCorrect = possibleAnswers.includes(studentAnswer);
                    }
                    break;
            }

            if (isCorrect) {
                pointsEarned = question.points;
                totalScore += pointsEarned;
            }

            graded[question._id] = { isCorrect, pointsEarned };
        });

        setScore(totalScore);
        setGradedAnswers(graded);
        setSubmitted(true);
    };

    const submitQuiz = async () => {
        if (isPreview) {
            gradeQuiz();
        } else {
            try {
                const answersArray = Object.keys(answers).map(questionId => ({
                    question: questionId,
                    answer: answers[questionId]
                }));

                await attemptsClient.submitQuizAttempt(attemptId as string, answersArray);
                navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/score`);
                
            } catch (error) {
                console.error("Error submitting quiz:", error);
                alert("Error submitting quiz. Please try again.");
            }
        }
    };

    const renderCurrentQuestion = () => {
        if (!currentQuestion) return null;

        const userAnswer = answers[currentQuestion._id];
        const questionNumber = currentQuestionIndex + 1;

        return (
            <div className="border rounded mb-4 border-secondary">
                {/* Question Header */}
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light">
                    <div className="d-flex align-items-center">
                        <h5 className="mb-0 fw-bold">Question {questionNumber}</h5>
                    </div>
                    <span className="fw-bold fs-5">{currentQuestion.points} pts</span>
                </div>

                {/* Question Content */}
                <div className="p-4">
                    <div className="mb-3" dangerouslySetInnerHTML={{ __html: currentQuestion.questionText }} />

                    {currentQuestion.questionType === "Multiple Choice" && (
                        <div>
                            {currentQuestion.choices.map((choice, choiceIndex) => {
                                const isSelected = userAnswer === choice.text;
                                
                                return (
                                    <div key={choiceIndex} className="mb-2">
                                        <Form.Check
                                            type="radio"
                                            name={`question-${currentQuestion._id}`}
                                            label={choice.text}
                                            checked={isSelected}
                                            onChange={() => !submitted && handleAnswerChange(currentQuestion._id, choice.text)}
                                            disabled={submitted}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {currentQuestion.questionType === "True/False" && (
                        <div>
                            {[true, false].map((option) => {
                                const isSelected = userAnswer === option;
                                
                                return (
                                    <div key={option.toString()} className="mb-2">
                                        <Form.Check
                                            type="radio"
                                            name={`question-${currentQuestion._id}`}
                                            label={option ? "True" : "False"}
                                            checked={isSelected}
                                            onChange={() => !submitted && handleAnswerChange(currentQuestion._id, option)}
                                            disabled={submitted}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {currentQuestion.questionType === "Fill in the Blank" && (
                        <div>
                            <Form.Control
                                type="text"
                                placeholder="Enter your answer"
                                value={userAnswer || ""}
                                onChange={(e) => !submitted && handleAnswerChange(currentQuestion._id, e.target.value)}
                                disabled={submitted}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (!quiz || !questions.length) {
        return <div className="p-4">Loading quiz...</div>;
    }

    if (accessCodeRequired && !accessCodeVerified) {
        return (
            <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                <div className="card p-4" style={{ maxWidth: '400px', width: '100%' }}>
                    <h3 className="text-center mb-4">{quiz.title}</h3>
                    <p className="text-center text-muted mb-4">This quiz requires an access code</p>
                    <Form.Group className="mb-3">
                        <Form.Label>Access Code</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter access code"
                            value={accessCodeInput}
                            onChange={(e) => setAccessCodeInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && verifyAccessCode()}
                        />
                    </Form.Group>
                    <div className="d-flex gap-2">
                        <Button variant="secondary" onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes`)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={verifyAccessCode} className="flex-grow-1">
                            Submit
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid p-4">
            {/* Header */}
            {isPreview && (
                <Alert variant="danger" className="mb-4 d-flex align-items-center">
                    <span className="me-2"><AiOutlineExclamationCircle /></span>
                    This is a preview of the published version of the quiz
                </Alert>
            )}

            <div className="mb-4">
                <h1 className="mb-2">{quiz.title}</h1>
                <p className="text-muted mb-0">Started: {startTime.toLocaleDateString()} at {startTime.toLocaleTimeString()}</p>
            </div>

            {/* Quiz Instructions */}
            <div className="mb-4">
                <h3 className="mb-3 fw-bold">Quiz Instructions</h3>
                <hr />
            </div>

            {/* Current Question */}
            {!submitted && (
                <div className="mb-4 px-5">
                    {renderCurrentQuestion()}
                </div>
            )}

            {/* Navigation */}
            {!submitted && (
                <div className="d-flex justify-content-between mb-4 px-5">
                    <div>
                        {!isFirstQuestion && (
                            <Button variant="light" className="border" onClick={goToPreviousQuestion}>
                                ◀ Previous
                            </Button>
                        )}
                    </div>
                    <div>
                        {!isLastQuestion && (
                            <Button variant="light" className="border" onClick={goToNextQuestion}>
                                Next ▶
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Submit Section */}
            {!submitted && (
                <div className="border rounded p-4 mb-4 bg-white d-flex justify-content-end align-items-center">
                    <span className="text-muted me-3">Quiz saved at {new Date().toLocaleTimeString()}</span>
                    <Button variant="light" className="border" onClick={submitQuiz}>
                        Submit Quiz
                    </Button>
                </div>
            )}

            {/* Keep Editing Button */}
            {isPreview && !submitted && (
                <div className="mb-4">
                    <Button 
                        variant="light" 
                        className="border text-start py-2 w-100"
                        onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/edit`)}
                    >
                        <FaPencil style={{ marginRight: "8px" }} />
                    Keep Editing This Quiz
                    </Button>
                </div>
            )}

            {/* Results Section (Only for Preview) */}
            {submitted && isPreview && (
                <div className="container-fluid p-4">
                    {/* Score Summary */}
                    <div className="text-start mb-4 p-4 border rounded bg-light">
                        <h3 className="fw-bold">Quiz Results</h3>
                        <div className="mb-3">
                            <h4>Score: {score} / {totalPoints} ({Math.round((score / totalPoints) * 100)}%)</h4>
                        </div>
                    </div>

                    {/* Detailed Questions and Answers */}
                    <div className="mb-4">
                        <h3 className="mb-3">Preview Results</h3>
                        {questions.map((question, index) => {
                            const userAnswer = answers[question._id];
                            const isCorrect = gradedAnswers[question._id]?.isCorrect;
                            const pointsEarned = gradedAnswers[question._id]?.pointsEarned || 0;
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
                                                            Correct Answer{question.possibleAnswers.length > 1 ? 's' : ''}: 
                                                        </span>
                                                        <span className="ms-1">{question.possibleAnswers.join(', ')}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <Button 
                        variant="light" 
                        className="border text-start py-2 w-100 mb-4"
                        onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/edit`)}
                    >
                        <FaPencil style={{ marginRight: "8px" }} />
                    Keep Editing This Quiz
                    </Button>

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
            )}

            {/* Question Navigation Links */}
            {!submitted && (
                <div className="mb-4">
                    <h4 className="mb-3">Questions</h4>
                    <div className="d-flex flex-column gap-2">
                        {questions.map((question, index) => {
                            const isCurrentQuestion = index === currentQuestionIndex;
                            const hasAnswer = answers[question._id] !== undefined;
                            const isCorrect = submitted ? gradedAnswers[question._id]?.isCorrect : null;
                            
                            return (
                                <div 
                                    key={question._id} 
                                    className="d-flex align-items-center"
                                    style={{ cursor: submitted ? 'default' : 'pointer' }}
                                    onClick={() => !submitted && goToQuestion(index)}
                                >
                                    <span className={`me-2 ${
                                        submitted 
                                            ? (isCorrect ? 'text-success' : 'text-danger')
                                            : hasAnswer 
                                                ? 'text-danger' 
                                                : 'text-muted'
                                    }`}>
                                        {submitted ? (isCorrect ? '✓' : '✗') : hasAnswer ? '●' : '○'}
                                    </span>
                                    <span 
                                        className={`${
                                            submitted 
                                                ? (isCorrect ? 'text-success' : 'text-danger')
                                                : isCurrentQuestion 
                                                    ? 'text-danger fw-bold text-decoration-underline' 
                                                    : hasAnswer 
                                                        ? 'text-danger' 
                                                        : 'text-muted'
                                        } ${!submitted ? 'quiz-question-link' : ''}`}
                                    >
                                        Question {index + 1}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <style>{`
                .quiz-question-link:hover {
                    text-decoration: underline !important;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}