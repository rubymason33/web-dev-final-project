import { useParams, Link, useNavigate } from "react-router-dom";
import { Button, Modal } from "react-bootstrap";
import { TiPencil } from "react-icons/ti";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import * as quizzesClient from "./client";
import * as attemptsClient from "./Attempts/client";
import {updateQuiz} from "./reducer"

export default function QuizDetails() {
    const { cid, qid } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [quiz, setQuiz] = useState<any>(null);
    
    const { currentUser } = useSelector((state: any) => state.accountReducer);
    const isFacultyorAdmin = currentUser?.role === "FACULTY" || currentUser?.role === "ADMIN";
    const isStudent = currentUser?.role === "STUDENT";
    
    const [latestAttempt, setLatestAttempt] = useState<any>(null);
    const [showErrorModal, setShowErrorModal] = useState(false);
    // @ts-ignore
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
    }, [qid, quiz]);

    useEffect(() => {
        const checkLatestAttempt = async () => {
            if (isStudent && quiz?._id) {
                try {
                    const attempt = await attemptsClient.getLatestAttempt(quiz._id);
                    if (attempt && attempt.completedAt) {
                        setLatestAttempt(attempt);
                    }
                } catch (error) {
                    console.log("No previous attempt found");
                    console.log(error)
                }
            }
        };

        checkLatestAttempt();
    }, [quiz?._id, isStudent]);

    const handleStartQuiz = async () => {
        navigate(`/Kambaz/Courses/${cid}/Quizzes/${quiz._id}/take`);
    };

    function formatTimeLimit(durationStr: any) {
        if (!durationStr) return "";
        if (durationStr.startsWith("PT")) {
            const hoursMatch = durationStr.match(/(\d+)H/);
            const minutesMatch = durationStr.match(/(\d+)M/);

            const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
            const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;

            let result = [];
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

    const handlePublish = async () => {
        try {
            const quizPublishChanged = { ...quiz, published: !quiz.published };
            const updatedQuiz = await quizzesClient.updateQuiz(quizPublishChanged);
            dispatch(updateQuiz(updatedQuiz));
        } catch (error) {
            console.error("Failed to update quiz publish status:", error);
        }
    }

    return (
        <div>
            <div id="wd-quiz-details-header" className="mb-3">
                {isFacultyorAdmin && (<div className="d-flex justify-content-end mb-2">
                    <Button  as={Link as any} to={`/Kambaz/Courses/${cid}/Quizzes/${quiz._id}/edit`} className="border-0 bg-secondary text-dark btn-lg me-2">
                        <TiPencil className="fs-4"/> Edit
                    </Button>
                    <Button as={Link as any} to={`/Kambaz/Courses/${cid}/Quizzes/${quiz._id}/preview`}  className="border-0 bg-secondary text-dark btn-lg me-2">
                        Preview
                    </Button>
                    <Button className="border-0 bg-success btn-lg" onClick={handlePublish}>
                        {quiz.published && "Un-publish"}
                        {!quiz.published && "Publish"}
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
                    <Button className="bg-danger border-0 btn-lg"
                    as={Link as any}
                    to={`/Kambaz/Courses/${cid}/Quizzes/${quiz._id}/preview`}>
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