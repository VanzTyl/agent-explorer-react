import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RootLayout from './layouts/RootLayout.tsx';
import Workspace from './pages/Workspace.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The RootLayout wraps everything and provides the sidebar/context menus */}
        <Route path="/" element={<RootLayout />}>
          
          {/* The 'index' route renders Workspace inside the layout's <Outlet /> when at "/" */}
          <Route index element={<Workspace />} />
          
          {/* We can add more routes here later, e.g., an individual agent chat view */}
          {/* <Route path="agent/:id" element={<AgentChat />} /> */}
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;