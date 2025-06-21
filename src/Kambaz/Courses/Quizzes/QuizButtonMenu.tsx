
import { Modal, Button } from "react-bootstrap";
export default function QuizButtonMenu({
    show,
    title,
    handleDelete,
    handlePublish,
    publishStatus,
    onCancel,
    goToEdit
}: {
    
    show: boolean;
    title: string;
    handleDelete: (id: string) => void;
    handlePublish: (quiz: any) => void;
    publishStatus: boolean;
    onCancel: () => void;
    goToEdit: () => void;
}) {
    return (
        <Modal show={show} onHide={onCancel}>
            <Modal.Header closeButton>
                <Modal.Title>Quiz Options</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Options for quiz: <strong>{title}</strong>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="secondary" onClick={goToEdit}>
                    Edit
                </Button>
                <Button variant="danger" onClick={handleDelete}>
                    Delete
                </Button>
                <Button variant="success" onClick={handlePublish}>
                    {publishStatus && "Un-publish"}
                    {!publishStatus && "Publish"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
