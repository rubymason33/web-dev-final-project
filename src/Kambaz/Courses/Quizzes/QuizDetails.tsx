import { useParams, Link, useNavigate } from "react-router-dom";
import { Button, Modal } from "react-bootstrap";
import { TiPencil } from "react-icons/ti";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import * as quizzesClient from "./client";
import * as attemptsClient from "./Attempts/client";
import * as questionsClient from "./Questions/client";

export default function QuizDetails() {
    const { cid, qid } = useParams();
    const navigate = useNavigate();
    
    const [quiz, setQuiz] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [attemptCount, setAttemptCount] = useState(0);
    
    const { currentUser } = useSelector((state: any) => state.accountReducer);
    const isFacultyorAdmin = currentUser?.role === "FACULTY" || currentUser?.role === "ADMIN";
    const isStudent = currentUser?.role === "STUDENT";
    
    const [latestAttempt, setLatestAttempt] = useState<any>(null);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const found = await quizzesClient.findQuizById(qid!);
                setQuiz(found.data);
            } catch (err) {
                console.error("Failed to fetch quiz:", err);
            }
        };
        fetchQuiz();
    }, [qid]);

    useEffect(() => {
        const fetchQuestions = async () => {
            if (isFacultyorAdmin && qid) {
                try {
                    const questionsData = await questionsClient.getQuestionsForQuiz(qid);
                    setQuestions(questionsData);
                } catch (error) {
                    console.error("Failed to fetch questions:", error);
                    setQuestions([]);
                }
            }
        };
        fetchQuestions();
    }, [qid, isFacultyorAdmin]);

    useEffect(() => {
        const checkLatestAttempt = async () => {
            if (isStudent && quiz?._id) {
                try {
                    const attempt = await attemptsClient.getLatestAttempt(quiz._id);
                    if (attempt && attempt.completedAt) {
                        setLatestAttempt(attempt);
                    }
                    
                    const attempts = await attemptsClient.getAttemptsForQuiz(quiz._id);
                    setAttemptCount(attempts.length);
                    console.log("Loaded attempts:", attempts.length);
                } catch (error) {
                    console.log("No previous attempt found");
                    console.log(error);
                    setAttemptCount(0);
                }
            }
        };

        checkLatestAttempt();
    }, [quiz?._id, isStudent]);

    const validateQuizAccess = () => {
        const now = new Date();
        
        if (isStudent) {
            if (quiz.availableDate && new Date(quiz.availableDate) > now) {
                setErrorMessage("This quiz is not yet available.");
                return false;
            }
            
            if (quiz.untilDate && new Date(quiz.untilDate) < now) {
                setErrorMessage("The availability period for this quiz has ended.");
                return false;
            }
            
            if (quiz.multipleAttempts === false && attemptCount >= 1) {
                setErrorMessage("You have already completed this quiz and multiple attempts are not allowed.");
                return false;
            }
            
            if (quiz.allowedAttempts && quiz.allowedAttempts > 0 && attemptCount >= quiz.allowedAttempts) {
                setErrorMessage(`You have reached the maximum number of attempts (${quiz.allowedAttempts}) for this quiz.`);
                return false;
            }
            
            if (latestAttempt && latestAttempt.completedAt && quiz.multipleAttempts === false) {
                setErrorMessage("You have already completed this quiz and multiple attempts are not allowed.");
                return false;
            }
        }
        
        if (isFacultyorAdmin) {
            if (!questions || questions.length === 0) {
                setErrorMessage("Cannot preview quiz: No questions have been added to this quiz yet.");
                return false;
            }
        }
        return true;
    };

    const handleStartQuiz = async () => {
        console.log("Starting quiz validation...");
        console.log("Quiz data:", {
            multipleAttempts: quiz.multipleAttempts,
            allowedAttempts: quiz.allowedAttempts,
            attemptCount: attemptCount,
            latestAttempt: latestAttempt
        });
        
        if (!validateQuizAccess()) {
            console.log("Validation failed, showing error modal");
            setShowErrorModal(true);
            return;
        }
        console.log("Validation passed, navigating to quiz");
        navigate(`/Kambaz/Courses/${cid}/Quizzes/${quiz._id}/take`);
    };

    const handlePreview = () => {
        if (!validateQuizAccess()) {
            setShowErrorModal(true);
            return;
        }
        navigate(`/Kambaz/Courses/${cid}/Quizzes/${quiz._id}/preview`);
    };

    function formatTimeLimit(durationStr: any) {
        if (!durationStr) return "";
        if (durationStr.startsWith("PT")) {
            const hoursMatch = durationStr.match(/(\d+)H/);
            const minutesMatch = durationStr.match(/(\d+)M/);

            const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
            const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;

            const result = [];
            if (hours > 0) result.push(`${hours} Hour${hours > 1 ? "s" : ""}`);
            if (minutes > 0) result.push(`${minutes} Minute${minutes > 1 ? "s" : ""}`);

            return result.join(" ");
        }
        return durationStr;
    }

    function formatDate(dateString: any) {
        if (!dateString) return "";
        const options: Intl.DateTimeFormatOptions = {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        };
        return new Date(dateString).toLocaleString('en-US', options);
    }

    const ErrorModal = () => (
        <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)} centered>
            <Modal.Header closeButton>
                <Modal.Title>Cannot Start Quiz</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{errorMessage}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button 
                    variant="primary" 
                    onClick={() => setShowErrorModal(false)}
                >
                    OK
                </Button>
            </Modal.Footer>
        </Modal>
    );

    if (!quiz) {
        return <div className="p-4"><h3>Loading quiz...</h3></div>;
    }

    return (
        <div>
            <div id="wd-quiz-details-header" className="mb-3">
                {isFacultyorAdmin && (<div className="d-flex justify-content-end mb-2">
                    <Button  as={Link as any} to={`/Kambaz/Courses/${cid}/Quizzes/${quiz._id}/edit`} className="border-0 bg-secondary text-dark btn-lg me-2">
                        <TiPencil className="fs-4"/> Edit
                    </Button>
                    <Button 
                        className="border-0 bg-secondary text-dark btn-lg"
                        onClick={handlePreview}
                    >
                        Preview
                    </Button>
                </div>)}
                
                {isStudent && (
                    <div className="d-flex justify-content-end mb-2">
                        <div className="d-flex gap-2">
                            <Button 
                                className="border-0 bg-danger btn-lg"
                                onClick={handleStartQuiz}
                            >
                                Start
                            </Button>
                            
                            {latestAttempt && (
                                <Button 
                                    variant="secondary"
                                    className="btn-lg"
                                    onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/${quiz._id}/score`)}
                                >
                                    View Score
                                </Button>
                            )}
                        </div>
                    </div>
                )}
                <h1 className="mb-3">{quiz.title}</h1>
                
                {isStudent && latestAttempt && (
                    <div className="mb-3 p-3 bg-light rounded border">
                        <h6 className="mb-2 text-muted">Latest Attempt</h6>
                        <div className="small text-muted">
                            <div>Completed: {new Date(latestAttempt.completedAt).toLocaleDateString()} at {new Date(latestAttempt.completedAt).toLocaleTimeString()}</div>
                            <div>Score: {latestAttempt.score}/{latestAttempt.totalPoints} ({Math.round((latestAttempt.score / latestAttempt.totalPoints) * 100)}%)</div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mb-4">
                <p className="fs-4">{quiz.description}</p>
            </div>
            
            <table className="table table-borderless w-auto mb-5">
                <tbody className="fs-4">
                    <tr>
                        <td className="text-end"><strong>Quiz Type</strong></td>
                        <td className="ps-2">{quiz.quizType}</td>
                    </tr>
                    <tr>
                        <td className="text-end"><strong>Points</strong></td>
                        <td className="ps-2">{quiz.points}</td>
                    </tr>
                    <tr>
                        <td className="text-end"><strong>Assignment Group</strong></td>
                        <td className="ps-2">{quiz.assignmentGroup}</td>
                    </tr>
                    <tr>
                        <td className="text-end"><strong>Shuffle Answers</strong></td>
                        <td className="ps-2">{quiz.shuffleAnswers ? "Yes" : "No"}</td>
                    </tr>
                    <tr>
                        <td className="text-end"><strong>Time Limit</strong></td>
                        <td className="ps-2">{formatTimeLimit(quiz.timeLimit)}</td>
                    </tr>
                    <tr>
                        <td className="text-end"><strong>Multiple Attempts</strong></td>
                        <td className="ps-2">{quiz.multipleAttempts ? "Yes" : "No"}</td>
                    </tr>
                    <tr>
                        <td className="text-end"><strong>Show Correct Answers</strong></td>
                        <td className="ps-2">{quiz.showCorrectAnswers}</td>
                    </tr>
                    <tr>
                        <td className="text-end"><strong>One Question at a Time</strong></td>
                        <td className="ps-2">{quiz.oneQuestionAtTime ? "Yes" : "No"}</td>
                    </tr>
                    <tr>
                        <td className="text-end"><strong>Webcam Required</strong></td>
                        <td className="ps-2">{quiz.webcamRequired ? "Yes" : "No"}</td>
                    </tr>
                    <tr>
                        <td className="text-end"><strong>Lock Questions After Answering</strong></td>
                        <td className="ps-2">{quiz.lockQuestionsAfterAnswering ? "Yes" : "No"}</td>
                    </tr>
                </tbody>
            </table>
            
            <table className="table table-borderless table-sm w-100 fs-4">
                <thead className="border-bottom">
                    <tr>
                        <th className="text-dark fw-bold py-2">Due</th>
                        <th className="text-dark fw-bold py-2">For</th>
                        <th className="text-dark fw-bold py-2">Available from</th>
                        <th className="text-dark fw-bold py-2">Until</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-bottom">
                        <td className="py-4">{formatDate(quiz.dueDate)}</td>
                        <td className="py-4">{quiz.availableFor || "Everyone"}</td>
                        <td className="py-4">{formatDate(quiz.availableDate)}</td>
                        <td className="py-4">{formatDate(quiz.untilDate)}</td>
                    </tr>
                </tbody>
            </table>
            <div className="d-flex justify-content-center">
                {isFacultyorAdmin ? (
                    <Button 
                        className="bg-danger border-0 btn-lg"
                        onClick={handlePreview}
                    >
                        Preview
                    </Button>
                ) : (
                    <div className="d-flex gap-2">
                        <Button 
                            className="bg-danger border-0 btn-lg"
                            onClick={handleStartQuiz}
                        >
                            Start
                        </Button>
                        
                        {latestAttempt && (
                            <Button 
                                variant="secondary"
                                className="btn-lg"
                                onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/${quiz._id}/score`)}
                            >
                                View Score
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <ErrorModal />
        </div>
    );
}