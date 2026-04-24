import { Router } from './Router';
import { useSocket } from '../hooks/useSocket';

export const App = () => {
  useSocket(); // Initialize socket connection globally
  return <Router />;
};
