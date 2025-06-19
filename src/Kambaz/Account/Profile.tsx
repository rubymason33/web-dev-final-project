import { Form, Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { setCurrentUser } from "./reducer";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as client from "./client";

export default function Profile() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const signOut = async () => {
        await client.signout();
        dispatch(setCurrentUser(null));
        navigate("/Kambaz/Account/Signin");
    };
    const [profile, setProfile] = useState<any>({});
    const { currentUser } = useSelector((state: any) => state.accountReducer);
    const updateProfile = async () => {
        const updatedProfile = await client.updateUser(profile);
        dispatch(setCurrentUser(updatedProfile));
    };

    const fetchProfile = () => {
        if (!currentUser) return navigate("/Kambaz/Account/Signin");

        // Format dob if it exists
        const formattedDob = currentUser.dob
            ? new Date(currentUser.dob).toISOString().slice(0, 10)
            : "";

        setProfile({
            ...currentUser,
            dob: formattedDob
        });
            
    };
    useEffect(() => { fetchProfile(); }, []);

    return (
        <div id="wd-profile-screen" >
            <h3>Profile</h3>
            {profile && (
                <Form>

                    <Form.Group as={Row} className="mb-2" controlId="wd-username">
                        <Form.Label column sm="3">Username</Form.Label>
                        <Col>
                            <Form.Control defaultValue={profile.username} placeholder="Username" 
                                onChange={(e) => setProfile({ ...profile, username:  e.target.value })}
                            />
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-2" controlId="wd-password">
                        <Form.Label column sm="3">Password</Form.Label>
                        <Col>
                            <Form.Control type="password" defaultValue={profile.password} placeholder="Password" 
                                onChange={(e) => setProfile({ ...profile, password:  e.target.value })}
                            />
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-2" controlId="wd-firstname">
                        <Form.Label column sm="4">First Name</Form.Label>
                        <Col>
                            <Form.Control defaultValue={profile.firstName} placeholder="First Name" 
                                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                            />
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-2" controlId="wd-lastname">
                        <Form.Label column sm="4">Last Name</Form.Label>
                        <Col>
                            <Form.Control defaultValue={profile.lastName} placeholder="Last Name" 
                                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                            />
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-2" controlId="wd-dob">
                        <Form.Label column sm="5">Date of Birth</Form.Label>
                        <Col>
                            <Form.Control
                                type="date"
                                value={profile.dob || ""}
                                onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                            />
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-2" controlId="wd-email">
                        <Form.Label column sm="3">Email</Form.Label>
                        <Col>
                            <Form.Control type="email" defaultValue={profile.email} placeholder="Email" 
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            />
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3" controlId="wd-role">
                        <Form.Label column sm="5">Account Type</Form.Label>
                        <Col>
                            <Form.Select value={profile.role} 
                                onChange={(e) => setProfile({ ...profile, role:  e.target.value })}
                                className="form-control mb-2" id="wd-role"
                            >
                                <option value="USER">User</option>
                                <option value="ADMIN">Admin</option>
                                <option value="FACULTY">Faculty</option>
                                <option value="STUDENT">Student</option>
                            </Form.Select>
                        </Col>
                    </Form.Group>

                    <Row>
                        <Col >
                            <Button onClick={updateProfile} className="btn btn-primary w-100 mb-2"> Update </Button>
                            <Button
                                id="wd-signout-btn"
                                className="btn btn-danger w-100"
                                onClick={signOut}
                            >
                                Sign out
                            </Button>
                        </Col>
                    </Row>
                </Form>
            )}
            
        </div>
    );
}
