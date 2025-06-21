import { useParams, Link, useNavigate } from "react-router-dom";
import { Button, FormControl, FormLabel, Modal } from "react-bootstrap";
import { TiPencil } from "react-icons/ti";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import * as attemptsClient from "./Attempts/client";

export default function QuizDetails() {
    const { cid, qid } = useParams();
    const navigate = useNavigate();
    const quizzes = useSelector((state: any) => state.quizzesReducer.quizzes);
    const quiz = quizzes.find(
        (q: any) => q.course === cid && q._id === qid
    );
    
    const { currentUser } = useSelector((state: any) => state.accountReducer);
    const isFacultyorAdmin = currentUser?.role === "FACULTY" || currentUser?.role === "ADMIN";
    const isStudent = currentUser?.role === "STUDENT";
    
    // State for attempt handling
    const [latestAttempt, setLatestAttempt] = useState<any>(null);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    
    // handle not finding a match
    if (!quiz) {
        return <div className="p-4"><h3>Quiz not found.</h3></div>;
    }

    // Check for latest attempt when component loads
    useEffect(() => {
        const checkLatestAttempt = async () => {
            if (isStudent && quiz?._id) {
                try {
                    const attempt = await attemptsClient.getLatestAttempt(quiz._id);
                    if (attempt && attempt.completedAt) {
                        setLatestAttempt(attempt);
                    }
                } catch (error) {
                    // No attempt found or error - that's okay
                    console.log("No previous attempt found");
                    console.log(error)
                }
            }
        };

        checkLatestAttempt();
    }, [quiz?._id, isStudent]);

    // Handle quiz start with error checking
    const handleStartQuiz = async () => {
        try {
            // Check if quiz can be started by attempting to create an attempt
            // This will throw an error if not eligible, preventing navigation
            const attempt = await attemptsClient.startQuizAttempt(quiz._id);
            
            // If we get here, the quiz can be started - navigate to take page
            navigate(`/Kambaz/Courses/${cid}/Quizzes/${quiz._id}/take`);
        } catch (error: any) {
            // Handle different error cases - show modal instead of navigating
            let message = "Could not start quiz. Please try again.";
            
            if (error.response) {
                switch (error.response.status) {
                    case 403:
                        if (error.response.data.message.includes("not published")) {
                            message = "This quiz is not yet published.";
                        } else if (error.response.data.message.includes("Maximum attempts")) {
                            message = "You have reached the maximum number of attempts for this quiz.";
                        } else if (error.response.data.message.includes("availability")) {
                            message = "This quiz is not available at this time. Please check the availability dates.";
                        } else if (error.response.data.message.includes("due")) {
                            message = "The due date for this quiz has passed.";
                        } else {
                            message = error.response.data.message || message;
                        }
                        break;
                    case 404:
                        message = "Quiz not found.";
                        break;
                    default:
                        message = error.response.data.message || message;
                }
            }
            
            // Show error modal instead of navigating
            setErrorMessage(message);
            setShowErrorModal(true);
        }
    };

    // Helper function to format ISO 8601 duration
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

    // Helper function to format dates
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
    
    const dispatch = useDispatch();

    // Error Modal Component
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

    return (
        <div>
            <div id="wd-quiz-details-header" className="mb-3">
                {isFacultyorAdmin && (
                    <div className="d-flex justify-content-end mb-2">
                        <Button as={Link} to={`/Kambaz/Courses/${cid}/Quizzes/${quiz._id}/edit`} className="border-0 bg-secondary text-dark btn-lg me-2">
                            <TiPencil className="fs-4"/> Edit
                        </Button>
                        <Button as={Link} to={`/Kambaz/Courses/${cid}/Quizzes/${quiz._id}/preview`} className="border-0 bg-secondary text-dark btn-lg">
                            Preview
                        </Button>
                    </div>
                )}
                
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
                
                {/* Show latest attempt info for students */}
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

            {/* Quiz Description - Only show if there's content and make it display-only */}
            {quiz.description && (
                <div className="mb-4 p-3 bg-light rounded border">
                    <div dangerouslySetInnerHTML={{ __html: quiz.description }} />
                </div>
            )}
            
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

            {/* Error Modal */}
            <ErrorModal />
        </div>
    );
}