import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="container mt-4">
      <h1 className="mb-4 text-center">Welcome to Little Coders!</h1>

      <div className="text-center">
        <Button
          variant="primary"
          className="px-4 py-2"
          onClick={() => navigate("/module-list")}
        >
          View Module List
        </Button>
      </div>
    </div>
  );
}

export default HomePage;
