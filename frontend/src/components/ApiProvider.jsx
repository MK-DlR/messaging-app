// frontend/src/components/ApiProvider.jsx

// imports
import { useEffect, useState, createContext } from "react";
import pingServer from "../helpers/pingServer";

export const ApiContext = createContext();

const ApiProvider = ({ children }) => {
    const [isCheckingApi, setIsCheckingApi] = useState(true);
    const [isApiReady, setIsApiReady] = useState(false);

    useEffect(() => {
        let timeoutId;
        let delay = 5000; // start at 5 seconds
        const maxDelay = 30000; // cap at 30 seconds

        const checkServer = async () => {
            try {
                await pingServer();
                setIsApiReady(true);
                setIsCheckingApi(false);

                // reset delay when backend is reachable
                delay = 5000;
            } catch {
                setIsApiReady(false);
                setIsCheckingApi(false);

                // increase delay
                delay = Math.min(delay * 2, maxDelay);
            }

            // schedule next check using updated delay
            timeoutId = setTimeout(checkServer, delay)
        };

        // initial check
        checkServer();

        return () => clearTimeout(timeoutId);
    }, [])

    if (isCheckingApi) {
        return (
            <ApiContext.Provider value={{ isCheckingApi, isApiReady }}>
                {children}
            </ApiContext.Provider>
        );
    } else {
        return (
            <ApiContext.Provider value={{ isCheckingApi, isApiReady }}>
                {children}
            </ApiContext.Provider>
        );
    }
}

export default ApiProvider;