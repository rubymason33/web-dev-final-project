import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as coursesClient from "../client.ts";
import PeopleTable from "./Table.tsx";

export default function People() {
    const { cid } = useParams();
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        const loadUsers = async () => {
            if (cid) {
                const data = await coursesClient.findUsersForCourse(cid);
                setUsers(data);
            }
        };
        loadUsers();
    }, [cid]);

    return (
        <div>
            <PeopleTable users={users} />
        </div>
    );
}
