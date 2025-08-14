import { Navigate } from 'react-router-dom';

function AIAssistantPage() {
  // Redirect the older AI assistant route to the consolidated Search page
  return <Navigate to="/search" replace />;
}

export default AIAssistantPage;
