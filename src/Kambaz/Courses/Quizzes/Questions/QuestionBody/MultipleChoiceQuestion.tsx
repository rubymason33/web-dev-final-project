import { Form, Button } from "react-bootstrap";
import EditingMenu from "../../EditingMenu";
import { FaRegTrashAlt } from "react-icons/fa";

export default function MultipleChoiceQuestion({
    form,
    setForm,
}: {
    form: any;
    setForm: (updated: any) => void;
}) {
    const updateChoiceText = (index: number, value: string) => {
        const updatedChoices = [...form.choices];
        updatedChoices[index].text = value;
        setForm({ ...form, choices: updatedChoices });
    };

    const setCorrectChoice = (index: number) => {
        const updatedChoices = form.choices.map((choice: any, i: number) => ({
        ...choice,
        isCorrect: i === index,
        }));
        setForm({ ...form, choices: updatedChoices });
    };

    const addChoice = () => {
        const updatedChoices = [...form.choices, { text: "", isCorrect: false }];
        setForm({ ...form, choices: updatedChoices });
    };

    const removeChoice = (index: number) => {
        const updatedChoices = [...form.choices];
        updatedChoices.splice(index, 1);
        setForm({ ...form, choices: updatedChoices });
    };

    return (
        <div>
            <p className="fs-6">Enter your question and multiple answers, and then select the one correct answer.</p>
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

            <Form.Label className="fs-4 mb-2 fw-bold">Answers:</Form.Label>
            {form.choices.map((choice: any, index: number) => (
                <div key={index} className="d-flex gap-2 align-items-center mb-3">
                    <Form.Check
                    type="radio"
                    name={`correctChoice-${form._id || "new"}`}
                    checked={choice.isCorrect}
                    onChange={() => setCorrectChoice(index)}
                    />
                    <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder={`Choice ${index + 1}`}
                    value={choice.text}
                    onChange={(e) => updateChoiceText(index, e.target.value)}
                    className="flex-grow-1"
                    />
                    {form.choices.length > 2 && (
                    <span
                        onClick={() => removeChoice(index)}
                        role="button"
                        className="text-danger d-flex align-items-center justify-content-center"
                        style={{ cursor: "pointer", height: "100%" }}
                        title="Delete choice"
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
                    onClick={addChoice}
                >
                    + Add Another Answer
                </Button>
            </div>
        </div>
    );
}
