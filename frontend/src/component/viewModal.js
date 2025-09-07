import React from "react";
import { Modal, Button } from "react-bootstrap";

function ViewModal({ show, onHide, title, children }) {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">{children}</Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ViewModal;
