import Kambaz from "./Kambaz";
import { HashRouter, Route, Routes, Navigate } from "react-router-dom";
import store from "./Kambaz/store";
import { Provider } from "react-redux";
import { Button } from "react-bootstrap";
export default function App() {
    return (
        <HashRouter>
            <Provider store={store}>
                <div>
                    <div
                        style={{
                            marginLeft: "150px",
                            padding: "10px 20px",
                            backgroundColor: "whitesmoke",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <div>
                            <h5 className="mb-1">Final Project: Kambaz Quizzes</h5>
                            <p>Summer 1 2025 | Afnan Tuffaha, Ashish Thomas, Ruby Mason | Section 04</p>
                        </div>

                        <div className="me-2 ">
                            <Button
                                className="me-2"
                                size="sm"
                                variant="secondary"
                                href="https://github.com/rubymason33/web-dev-final-project-node"
                                target="_blank"
                            >
                                Node Repo
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                href="https://github.com/rubymason33/web-dev-final-project-react"
                                target="_blank"
                            >
                                React Repo
                            </Button>
                        </div>
                    </div>
                    <Routes>
                        <Route path="/" element={<Navigate to="Kambaz" />} />
                        <Route path="/Kambaz/*" element={<Kambaz />} />
                    </Routes>
                </div>
            </Provider>
            
        </HashRouter>
    );
}




