import { Form, Button } from "react-bootstrap";
import EditingMenu from "../../EditingMenu";
import { FaRegTrashAlt } from "react-icons/fa";

export default function FillInTheBlankQuestion({
    form,
    setForm,
}: {
    form: any;
    setForm: (updated: any) => void;
}) {
    const updateAnswer = (index: number, value: string) => {
        const updated = [...form.possibleAnswers];
        updated[index] = value;
        setForm({ ...form, possibleAnswers: updated });
    };

    const addAnswer = () => {
        setForm({
        ...form,
        possibleAnswers: [...form.possibleAnswers, ""],
        });
    };

    const removeAnswer = (index: number) => {
        const updated = [...form.possibleAnswers];
        updated.splice(index, 1);
        setForm({ ...form, possibleAnswers: updated });
    };

    return (
        <div>
            <p className="fs-6">
                Enter your question text, then define all possible correct answers for the blank. Students will see 
                the question followed by a small textbox to type their answer.
            </p>

            <Form.Group className="mb-3">
                <Form.Label className="fs-4 mb-2 fw-bold">Question:</Form.Label>
                <EditingMenu />
                <Form.Control
                as="textarea"
                rows={3}
                value={form.questionText}
                onChange={(e) => setForm({ ...form, questionText: e.target.value })}
                />
            </Form.Group>

            <Form.Label className="fs-4 mb-2 fw-bold">Possible Correct Answers:</Form.Label>
            {form.possibleAnswers.map((answer: string, index: number) => (
                <div key={index} className="d-flex gap-2 align-items-center mb-3">
                    <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder={`Answer ${index + 1}`}
                        value={answer}
                        onChange={(e) => updateAnswer(index, e.target.value)}
                        className="flex-grow-1"
                    />
                    {form.possibleAnswers.length > 1 && (
                        <span
                        onClick={() => removeAnswer(index)}
                        role="button"
                        className="text-danger d-flex align-items-center justify-content-center"
                        style={{ cursor: "pointer", height: "100%" }}
                        >
                        <FaRegTrashAlt />
                        </span>
                    )}
                </div>
            ))}

            <div className="d-flex justify-content-end">
                <Button
                variant="link"
                className="text-danger p-0"
                onClick={addAnswer}
                >
                + Add Another Answer
                </Button>
            </div>

            {/* case sentitve switch */}
            <Form.Check
                type="switch"
                id="case-sensitive-switch"
                label="Answers are case-sensitive"
                className="mt-3 fs-5"
                checked={form.caseSensitive}
                onChange={(e) => setForm({ ...form, caseSensitive: e.target.checked })}
            />

        </div>
    );
}