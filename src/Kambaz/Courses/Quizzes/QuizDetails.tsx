import { useParams, Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { TiPencil } from "react-icons/ti";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import * as quizzesClient from "./client"

export default function QuizDetails() {
    const { cid, qid } = useParams();
    const [quiz, setQuiz] = useState<any>(null);
    const { currentUser } = useSelector((state: any) => state.accountReducer);
    const isFacultyorAdmin = currentUser?.role === "FACULTY" || currentUser?.role ==="ADMIN";

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const found = await quizzesClient.findQuizById(qid!);
                setQuiz(found);
            } catch (err) {
                console.error("Failed to fetch quiz:", err);
            }
        };
        fetchQuiz();
    }, [qid]);

    if (!quiz) {
        return <div className="p-4"><h3>Loading quiz...</h3></div>;
    }

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

    return (
        <div>
            <div id="wd-quiz-details-header" className="mb-3">
                {isFacultyorAdmin && (<div className="d-flex justify-content-end mb-2">
                    <Button  as={Link as any} to={`/Kambaz/Courses/${cid}/Quizzes/${quiz._id}/edit`} className="border-0 bg-secondary text-dark btn-lg me-2">
                        <TiPencil className="fs-4"/> Edit
                    </Button>
                    <Button as={Link as any} to={`/Kambaz/Courses/${cid}/Quizzes/${quiz._id}/take/preview`}  className="border-0 bg-secondary text-dark btn-lg">
                        Preview
                    </Button>
                </div>)}
                {!isFacultyorAdmin && (<div className="d-flex justify-content-end mb-2">
                <Button as={Link as any} to={`/Kambaz/Courses/${cid}/Quizzes/${quiz._id}/take`} className="border-0 bg-danger btn-lg me-2">
                        Start
                    </Button>
                </div>)}
                <h1 className="mb-3">{quiz.title}</h1>
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
                    <td className="py-4">{quiz.availableFor}</td>
                    <td className="py-4">{formatDate(quiz.availableDate)}</td>
                    <td className="py-4">{formatDate(quiz.untilDate)}</td>
                    </tr>
                </tbody>
            </table>
            <div className="d-flex justify-content-center">
                {isFacultyorAdmin ? 
                <Button className="bg-danger border-0 btn-lg"
                as={Link as any}
                to={`/Kambaz/Courses/${cid}/Quizzes/${quiz._id}/take/preview`}>
                Preview
                </Button>
                :
                <Button className="bg-danger border-0 btn-lg"
                as={Link as any}
                to={`/Kambaz/Courses/${cid}/Quizzes/${quiz._id}/take`}>
                Start
                </Button>}
            
            </div>
        </div>
    );
}