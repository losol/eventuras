import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './routes/Home';
import ErrorPage from './routes/Error';
import Interaction from './routes/interaction/Interaction';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="/interaction/:uid" element={<Interaction />} />
      </Routes>
    </BrowserRouter>
  );
}
