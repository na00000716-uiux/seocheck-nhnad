import { QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcClient, queryClient } from './lib/trpc';
import { Home } from './pages/Home';
import { Toaster } from 'sonner';

function App() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Home />
        <Toaster position="top-right" />
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;
