import { Form, Row, Col, Button, Tabs, Tab } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import * as quizzesClient from "./client";
import {addQuiz, updateQuiz} from "./reducer"
import QuestionEditor from "./Questions/QuestionEditor";
import EditingMenu from "./EditingMenu";
import * as questionsClient from "./Questions/client"



export default function QuizEditor() {
    const [key, setKey] = useState("details");
    const { cid, qid } = useParams()
    const quizzes = useSelector((state: any) =>
        state.quizzesReducer.quizzes
    );
    const existingQuiz = quizzes.find(
        (q: any) => q.course === cid && q._id === qid
    );
    const dispatch = useDispatch()
    const navigate = useNavigate();
    const { currentUser } = useSelector((state: any) => state.accountReducer);
    const isFaculty = currentUser?.role === "FACULTY";
    const defaultQuiz = {
        title: "",
        createdBy: currentUser._id,
        description: "",
        course: cid,
        points: 25,
        questions: 0,
        status: "Not available until",
        quizType: "Graded Quiz",
        assignmentGroup: "Quizzes",
        shuffleAnswers: true,
        timeLimit: 20,
        timeLimitOn: true,
        multipleAttempts: false,
        maxAttempts: 1,
        showCorrectAnswers: "Immediately",
        accessCode: "",
        oneQuestionAtTime: true,
        webcamRequired: false,
        lockQuestionsAfterAnswering: false,
        dueDate: "",
        availableDate: "",
        availableFor: "",
        untilDate: "",
        published: false,
        assignTo: ""
    }
    const [formData, setFormData] = useState(defaultQuiz)

    // pass the db data to the questions editor once
    const [workingQuestions, setWorkingQuestions] = useState<any[]>([]);

    useEffect(() => {
        const fetchQuestions = async () => {
            const fetched = await questionsClient.getQuestionsForQuiz(qid as string);
            setWorkingQuestions(fetched);
        };
        if (qid) fetchQuestions();
    }, [qid]);


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
                availableDate: existingQuiz.availableDate
                    ? existingQuiz.availableDate.slice(0, 16)
                    : "",
                dueDate: existingQuiz.dueDate
                    ? existingQuiz.dueDate.slice(0, 16)
                    : "",
                untilDate: existingQuiz.untilDate
                    ? existingQuiz.untilDate.slice(0, 16)
                    : ""
            });
        }
    }, [existingQuiz]);
    const handleChange = (e: any) => {
        const { name, type, checked, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value),
        }));
    }
    const handleSave = async (e: any) => {
        e.preventDefault();
        let newId = qid
        const status = calculateQuizStatus()
        if (!status) {
            return;
        }
        const updatedFormData = { ...formData, status: status };
        try {
            if (existingQuiz) {
                console.log("existing")
                const updatedQuiz = await quizzesClient.updateQuiz({
                    ...updatedFormData,
                    _id: existingQuiz._id
                });
                dispatch(updateQuiz(updatedQuiz));
            } else {
                console.log("new")
                const newQuiz = await quizzesClient.createQuizForCourse(
                    cid as string,
                    updatedFormData
                );
                newId = newQuiz._id
                dispatch(addQuiz(newQuiz));
            }
            navigate(`../Quizzes/${newId}`);
        } catch (error) {
            console.error("Error saving quiz:", error);
        }
    };

    const handleSaveandPublish = async (e: any) => {
        e.preventDefault();
        const status = calculateQuizStatus()
        if (!status) {
            return;
        }
        const updatedFormData = { ...formData, published: true, status: status };
        try {
            if (existingQuiz) {
                const updatedQuiz = await quizzesClient.updateQuiz({
                    ...updatedFormData,
                    _id: existingQuiz._id
                });
                dispatch(updateQuiz(updatedQuiz));
            } else {
                const newQuiz = await quizzesClient.createQuizForCourse(
                    cid as string,
                    updatedFormData
                );
                dispatch(addQuiz(newQuiz));
            }
            navigate(`../Quizzes`);
        } catch (error) {
            console.error("Error saving quiz:", error);
        }
    };

    function calculateQuizStatus() {
        const now = new Date();
        const available = new Date(formData.availableDate);
        const until = new Date(formData.untilDate);
        const due = new Date(formData.dueDate)
        if (available > until) {
            alert("Quiz Available Date must be before Open Until date")
            return null
        }
        if (due < available) {
            alert("Quiz cannot be due before it is available")
            return null
        }
        if (due > until) {
            alert("Quiz cannot be due after it is available")
            return null
        }
        if (now < available) {
          return "Not available until";
        } else if (now > until) {
          return "Closed";
        } else {
          return "Available";
        }
      }

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
                    <Form.Control type="text" placeholder="Quiz Title" name="title" value={formData.title} onChange={handleChange} />
                </Form.Group>

                <Form.Group className="mb-5" id="wd-instructions">
                    <Form.Label className="fw-bold">Quiz Instructions</Form.Label>
                    <br></br>

                    <EditingMenu />
                    <Form.Control as="textarea" rows={5} placeholder="Description" defaultValue={formData.description} />

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
                    name="points"
                    value={formData.points}
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    defaultValue={formData.assignmentGroup}
                    className=""
                    onChange={handleChange}
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
                <Form.Check type="checkbox" label="Shuffle Answers" name="shuffleAnswers" checked={formData.shuffleAnswers} onChange={handleChange}/>
                <div className="d-flex gap-5">
                    <Form.Check type="checkbox" label="Time Limit" name="timeLimitOn" checked={formData.timeLimitOn} onChange={handleChange}/>
                    <Form.Group className="d-flex gap-2">
                        <Form.Control type="number" defaultValue={formData.timeLimit} name="timeLimit" onChange={handleChange} style={{ width: "60px" }}/>
                        <Form.Label>Minutes</Form.Label>
                    </Form.Group>

                </div>
                <div className="wd-outline-box mb-2">
                    <Form.Check type="checkbox" label="Allow Multiple Attempts"  name="multipleAttempts"    checked={formData.multipleAttempts} onChange={handleChange}/>
                    {(formData.multipleAttempts)  && 
                    (<div className="mt-2 d-flex gap-2">
                    <Form.Control type="number" name="maxAttempts" defaultValue={formData.maxAttempts} style={{ width: "60px" }} onChange={handleChange}/>
                        <Form.Label className="">Allowed Attempts</Form.Label>                    </div>)}
                </div>

                <div className="wd-outline-box mb-4">
                    <Form.Check
                        type="checkbox"
                        label="Show Correct Answers"
                        checked={formData.showCorrectAnswers !== ""}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                showCorrectAnswers: e.target.checked ? "Immediately" : "",
                            })
                        }
                    />

                    {formData.showCorrectAnswers !== "" && (
                        <div className="mt-2">
                            {["Immediately", "After Due Date", "After Last Attempt", "Never", "On Specific Date"].map((option) => (
                                <Form.Check
                                    key={option}
                                    type="radio"
                                    label={option}
                                    name="showCorrectAnswersOption"
                                    value={option}
                                    checked={formData.showCorrectAnswers === option}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            showCorrectAnswers: e.target.value,
                                        })
                                    }
                                />
                            ))}
                        </div>
                    )}
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
                            name="accessCode"
                            placeholder="Enter passcode"
                            className="mt-2"
                        />
                        )}
                </div>

                <div className="wd-outline-box mb-2">
                    <Form.Check type="checkbox" label="One Question at a Time"  name="oneQuestionAtTime"    checked={formData.oneQuestionAtTime} onChange={handleChange}/>
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
                        name="availableDate"
                        value={formData.availableDate}
                        onChange={handleChange}
                        />
                    </Col>
                    <Col>
                        <Form.Label><b>Until</b></Form.Label>
                        <Form.Control
                        type="datetime-local"
                        name="untilDate"
                        value={formData.untilDate}
                        onChange={handleChange}
                        />
                    </Col>
                    </Row>
                </div>
                </Col>
            </Row>


            <hr />

            </Form>
        </div>
            </Tab>
            <Tab eventKey="questions" title="Questions" >

 
                {/* Questions content PASS IN THE DB HERE AND THEN */} 
                <QuestionEditor
                    workingQuestions={workingQuestions}
                    setWorkingQuestions={setWorkingQuestions}
                />
            </Tab>
        </Tabs>
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

        </>


        
    )
}