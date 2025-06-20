import { useState } from "react";
import { Button } from "react-bootstrap";
import QuestionEditorForm from "./QuestionEditorForm";
import { TiPencil } from "react-icons/ti";


// avoid the type 'never' errors
type Choice = { text: string; isCorrect: boolean };
type Question = {
    _id: string;
    title: string;
    points: number;
    questionType: "Multiple Choice" | "True/False" | "Fill in the Blank";
    questionText: string;
    choices: Choice[];
    correctAnswer?: boolean;
    possibleAnswers?: string[];
    caseSensitive?: boolean;
};

export default function QuestionEditor({
    workingQuestions, // this comes from editor
    setWorkingQuestions,
}: {
    workingQuestions: Question[];
    setWorkingQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
}) {
    const [adding, setAdding] = useState(false);
    const [newType, setNewType] = useState("Multiple Choice");
    const [editingId, setEditingId] = useState<string | null>(null);

    const updateWorkingQuestion = (updatedQuestion: Question) => {
        setWorkingQuestions((prev) =>
        prev.map((q) => (q._id === updatedQuestion._id ? updatedQuestion : q))
        );
    };

    return (
        <div>
            {!adding && (
                <div className="d-flex justify-content-center my-3">
                <Button
                    variant="secondary"
                    className="mt-3 mb-3"
                    onClick={() => setAdding(true)}
                >
                    + New Question
                </Button>
                </div>
            )}

            {adding && (
                <QuestionEditorForm
                    mode="new"
                    questionType={newType}
                    onCancel={() => {
                        setAdding(false);
                        setNewType("Multiple Choice");
                    }}
                    onUpdate={(newQuestion) =>
                        setWorkingQuestions((prev) => [...prev, newQuestion])
                    }
                    onSaved={() => {
                        setAdding(false);
                        setNewType("Multiple Choice");
                    }}
                />
            )}

            {workingQuestions.map((q) =>
                editingId === q._id ? (
                <QuestionEditorForm
                    key={q._id + q.title + q.points}
                    mode="edit"
                    question={q}
                    onUpdate={updateWorkingQuestion}
                    onDelete={() => {
                    const updated = workingQuestions.filter((wq) => wq._id !== q._id);
                    setWorkingQuestions(updated);
                    setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                    onSaved={() => setEditingId(null)}
                />
                ) : (
                <div
                    key={q._id}
                    className="border rounded p-3 mb-3 bg-white d-flex justify-content-between align-items-center"
                >
                    <div>
                        <strong>{q.title}</strong>{" "}
                        <span className="text-muted">({q.questionType})</span>
                        <br />
                        <small>{q.points} pts</small>
                    </div>
                    <span
                        onClick={() => setEditingId(q._id)}
                        role="button"
                        title="Edit"
                        className="text-secondary d-flex align-items-center"
                        style={{ cursor: "pointer" }}
                    >
                        <TiPencil />
                    </span>
                </div>
                )
            )}
        </div>
    );
}
