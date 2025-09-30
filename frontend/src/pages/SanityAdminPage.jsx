import React from 'react';
import SanityAdmin from '../components/SanityAdmin';

export default function SanityAdminPage(){
  return (
    <div style={{padding:20}}>
      <h2>Admin</h2>
      <SanityAdmin apiUrl={import.meta.env.VITE_API_URL || '/api'} />
    </div>
  );
}
