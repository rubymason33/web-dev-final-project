import { Button, Form, InputGroup, ListGroup } from "react-bootstrap";
import { CiSearch } from "react-icons/ci";
import { FaPlus } from "react-icons/fa6";
import { IoEllipsisVertical } from "react-icons/io5";
import { RiArrowDownSFill } from "react-icons/ri";
import { Link, useParams } from "react-router";
import { HiOutlineRocketLaunch } from "react-icons/hi2";
import * as db from "../../Database";
import "./styles.css"
import { useDispatch, useSelector } from "react-redux";
import * as quizzesClient from "./client"
import { FaTrash } from "react-icons/fa";
import GreenCheckmark from "./GreenCheckmark";
import {deleteQuiz} from "./reducer"

export default function Quizzes() {
    const { cid } = useParams();
    const quizzes = db.quizzes.filter((q: any) => q.course === cid);
    const { currentUser } = useSelector((state: any) => state.accountReducer);
    const isFaculty = currentUser?.role === "FACULTY";

    const dispatch = useDispatch();
    const handleDelete = async (quizId: any) => {
        console.log(`deleteing quiz with id ${quizId}`)
        try {
            await quizzesClient.deleteQuiz(quizId);
            dispatch(deleteQuiz(quizId));
        } catch (error) {
            console.error("Failed to delete assignment:", error);
        }
    };

    return (
        <div>
            <div id="wd-quiz-header" className="mb-5">
                <Button className="me-2 float-end border border-dark" size="lg" variant="secondary">
                    <IoEllipsisVertical /> 
                </Button>
                {isFaculty && (
                    <Link 
                        to={`/Kambaz/Courses/${cid}/Quizzes/New/edit`} 
                        className="btn btn-danger me-2 float-end btn-lg"
                    >
                        <FaPlus /> Quiz
                    </Link>
                )}
                
                <InputGroup style={{ maxWidth: "300px" }} className="me-1 justify-left" size="lg">
                    <InputGroup.Text><CiSearch /></InputGroup.Text>
                    <Form.Control
                        placeholder="Search for Quiz"
                    />
                </InputGroup>
                <hr />
            </div>
            <div id="wd-quiz-list">
                <ListGroup className="rounded-0" id="wd-quizzes">
                    <ListGroup.Item className="wd-quiz-category p-0 mb-5 fs-5 border-gray">
                        <div className="wd-title p-3 ps-2 bg-secondary d-flex justify-content-between align-items-center"> 
                            <div className="d-flex align-items-center">
                                <RiArrowDownSFill className="me-2 fs-3" />
                                <span className="fs-5">Assignment Quizzes</span>
                            </div>
                        </div>

                        <ListGroup className="wd-quiz rounded-0">
                            {quizzes.map((quiz: any) => (
                                <ListGroup.Item key={quiz._id} className="d-flex align-items-center px-3 py-3">
                                    {/* rocket icon */}
                                    <div className="me-3 d-flex align-items-center" style={{ width: "30px" }}>
                                        <HiOutlineRocketLaunch className="fs-2 text-success" />
                                    </div>

                                    {/* text block */}
                                    <div className="flex-grow-1">
                                        <div className="fw-bold fs-5 mb-1">
                                            <Link
                                                to={`/Kambaz/Courses/${cid}/Quizzes/${quiz._id}`}
                                                id="wd-quiz-link">
                                                {quiz.title}
                                            </Link>
                                        </div>

                                        <div className="small mb-1">
                                            {quiz.status === "Closed" && (
                                                <>
                                                <span className="text-muted fw-bold">{quiz.status}</span>
                                                <span className="text-muted fw-bold"> | Due </span>
                                                <span className="text-muted">
                                                    {new Date(quiz.dueDate).toLocaleString("en-US", {
                                                    month: "long",
                                                    day: "numeric",
                                                    hour: "numeric",
                                                    minute: "2-digit",
                                                    hour12: true
                                                    })}
                                                </span>
                                                </>
                                            )}
                                            
                                            {quiz.status === "Available" && (
                                                <>
                                                <span className="text-muted fw-bold">{quiz.status}</span>
                                                <span className="text-muted fw-bold"> | Due </span>
                                                <span className="text-muted">
                                                    {new Date(quiz.dueDate).toLocaleString("en-US", {
                                                    month: "long",
                                                    day: "numeric",
                                                    hour: "numeric",
                                                    minute: "2-digit",
                                                    hour12: true
                                                    })}
                                                </span>
                                                </>
                                            )}

                                            {quiz.status === "Not available until" && (
                                                <>
                                                <span className="text-muted fw-bold">{quiz.status}</span>
                                                <span className="text-muted"> </span>
                                                <span className="text-muted">
                                                    {new Date(quiz.availableFrom).toLocaleString("en-US", {
                                                    month: "long",
                                                    day: "numeric",
                                                    hour: "numeric",
                                                    minute: "2-digit",
                                                    hour12: true
                                                    })}
                                                </span>
                                                <span className="text-muted fw-bold"> | Due </span>
                                                <span className="text-muted">
                                                    {new Date(quiz.dueDate).toLocaleString("en-US", {
                                                    month: "long",
                                                    day: "numeric",
                                                    hour: "numeric",
                                                    minute: "2-digit",
                                                    hour12: true
                                                    })}
                                                </span>
                                                </>
                                            )}
                                        </div>
                                            <div className="small text-muted">
                                            {quiz.points} pts | {quiz.questions} Questions
                                        </div>

                                    </div>
                                    {/* lesson control */}
                                    <div className="d-flex align-items-center ms-3 gap-2">
                                    <FaTrash className="text-danger" onClick={() => handleDelete(quiz._id)}/>
                                    <GreenCheckmark />
                                    <IoEllipsisVertical className="fs-4"/>
                                    </div>


                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </ListGroup.Item>
                </ListGroup>
                    
            </div>

        </div>
    );
}


