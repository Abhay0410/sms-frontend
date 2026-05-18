import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import {
  FaUser,
  FaMapMarkerAlt,
  FaUserFriends,
  FaHeartbeat,
  FaUniversity,
  FaBus,
  FaSave,
  FaSpinner,
  FaCamera,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const TABS = [
  { id: "personal", label: "Personal Info", icon: FaUser },
  { id: "address", label: "Address", icon: FaMapMarkerAlt },
  { id: "parent", label: "Parent/Guardian", icon: FaUserFriends },
  { id: "medical", label: "Medical", icon: FaHeartbeat },
  { id: "bank", label: "Bank & Scholarship", icon: FaUniversity },
  { id: "transport", label: "Transport & Hostel", icon: FaBus },
];

const Input = ({ label, name, register, errors, ...rest }) => (
  <div>
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
    <input
      {...register(name)}
      {...rest}
      className={`w-full mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all ${errors[name] ? 'border-red-400' : ''}`}
    />
    {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name].message}</p>}
  </div>
);

const Select = ({ label, name, register, errors, children, ...rest }) => (
    <div>
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      <select
        {...register(name)}
        {...rest}
        className={`w-full mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all appearance-none ${errors[name] ? 'border-red-400' : ''}`}
      >
        {children}
      </select>
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name].message}</p>}
    </div>
  );

export default function EditStudentProfile() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const profilePictureFile = watch("profilePicture");

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const response = await api.get(API_ENDPOINTS.ADMIN.STUDENT.GET_BY_ID(studentId));
        const data = response.data.student || response.data;
        setStudentData(data);
        
        // Pre-fill form with existing data correctly mapped
        reset({
          ...data,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          // Extract nested address fields to flat form fields
          street: data.address?.street || "",
          city: data.address?.city || "",
          state: data.address?.state || "",
          pincode: data.address?.pincode || "",
          country: data.address?.country || 'India',
          // Extract nested emergency contact fields
          emergencyContactName: data.emergencyContact?.name || "",
          emergencyContactRelation: data.emergencyContact?.relation || "",
          emergencyContactPhone: data.emergencyContact?.phone || "",
        });

        if (data.profilePicturePublicId) {
            // Using Cloudinary URL directly if available
            setProfilePicPreview(data.profilePicture);
        } else if (data.profilePicture) {
            // Fallback for local uploads
            const API_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:5000";
            setProfilePicPreview(`${API_URL}/${data.profilePicture.replace(/\\/g, '/')}`);
        }

      } catch (err) {
        toast.error("Failed to fetch student profile.");
        navigate("/admin/student-management");
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchStudent();
    }
  }, [studentId, reset, navigate]);

  useEffect(() => {
    if (profilePictureFile && profilePictureFile.length > 0) {
      const file = profilePictureFile[0];
      setProfilePicPreview(URL.createObjectURL(file));
    }
  }, [profilePictureFile]);

  const onSubmit = async (data) => {
    // We MUST use FormData to support the Multer file upload on the backend
    const formData = new FormData();

    // 1. Append all flat text fields
    Object.keys(data).forEach((key) => {
      const skipKeys = [
        "street", "city", "state", "pincode", "country", 
        "emergencyContactName", "emergencyContactRelation", "emergencyContactPhone", 
        "profilePicture", "dateOfBirth"
      ];

      // Append standard values
      if (!skipKeys.includes(key) && data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    // 2. Format Date properly
    if (data.dateOfBirth) {
      formData.append("dateOfBirth", new Date(data.dateOfBirth).toISOString());
    }

    // 3. Append Nested Objects using Mongoose-friendly Dot Notation
    if (data.street) formData.append("address.street", data.street);
    if (data.city) formData.append("address.city", data.city);
    if (data.state) formData.append("address.state", data.state);
    if (data.pincode) formData.append("address.pincode", data.pincode);
    formData.append("address.country", data.country || "India");

    if (data.emergencyContactName) formData.append("emergencyContact.name", data.emergencyContactName);
    if (data.emergencyContactRelation) formData.append("emergencyContact.relation", data.emergencyContactRelation);
    if (data.emergencyContactPhone) formData.append("emergencyContact.phone", data.emergencyContactPhone);

    // 4. Append File if selected
    if (data.profilePicture && data.profilePicture.length > 0) {
      formData.append("profilePicture", data.profilePicture[0]);
    }

    try {
      await api.put(API_ENDPOINTS.ADMIN.STUDENT.UPDATE(studentId), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Student profile updated successfully!");
      navigate("/admin/student-management");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-indigo-600 text-4xl" />
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "personal":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 flex flex-col items-center">
                <label htmlFor="profilePictureInput" className="cursor-pointer group">
                    <div className="w-40 h-40 rounded-full bg-slate-100 border-4 border-white shadow-lg relative overflow-hidden">
                        <img src={profilePicPreview || 'https://via.placeholder.com/150'} alt="Profile" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <FaCamera size={24} />
                        </div>
                    </div>
                </label>
                <input id="profilePictureInput" type="file" {...register("profilePicture")} className="hidden" accept="image/*" />
                <p className="text-xs text-slate-500 mt-2">Click to change picture</p>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Full Name" name="name" register={register} errors={errors} />
              <Input label="Email Address" name="email" type="email" register={register} errors={errors} />
              <Input label="Mobile Number" name="mobileNumber" type="tel" register={register} errors={errors} />
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date of Birth</label>
                <Controller
                  control={control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <DatePicker
                      selected={field.value}
                      onChange={(date) => field.onChange(date)}
                      dateFormat="dd/MM/yyyy"
                      className="w-full mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      placeholderText="DD/MM/YYYY"
                      showYearDropdown
                      scrollableYearDropdown
                    />
                  )}
                />
              </div>
              <Select label="Gender" name="gender" register={register} errors={errors}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
              <Input label="Blood Group" name="bloodGroup" register={register} errors={errors} placeholder="e.g., O+" />
              <Input label="Religion" name="religion" register={register} errors={errors} placeholder="e.g., Hinduism" />
              <Input label="Caste" name="caste" register={register} errors={errors} placeholder="e.g., General" />
              <Input label="Nationality" name="nationality" register={register} errors={errors} placeholder="e.g., Indian" />
              <Input label="Aadhar Number" name="aadharNumber" register={register} errors={errors} placeholder="12-digit number" maxLength="12" />
              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" {...register("isHandicapped")} className="h-4 w-4 rounded" />
                <label className="text-sm font-medium">Is Handicapped</label>
              </div>
            </div>
          </div>
        );
      case "address":
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <Input label="Street Address" name="street" register={register} errors={errors} />
                </div>
                <Input label="City" name="city" register={register} errors={errors} />
                <Input label="State" name="state" register={register} errors={errors} />
                <Input label="Pincode" name="pincode" register={register} errors={errors} />
                <Input label="Country" name="country" register={register} errors={errors} />
            </div>
        );
      case "parent":
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <h3 className="md:col-span-2 text-md font-bold text-slate-600 border-b pb-2">Mother's Details</h3>
                <Input label="Mother's Name" name="motherName" register={register} errors={errors} />
                <Input label="Mother's Phone" name="motherPhone" register={register} errors={errors} />
                <Input label="Mother's Email" name="motherEmail" type="email" register={register} errors={errors} />
                <Input label="Mother's Qualification" name="motherQualification" register={register} errors={errors} />
                
                <h3 className="md:col-span-2 text-md font-bold text-slate-600 border-b pb-2 mt-4">Father's Details</h3>
                <Input label="Father's Qualification" name="fatherQualification" register={register} errors={errors} />

                <h3 className="md:col-span-2 text-md font-bold text-slate-600 border-b pb-2 mt-4">Guardian's Details</h3>
                <Input label="Guardian's Name" name="guardianName" register={register} errors={errors} />
                <Input label="Relation to Student" name="guardianRelation" register={register} errors={errors} />
                <Input label="Guardian's Phone" name="guardianPhone" register={register} errors={errors} />
                <Input label="Guardian's Email" name="guardianEmail" register={register} errors={errors} />
            </div>
        );
      case "medical":
        return (
            <div className="space-y-6">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Medical History</label>
                    <textarea {...register("medicalHistory")} rows="3" className="w-full mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all" placeholder="Any known conditions..."></textarea>
                </div>
                <Input label="Allergies" name="allergies" register={register} errors={errors} placeholder="e.g., Peanuts, Dust" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
                    <Input label="Emergency Contact Name" name="emergencyContactName" register={register} errors={errors} />
                    <Input label="Emergency Contact Relation" name="emergencyContactRelation" register={register} errors={errors} />
                    <Input label="Emergency Contact Phone" name="emergencyContactPhone" register={register} errors={errors} />
                </div>
            </div>
        );
      case "bank":
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Bank Name" name="bankName" register={register} errors={errors} />
                <Input label="Account Number" name="accountNumber" register={register} errors={errors} />
                <Input label="IFSC Code" name="ifscCode" register={register} errors={errors} />
                <Input label="Account Holder Name" name="accountHolderName" register={register} errors={errors} />
                <Input label="Scholarship Name" name="scholarshipName" register={register} errors={errors} />
                <Input label="SSID" name="ssid" register={register} errors={errors} />
            </div>
        );
      case "transport":
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <input type="checkbox" {...register("transportRequired")} id="transportRequired" className="h-5 w-5 rounded" />
                        <label htmlFor="transportRequired" className="font-bold text-slate-700">Transport Required</label>
                    </div>
                    <Input label="Bus Route" name="busRoute" register={register} errors={errors} />
                    <Input label="Pickup Point" name="pickupPoint" register={register} errors={errors} />
                </div>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <input type="checkbox" {...register("hostelResident")} id="hostelResident" className="h-5 w-5 rounded" />
                        <label htmlFor="hostelResident" className="font-bold text-slate-700">Hostel Resident</label>
                    </div>
                    <Input label="Hostel Block" name="hostelBlock" register={register} errors={errors} />
                    <Input label="Room Number" name="roomNumber" register={register} errors={errors} />
                </div>
            </div>
        );
      default:
        return null;
    }
  };

  // ✅ ROBUST EXTRACTION: Safely get class and section from anywhere in the object
  const displayClass = studentData?.className || studentData?.class?.className || studentData?.targetClass?.className || 
    (typeof studentData?.targetClass === 'string' && !/^[0-9a-fA-F]{24}$/.test(studentData?.targetClass) ? studentData?.targetClass : null) || 
    "Unassigned";
    
  const displaySection = studentData?.section?.sectionName || studentData?.section?.name || studentData?.section || "";
  const displayRoll = studentData?.rollNumber || "N/A";
  const displayStatus = studentData?.status || "REGISTERED";

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
          {/* Header */}
          <div className="p-6 border-b border-slate-200">
            <h1 className="text-2xl font-bold text-slate-800">Edit Student Profile</h1>
            <p className="text-sm text-slate-500 mt-1">
              Completing profile for <span className="font-semibold text-indigo-600">{studentData?.name} ({studentData?.studentID})</span>
            </p>
            
            {/* ✅ ACADEMIC STATUS BANNER */}
            <div className="mt-4 bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex flex-wrap gap-6 items-center">
              <div>
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5">Current Class</p>
                <p className="font-bold text-indigo-900 text-sm">
                  {displayClass.replace(/^Class\s/i, '')} {displaySection ? `- Sec ${displaySection}` : ''}
                </p>
              </div>
              <div className="hidden sm:block w-px h-8 bg-indigo-200"></div>
              <div>
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5">Roll Number</p>
                <p className="font-bold text-indigo-900 text-sm">{displayRoll}</p>
              </div>
              <div className="hidden sm:block w-px h-8 bg-indigo-200"></div>
              <div>
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5">Enrollment Status</p>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  displayStatus === 'ENROLLED' || displayStatus === 'ACTIVE' 
                    ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {displayStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row">
            {/* Sidebar Tabs */}
            <nav className="w-full md:w-64 p-4 border-b md:border-b-0 md:border-r border-slate-200">
              <ul className="flex md:flex-col gap-1">
                {TABS.map((tab) => (
                  <li key={tab.id} className="flex-1 md:flex-initial">
                    <button
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === tab.id
                          ? "bg-indigo-100 text-indigo-700"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <tab.icon />
                      <span>{tab.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Form Content */}
            <div className="flex-1">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="p-6 md:p-8">
                    {renderTabContent()}
                </div>
                <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaSave />
                    )}
                    {isSubmitting ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}