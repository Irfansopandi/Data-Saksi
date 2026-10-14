import React, { useState } from 'react';
import FormPage from './pages/FormPage';
import SuccessPage from './pages/SuccessPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

function App() {
  const [successData, setSuccessData] = useState(null);

  const handleSuccess = (data) => {
    setSuccessData(data);
  };

  const handleNewInput = () => {
    setSuccessData(null);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-vh-100">
      {successData ? (
        <SuccessPage result={successData} onNewInput={handleNewInput} />
      ) : (
        <FormPage onSuccess={handleSuccess} />
      )}
    </div>
  );
}

export default App;
