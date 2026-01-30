// pages/teacher/Teacher_Features/GetTeacherClassesAndSubjects.jsx - UPDATED
import { useEffect, useState } from "react";
import api, { API_ENDPOINTS } from "../../../services/api";
import { toast } from "react-toastify";
import BackButton from "../../../components/BackButton";

export default function GetTeacherClassesAndSubjects() {
  const [data, setData] = useState({ 
    classes: [], 
    subjects: [],
    teacher: null 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeacherAssignments();
  }, []);

  const loadTeacherAssignments = async () => {
    try {
      setLoading(true);
      
      // ✅ Use the teacher attendance classes endpoint which returns both class and subject assignments
      const resp = await api.get(API_ENDPOINTS.TEACHER.ATTENDANCE.CLASSES);
      console.log("📚 Teacher assignments response:", resp);
      
      // Handle different response structures
      const responseData = resp.data || resp;
      const actualData = responseData.data || responseData;
      
      console.log("📚 Processed assignments:", actualData);
      
      setData({ 
        classes: actualData.classes || [], 
        subjects: actualData.teachingSubjects || [],
        teacher: actualData.teacher || null
      });
      
      if (actualData.classes.length === 0 && actualData.teachingSubjects.length === 0) {
        toast.info("You are not assigned to any classes or subjects");
      }
    } catch (error) {
      console.error("❌ Failed to load assignments:", error);
      toast.error(error.message || "Failed to load classes and subjects");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <BackButton to="/teacher/teacher-dashboard" />
        
        {/* Teacher Info Header */}
        {data.teacher && (
          <div className="mb-6 p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {data.teacher.name}
            </h2>
            <p className="text-gray-600">
              Teacher ID: <span className="font-semibold">{data.teacher.teacherID}</span>
            </p>
            <div className="mt-4 flex gap-4 text-sm">
              {/* <span className={`px-3 py-1 rounded-full ${
                data.classes.length > 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                Class Teacher: {data.classes.length} classes
              </span> */}
              {/* <span className={`px-3 py-1 rounded-full ${
                data.subjects.length > 0 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                Subject Teacher: {data.subjects.length} subjects
              </span> */}
            </div>
          </div>
        )}
        
        <h2 className="text-3xl font-bold text-gray-900 mb-6">My Classes & Subjects</h2>
        
        {/* Classes & Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Classes Section - Shows BOTH Class Teacher AND Subject Teacher Classes */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 p-2 rounded-lg">🏫</span>
              All My Classes
            </h3>
            
            {data.classes.length > 0 || data.subjects.length > 0 ? (
              <div className="space-y-4">
                {/* Show Class Teacher Assignments */}
                {data.classes.map((cls, index) => (
                  <div key={`class-${index}`} className="border border-green-200 rounded-lg p-4 bg-green-50 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-900">
                          Class {cls.className} - Section {cls.section}
                        </h4>
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">
                          Class Teacher
                        </span>
                      </div>
                      {/* <span className="text-sm text-gray-500">
                        Students: {cls.currentStrength || 0}
                      </span> */}
                    </div>
                  </div>
                ))}
                
                {/* Show Subject Teacher Classes (deduplicated) */}
                {data.subjects
                  .filter((subject, index, self) => 
                    index === self.findIndex(s => 
                      s.className === subject.className && s.section === subject.section
                    )
                  )
                  .map((subject, index) => (
                    <div key={`subject-class-${index}`} className="border border-blue-200 rounded-lg p-4 bg-blue-50 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-gray-900">
                            Class {subject.className} - Section {subject.section}
                          </h4>
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                            Subject Teacher
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          Teaching {data.subjects.filter(s => 
                            s.className === subject.className && s.section === subject.section
                          ).length} subjects
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No classes assigned</p>
            )}
          </div>

          {/* Subjects Section - Shows ALL Subjects Taught */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="bg-green-100 text-green-600 p-2 rounded-lg">📚</span>
              All Subjects I Teach
            </h3>
            
            {data.subjects.length > 0 ? (
              <div className="space-y-3">
                {data.subjects.map((subject, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-900">{subject.subjectName}</h4>
                        <p className="text-sm text-gray-600">
                          Class {subject.className} - Section {subject.section}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Hours: {subject.hoursPerWeek || 5}/week
                        </p>
                      </div>
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                        {subject.role || "Subject Teacher"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No subjects assigned</p>
            )}
          </div>
        </div>

        {/* Debug Info */}
        {/* <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <details>
            <summary className="cursor-pointer font-medium text-gray-700">Debug Information</summary>
            <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div> */}
      </div>
    </div>
  );
}