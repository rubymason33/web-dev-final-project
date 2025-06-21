import { useState } from "react";
import { Button, Form, Row, Col } from "react-bootstrap";
import MultipleChoiceQuestion from "./QuestionBody/MultipleChoiceQuestion";
import TrueFalseQuestion from "./QuestionBody/TrueFalseQuestion";
import FillInTheBlankQuestion from "./QuestionBody/FillInTheBlankQuestion";
import { v4 as uuidv4 } from "uuid";

const QUESTION_TYPES = ["Multiple Choice", "True/False", "Fill in the Blank"];

export default function QuestionEditorForm({
    question = {},
    mode = "new",
    questionType,
    onCancel,
    onSaved,
    onSave,
    onDelete,
}: {
    question?: any;
    mode: "new" | "edit";
    questionType?: string;
    onCancel?: () => void;
    onSaved?: () => void;
    onSave: (updatedQuestion: any) => Promise<void>;
    onDelete?: () => void;
}) {
    const [form, setForm] = useState({
        title: question.title || "",
        points: question.points || 1,
        questionType: question.questionType || questionType || "Multiple Choice",
        questionText: question.questionText || "",
        // mcq have at least 2 choices, t/f has none
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
        _id: question._id || uuidv4(),
    });

    const updateField = (field: string, value: any) => {
        const updated = { ...form, [field]: value };
        setForm(updated);
    };

    const handleSave = async () => {
        await onSave(form);  // send to backend
        if (onSaved) onSaved(); // exit editing
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this question?")) {
            if (onDelete) await onDelete();
            if (onSaved) onSaved();
        }
    };

    // each question has same "header" and "footer" but different content
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
            {renderBody()}
            <div className="d-flex justify-content-end gap-2 mt-3">
                {/* handles updates */}
                {mode === "edit" && (
                    <>
                        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
                        <Button variant="danger" onClick={handleSave}>Save</Button>
                        <Button variant="outline-danger" onClick={handleDelete}>Delete</Button>
                    </>
                )}
                {/* handles creates */}
                {mode === "new" && (
                    <>
                        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
                        <Button variant="danger" onClick={handleSave}>Save</Button>
                    </>
                )}
            </div>
        </div>
    );
}
