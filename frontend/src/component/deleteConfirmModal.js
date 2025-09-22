import React from "react";
import { Modal, Button } from "react-bootstrap";

function DeleteConfirmModal({ show, onHide, onConfirm, title, message }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Body className="text-center p-4">
        <div className="mb-3">
          <span className="text-danger" style={{ fontSize: "2rem" }}>⚠️</span>
        </div>
        <h5 className="mb-3">{title}</h5>
        <p>{message}</p>
        <div className="d-flex justify-content-center gap-2 mt-4">
          <Button variant="danger" onClick={onConfirm}>
            Delete
          </Button>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default DeleteConfirmModal;
