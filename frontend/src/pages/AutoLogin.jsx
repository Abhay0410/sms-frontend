import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export default function AutoLogin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const performAutoLogin = async () => {
      const token = searchParams.get('token');

      if (!token) {
        navigate('/');
        return;
      }

      try {
        // 1. Decode JWT payload to get schoolId and role
        const payloadBase64 = token.split('.')[1];
        if (!payloadBase64) throw new Error("Invalid token format");
        
        const decodedPayload = JSON.parse(atob(payloadBase64));
        const { schoolId, id: adminId, role, isSuperAdmin, designation } = decodedPayload;

        if (!schoolId) {
          throw new Error('Invalid token: missing school reference.');
        }

        // 2. Set token in API and LocalStorage so subsequent requests work
        api.setToken(token);
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', role || 'admin');
        
        // Save FULL admin structure so AdminRoutes.jsx grants full access!
        localStorage.setItem(role || 'admin', JSON.stringify({ 
          _id: adminId, 
          role: role || 'admin',
          isSuperAdmin: isSuperAdmin !== undefined ? isSuperAdmin : true,
          designation: designation || 'Principal' // Force Principal designation as fallback
        }));

        // 3. Fetch the schools list to find the school's slug
        const schoolsResponse = await api.get('/api/schools');
        const fetchedSchools = schoolsResponse.data?.data?.schools || schoolsResponse.data?.data || schoolsResponse.data;
        const schools = Array.isArray(fetchedSchools) ? fetchedSchools : [];
        const school = schools.find(s => s._id === schoolId);

        if (!school) {
          throw new Error('School not found in the platform.');
        }

        // 4. Save the selected school to LocalStorage
        localStorage.setItem('selectedSchool', JSON.stringify(school));

        // 5. Construct the specific school slug and redirect
        const schoolSlug = school.slug || school.schoolName?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'default';
        
        // 6. We use window.location.href to force a full app reload so all Contexts/Hooks pick up the new LocalStorage values!
        window.location.href = `/school/${schoolSlug}/admin/admin-dashboard`;

      } catch (err) {
        console.error('AutoLogin error:', err);
        setError(err.message || 'Authentication failed. Please try logging in manually.');
      }
    };

    performAutoLogin();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-xl max-w-md w-full border border-gray-100">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Login Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => navigate('/')} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">Go to Homepage</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 font-medium text-lg">Securing your session...</p>
        <p className="text-gray-400 text-sm mt-2">Please wait while we log you in securely</p>
      </div>
    </div>
  );
}
