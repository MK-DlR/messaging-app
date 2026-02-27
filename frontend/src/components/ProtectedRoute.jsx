// frontend/src/components/ProtectedRoute.jsx

// imports
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
    const token = localStorage.getItem("token");

    // check for token in localStorage
    if (token) {
        return children;
    } else {
        // redirect to login
        return <Navigate to="/login" />
    }
}

export default ProtectedRoute;
