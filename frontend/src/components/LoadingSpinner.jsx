// src/components/LoadingSpinner.jsx
export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-orange-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600 mx-auto mb-4"></div>
        <p className="text-lg font-medium text-slate-700">Loading...</p>
      </div>
    </div>
  );
}