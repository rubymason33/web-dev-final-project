import { Modal, Button } from "react-bootstrap";

export default function DeleteConfirmation({
    show,
    title,
    onConfirm,
    onCancel
}: {
    show: boolean;
    title: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <Modal show={show} onHide={onCancel}>
            <Modal.Header closeButton>
                <Modal.Title>Delete Assignment</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Are you sure you want to delete <strong>{title}</strong>?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={onConfirm}>
                    Delete
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
