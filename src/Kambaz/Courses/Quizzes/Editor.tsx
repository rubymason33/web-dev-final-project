import { Form, Row, Col, Button, Tabs, Tab } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import * as db from "../../Database";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import * as quizzesClient from "./client";
import { FaItalic } from "react-icons/fa";
import { FaUnderline } from "react-icons/fa";
import { AiOutlineFontColors } from "react-icons/ai";
import { FaHighlighter } from "react-icons/fa6";
import { HiDotsVertical } from "react-icons/hi";
import { FaChevronDown } from "react-icons/fa";
import {addQuiz, updateQuiz} from "./reducer"



export default function QuizEditor() {
    const [key, setKey] = useState("details");
    const { cid, qid } = useParams()
    const existingQuiz = db.quizzes.find(
        (q: any) => q.course === cid && q._id === qid
    );

    const dispatch = useDispatch()
    const navigate = useNavigate();
    const { currentUser } = useSelector((state: any) => state.accountReducer);
    const isFaculty = currentUser?.role === "FACULTY";
    const defaultQuiz = {
        title: "",
        instructions: "",
        course: cid,
        points: 0,
        questions: 0,
        status: "Not available until",
        quizType: "Graded Quiz",
        assignmentGroup: "Quizzes",
        shuffleAnswers: true,
        timeLimit: "PT20M",
        multipleAttempts: false,
        howManyAttempts: 1,
        showCorrectAnswers: false,
        accessCode: "",
        oneQuestionAtATime: true,
        webcamRequired: false,
        lockQuestionsAfterAnswering: false,
        dueDate: "",
        availableUntil: "",
        availableFor: "",
        availableFrom: "",
        published: false
    }
    const [formData, setFormData] = useState(defaultQuiz)
    // only faculty can view the editor page
    useEffect(() => {
        if (!isFaculty) {
            navigate("../Quizzes");
        }
    }, [isFaculty, navigate]);

    // populate dates correctly
    useEffect(() => {
        if (existingQuiz) {
            setFormData({
                ...existingQuiz,
                availableFrom: existingQuiz.availableFrom
                    ? existingQuiz.availableFrom.slice(0, 16)
                    : "",
                dueDate: existingQuiz.dueDate
                    ? existingQuiz.dueDate.slice(0, 16)
                    : "",
                availableUntil: existingQuiz.availableUntil
                    ? existingQuiz.availableUntil.slice(0, 16)
                    : ""
            });
        }
    }, [existingQuiz]);
    const handleChange = (e: any) => {
        const { name, type, checked, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    }
    const handleSave = async (e: any) => {
        e.preventDefault();
        try {
            if (existingQuiz) {
                const updatedQuiz = await quizzesClient.updateQuiz({
                    ...formData,
                    _id: existingQuiz._id
                });
                dispatch(updateQuiz(updatedQuiz));
            } else {
                const newQuiz = await quizzesClient.createQuizForCourse(
                    cid as string,
                    formData
                );
                dispatch(addQuiz(newQuiz));
            }
            navigate(`../Quizzes/${qid}`);
        } catch (error) {
            console.error("Error saving quiz:", error);
        }
    };

    const handleSaveandPublish = async (e: any) => {
        e.preventDefault();
        setFormData({...formData, published: true});
        try {
            if (existingQuiz) {
                const updatedQuiz = await quizzesClient.updateQuiz({
                    ...formData,
                    _id: existingQuiz._id
                });
                dispatch(updateQuiz(updatedQuiz));
            } else {
                const newQuiz = await quizzesClient.createQuizForCourse(
                    cid as string,
                    formData
                );
                dispatch(addQuiz(newQuiz));
            }
            navigate(`../Quizzes`);
        } catch (error) {
            console.error("Error saving quiz:", error);
        }
    };

    const handleCancel = () => {
        navigate("../Quizzes");
    };

    return (
        <>
        <style>{`
        .custom-tabs .nav-link {
          font-size: 0.85rem;
          color: red;
        }
        .custom-tabs .nav-link.active {
          color: black !important;
          font-weight: bold;
        }
      `}</style>
        <Tabs activeKey={key} onSelect={(k: any) => setKey(k || "details")} className="mb-3 custom-tabs">
            
            <Tab eventKey="details" title="Details" >
            <div id="wd-quizzes-editor" className="fs-6">
            <Form>
                <Form.Group className="mb-3" id="wd-name">
                    <Form.Label className="fw-bold">Quiz Title *</Form.Label>
                    <Form.Control type="text" placeholder="Quiz Title" name="title" defaultValue={formData.title} />
                </Form.Group>

                <Form.Group className="mb-5" id="wd-instructions">
                    <Form.Label className="fw-bold">Quiz Instructions</Form.Label>
                    <br></br>
                    <div className="ms-4" style={{ fontSize: "1rem" }}>
                        <div className="d-flex gap-3">
                            <span>Edit</span> 
                            <span>View</span>
                            <span>Insert</span>
                            <span>Format</span>
                            <span>Tools</span>
                            <span>Table</span>
                        </div> <br/>
                        <div className="d-flex gap-5">
                            <h6>12pt<FaChevronDown/></h6> 
                            <h6>Paragraph<FaChevronDown/></h6> |
                            <h6 className="fw-bold">B</h6>
                            <FaItalic />
                            <FaUnderline />
                            <AiOutlineFontColors />
                            <FaHighlighter /> | 
                            <HiDotsVertical />

                        </div>
                    </div>
                    <Form.Control as="textarea" rows={5} placeholder="Description" defaultValue={formData.instructions} />
                </Form.Group>
            
            <Row className="align-items-start mb-3">
                <Col md={3} className="text-end">
                <Form.Label htmlFor="wd-points" className="">Points</Form.Label>
                </Col>
                <Col>
                <div className="">
                    <Form.Control
                    type="number"
                    id="wd-points"
                    name="quizPoints"
                    placeholder="25"
                    value={formData.points}
                    className="" />
                </div>
                </Col>
            </Row>
            <Row className="align-items-start mb-3">
                <Col md={3} className="text-end">
                <Form.Label htmlFor="wd-quiz-type" className="">Quiz Type</Form.Label>
                </Col>
                <Col>
                <div className="">
                    <Form.Select
                    id="wd-quiz-type"
                    name="quizType"
                    value={formData.quizType}
                    className=""
                    >
                    <option value="Practice Quiz">Practice Quiz</option>
                    <option value="Graded Quiz">Graded Quiz</option>
                    <option value="Graded Survey">Graded Survey</option>
                    <option value="Ungraded Survey">Ungraded Survey</option>
                    </Form.Select>
                </div>
                </Col>
            </Row>
            <Row className="align-items-start mb-5">
                <Col md={3} className="text-end">
                <Form.Label htmlFor="wd-quiz-group" className="">Assignment Group</Form.Label>
                </Col>
                <Col>
                <div className="">
                    <Form.Select
                    id="wd-quiz-group"
                    name="quizGroup"
                    value={formData.assignmentGroup}
                    className=""
                    >
                    <option value="Assignments">Assignments</option>
                    <option value="Quizzes">Quizzes</option>
                    <option value="Exams">Exams</option>
                    </Form.Select>
                </div>
                </Col>
            </Row>
            <Row className="align-items-start mb-3">
                <Col md={3} className="text-end">
                </Col>
                <Col>
                <h6 className="fw-bold">Options</h6>
                <Form.Check type="checkbox" label="Shuffle Answers" checked={formData.shuffleAnswers} onChange={handleChange}/>
                <div className="d-flex gap-5">
                    <Form.Check type="checkbox" label="Time Limit" checked={!(formData.timeLimit === null)} onChange={handleChange}/>
                    <Form.Group className="d-flex gap-2">
                        <Form.Control type="text" value={formData.timeLimit.slice(2,4)} onChange={handleChange} style={{ width: "60px" }}/>
                        <Form.Label>Minutes</Form.Label>
                    </Form.Group>

                </div>
                <div className="wd-outline-box mb-2">
                    <Form.Check type="checkbox" label="Allow Multiple Attempts"  name="multipleAttempts"    checked={formData.multipleAttempts} onChange={handleChange}/>
                    {(formData.multipleAttempts)  && 
                    (<div className="mt-2 d-flex gap-2">
                    <Form.Control type="number" placeholder="1" name="howManyAttempts" defaultValue={formData.howManyAttempts} style={{ width: "60px" }}/>
                        <Form.Label className="">Allowed Attempts</Form.Label>                    </div>)}
                </div>

                <div className="wd-outline-box mb-4">
                    <Form.Check type="checkbox" label="Show Correct Answers"  name="showCorrectAnswers"    checked={formData.showCorrectAnswers} onChange={handleChange}/>
                </div>
                <h6 className="fw-bold">Quiz Restrictions</h6>
                <div className="wd-outline-box mb-4">
                    <Form.Check type="checkbox" label="Require passcode"  checked={formData.accessCode !== ""} onChange={(e) =>
                        setFormData({
                        ...formData,
                        accessCode: e.target.checked ? "defaultPasscode" : "",
                        })
                    }/>
                    {formData.accessCode !== "" && (
                        <Form.Control
                            type="text"
                            value={formData.accessCode}
                            onChange={handleChange}
                            placeholder="Enter passcode"
                            className="mt-2"
                        />
                        )}
                </div>

                <div className="wd-outline-box mb-2">
                    <Form.Check type="checkbox" label="One Question at a Time"  name="oneQuestionAtATime"    checked={formData.oneQuestionAtATime} onChange={handleChange}/>
                </div>

                <div className="wd-outline-box mb-2">
                    <Form.Check type="checkbox" label="Webcam Required"  name="webcamRequired"    checked={formData.webcamRequired} onChange={handleChange}/>
                </div>

                <div className="wd-outline-box mb-2">
                    <Form.Check type="checkbox" label="Lock Questions after answering"  name="lockQuestionsAfterAnswering"    checked={formData.lockQuestionsAfterAnswering} onChange={handleChange}/>
                </div>
                </Col>
            </Row>

            <Row className="align-items-start mb-3">
                <Col md={3} className="text-end">
                <Form.Label htmlFor="wd-assign-to" className="">Assign</Form.Label>
                </Col>
                <Col className="wd-outline-box">
                <div className="">
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
            <div className="wd-assignment-editor-end">
                <Button
                variant="danger"
                className="float-end"
                onClick={handleSaveandPublish}
                >
                Save and Publish
                </Button>
                <Button
                variant="danger"
                className="me-2 float-end"
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
            </Tab>
            <Tab eventKey="questions" title="Questions" >
                {/* Questions content */}
                <div>List of quiz Questions</div>
            </Tab>
        </Tabs>
        </>


        
    )
}