import React from "react";
import { Modal, Button } from "react-bootstrap";

function DeleteConfirmModal({ show, onHide, onConfirm, title = "Are you sure?", message }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Body className="text-center p-4">
        <div className="mb-3">
          <i className="bi bi-exclamation-triangle-fill text-danger fs-1"></i>
        </div>
        <h5 className="fw-bold">{title}</h5>
        <p className="text-muted">{message || "This action cannot be undone."}</p>
        <div className="d-grid gap-2 mt-4">
          <Button variant="danger" size="lg" onClick={onConfirm}>
            Delete
          </Button>
          <Button variant="outline-secondary" size="lg" onClick={onHide}>
            Cancel
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default DeleteConfirmModal;
