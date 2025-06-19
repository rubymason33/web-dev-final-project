import { InputGroup, Form, Button } from "react-bootstrap";
import { CiSearch } from "react-icons/ci";
import { FaPlus } from "react-icons/fa6";
import { ListGroup } from "react-bootstrap";
import { BsGripVertical } from "react-icons/bs";
import LessonControlButtons from "../Modules/LessonControlButtons";
import AssignmentControlButtons from "./AssignmentControlButtons";
import { MdOutlineAssignment } from "react-icons/md";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaTrash } from "react-icons/fa";
import DeleteConfirmation from "./DeleteConfirmation";
import { deleteAssignment as deleteAssignmentAction, setAssignments } from "./reducer";
import { useEffect, useState } from "react";
import * as assignmentsClient from "./client";


export default function Assignments() {
    const { cid } = useParams();
    const dispatch = useDispatch();
    const assignments = useSelector((state: any) =>
        state.assignmentsReducer.assignments.filter((a: any) => a.course === cid)
    );

    const { currentUser } = useSelector((state: any) => state.accountReducer);
    const isFaculty = currentUser?.role === "FACULTY";

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [assignmentToDelete, setAssignmentToDelete] = useState<any>(null);

    useEffect(() => {
        const fetchAssignments = async () => {
            if (!cid) return;
            try {
                const fetchedAssignments = await assignmentsClient.findAssignmentsForCourse(cid);
                dispatch(setAssignments(fetchedAssignments));
            } catch (error) {
                console.error("Failed to fetch assignments:", error);
            }
        };
        fetchAssignments();
    }, [cid, dispatch]);

    const handleDeleteClick = (assignment: any) => {
        setAssignmentToDelete(assignment);
        setShowDeleteModal(true);
    };
    const handleConfirmDelete = async () => {
        if (assignmentToDelete) {
            try {
                await assignmentsClient.deleteAssignment(assignmentToDelete._id);
                dispatch(deleteAssignmentAction(assignmentToDelete._id));
            } catch (error) {
                console.error("Failed to delete assignment:", error);
            }
        }
        setShowDeleteModal(false);
        setAssignmentToDelete(null);
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setAssignmentToDelete(null);
    };

    return (
        <div>
            <div id="wd-assignment-header" className="mb-5">
                {/* only faculty types */}
                {isFaculty && (
                    <Link 
                        to={`/Kambaz/Courses/${cid}/Assignments/New`} 
                        className="btn btn-danger me-2 float-end btn-lg"
                    >
                        <FaPlus /> Assignment
                    </Link>
                )}

                <Button className="me-2 float-end" size="lg" variant="secondary">
                    <FaPlus /> Group
                </Button>
                <InputGroup style={{ maxWidth: "300px" }} className="me-1 justify-left" size="lg">
                    <InputGroup.Text><CiSearch /></InputGroup.Text>
                    <Form.Control
                        placeholder="Search..."
                    />
                </InputGroup>
            </div>
            <div>
                <ListGroup className="rounded-0" id="wd-assignments">
                    <ListGroup.Item className="wd-assignment-category p-0 mb-5 fs-5 border-gray">
                        <div className="wd-title p-3 ps-2 bg-secondary d-flex justify-content-between align-items-center"> 
                            <div className="d-flex align-items-center">
                                <BsGripVertical className="me-2 fs-3" />
                                <span className="fs-5">ASSIGNMENTS</span>
                            </div>
                            <AssignmentControlButtons />
                        </div>

                        <ListGroup className="wd-lesson rounded-0">
                            {assignments.map((assignment: any) => (
                                <ListGroup.Item key={assignment._id} className="d-flex align-items-center px-3 py-3">
                                    {/* grip icon */}
                                    <div className="me-3 d-flex align-items-center" style={{ width: "30px" }}>
                                        <BsGripVertical className="fs-2 text-muted" />
                                    </div>

                                    {/* assignment icon */}
                                    <div className="me-3 d-flex align-items-center" style={{ width: "30px" }}>
                                        <MdOutlineAssignment className="fs-2 text-success" />
                                    </div>

                                    {/* text block */}
                                    <div className="flex-grow-1">
                                        <div className="fw-bold fs-5 mb-1">
                                            <Link
                                                to={`/Kambaz/Courses/${cid}/Assignments/${assignment._id}`}
                                                className="wd-assignment-link">
                                                {assignment.title || assignment.name || "Untitled"}
                                            </Link>
                                        </div>

                                        <div className="small mb-1">
                                            <span className="text-danger">{assignment.modules}</span>
                                            <span className="text-muted"> | </span>
                                            <span className="fw-bold text-muted">Not available until </span>
                                            <span className="text-muted">
                                                {new Date(assignment.availableFrom).toLocaleString("en-US", {
                                                    month: "long",
                                                    day: "numeric",
                                                    hour: "numeric",
                                                    minute: "2-digit",
                                                    hour12: true
                                                })}{" | "}
                                            </span>
                                        </div>
                                        <div className="small text-muted">
                                            <span className="fw-bold">Due </span>
                                            {new Date(assignment.dueDate).toLocaleString("en-US", {
                                                month: "long",
                                                day: "numeric",
                                                hour: "numeric",
                                                minute: "2-digit",
                                                hour12: true
                                            })}{" | "} {assignment.points} pts
                                        </div>
                                    </div>

                                    {/* lesson control */}
                                    <div className="d-flex align-items-center ms-3">
                                        {isFaculty && (
                                            <div
                                                className="d-flex align-items-center me-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={() => handleDeleteClick(assignment)}
                                            >
                                                <FaTrash className="text-danger fs-5" />
                                            </div>
                                        )}
                                        <LessonControlButtons />
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </ListGroup.Item>
                </ListGroup>
            </div>
            <DeleteConfirmation
                show={showDeleteModal}
                title={assignmentToDelete?.title}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </div>
    );
}

