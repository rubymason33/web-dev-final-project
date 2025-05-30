import { IoEllipsisVertical } from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";
export default function AssignmentControlButtons() {
    return (
        <div className="d-flex align-items-center gap-3 float-end">
            <div className="border rounded-pill px-3 py-2">
                <span>40% of Total</span>
            </div>
            <FaPlus />
            <IoEllipsisVertical className="fs-4"/>
      </div>
    );
}