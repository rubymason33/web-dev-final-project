import { useState, useEffect } from "react";
import { useParams } from "react-router";
import PeopleTable from "../Courses/People/Table";
import * as client from "./client";
import { FormControl } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
export default function Users() {
    const [users, setUsers] = useState<any[]>([]);
    const [role, setRole] = useState("");
    const [name, setName] = useState("");
    const createUser = async () => {
        const user = await client.createUser({
            firstName: "New",
            lastName: `User${users.length + 1}`,
            username: `newuser${Date.now()}`,
            password: "password123",
            email: `email${users.length + 1}@neu.edu`,
            section: "S101",
            role: "STUDENT",
        });
        setUsers([...users, user]);
    };
    // const filterUsersByRole = async (role: string) => {
    //     setRole(role);
    //     if (role) {
    //         const users = await client.findUsersByRole(role);
    //         setUsers(users);
    //     } else {
    //         fetchUsers();
    //     }
    // };
    // const filterUsersByName = async (name: string) => {
    //     setName(name);
    //     if (name) {
    //         const users = await client.findUsersByPartialName(name);
    //         setUsers(users);
    //     } else {
    //         fetchUsers();
    //     }
    // };
    const { uid } = useParams();
    const fetchUsers = async () => {
        const users = await client.findAllUsers();
        setUsers(users);
    };
    // to filter by name and role
    const filterUsers = async (name: string, role: string) => {
        setName(name);
        setRole(role);
        if (!name && !role) {
            fetchUsers();
            return;
        }
        let users = await client.findAllUsers();
        if (role) {
            users = users.filter((u: any) => u.role === role);
        }
        if (name) {
            users = users.filter((u: any) =>
                `${u.firstName} ${u.lastName}`.toLowerCase().includes(name.toLowerCase())
            );
        }
        setUsers(users);
    };

    useEffect(() => {
        fetchUsers();
    }, [uid]);
    return (
        <div>
            <h3>Users</h3>
            <button onClick={createUser} className="float-end btn btn-danger wd-add-people">
                <FaPlus className="me-2" />
                Users
            </button>
            {/* to filter by name and role */}
            <FormControl
                value={name}
                onChange={(e) => filterUsers(e.target.value, role)}
                placeholder="Search people"
                className="float-start w-25 me-2 wd-filter-by-name"
            />
            <select
                value={role}
                onChange={(e) => filterUsers(name, e.target.value)}
                className="form-select float-start w-25 wd-select-role"
            >
                <option value="">All Roles</option>
                <option value="STUDENT">Students</option>
                <option value="TA">Assistants</option>
                <option value="FACULTY">Faculty</option>
                <option value="ADMIN">Administrators</option>
            </select>

            {/* <FormControl onChange={(e) => filterUsersByName(e.target.value)} placeholder="Search people"
            className="float-start w-25 me-2 wd-filter-by-name" />
            <select value={role} onChange={(e) =>filterUsersByRole(e.target.value)}
            className="form-select float-start w-25 wd-select-role" >
                <option value="">All Roles</option>
                <option value="STUDENT">Students</option>
                <option value="TA">Assistants</option>
                <option value="FACULTY">Faculty</option>
                <option value="ADMIN">Administrators</option>
            </select> */}
            <PeopleTable users={users} />
        </div>
    );
}

