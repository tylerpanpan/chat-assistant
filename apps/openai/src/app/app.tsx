import { QueryClientProvider, QueryClient } from 'react-query';
import { RouterProvider } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import router from './router';
import { AuthProvider } from './provider/AuthProvider';
import FeedbackProvider from './components/Feedback';
import { AudioProvider } from './provider/AudioProvider';
import './app.module.scss';

function App() {
  const client = new QueryClient();

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
