import Kambaz from "./Kambaz";
import { HashRouter, Route, Routes, Navigate } from "react-router-dom";
import store from "./Kambaz/store";
import { Provider } from "react-redux";
export default function App() {
    return (
        <HashRouter>
            <Provider store={store}>
                <div>
                    <div style={{ marginLeft: '200px', padding: '20px' }}>
                        <h1>Web Dev Final Project</h1>
                        <p>Ruby, Afnan, Ashish</p>
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




