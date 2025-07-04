// import CourseNavigation from "./Navigation";
// import Modules from "./Modules";
// import Home from "./Home";
// import Assignments from "./Assignments";
// import AssignmentEditor from "./Assignments/Editor";
// import { courses } from "../Database";
// import { Navigate, Route, Routes, useLocation, useParams } from "react-router";
// import { FaAlignJustify } from "react-icons/fa";
// import PeopleTable from "./People/Table";
// import Quizzes from "./Quizzes";
// import QuizDetails from "./Quizzes/QuizDetails";

// export default function Courses() {
//     const { cid } = useParams();
//     const course = courses.find((course) => course._id === cid);
//     const {pathname} = useLocation();
//     return (
//         <div id="wd-courses">
//             <h2 className="text-danger">
//                 <FaAlignJustify className="me-4 fs-4 mb-1"></FaAlignJustify>
//                 {course && course.number + "." + course.name} &gt; {pathname.split("/")[4]}
//             </h2>
//             <hr />
//             <div className="d-flex">
//                 <div className="d-none d-md-block">
//                     <CourseNavigation />
//                 </div>
//                 <div className="flex-fill">
//                     <Routes>
//                         <Route path="/" element={<Navigate to="Home" />} />
//                         <Route path="Home" element={<Home />} />
//                         <Route path="Modules" element={<Modules />} />
//                         <Route path="Assignments" element={<Assignments />} />
//                         <Route path="Assignments/:aid" element={<AssignmentEditor />} />
//                         <Route path="Piazza" element={<h2>Piazza</h2>} />
//                         <Route path="Zoom" element={<h2>Zoom</h2>} />
//                         <Route path="Quizzes" element={<h2><Quizzes /></h2>} />
//                         <Route path="Quizzes/:qid" element={<h2><QuizDetails /></h2>} />
//                         <Route path="Grades" element={<h2>Grades</h2>} />
//                         <Route path="People" element={<PeopleTable />} />
//                     </Routes>
//                 </div>
//             </div>
//         </div>
//     );
// }

import CourseNavigation from "./Navigation";
import Modules from "./Modules";
import Home from "./Home";
import Assignments from "./Assignments";
import AssignmentEditor from "./Assignments/Editor";
import { Navigate, Route, Routes, useLocation, useParams } from "react-router";
import { FaAlignJustify } from "react-icons/fa";
import { useEffect, useState } from "react";
import * as coursesClient from "./client"
import People from "./People/People";
import Quizzes from "./Quizzes";
import QuizDetails from "./Quizzes/QuizDetails";
import QuizEditor from "./Quizzes/Editor";
import QuizTaker from "./Quizzes/QuizTaker";
import QuizScoreView from "./Quizzes/QuizScoreView";

export default function Courses() {
    const { cid } = useParams();
    const {pathname} = useLocation();
    const [allCourses, setAllCourses] = useState<any[]>([]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await coursesClient.fetchAllCourses();
                setAllCourses(data);
            } catch (error) {
                console.error("Failed to fetch courses:", error);
                setAllCourses([]);
            }
        };
        fetchCourses();
    }, []);

    const course = allCourses.find((course: any) => course._id === cid);

    if (!course) {
        return <h2>Loading course...</h2>;
    }

    return (
        <div id="wd-courses">
            <h2 className="text-danger">
                <FaAlignJustify className="me-4 fs-4 mb-1"></FaAlignJustify>
                {course && course.number + "." + course.title} &gt; {pathname.split("/")[4]}
            </h2>
            <hr />
            <div className="d-flex">
                <div className="d-none d-md-block">
                    <CourseNavigation />
                </div>
                <div className="flex-fill">
                    <Routes>
                        <Route path="/" element={<Navigate to="Home" />} />
                        <Route path="Home" element={<Home />} />
                        <Route path="Modules" element={<Modules />} />
                        <Route path="Assignments" element={<Assignments />} />
                        <Route path="Assignments/:aid" element={<AssignmentEditor />} />
                        <Route path="Piazza" element={<h2>Piazza</h2>} />
                        <Route path="Zoom" element={<h2>Zoom</h2>} />
                        <Route path="Quizzes" element={<h2><Quizzes /></h2>} />
                        <Route path="Quizzes/:qid/edit" element={<h2><QuizEditor /></h2>} />
                        <Route path="Quizzes/:qid/preview" element={<QuizTaker />} />
                        <Route path="Quizzes/:qid/take" element={<QuizTaker />} />
                        <Route path="Quizzes/:qid/score" element={<h2><QuizScoreView /></h2>} />
                        <Route path="Quizzes/:qid" element={<h2><QuizDetails /></h2>} />
                        <Route path="Grades" element={<h2>Grades</h2>} />
                        <Route path="People" element={<People />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
}
  
  