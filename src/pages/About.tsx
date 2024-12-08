import { Link } from "react-router-dom";

export default function About() {
    return (
        <div>
            <h1>About</h1>
            <p>This is the about page</p>
            <button className="rounded-md border-4 border-coutPurple bg-coutYellow">
                <Link to="/">Home Page</Link>
            </button>
        </div>
    )
}