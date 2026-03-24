// frontend/src/helpers/useApi.js

// imports
import { useContext } from "react";
import { ApiContext } from "../components/ApiProvider";

function useApi() {
  return useContext(ApiContext);
}

export default useApi;
