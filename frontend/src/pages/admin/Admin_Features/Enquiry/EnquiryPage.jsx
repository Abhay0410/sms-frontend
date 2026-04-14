import React from "react";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaPhoneAlt } from "react-icons/fa";

const Section = ({ id, title, children }) => (
  <div
    id={id}
    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition"
  >
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg md:text-xl font-semibold text-slate-800">
        {title}
      </h2>
      <div className="h-1 w-10 bg-indigo-500 rounded-full" />
    </div>
    {children}
  </div>
);

export default function EnquiryPage() {
  const location = useLocation();
  const [search, setSearch] = useState("");

  const [enquiries, setEnquiries] = useState([
    {
      id: 1,
      studentName: "Aarav Sharma",
      parentName: "Rajesh Sharma",
      phone: "9876543210",
      class: "10",
      source: "Walk-in",
      status: "New",
      followUp: "2026-04-20",
    },
    {
      id: 2,
      studentName: "Ananya Verma",
      parentName: "Suresh Verma",
      phone: "9123456780",
      class: "8",
      source: "Website",
      status: "Follow-up",
      followUp: "2026-04-18",
    },
    {
      id: 3,
      studentName: "Rohan Patel",
      parentName: "Mahesh Patel",
      phone: "9988776655",
      class: "6",
      source: "Referral",
      status: "Interested",
      followUp: "2026-04-16",
    },
    {
      id: 4,
      studentName: "Priya Singh",
      parentName: "Amit Singh",
      phone: "9090909090",
      class: "9",
      source: "Social Media",
      status: "Converted",
      followUp: "",
    },
    {
      id: 5,
      studentName: "Kabir Khan",
      parentName: "Imran Khan",
      phone: "9898989898",
      class: "7",
      source: "Walk-in",
      status: "Not Interested",
      followUp: "",
    },
    {
      id: 6,
      studentName: "Sneha Gupta",
      parentName: "Vikas Gupta",
      phone: "9812345678",
      class: "5",
      source: "Website",
      status: "Follow-up",
      followUp: "2026-04-19",
    },
    {
      id: 7,
      studentName: "Aditya Mishra",
      parentName: "Ramesh Mishra",
      phone: "9765432109",
      class: "11",
      source: "Advertisement",
      status: "New",
      followUp: "2026-04-22",
    },
    {
      id: 8,
      studentName: "Pooja Yadav",
      parentName: "Sanjay Yadav",
      phone: "9345678123",
      class: "4",
      source: "Referral",
      status: "Interested",
      followUp: "2026-04-17",
    },
    {
      id: 9,
      studentName: "Rahul Das",
      parentName: "Mohan Das",
      phone: "9456123789",
      class: "3",
      source: "Walk-in",
      status: "Follow-up",
      followUp: "2026-04-15",
    },
    {
      id: 10,
      studentName: "Neha Jain",
      parentName: "Anil Jain",
      phone: "9988123456",
      class: "12",
      source: "Website",
      status: "Converted",
      followUp: "",
    }
  ]);

  //       useEffect(() => {
  //     const hash = location.hash.replace("#", "");

  //     if (!hash) return;

  //     // 🔥 NEW ENQUIRY → TOP
  //     if (hash === "new-enquiry") {
  //       window.scrollTo({
  //         top: 0,
  //         behavior: "smooth",
  //       });
  //       return;
  //     }

  //     // 🔥 OTHER SECTIONS
  //     const el = document.getElementById(hash);

  //     if (el) {
  //   el.scrollIntoView({
  //     behavior: "smooth",
  //     block: "start", // 👈 ye section ko TOP pe le aata hai
  //   });
  // }
  //   }, [location]);

  const filteredData = enquiries.filter((e) =>
    e.studentName.toLowerCase().includes(search.toLowerCase()) ||
    e.phone.includes(search)
  );

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (!hash) return;

    const el = document.getElementById(hash);
    const container = document.getElementById("main-content");

    if (el && container) {
      const containerTop = container.getBoundingClientRect().top;
      const elementTop = el.getBoundingClientRect().top;

      const scrollPosition = elementTop - containerTop + container.scrollTop;

      container.scrollTo({
        top: scrollPosition - 20, // 👈 thoda gap
        behavior: "smooth",
      });
    }
  }, [location.hash]);

  const total = enquiries.length;

  const newCount = enquiries.filter(e => e.status === "New").length;

  const convertedCount = enquiries.filter(e => e.status === "Converted").length;

  const pendingCount = enquiries.filter(e =>
    ["New", "Follow-up", "Interested"].includes(e.status)
  ).length;

  return (
    <div className="max-w-7xl mx-auto  space-y-8">

      <div className="flex items-center gap-4 ">

        {/* 🔵 Icon */}
        <div className="h-16 w-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
          <FaPhoneAlt size={28} />
        </div>

        {/* 📄 Text */}
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Enquiry Management
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-1">
            Manage student enquiries, follow-ups, and admission tracking efficiently.
          </p>
        </div>

      </div>

      {/* 1. New Enquiry */}
      <Section id="new-enquiry" title="New Enquiry">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* 👨‍🎓 Student Details */}
          <input placeholder="Student Name" className="input" />

          <select className="input">
            <option value="">Select Class</option>
            <option>Nursery</option>
            <option>LKG</option>
            <option>UKG</option>
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
            <option>6</option>
            <option>7</option>
            <option>8</option>
            <option>9</option>
            <option>10</option>
            <option>11</option>
            <option>12</option>
          </select>

          <select className="input">
            <option value="">Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>

          <input type="date" className="input" />

          {/* 👨‍👩‍👧 Parent Details */}
          <input placeholder="Parent Name" className="input" />

          <select className="input">
            <option value="">Relation</option>
            <option>Father</option>
            <option>Mother</option>
            <option>Guardian</option>
          </select>

          <input placeholder="Phone Number" className="input" />
          <input placeholder="Alternate Phone" className="input" />

          <input placeholder="Email" className="input md:col-span-2" />

          {/* 📍 Address */}
          <input placeholder="City" className="input" />
          <input placeholder="State" className="input" />

          {/* 📢 Source */}
          <select className="input">
            <option value="">Enquiry Source</option>
            <option>Walk-in</option>
            <option>Website</option>
            <option>Referral</option>
            <option>Social Media</option>
            <option>Advertisement</option>
          </select>

          {/* 📅 Follow-up */}
          <input type="date" className="input" />

          {/* 🚐 Optional */}
          <select className="input">
            <option value="">Transport Required?</option>
            <option>Yes</option>
            <option>No</option>
          </select>

          <select className="input">
            <option value="">Hostel Required?</option>
            <option>Yes</option>
            <option>No</option>
          </select>

          {/* 📝 Notes */}
          <textarea

            placeholder="Notes / Remarks"
            className="col-span-2 input h-24"
          />

          {/* 🚀 Submit */}
          <button className="col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold">
            Submit Enquiry
          </button>

        </form>
      </Section>

      {/* 2. Enquiry Details */}
      <Section id="details" title="Enquiry Details">
        <div className="bg-white p-6 rounded-2xl shadow-md">

          {/* 🔍 Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">Enquiry Details</h2>

            <input
              placeholder="Search by name or phone..."
              className="border px-3 py-2 rounded-xl text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* 📊 Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-3 text-left">Student</th>
                  <th className="p-3 text-left">Parent</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">Class</th>
                  <th className="p-3 text-left">Source</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Follow-up</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-b hover:bg-slate-50">
                  <td className="p-3 font-medium">Aarav Sharma</td>
                  <td>Rajesh Sharma</td>
                  <td>9876543210</td>
                  <td>10</td>
                  <td>Walk-in</td>
                  <td>
                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-lg text-xs">
                      New
                    </span>
                  </td>
                  <td>20 Apr 2026</td>
                  <td className="space-x-2">
                    <button className="text-indigo-600 hover:underline text-xs">View</button>
                    <button className="text-green-600 hover:underline text-xs">Edit</button>
                  </td>
                </tr>

                <tr className="border-b hover:bg-slate-50">
                  <td className="p-3 font-medium">Ananya Verma</td>
                  <td>Suresh Verma</td>
                  <td>9123456780</td>
                  <td>8</td>
                  <td>Website</td>
                  <td>
                    <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-lg text-xs">
                      Follow-up
                    </span>
                  </td>
                  <td>18 Apr 2026</td>
                  <td className="space-x-2">
                    <button className="text-indigo-600 hover:underline text-xs">View</button>
                    <button className="text-green-600 hover:underline text-xs">Edit</button>
                  </td>
                </tr>

                <tr className="border-b hover:bg-slate-50">
                  <td className="p-3 font-medium">Rohan Patel</td>
                  <td>Mahesh Patel</td>
                  <td>9988776655</td>
                  <td>6</td>
                  <td>Referral</td>
                  <td>
                    <span className="bg-green-100 text-green-600 px-2 py-1 rounded-lg text-xs">
                      Converted
                    </span>
                  </td>
                  <td>-</td>
                  <td className="space-x-2">
                    <button className="text-indigo-600 hover:underline text-xs">View</button>
                    <button className="text-green-600 hover:underline text-xs">Edit</button>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* 3. Enquiry Details II */}
      <Section id="details2" title="Enquiry Details II">
        <div className="bg-white p-6 rounded-2xl shadow-md">

          {/* 🔵 Header */}
          <h2 className="text-xl font-bold text-slate-800 mb-6">
            Enquiry Tracking (Follow-up & History)
          </h2>

          {/* 🧑 Basic Info */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-100 p-4 rounded-xl">
              <p className="text-xs text-slate-500">Student</p>
              <p className="font-semibold">Aarav Sharma</p>
            </div>
            <div className="bg-slate-100 p-4 rounded-xl">
              <p className="text-xs text-slate-500">Class</p>
              <p className="font-semibold">10</p>
            </div>
            <div className="bg-slate-100 p-4 rounded-xl">
              <p className="text-xs text-slate-500">Status</p>
              <p className="font-semibold text-indigo-600">Follow-up</p>
            </div>
          </div>

          {/* 📅 Add Follow-up */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Add Follow-up</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <input type="date" className="input" />

              <select className="input">
                <option>Call</option>
                <option>Visit</option>
                <option>Meeting</option>
              </select>

              <select className="input">
                <option>Follow-up</option>
                <option>Interested</option>
                <option>Converted</option>
                <option>Not Interested</option>
              </select>

              <textarea
                placeholder="Write remarks..."
                className="col-span-3 input"
              />

              <button className="col-span-3 bg-indigo-600 text-white py-2 rounded-xl">
                Add Follow-up
              </button>
            </div>
          </div>

          {/* 📜 History Timeline */}
          <div>
            <h3 className="font-semibold mb-4">Follow-up History</h3>

            <div className="space-y-4">

              {/* Item */}
              <div className="border-l-4 border-indigo-500 pl-4">
                <p className="text-sm font-semibold">📞 Call - 18 Apr 2026</p>
                <p className="text-xs text-slate-500">Status: Follow-up</p>
                <p className="text-sm mt-1">
                  Parent asked about fee structure.
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <p className="text-sm font-semibold">🏫 Visit - 16 Apr 2026</p>
                <p className="text-xs text-slate-500">Status: Interested</p>
                <p className="text-sm mt-1">
                  Visited school, liked infrastructure.
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <p className="text-sm font-semibold">✅ Admission - 20 Apr 2026</p>
                <p className="text-xs text-slate-500">Status: Converted</p>
                <p className="text-sm mt-1">
                  Admission completed successfully.
                </p>
              </div>

            </div>
          </div>

        </div>
      </Section>

      {/* 4. Done Followup */}
      <Section id="done" title="Done Followup">
        <div className="bg-white p-6 rounded-2xl shadow-md">

          {/* 🔵 Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">
              Done Follow-ups
            </h2>

            <input
              placeholder="Search..."
              className="border px-3 py-2 rounded-xl text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* 📊 Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-3 text-left">Student</th>
                  <th className="p-3 text-left">Parent</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">Class</th>
                  <th className="p-3 text-left">Final Status</th>
                  <th className="p-3 text-left">Completed On</th>
                  <th className="p-3 text-left">Remarks</th>
                </tr>
              </thead>

              <tbody>

                <tr className="border-b hover:bg-slate-50">
                  <td className="p-3 font-medium">Aarav Sharma</td>
                  <td>Rajesh Sharma</td>
                  <td>9876543210</td>
                  <td>10</td>
                  <td>
                    <span className="bg-green-100 text-green-600 px-2 py-1 rounded-lg text-xs">
                      Converted
                    </span>
                  </td>
                  <td>20 Apr 2026</td>
                  <td>Admission completed</td>
                </tr>

                <tr className="border-b hover:bg-slate-50">
                  <td className="p-3 font-medium">Kabir Khan</td>
                  <td>Imran Khan</td>
                  <td>9898989898</td>
                  <td>7</td>
                  <td>
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded-lg text-xs">
                      Not Interested
                    </span>
                  </td>
                  <td>18 Apr 2026</td>
                  <td>Chose another school</td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* 5. Pending Followup */}
      <Section id="pending" title="Pending Followup">
        <div className="bg-white p-6 rounded-2xl shadow-md">

          {/* 🔵 Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">
              Pending Follow-ups
            </h2>

            <input
              placeholder="Search..."
              className="border px-3 py-2 rounded-xl text-sm"
            />
          </div>

          {/* 📊 Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-3 text-left">Student</th>
                  <th className="p-3 text-left">Parent</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">Class</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Next Follow-up</th>
                  <th className="p-3 text-left">Priority</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>

              <tbody>

                <tr className="border-b hover:bg-slate-50">
                  <td className="p-3 font-medium">Ananya Verma</td>
                  <td>Suresh Verma</td>
                  <td>9123456780</td>
                  <td>8</td>
                  <td>
                    <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-lg text-xs">
                      Follow-up
                    </span>
                  </td>
                  <td>18 Apr 2026</td>
                  <td>
                    <span className="text-red-500 font-semibold text-xs">
                      High
                    </span>
                  </td>
                  <td>
                    <button className="text-indigo-600 text-xs hover:underline">
                      Call Now
                    </button>
                  </td>
                </tr>

                <tr className="border-b hover:bg-slate-50">
                  <td className="p-3 font-medium">Rohan Patel</td>
                  <td>Mahesh Patel</td>
                  <td>9988776655</td>
                  <td>6</td>
                  <td>
                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-lg text-xs">
                      New
                    </span>
                  </td>
                  <td>20 Apr 2026</td>
                  <td>
                    <span className="text-yellow-500 font-semibold text-xs">
                      Medium
                    </span>
                  </td>
                  <td>
                    <button className="text-indigo-600 text-xs hover:underline">
                      Follow-up
                    </button>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* 6. Search */}
      <Section id="search" title="Enquiry Search">
        <div className="bg-white p-6 rounded-2xl shadow-md">

          {/* 🔍 Header */}
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Enquiry Search
          </h2>

          {/* 🔍 Search Input */}
          <input
            placeholder="Search by name or phone..."
            className="input w-full mb-6"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* 📊 Results */}
          <div className="space-y-4">

            {filteredData.length === 0 ? (
              <p className="text-slate-500 text-sm">No results found</p>
            ) : (
              filteredData.map((e) => (
                <div
                  key={e.id}
                  className="border p-4 rounded-xl flex justify-between items-center hover:bg-slate-50"
                >
                  <div>
                    <p className="font-semibold">{e.studentName}</p>
                    <p className="text-xs text-slate-500">
                      {e.parentName} • {e.phone}
                    </p>
                    <p className="text-xs text-slate-400">
                      Class {e.class} • {e.source}
                    </p>
                  </div>

                  <span className="text-xs font-semibold text-indigo-600">
                    {e.status}
                  </span>
                </div>
              ))
            )}

          </div>
        </div>
      </Section>

      {/* 7. Status */}
      <Section id="status" title="Enquiry Status">
        <Section id="status" title="Enquiry Status">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <div className="bg-blue-100 p-4 rounded-xl text-center">
              <p className="text-sm text-gray-600">Total</p>
              <h2 className="text-2xl font-bold">{total}</h2>
            </div>

            <div className="bg-yellow-100 p-4 rounded-xl text-center">
              <p className="text-sm text-gray-600">New</p>
              <h2 className="text-2xl font-bold">{newCount}</h2>
            </div>

            <div className="bg-green-100 p-4 rounded-xl text-center">
              <p className="text-sm text-gray-600">Converted</p>
              <h2 className="text-2xl font-bold">{convertedCount}</h2>
            </div>

            <div className="bg-red-100 p-4 rounded-xl text-center">
              <p className="text-sm text-gray-600">Pending</p>
              <h2 className="text-2xl font-bold">{pendingCount}</h2>
            </div>

          </div>
        </Section>
      </Section>
    </div>
  );
}

/* Tailwind helper classes */
const style = document.createElement('style');
style.innerHTML = `
.input { @apply border p-2 rounded-xl w-full; }
.card { @apply bg-indigo-100 p-4 rounded-xl text-center font-bold; }
`;
document.head.appendChild(style);


