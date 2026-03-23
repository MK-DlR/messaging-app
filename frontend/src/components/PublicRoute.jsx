// frontend/src/components/PublicRoute.jsx

// imports
import { Navigate } from "react-router-dom";

function PublicRoute({ children }) {
    const token = localStorage.getItem("token");

    // check for token in localStorage
    if (!token) {
        return children;
    } else {
        // redirect to home
        return <Navigate to="/" />
    }
}

export default PublicRoute;
