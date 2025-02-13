import { SetStateAction } from "react";
import UserInterface from "./UserInterface";

export default interface AuthContextInterface {
    user: UserInterface | null | undefined;
    login: (userData: SetStateAction<UserInterface | null | undefined>) => void;
    logout: () => void;
}