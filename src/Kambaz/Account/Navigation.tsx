import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
export default function AccountNavigation() {
    const location = useLocation().pathname;
    const { currentUser } = useSelector((state: any) => state.accountReducer);
    const links = currentUser ? ["Profile"] : ["Signin", "Signup"];

    return (
        <div id="wd-account-navigation" className="wd list-group fs-5 rounded-0">
            {links.includes("Signin") && (
                <Link
                to="/Kambaz/Account/Signin"
                id="wd-account-signin-link"
                className={`list-group-item border-0 ${
                    location === "/Kambaz/Account/Signin" ? "active" : "text-danger"
                }`}
                >
                Signin
                </Link>
            )}

            {links.includes("Signup") && (
                <Link
                to="/Kambaz/Account/Signup"
                id="wd-account-signup-link"
                className={`list-group-item border-0 ${
                    location === "/Kambaz/Account/Signup" ? "active" : "text-danger"
                }`}
                >
                Signup
                </Link>
            )}

            {links.includes("Profile") && (
                <Link
                to="/Kambaz/Account/Profile"
                id="wd-account-profile-link"
                className={`list-group-item border-0 ${
                    location === "/Kambaz/Account/Profile" ? "active" : "text-danger"
                }`}
                >
                Profile
                </Link>
            )}

            {currentUser && currentUser.role === "ADMIN" && (
                <Link
                    to="/Kambaz/Account/Users"
                    className={`list-group-item border-0 ${
                        location === "/Kambaz/Account/Users" ? "active" : "text-danger"
                    }`}
                >
                    Users
                </Link>
            )}      
        </div>
);}
    
