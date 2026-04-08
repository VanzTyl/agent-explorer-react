import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RootLayout from './layouts/RootLayout.tsx';
import Workspace from './pages/Workspace.tsx'; // <-- 1. Import Workspace
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Workspace />, // <-- 2. Set Workspace as the default view
      },
      // Note: If you still want to keep your HomePage, you can move it to a specific path:
      // {
      //   path: 'home',
      //   element: <HomePage />,
      // },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
);