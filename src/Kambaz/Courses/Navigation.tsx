import { Link, useLocation, useParams } from "react-router-dom";
import { ListGroup } from "react-bootstrap";

export default function CourseNavigation() {
    const { pathname } = useLocation();
    const { cid } = useParams();
    const links = ["Home", "Modules", "Piazza", "Zoom", "Assignments", "Quizzes", "Grades", "People"];

    return (
        <ListGroup id="wd-courses-navigation" className="fs-5 rounded-0 wd">
            {links.map((link) => {
                const path = `/Kambaz/Courses/${cid}/${link}`;
                const id = `wd-course-${link.toLowerCase()}-link`;
                return (
                    <ListGroup.Item
                        key={link}
                        as={Link}
                        to={path}
                        id={id}
                        className={`border-0 ${pathname.includes(link) ? "active" : "text-danger"}`}>
                        {link}
                    </ListGroup.Item>
                );
            })}
        </ListGroup>
    );
}
