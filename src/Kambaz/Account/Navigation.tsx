import { Link, useLocation } from "react-router-dom";
export default function AccountNavigation() {
    const location = useLocation().pathname;

    return (
        <div id="wd-account-navigation" className="wd list-group fs-5 rounded-0">
            <Link to="/Kambaz/Account/Signin" id="wd-account-signin-link"
            className={"list-group-item border border-0 " + (location === "/Kambaz/Account/Signin" ? "active" : "text-danger")}> Signin </Link>
            <Link to="/Kambaz/Account/Signup" id="wd-account-signup-link"
            className={"list-group-item border border-0 " + (location === "/Kambaz/Account/Signup" ? "active" : "text-danger")}> Signup </Link>
            <Link to="/Kambaz/Account/Profile" id="wd-account-profile-link"
            className={"list-group-item border border-0 " + (location === "/Kambaz/Account/Profile" ? "active" : "text-danger")}> Profile </Link>
        </div>
);}
    
