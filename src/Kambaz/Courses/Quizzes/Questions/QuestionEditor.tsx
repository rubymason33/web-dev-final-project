import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import * as questionsClient from "./client";
import QuestionEditorForm from "./QuestionEditorForm";
import { TiPencil } from "react-icons/ti";

// avoid the type 'never' errors
type Choice = {
    text: string;
    isCorrect: boolean;
};

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


export default function QuestionEditor({ quizId }: { quizId: string }) {
    // ability to revert all changed if cancelAll is clicked
    const [originalQuestions, setOriginalQuestions] = useState<Question[]>([]);
    const [workingQuestions, setWorkingQuestions] = useState<Question[]>([]);

    const [adding, setAdding] = useState(false);
    const [newType, setNewType] = useState("Multiple Choice");
    const [editingId, setEditingId] = useState<string | null>(null);


    const refresh = () => {
        questionsClient.getQuestionsForQuiz(quizId).then((fetched) => {
        setOriginalQuestions(fetched);
        setWorkingQuestions(JSON.parse(JSON.stringify(fetched)));
        });
    };

    useEffect(() => {
        refresh();
    }, [quizId]);

    // revert to pre change
    const handleCancelAll = async () => {
        for (const original of originalQuestions) {
            await questionsClient.updateQuestion(original._id, original);
        }
        setEditingId(null);
        refresh();
    };

    // save all current changes
    const handleSaveAll = async () => {
        for (let i = 0; i < workingQuestions.length; i++) {
            const updated = workingQuestions[i];
            const original = originalQuestions.find(q => q._id === updated._id);

            // compare to original
            if (JSON.stringify(updated) !== JSON.stringify(original)) {
                await questionsClient.updateQuestion(updated._id, updated);
            }
        }
        refresh();
    };

    const handleCancel = () => {
        setAdding(false);
    };

    // when editing mode
    const resetQuestion = (id: string) => {
        const original = originalQuestions.find(q => q._id === id);
        if (!original) return;
        const updated = workingQuestions.map(q =>
            q._id === id ? JSON.parse(JSON.stringify(original)) : q
        );
        setWorkingQuestions(updated);
    };

    const updateWorkingQuestion = (index: number, updatedQuestion: Question) => {
        const updated = [...workingQuestions];
        updated[index] = updatedQuestion;
        setWorkingQuestions(updated);
    };

    return (
        <div>
        {!adding && (
            <div className="d-flex justify-content-center my-3">
                <Button variant="secondary" className="mt-3 mb-3" onClick={() => setAdding(true)}>
                    + New Question
                </Button>
            </div>

        )}

        {adding && (
            <>
            <QuestionEditorForm
                mode="new"
                questionType={newType}
                quizId={quizId}
                onCancel={() => {
                    setAdding(false);
                    setNewType("Multiple Choice");
                }}
                onSaved={() => {
                    handleCancel();
                    refresh();
                }}
            />
            </>
        )}

        {workingQuestions.map((q, index) => (
            editingId === q._id ? (
                <QuestionEditorForm
                    key={q._id}
                    mode="edit"
                    quizId={quizId}
                    question={q}
                    onUpdate={(updated) => updateWorkingQuestion(index, updated)}
                    onDelete={() => {
                        const updated = workingQuestions.filter((wq) => wq._id !== q._id);
                        setWorkingQuestions(updated);
                        setEditingId(null);
                    }}
                    onCancel={() => {
                        resetQuestion(q._id);
                        setEditingId(null);
                    }}
                />
            ) : (
                <div
                key={q._id}
                className="border rounded p-3 mb-3 bg-white d-flex justify-content-between align-items-center"
                >
                <div>
                    <strong>{q.title}</strong> <span className="text-muted">({q.questionType})</span>
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
        ))}


        {/* Save/Cancel all buttons */}
        <hr />
        <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="secondary" onClick={handleCancelAll}>
            Cancel All
            </Button>
            <Button variant="danger" onClick={handleSaveAll}>
            Save All
            </Button>
        </div>
        </div>
    );
}
