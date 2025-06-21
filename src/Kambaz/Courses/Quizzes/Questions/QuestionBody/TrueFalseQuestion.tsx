import { Form } from "react-bootstrap";
import EditingMenu from "../../EditingMenu";

export default function TrueFalseQuestion({
    form,
    setForm,
}: {
    form: any;
    setForm: (updated: any) => void;
}) {


    return (
        <div>
            <p className="fs-6">Enter your question text, then select if True or False is the correct answer.</p>
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

            <Form.Label className="fs-4 mb-2 fw-bold">Answer:</Form.Label>
            <div className="mb-3 fs-4">
                <Form.Check
                    type="radio"
                    label="True"
                    id="true"
                    name={`trueFalse-${form._id || "new"}`}
                    checked={form.correctAnswer === true}
                    onChange={() => setForm({ ...form, correctAnswer: true })}
                />
                <br />
                <Form.Check
                    type="radio"
                    label="False"
                    id="false"
                    name={`trueFalse-${form._id || "new"}`}
                    checked={form.correctAnswer === false}
                    onChange={() => setForm({ ...form, correctAnswer: false })}
                />
            </div>
            
    
            

            
        </div>
    );
}
