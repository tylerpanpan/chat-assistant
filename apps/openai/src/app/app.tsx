// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.scss';
import { QueryClientProvider, QueryClient } from 'react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import Chat from './views/Chat';
import { AuthProvider } from './provider/AuthProvider';
import FeedbackProvider from './components/Feedback';
import { AudioProvider } from './provider/AudioProvider';

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
    }
  ]);

  return (
    <>
      <CssBaseline />
      <QueryClientProvider client={client}>
        <FeedbackProvider>
          <AuthProvider>
            <AudioProvider>
              <RouterProvider router={router} />
            </AudioProvider>
          </AuthProvider>
        </FeedbackProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
