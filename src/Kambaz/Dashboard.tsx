// import { Link } from "react-router-dom";
// import { Row, Col, Card, Button,  } from "react-bootstrap";
// import * as db from "./Database"

// export default function Dashboard() {
//     const courses = db.courses;
//     return (
//         <div id="wd-dashboard">
//             <h1 id="wd-dashboard-title">Dashboard</h1> <hr />
//             <h2 id="wd-dashboard-published">Published Courses ({courses.length})</h2> <hr />
//             <div id="wd-dashboard-courses">
//                 <Row xs={1} md={5} className="g-4">
//                     {courses.map((course) => (
//                     <Col className="wd-dashboard-course" style={{ width: "300px" }}>
//                         <Card>
//                             <Link to={`/Kambaz/Courses/${course._id}/Home`}
//                                 className="wd-dashboard-course-link text-decoration-none text-dark" >
//                                 <Card.Img src={course.image} variant="top" width="100%" height={160} />
//                                 <Card.Body className="card-body">
//                                     <Card.Title className="wd-dashboard-course-title text-nowrap overflow-hidden">
//                                         {course.name}
//                                     </Card.Title>
//                                     <Card.Text className="wd-dashboard-course-description overflow-hidden" style={{ height: "100px" }}>
//                                         {course.description}
//                                     </Card.Text>
//                                     <Button variant="primary"> Go </Button>
//                                 </Card.Body>
//                             </Link>
//                         </Card>
//                     </Col>
//                     ))}
//                 </Row>
//             </div>
//         </div>
//     );
// }


import { Link } from "react-router-dom";
import { Row, Col, Card, Button, FormControl,  } from "react-bootstrap";
import { useSelector } from "react-redux";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
axios.defaults.withCredentials = true;

export default function Dashboard({
    courses,
    course,
    setCourse,
    addNewCourse,
    deleteCourse,
    updateCourse,
    enrolling,
    setEnrolling,
    updateEnrollment
}: {
    courses: any[];
    course: any;
    setCourse: React.Dispatch<any>;
    addNewCourse: (course: any) => void;
    deleteCourse: (courseId: string) => void;
    updateCourse: (course: any) => void;
    enrolling: boolean;
    setEnrolling: (enrolling: boolean) => void;
    updateEnrollment: (courseId: string, enrolled: boolean) => void;
}) {

    const { currentUser } = useSelector((state: any) => state.accountReducer);
    const isFaculty = currentUser?.role?.toUpperCase() === "FACULTY";

    const handleAddNewCourse = () => {
        const newCourse = {
            ...course,
            _id: uuidv4(),
            image: course.image || "/images/NEU.png",
        };
        addNewCourse(newCourse);

        setCourse({
            _id: "",
            title: "",
            description: "",
            number: "",
            startDate: "",
            endDate: "",
            department: "",
            credits: 0,
            image: "",
        });
    };

    const handleUpdateCourse = () => {
        updateCourse(course);
        setCourse({
        _id: "",
        title: "",
        description: "",
        number: "",
        startDate: "",
        endDate: "",
        department: "",
        credits: 0,
        image: "",
        });
    };

    const handleDeleteCourse = (id: string) => {
        deleteCourse(id);
    };

    return (
        <div id="wd-dashboard">
            <h1 id="wd-dashboard-title">Dashboard</h1> <hr />
        

            {/* enroll button for non faculty */}
            {!isFaculty && (
                <Button
                    className="float-end"
                    variant="primary"
                    onClick={() => setEnrolling(!enrolling)}
                >
                    {enrolling ? "My Courses" : "All Courses"}
                </Button>
            )}
            {/* new course permissions for faculty*/}
            {isFaculty && (
                <>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="mb-0">New Course</h5>
                        <div>
                            <Button
                                className="btn btn-warning me-2"
                                onClick={handleUpdateCourse}
                                id="wd-update-course-click"
                            >
                                Update
                            </Button>
                            <Button
                                className="btn btn-primary"
                                id="wd-add-new-course-click"
                                onClick={handleAddNewCourse}
                            >
                                Add
                            </Button>
                        </div>
                    </div>
                    <Row className="mb-2">
                        <Col>
                            <FormControl
                            value={course.title}
                            onChange={(e) => setCourse({ ...course, title: e.target.value })}
                            placeholder="New Course"
                            />
                        </Col>
                        <Col>
                            <FormControl
                            value={course.number}
                            onChange={(e) => setCourse({ ...course, number: e.target.value })}
                            placeholder="New Course Number"
                            />
                        </Col>
                    </Row>

                    <FormControl
                    value={course.description}
                    rows={3}
                    as="textarea"
                    className="mb-2"
                    onChange={(e) => setCourse({ ...course, description: e.target.value })}
                    placeholder="New Description"
                    />

                    <FormControl
                    type="file"
                    className="mb-2"
                    onChange={(e) => {
                        const target = e.target as HTMLInputElement; 
                        const file = target.files?.[0];
                        if (file) {
                        const imageUrl = URL.createObjectURL(file);
                        setCourse({ ...course, image: imageUrl });
                        }
                    }}
                    placeholder="Upload Image"
                    />

                    <hr />
                </>
            )}

            {/* published course permissions */}
            <h2 id="wd-dashboard-published">
                {enrolling ? "All Courses" : "My Courses"} ({courses.length})
            </h2>
            <hr />
            <div id="wd-dashboard-courses">
                <Row xs={1} md={5} className="g-4">
                    {courses.map((course: any) => (
                        <Col key={course._id} className="wd-dashboard-course" style={{ width: "300px" }}>
                            <Card>
                                <Card.Img
                                    src={course.image}
                                    variant="top"
                                    width="100%"
                                    height={160}
                                />
                                <Card.Body className="card-body">
                                    <Card.Title className="wd-dashboard-course-title text-nowrap overflow-hidden text-primary">
                                        {course.title || "Untitled Course"}
                                    </Card.Title>
                                    <Card.Text
                                        className="wd-dashboard-course-description overflow-hidden"
                                        style={{ height: "100px" }}
                                    >
                                        {course.description}
                                    </Card.Text>
                                    <Link to={`/Kambaz/Courses/${course._id}/Home`} 
                                        className="wd-dashboard-course-link text-decoration-none text-dark"
                                    >
                                        <Button variant="primary">Go</Button>
                                    </Link>
                                        

                                    {/* Enroll/Unenroll Buttons */}
                                    {!isFaculty && enrolling && (
                                        <Button onClick={(e) => {
                                                e.preventDefault();
                                                updateEnrollment(course._id, !course.enrolled);
                                            }}
                                            className={`btn ${ course.enrolled ? "btn-danger" : "btn-success" } float-end`} 
                                        >
                                            {course.enrolled ? "Unenroll" : "Enroll"}
                                        </Button>
                                    )}
                                    {/* other buttons only for FACULTY */}
                                    {isFaculty && (
                                        <>
                                            <Button
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    handleDeleteCourse(course._id);
                                                }}
                                                className="btn btn-danger float-end"
                                                id="wd-delete-course-click"
                                            >
                                                Delete
                                            </Button>
                                            <Button
                                                id="wd-edit-course-click"
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    setCourse(course);
                                                }}
                                                className="btn btn-warning me-2 float-end"
                                            >
                                                Edit
                                            </Button>
                                        </>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </div>
    );
}
