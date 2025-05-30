import { Form, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function Profile() {
    return (
        <div id="wd-profile-screen" >
            <h3>Profile</h3>
            <Form>

                <Form.Group as={Row} className="mb-2" controlId="wd-username">
                    <Form.Label column sm="3">Username</Form.Label>
                    <Col>
                        <Form.Control defaultValue="alice" placeholder="Username" />
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-2" controlId="wd-password">
                    <Form.Label column sm="3">Password</Form.Label>
                    <Col>
                        <Form.Control type="password" defaultValue="123" placeholder="Password" />
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-2" controlId="wd-firstname">
                    <Form.Label column sm="4">First Name</Form.Label>
                    <Col>
                        <Form.Control defaultValue="Alice" placeholder="First Name" />
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-2" controlId="wd-lastname">
                    <Form.Label column sm="4">Last Name</Form.Label>
                    <Col>
                        <Form.Control defaultValue="Wonderland" placeholder="Last Name" />
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-2" controlId="wd-dob">
                    <Form.Label column sm="5">Date of Birth</Form.Label>
                    <Col>
                        <Form.Control type="date" defaultValue="2000-01-01" />
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-2" controlId="wd-email">
                    <Form.Label column sm="3">Email</Form.Label>
                    <Col>
                        <Form.Control type="email" defaultValue="alice@wonderland" placeholder="Email" />
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3" controlId="wd-role">
                    <Form.Label column sm="5">Account Type</Form.Label>
                    <Col>
                        <Form.Select defaultValue="FACULTY">
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                            <option value="FACULTY">Faculty</option>
                            <option value="STUDENT">Student</option>
                        </Form.Select>
                    </Col>
                </Form.Group>

                <Row>
                    <Col >
                        <Link id="wd-signout" to="/Kambaz/Account/Signin" className="btn btn-danger w-100">
                            Sign out
                        </Link>
                    </Col>
                </Row>

            </Form>
        </div>
    );
}
