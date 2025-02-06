import { SetStateAction } from "react";
import UserInterface from "./UserInterface";

export default interface AuthContextInterface {
    user: UserInterface | null;
    login: (userData: SetStateAction<UserInterface | null>) => void;
    logout: () => void;
}