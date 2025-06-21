import { FaItalic } from "react-icons/fa";
import { FaUnderline } from "react-icons/fa";
import { AiOutlineFontColors } from "react-icons/ai";
import { FaHighlighter } from "react-icons/fa6";
import { HiDotsVertical } from "react-icons/hi";
import { FaChevronDown } from "react-icons/fa";

export default function EditingMenu() {
    return (
       <div className="ms-4" style={{ fontSize: "1rem" }}>
                <div className="d-flex gap-3">
                    <span>Edit</span> 
                    <span>View</span>
                    <span>Insert</span>
                    <span>Format</span>
                    <span>Tools</span>
                    <span>Table</span>
                </div> <br/>
                <div className="d-flex gap-5">
                    <h6>12pt<FaChevronDown/></h6> 
                    <h6>Paragraph<FaChevronDown/></h6> |
                    <h6 className="fw-bold">B</h6>
                    <FaItalic />
                    <FaUnderline />
                    <AiOutlineFontColors />
                    <FaHighlighter /> | 
                    <HiDotsVertical />
                </div>
        </div>
    );
}