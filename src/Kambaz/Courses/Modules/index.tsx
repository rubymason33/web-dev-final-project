import ModuleControlButtons from "./ModuleControlButtons";
import ModulesControls from "./ModulesControls"
import LessonControlButtons from "./LessonControlButtons";
import * as db from "../../Database";
import { ListGroup } from "react-bootstrap";
import { BsGripVertical } from "react-icons/bs";
import { useParams } from "react-router";

export default function Modules() {
    const { cid } = useParams();
    const modules = db.modules;
    return (
        <div id="wd-module-page">
            <ModulesControls /><br /><br /><br /><br />
            <ListGroup id="wd-modules" className="rounded-0">
                {modules 
                .filter((module: any) => module.course === cid)
                .map((module: any) => (
                <ListGroup.Item className="wd-module p-0 mb-5 fs-5 border-gray">
                    <div className="wd-title p-3 ps-2 bg-secondary">
                    <BsGripVertical className="me-2 fs-3" /> {module.name} <ModuleControlButtons />
                    </div>
                    {module.lessons && (
                    <ListGroup className="wd-lessons rounded-0">
                        {module.lessons.map((lesson: any) => (
                        <ListGroup.Item className="wd-lesson p-3 ps-1">
                            <BsGripVertical className="me-2 fs-3" /> {lesson.name} <LessonControlButtons />
                        </ListGroup.Item>
                    ))}</ListGroup>)}
                </ListGroup.Item>))}
            </ListGroup>
        </div>
    );
}
  
  