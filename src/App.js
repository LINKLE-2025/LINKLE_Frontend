import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/App.tsx
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import MapPage from "./pages/MapPage";
// import LoginPage from "./pages/auth/LoginPage";
// import SignupPage from "./pages/auth/SignupPage";
const App = () => {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: '/', element: _jsx(LandingPage, {}) }), _jsx(Route, { path: '/map', element: _jsx(MapPage, {}) })] }));
};
export default App;
