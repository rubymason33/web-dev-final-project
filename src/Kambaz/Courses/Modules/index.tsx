import ModuleControlButtons from "./ModuleControlButtons";
import ModulesControls from "./ModulesControls"
import LessonControlButtons from "./LessonControlButtons";
import { FormControl, ListGroup } from "react-bootstrap";
import { BsGripVertical } from "react-icons/bs";
import { useParams } from "react-router";
import { useState, useEffect } from "react";
import { addModule, editModule, updateModule, deleteModule, setModules } from "./reducer";
import { useSelector, useDispatch } from "react-redux";
import * as coursesClient from "../client";
import * as modulesClient from "./client";

export default function Modules() {
    const { cid } = useParams();
    const [moduleName, setModuleName] = useState("");
    const { modules } = useSelector((state: any) => state.modulesReducer);
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state: any) => state.accountReducer);
    const isFaculty = currentUser?.role === "FACULTY";
    // const addModuleHandler = async () => {
    //     const newModule = await coursesClient.createModuleForCourse(cid!, {
    //         name: moduleName,
    //         course: cid,
    //     });
    //     dispatch(addModule(newModule));
    //     setModuleName("");
    // };
    const addModuleHandler = async () => {
        try {
            const newModuleData = {
                name: moduleName,
                course: cid,
            };
            const savedModule = await coursesClient.createModuleForCourse(cid!, newModuleData);
            dispatch(addModule(savedModule));
            setModuleName("");
            // get a refresh
            const updatedModules = await coursesClient.findModulesForCourse(cid!);
            dispatch(setModules(updatedModules));
        } catch (err) {
            console.error("Failed to create module:", err);
        }
    };

    const updateModuleHandler = async (module: any) => {
        await modulesClient.updateModule(module);
        dispatch(updateModule(module));
    };
    const fetchModulesForCourse = async () => {
        const modules = await coursesClient.findModulesForCourse(cid!);
        dispatch(setModules(modules));
    };
    useEffect(() => {
        fetchModulesForCourse();
    }, [cid]);
    const deleteModuleHandler = async (moduleId: string) => {
        await modulesClient.deleteModule(moduleId);
        dispatch(deleteModule(moduleId));
    };
    
    return (
        <div id="wd-module-page">
            {isFaculty && (
            <ModulesControls
                setModuleName={setModuleName}
                moduleName={moduleName}
                addModule={addModuleHandler}
                />
            )}
            <br /><br /><br /><br />
            <ListGroup id="wd-modules" className="rounded-0">
                {modules 
                // .filter((module: any) => module.course === cid)
                .map((module: any) => (
                <ListGroup.Item className="wd-module p-0 mb-5 fs-5 border-gray">
                    <div className="wd-title p-3 ps-2 bg-secondary">
                    <BsGripVertical className="me-2 fs-3" />
                    {!module.editing && module.name}
                    { module.editing && isFaculty && (
                        <FormControl className="w-50 d-inline-block"
                            onChange={(e) => 
                                updateModuleHandler({ ...module, name: e.target.value })
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    updateModuleHandler({ ...module, editing: false });
                                }
                            }}
                            defaultValue={module.name}
                        />
                    )}
                    {isFaculty && (
                        <ModuleControlButtons
                            moduleId={module._id}
                            deleteModule={(moduleId) => deleteModuleHandler(moduleId)}
                            editModule={(moduleId) => dispatch(editModule(moduleId))}
                        />
                    )}
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
  