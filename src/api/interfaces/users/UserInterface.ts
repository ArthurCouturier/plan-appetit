import { UUIDTypes } from "uuid";

export default interface USerInterface {
    uuid: UUIDTypes;
    email: string;
    pseudo: string;
    token: string;
}
