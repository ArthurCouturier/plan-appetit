import { useContext } from "react";
import { AuthContext } from "../../components/authentication/AuthProvider";

export default function useAuth() {
    return useContext(AuthContext);
}
