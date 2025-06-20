import { useEffect, useState } from "react";
import { Button, Form, Row, Col } from "react-bootstrap";
import * as questionsClient from "./client";
import MultipleChoiceQuestion from "./QuestionBody/MultipleChoiceQuestion";
import TrueFalseQuestion from "./QuestionBody/TrueFalseQuestion";
import FillInTheBlankQuestion from "./QuestionBody/FillInTheBlankQuestion";


const QUESTION_TYPES = ["Multiple Choice", "True/False", "Fill in the Blank"];

export default function QuestionEditorForm({
    quizId,
    question = {},
    mode = "new",
    questionType,
    onCancel,
    onSaved,
    onUpdate,
    onDelete,
}: {
    quizId: string;
    question?: any;
    mode: "new" | "edit";
    questionType?: string;
    onCancel?: () => void;
    onSaved?: () => void;
    onUpdate?: (updatedQuestion: any) => void;
    onDelete?: () => void;
}) {
    const [form, setForm] = useState({
        title: question.title || "",
        points: question.points || 1,
        questionType: question.questionType || questionType || "Multiple Choice",
        questionText: question.questionText || "",
        // default to 2 choices for mcq, none for t/f
        choices:
            (question.questionType || questionType) === "Multiple Choice"
            ? question.choices || [
                { text: "", isCorrect: false },
                { text: "", isCorrect: false }
                ]
            : [],
        correctAnswer: question.correctAnswer ?? true,
        possibleAnswers: question.possibleAnswers || [],
        caseSensitive: question.caseSensitive || false,
        _id: question._id,
    });

    useEffect(() => {
        if (mode === "edit" && onUpdate) {
            onUpdate(form);
        }
    }, [form]);

    const updateField = (field: string, value: any) => {
        const updated = { ...form, [field]: value };
        setForm(updated);
        if (mode === "edit" && onUpdate) {
            onUpdate(updated);
        }
    };

    const handleSave = async () => {
        const payload = { ...form };
        await questionsClient.createQuestion(quizId, payload);
        if (onSaved) onSaved();
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this question?")) {
            await questionsClient.deleteQuestion(form._id);
            if (onSaved) onSaved();
            if (onDelete) onDelete();
        }
    };
    
    const handleUpdate = async () => {
        if (form._id) {
            await questionsClient.updateQuestion(form._id, form); 
            if (onSaved) onSaved();
            if (onCancel) onCancel();
        }
    };

    // Each has title, points, save/cancel but needs the UI for the right quesiton
    const renderBody = () => {
        switch (form.questionType) {
            case "Multiple Choice":
                return <MultipleChoiceQuestion form={form} setForm={setForm} />;
            case "True/False":
                return <TrueFalseQuestion form={form} setForm={setForm} />;
            case "Fill in the Blank":
                return <FillInTheBlankQuestion form={form} setForm={setForm} />;
            default:
                return null;
        }
    };

    return (
        <div className="border rounded p-4 mb-4 bg-light">
            <Row className="align-items-center mb-3">
                {/* all types have title, points, dropdown */}
                <Col>
                    <Form.Control
                        type="text"
                        placeholder="Question Title"
                        value={form.title}
                        onChange={(e) => updateField("title", e.target.value)}
                    />
                </Col>
                <Col>
                    <Form.Select
                        value={form.questionType}
                        onChange={(e) => updateField("questionType", e.target.value)}
                    >
                        {QUESTION_TYPES.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
                <Col xs="auto">
                    <div className="d-flex align-items-center gap-2">
                        <Form.Label htmlFor="form-points" className="mb-0 fs-4">pts:</Form.Label>
                        <Form.Control
                            id="form-points"
                            type="number"
                            value={form.points}
                            onChange={(e) => updateField("points", parseInt(e.target.value, 10))}
                            style={{ width: "60px" }}
                        />
                    </div>
                </Col>
            </Row>
            <hr />

            {/* grab the respective question type */}
            {renderBody()}

            {/* <div className="d-flex justify-content-end gap-2 mt-3">
                {mode === "edit" && (
                    <Button variant="outline-danger" onClick={handleDelete}>
                        Delete
                    </Button>
                )}
                {mode === "new" && onCancel && (
                    <Button variant="secondary" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                {mode === "new" && (
                    <Button variant="danger" onClick={handleSave}>
                        Save
                    </Button>
                )}
            </div> */}
            <div className="d-flex justify-content-end gap-2 mt-3">
  {mode === "edit" && (
    <>
      <Button
        variant="secondary"
        onClick={() => onCancel?.()}
      >
        Cancel
      </Button>
      <Button
        variant="danger"
        onClick={handleUpdate}
        >
        Save
      </Button>
    </>
  )}
  {mode === "edit" && (
    <Button variant="outline-danger" onClick={handleDelete}>
      Delete
    </Button>
  )}
  {mode === "new" && onCancel && (
    <Button variant="secondary" onClick={onCancel}>
      Cancel
    </Button>
  )}
  {mode === "new" && (
    <Button variant="danger" onClick={handleSave}>
      Save
    </Button>
  )}
</div>

        </div>
    );
}
