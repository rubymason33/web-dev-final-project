import { Table } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import { useParams } from "react-router-dom";
import * as db from "../../Database";
export default function PeopleTable() {
    const { cid } = useParams();
    const { users, enrollments } = db;

    const people = enrollments
    .filter((e: any) => e.course === cid)
    .map((e: any) => {
      const user = users.find((u: any) => u._id === e.user);
      return { ...user, ...e };
    });

    return (
        <div id="wd-people-table">
            <Table striped>
                <thead>
                    <tr><th>Name</th><th>Login ID</th><th>Section</th><th>Role</th><th>Last Activity</th><th>Total Activity</th></tr>
                </thead>
                <tbody>
                    {people.map((person: any) => (
                    <tr key={`${person.user}-${person.course}`}>
                    <td className="wd-full-name text-nowrap">
                        <FaUserCircle className="me-2 fs-4 text-secondary" />
                        {person.firstName} {person.lastName}
                    </td>
                    <td>{person.loginId}</td>
                    <td>{person.section}</td>
                    <td>{person.role}</td>
                    <td>{person.lastActivity}</td>
                    <td>{person.totalActivity}</td>
                    </tr>
                    ))}
                </tbody>
            </Table>
        </div> 
    );
}

