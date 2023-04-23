// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.scss';
import { QueryClientProvider, QueryClient } from 'react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import Chat from './views/Chat';
import Registry from './views/Registry';
import { AuthProvider } from './provider/AuthProvider';
import FeedbackProvider from './components/Feedback';

export function App() {
  const client = new QueryClient();

  const router = createBrowserRouter([
    {
      path: '/',
      children: [
        {
          index: true,
          path: '',
          element: <Chat />,
        },
      ],
    },
    {
      path: '/registry',
      children: [
        {
          index: true,
          path: '',
          element: <Registry />,
        },
      ],
    }
  ]);

  return (
    <>
      <CssBaseline />
      <QueryClientProvider client={client}>
        <FeedbackProvider>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </FeedbackProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
