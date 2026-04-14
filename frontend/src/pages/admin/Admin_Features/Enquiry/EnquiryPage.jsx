import React from "react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";


const Section = ({ id, title, children }) => (
  <div id={id} className="bg-white p-6 rounded-2xl shadow-md  scroll-mt-24 mb-10">
    <h2 className="text-xl font-bold mb-4 text-slate-800">{title}</h2>
    {children}
  </div>
);

export default function EnquiryPage() {
     const location = useLocation();

      useEffect(() => {
    const hash = location.hash.replace("#", "");

    if (!hash) return;

    // 🔥 NEW ENQUIRY → TOP
    if (hash === "new-enquiry") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    // 🔥 OTHER SECTIONS
    const el = document.getElementById(hash);

    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;

      window.scrollTo({
        top: y,
        behavior: "smooth",
      });
    }
  }, [location]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      {/* 1. New Enquiry */}
      <Section id="new-enquiry" title="New Enquiry">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input placeholder="Student Name" className="input" />
          <input placeholder="Class Interested" className="input" />
          <input placeholder="Parent Name" className="input" />
          <input placeholder="Phone" className="input" />
          <input placeholder="Email" className="input" />
          <input placeholder="Source" className="input" />
          <textarea placeholder="Notes" className="col-span-2 input" />
          <button className="col-span-2 bg-indigo-600 text-white py-2 rounded-xl">
            Submit
          </button>
        </form>
      </Section>

      {/* 2. Enquiry Details */}
      <Section id="details" title="Enquiry Details">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th>Name</th>
              <th>Phone</th>
              <th>Class</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Aarav</td>
              <td>9876543210</td>
              <td>10</td>
              <td>New</td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* 3. Enquiry Details II */}
      <Section id="details2" title="Enquiry Details II">
        <p>Advanced tracking (Follow-up, remarks, history)</p>
      </Section>

      {/* 4. Done Followup */}
      <Section id="done" title="Done Followup">
        <p>Completed follow-ups list</p>
      </Section>

      {/* 5. Pending Followup */}
      <Section id="pending" title="Pending Followup">
        <p>Pending follow-ups list</p>
      </Section>

      {/* 6. Search */}
      <Section id="search" title="Enquiry Search">
        <input placeholder="Search by name or phone" className="input w-full" />
      </Section>

      {/* 7. Status */}
      <Section id="status" title="Enquiry Status">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card">Total</div>
          <div className="card">New</div>
          <div className="card">Converted</div>
          <div className="card">Pending</div>
        </div>
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


