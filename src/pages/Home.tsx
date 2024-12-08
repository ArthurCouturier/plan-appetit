import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div>
            <h1>Home</h1>
            <p>This is the home page</p>
            <button className="rounded-md border-4 border-coutPurple bg-coutYellow">
                <Link to="/about">About Page</Link>
            </button>
        </div>
    )
}