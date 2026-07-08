import Home from './Components/Main/Home';
import About from './Components/Main/About';
import Contact from './Components/Main/Contact';
import AuthModule from './Components/Auth/Auth.jsx';
import AuthLogin from './Components/Auth/AuthLogin.jsx';
import AuthLogout from './Components/Auth/AuthLogout.jsx';
import AuthRegister from './Components/Auth/AuthRegister.jsx';
import ProtectedRoute from './Service/ProtectedRoute.jsx';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';

function App() {
  return (
    // Uses React routing for best performance
    <Router>
      <nav>
        <Link to="/authenticated">Home</Link>
        <Link to="/authenticated/about">About</Link>
        <Link to="/authenticated/contact">Contact</Link>
        <Link to="/logout">Logout</Link>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<AuthModule />} />
          <Route path="/auth/register" element={<AuthRegister />} />
          <Route path="/auth/login" element={<AuthLogin />} />
          <Route path="/logout" element={<AuthLogout />} />

          <Route
            path="/authenticated"
            element={<ProtectedRoute element={Home} />}
          />
          <Route
            path="/authenticated/about"
            element={<ProtectedRoute element={About} />}
          />
          <Route
            path="/authenticated/contact"
            element={<ProtectedRoute element={Contact} />}
          />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
