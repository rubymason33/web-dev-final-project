// import { Routes, Route, Navigate } from "react-router";
// import Account from "./Account";
// import Dashboard from "./Dashboard";
// import KambazNavigation from "./Navigation";
// import Courses from "./Courses";
// import "./styles.css";
// export default function Kambaz() {
//     return (
//         <div id="wd-kambaz">
//             <KambazNavigation />
//             <div className="wd-main-content-offset p-3">
//                 <Routes>
//                     <Route path="/" element={<Navigate to="Account" />} />
//                     <Route path="/Account/*" element={<Account />} />
//                     <Route path="/Dashboard" element={<Dashboard />} />
//                     <Route path="/Courses" element={<Dashboard />} />
//                     <Route path="/Courses/:cid/*" element={<Courses />} />
//                     <Route path="/Calendar" element={<h1>Calendar</h1>} />
//                     <Route path="/Inbox" element={<h1>Inbox</h1>} />
//                 </Routes>
//             </div>
//         </div>
// );}
  
import { Routes, Route, Navigate } from "react-router";
import Account from "./Account";
import Dashboard from "./Dashboard";
import KambazNavigation from "./Navigation";
import Courses from "./Courses";
import "./styles.css";
import ProtectedRoute from "./Account/ProtectedRoute";
import Session from "./Account/Session";
import * as courseClient from "./Courses/client";
import * as userClient from "./Account/client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function Kambaz() {
    // handle an error with not displaying null courses
    const defaultCourse = {
        _id: "",
        title: "",
        description: "",
        number: "",
        startDate: "",
        endDate: "",
        department: "",
        credits: 0,
        image: "",
    };
    const [course, setCourse] = useState<any>(defaultCourse);
    const [courses, setCourses] = useState<any[]>([]);
    const { currentUser } = useSelector((state: any) => state.accountReducer);
    const [enrolling, setEnrolling] = useState<boolean>(false);
    const findCoursesForUser = async () => {
        try {
            const courses = await userClient.findCoursesForUser(currentUser._id);
            setCourses(courses);
        } catch (error) {
            console.error(error);
        }
    };
    const updateEnrollment = async (courseId: string, enrolled: boolean) => {
        if (enrolled) {
            await userClient.enrollIntoCourse(currentUser._id, courseId);
        } else {
            await userClient.unenrollFromCourse(currentUser._id, courseId);
        }
        setCourses(
            courses.map((course) => {
            if (course._id === courseId) {
                return { ...course, enrolled: enrolled };
            } else {
                return course;
            }
            })
        );
    };
    const fetchCourses = async () => {
        try {
            const allCourses = await courseClient.fetchAllCourses();
            const enrolledCourses = await userClient.findCoursesForUser(currentUser._id);
            const courses = allCourses.map((course: any) => {
                if (enrolledCourses.find((c: any) => c._id === course._id)) {
                    return { ...course, enrolled: true };
                } else {
                    return course;
                }
            });
            setCourses(courses);
        } catch (error) {
            console.error(error);
        }
    };
    useEffect(() => {
        if (enrolling) {
            fetchCourses();
        } else {
            findCoursesForUser();
        }
    }, [currentUser, enrolling]);

    const addNewCourse = async (course: any) => {
        try {
            const newCourse = await courseClient.createCourse(course);
            await fetchCourses();
            setCourses([...courses, newCourse]);
        } catch (error) {
            console.error("Failed to add course:", error);
        }
    };
    const deleteCourse = async (courseId: string) => {
        const status = await courseClient.deleteCourse(courseId);
        await fetchCourses();
        setCourses(courses.filter((course) => course._id !== courseId));
        console.log("Delete status:", status);
    };
    const updateCourse = async (course: any) => {
        await courseClient.updateCourse(course);
        await fetchCourses();
        setCourses(courses.map((c) => {
            if (c._id === course._id) { return course; }
            else { return c; }
        }));
    };

    return (
        <Session>
            <div id="wd-kambaz">
                <KambazNavigation />
                <div className="wd-main-content-offset p-3">
                    <Routes>
                        <Route path="/" element={<Navigate to="Account" />} />
                        <Route path="/Account/*" element={<Account />} />
                        <Route path="/Dashboard" element={
                            <ProtectedRoute>
                                <Dashboard 
                                    courses={courses}
                                    course={course}
                                    setCourse={setCourse}
                                    addNewCourse={addNewCourse}
                                    deleteCourse={deleteCourse}
                                    updateCourse={updateCourse}
                                    enrolling={enrolling}
                                    setEnrolling={setEnrolling}
                                    updateEnrollment={updateEnrollment}
                                />
                            </ProtectedRoute>
                        } />
                        <Route path="/Courses/:cid/*" element={<ProtectedRoute><Courses/></ProtectedRoute>} />
                        <Route path="/Calendar" element={<h1>Calendar</h1>} />
                        <Route path="/Inbox" element={<h1>Inbox</h1>} />
                    </Routes>
                </div>
            </div>
        </Session>
        
);}
  