import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { addAssignment, updateAssignment } from "./reducer";
import { Col, Form, Row, Button } from "react-bootstrap";
import "./styles.css"
import * as assignmentsClient from "./client";


export default function AssignmentEditor() {
    const { cid, aid } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const existingAssignment = useSelector((state: any) =>
        state.assignmentsReducer.assignments.find((a: any) => a._id === aid)
    );

    const { currentUser } = useSelector((state: any) => state.accountReducer);
    const isFaculty = currentUser?.role === "FACULTY";

    // only faculty can view the editor page
    useEffect(() => {
        if (!isFaculty) {
            navigate("../Assignments");
        }
    }, [isFaculty, navigate]);

    const [formData, setFormData] = useState({
        course: cid,
        title: "",
        description: "",
        points: 100,
        modules: "Multiple Modules",
        assignmentGroup: "ASSIGNMENTS",
        displayGradeAs: "PERCENTAGE",
        submissionType: "ONLINE",
        onlineEntryOptions: "",
        assignTo: "Everyone",
        dueDate: "",
        availableFrom: "",
        availableUntil: "",
    });

    // populate dates correctly
    useEffect(() => {
        if (existingAssignment) {
            setFormData({
                ...existingAssignment,
                availableFrom: existingAssignment.availableFrom
                    ? existingAssignment.availableFrom.slice(0, 16)
                    : "",
                dueDate: existingAssignment.dueDate
                    ? existingAssignment.dueDate.slice(0, 16)
                    : "",
                availableUntil: existingAssignment.availableUntil
                    ? existingAssignment.availableUntil.slice(0, 16)
                    : ""
            });
        }
    }, [existingAssignment]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
        ) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleSave = async (e: any) => {
        e.preventDefault();
        try {
            if (existingAssignment) {
                const updatedAssignment = await assignmentsClient.updateAssignment({
                    ...formData,
                    _id: existingAssignment._id
                });
                dispatch(updateAssignment(updatedAssignment));
            } else {
                const newAssignment = await assignmentsClient.createAssignmentForCourse(
                    cid as string,
                    formData
                );
                dispatch(addAssignment(newAssignment));
            }
            navigate("../Assignments");
        } catch (error) {
            console.error("Error saving assignment:", error);
        }
    };

    const handleCancel = () => {
        navigate("../Assignments");
    };


    return (
        <div id="wd-assignments-editor" className="p-4">
            <Form>
            {/* Title */}
            <Form.Group className="mb-3" id="wd-title">
                <Form.Label>Assignment Title</Form.Label>
                <Form.Control
                type="text"
                placeholder="Assignment Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                />
            </Form.Group>

            {/* Description */}
            <Form.Group className="mb-3" id="wd-description">
                <Form.Label>Description</Form.Label>
                <Form.Control
                as="textarea"
                rows={5}
                placeholder="Assignment Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                />
            </Form.Group>

            {/* Points */}
            <Row className="mb-3 align-items-center">
                <Col xs="auto">
                <Form.Label htmlFor="wd-points" className="mb-0">Points</Form.Label>
                </Col>
                <Col>
                <Form.Control
                    id="wd-points"
                    type="number"
                    placeholder="100"
                    name="points"
                    value={formData.points}
                    onChange={handleChange}
                />
                </Col>
            </Row>

            {/* Assignment Group */}
            <Row className="mb-3 align-items-center">
                <Col xs="auto">
                <Form.Label htmlFor="wd-group" className="mb-0">Assignment Group</Form.Label>
                </Col>
                <Col>
                <Form.Select
                    id="wd-assignment-group"
                    name="assignmentGroup"
                    value={formData.assignmentGroup}
                    onChange={handleChange}
                >
                    <option value="ASSIGNMENTS">ASSIGNMENTS</option>
                    <option value="QUIZZES">QUIZZES</option>
                </Form.Select>
                </Col>
            </Row>

            {/* Display Grade As */}
            <Row className="align-items-center mb-3">
                <Col xs="auto">
                <Form.Label htmlFor="wd-display-grade-as" className="mb-0">Display Grade As</Form.Label>
                </Col>
                <Col>
                <Form.Select
                    id="wd-display-grade-as"
                    name="displayGradeAs"
                    value={formData.displayGradeAs}
                    onChange={handleChange}
                >
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="POINTS">Points</option>
                </Form.Select>
                </Col>
            </Row>

            {/* Submission Type */}
            <Row className="align-items-start mb-3">
                <Col xs="auto">
                <Form.Label htmlFor="wd-submission-type" className="mb-0">Submission Type</Form.Label>
                </Col>
                <Col>
                <div className="wd-outline-box">
                    <Form.Select
                    id="wd-submission-type"
                    name="submissionType"
                    value={formData.submissionType}
                    onChange={handleChange}
                    className="mb-3"
                    >
                    <option value="ONLINE">Online</option>
                    <option value="IN-PERSON">In Person</option>
                    </Form.Select>

                    {/* Online Entry Options */}
                    <b className="d-block mb-2">Online Entry Options</b>
                    <Form.Check type="checkbox" label="Text Entry" />
                    <Form.Check type="checkbox" label="Website URL" />
                    <Form.Check type="checkbox" label="Media Recordings" />
                    <Form.Check type="checkbox" label="Student Annotation" />
                    <Form.Check type="checkbox" label="File Uploads" />
                </div>
                </Col>
            </Row>

            {/* Assign Section */}
            <Row className="align-items-start mb-3">
                <Col xs="auto">
                <Form.Label htmlFor="wd-assign-to" className="mb-0">Assign</Form.Label>
                </Col>
                <Col>
                <div className="wd-outline-box">
                    <Form.Label><b>Assign To</b></Form.Label>
                    <Form.Control
                    type="text"
                    name="assignTo"
                    value={formData.assignTo}
                    onChange={handleChange}
                    className="mb-3"
                    />

                    <Form.Label><b>Due</b></Form.Label>
                    <Form.Control
                    type="datetime-local"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="mb-3"
                    />

                    <Row className="mb-3">
                    <Col>
                        <Form.Label><b>Available From</b></Form.Label>
                        <Form.Control
                        type="datetime-local"
                        name="availableFrom"
                        value={formData.availableFrom}
                        onChange={handleChange}
                        />
                    </Col>
                    <Col>
                        <Form.Label><b>Until</b></Form.Label>
                        <Form.Control
                        type="datetime-local"
                        name="availableUntil"
                        value={formData.availableUntil}
                        onChange={handleChange}
                        />
                    </Col>
                    </Row>
                </div>
                </Col>
            </Row>

            <hr />

            {/* Save and Cancel */}
            <div className="wd-assignment-editor-end">
                <Button
                variant="danger"
                className="float-end"
                onClick={handleSave}
                >
                Save
                </Button>
                <Button
                variant="secondary"
                className="me-2 float-end"
                onClick={handleCancel}
                >
                Cancel
                </Button>
            </div>
            </Form>
        </div>
    );
}
