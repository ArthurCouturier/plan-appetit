import { useContext } from "react";
import { AuthContext } from "../authentication/authContext";

export default function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth doit être utilisé dans un AuthProvider");
    }
    return context;
}
