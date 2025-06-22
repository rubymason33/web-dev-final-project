import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import QuestionEditorForm from "./QuestionEditorForm";
import { TiPencil } from "react-icons/ti";
import * as questionsClient from "./client";


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
    originalQuestions,
    quizId,
}: {
    originalQuestions: Question[];
    quizId: string;
}) {
    const [displayQuestions, setDisplayQuestions] = useState<Question[]>(originalQuestions);
    const [adding, setAdding] = useState(false);
    const [newType, setNewType] = useState("Multiple Choice");
    const [editingId, setEditingId] = useState<string | null>(null);

    const addQuestionHandler = async (newQuestion: Question) => {
        const created = await questionsClient.createQuestion(quizId, newQuestion);
        setDisplayQuestions((prev) => [...prev, created]);
    };
    const updateQuestionHandler = async (updated: Question) => {
        await questionsClient.updateQuestion(updated._id, updated);
        setDisplayQuestions((prev) =>
            prev.map((q) => (q._id === updated._id ? updated : q))
        );
    };
    const deleteQuestionHandler = async (id: string) => {
        await questionsClient.deleteQuestion(id);
        setDisplayQuestions((prev) => prev.filter((q) => q._id !== id));
    };

    useEffect(() => {
        const fetchCurrentDB = async () => {
            const current = await questionsClient.getQuestionsForQuiz(quizId);
            setDisplayQuestions(current); // always reflects db
        };
        fetchCurrentDB();
    }, [quizId]);

    const getCurrentTotalPoints = () => {
        return displayQuestions.reduce((sum, q) => sum + (q.points || 0), 0);
    };

    return (
        <div>
            <div className="d-flex justify-content-end mb-3">
                <div className="p-2 bg-light border rounded fs-5">
                    <b>Total Points:</b> {getCurrentTotalPoints()}
                </div>
            </div>
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
                    onSave={addQuestionHandler}
                    onSaved={() => {
                        setAdding(false);
                        setNewType("Multiple Choice");
                    }}
                />
            )}

            {/* collapse when not editing current */}
            {displayQuestions.map((q) =>
                editingId === q._id ? (
                <QuestionEditorForm
                    key={q._id}
                    mode="edit"
                    question={q}
                    onSave={updateQuestionHandler}
                    onDelete={async () => {
                        await deleteQuestionHandler(q._id);
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
