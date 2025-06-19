import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useParams } from "react-router-dom";
import { setEnrollments } from "../Enrollments/reducer";
import * as accountsClient from "./client.ts";

export default function ProtectedRoute({ children }: { children: any }) {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state: any) => state.accountReducer);
    const enrollments = useSelector((state: any) => state.enrollmentsReducer.enrollments);
    const { cid } = useParams();
    const [loading, setLoading] = useState(true);

    // get the enrollments
    useEffect(() => {
        const fetchEnrollments = async () => {
            if (currentUser) {
                try {
                    const data = await accountsClient.findCoursesForUser(currentUser._id);
                    dispatch(setEnrollments(data));
                } catch (err) {
                    console.error("Failed to fetch enrollments", err);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchEnrollments();
    }, [currentUser, dispatch]);

    if (!currentUser) {
        return <Navigate to="/Kambaz/Account/Signin" />;
    }

    if (loading) {
        return <div>Loading enrollments...</div>;
    }

    if (cid) {
        const isEnrolled = enrollments.some((c: any) => c._id === cid);
        const isFaculty = currentUser.role === "FACULTY";

        if (!isEnrolled && !isFaculty) {
            return <Navigate to="/Kambaz/Dashboard" />;
        }
    }

    return children;
}
