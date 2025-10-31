import React, { useState } from 'react';

function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(12);
  const [currentMonth, setCurrentMonth] = useState('July 2028');

  const appointments = [
    {
      name: 'Caren G. Simpson',
      date: '20-07-28',
      time: '09:00 AM',
      doctor: 'Dr. Petra Winsbury',
      treatment: 'Routine Check-Up',
      status: 'Confirmed'
    },
    {
      name: 'Edgar Warrow',
      date: '20-07-28',
      time: '10:30 AM',
      doctor: 'Dr. Olivia Martinez',
      treatment: 'Cardiac Consultation',
      status: 'Confirmed'
    },
    {
      name: 'Ocean Jane Lupre',
      date: '20-07-28',
      time: '11:00 AM',
      doctor: 'Dr. Damian Sanchez',
      treatment: 'Pediatric Check-Up',
      status: 'Pending'
    },
    {
      name: 'Shane Riddick',
      date: '20-07-28',
      time: '01:00 PM',
      doctor: 'Dr. Chloe Harrington',
      treatment: 'Skin Allergy',
      status: 'Cancelled'
    },
    {
      name: 'Queen Lawnston',
      date: '20-07-28',
      time: '02:30 PM',
      doctor: 'Dr. Petra Winsbury',
      treatment: 'Follow-Up Visit',
      status: 'Confirmed'
    }
  ];

  const doctors = [
    {
      name: 'Dr. Petra Winsbury',
      specialty: 'General Medicine',
      available: true,
      time: '09:00 AM - 12:00 PM'
    },
    {
      name: 'Dr. Ameena Karim',
      specialty: 'Orthopedics',
      available: false
    },
    {
      name: 'Dr. Olivia Martinez',
      specialty: 'Cardiology',
      available: true,
      time: '10:00 AM - 01:00 PM'
    },
    {
      name: 'Dr. Damian Sanchez',
      specialty: 'Pediatrics',
      available: true,
      time: '11:00 AM - 02:00 PM'
    },
    {
      name: 'Dr. Chloe Harrington',
      specialty: 'Dermatology',
      available: false
    }
  ];

  const reports = [
    { title: 'Room Cleaning Needed', time: '1 minutes ago' },
    { title: 'Equipment Maintenance', time: '3 minutes ago' },
    { title: 'Medication Restock', time: '5 minutes ago' },
    { title: 'HVAC System Issue', time: '1 hour ago' },
    { title: 'Patient Transport Required', time: 'Yesterday' }
  ];

  const activities = [
    {
      text: 'Felix Müller was discharged from Room 205 after successful treatment',
      time: '08:30 AM'
    },
    {
      text: 'Léa Rousseau admitted to Room 312 for surgery scheduled later today',
      time: '09:00 AM'
    },
    {
      text: 'MRI machine in Radiology Department received routine maintenance check',
      time: '10:00 AM'
    },
    {
      text: 'ICU received restock of essential medications',
      time: '11:00 AM'
    },
    {
      text: 'Code Blue emergency response initiated for a patient in Room 108',
      time: '01:15 PM'
    }
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-600';
      case 'Pending':
        return 'bg-red-100 text-red-600';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-gray-50 text-slate-800 p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 flex flex-col justify-between border border-transparent hover:border-slate-300 transition">
            <div className="flex justify-between items-center text-slate-500 text-xs font-medium">
              <span>Total Invoice</span>
              <span className="cursor-pointer">⋯</span>
            </div>
            <div className="mt-2 font-bold text-2xl text-slate-900 leading-none">
              1,287
            </div>
            <div className="mt-1 text-xs text-slate-500">
              56 more than yesterday
            </div>
            <div className="mt-2 inline-flex items-center text-green-600 text-xs font-semibold rounded-md bg-green-100 px-2 py-0.5 w-max">
              <span className="mr-1">↑</span>
              2.14%
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 flex flex-col justify-between border border-transparent hover:border-slate-300 transition">
            <div className="flex justify-between items-center text-slate-500 text-xs font-medium">
              <span>Total Patients</span>
              <span className="cursor-pointer">⋯</span>
            </div>
            <div className="mt-2 font-bold text-2xl text-slate-900 leading-none">
              965
            </div>
            <div className="mt-1 text-xs text-slate-500">
              45 more than yesterday
            </div>
            <div className="mt-2 inline-flex items-center text-green-600 text-xs font-semibold rounded-md bg-green-100 px-2 py-0.5 w-max">
              <span className="mr-1">↑</span>
              3.78%
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 flex flex-col justify-between border border-transparent hover:border-slate-300 transition">
            <div className="flex justify-between items-center text-slate-500 text-xs font-medium">
              <span>Appointments</span>
              <span className="cursor-pointer">⋯</span>
            </div>
            <div className="mt-2 font-bold text-2xl text-slate-900 leading-none">
              128
            </div>
            <div className="mt-1 text-xs text-slate-500">
              18 less than yesterday
            </div>
            <div className="mt-2 inline-flex items-center text-red-600 text-xs font-semibold rounded-md bg-red-100 px-2 py-0.5 w-max">
              <span className="mr-1">↓</span>
              1.56%
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 flex flex-col justify-between border border-transparent hover:border-slate-300 transition">
            <div className="flex justify-between items-center text-slate-500 text-xs font-medium">
              <span>Bedroom</span>
              <span className="cursor-pointer">⋯</span>
            </div>
            <div className="mt-2 font-bold text-2xl text-slate-900 leading-none">
              315
            </div>
            <div className="mt-1 text-xs text-slate-500">
              56 more than yesterday
            </div>
            <div className="mt-2 inline-flex items-center text-green-600 text-xs font-semibold rounded-md bg-green-100 px-2 py-0.5 w-max">
              <span className="mr-1">↑</span>
              1.64%
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Section - Charts and Data */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Patient Overview by Age */}
              <div className="bg-white rounded-xl p-5 border border-transparent hover:border-slate-300 transition">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Patient Overview</p>
                    <p className="text-xs text-slate-500">by Age Stages</p>
                  </div>
                  <button className="bg-slate-800 text-white text-xs font-semibold rounded-md px-3 py-1">
                    Last 8 Days ▼
                  </button>
                </div>
                <div className="h-40 bg-gradient-to-t from-gray-100 to-gray-50 rounded-lg flex items-end justify-center p-4">
                  <div className="flex items-end space-x-4">
                    <div className="bg-slate-800 w-12 h-20 rounded-t flex flex-col justify-end items-center">
                      <span className="text-white text-xs mb-1">105</span>
                    </div>
                    <div className="bg-slate-400 w-12 h-32 rounded-t flex flex-col justify-end items-center">
                      <span className="text-white text-xs mb-1">132</span>
                    </div>
                    <div className="bg-slate-300 w-12 h-12 rounded-t flex flex-col justify-end items-center">
                      <span className="text-white text-xs mb-1">38</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-start space-x-4 mt-3 text-xs text-slate-500">
                  <div className="flex items-center space-x-1">
                    <span className="w-3 h-3 rounded-full bg-slate-800 block"></span>
                    <span>Child</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-3 h-3 rounded-full bg-slate-400 block"></span>
                    <span>Adult</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-3 h-3 rounded-full bg-slate-300 block"></span>
                    <span>Elderly</span>
                  </div>
                </div>
              </div>

              {/* Revenue Chart */}
              <div className="bg-white rounded-xl p-5 border border-transparent hover:border-slate-300 transition">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs font-semibold text-slate-800">Revenue</p>
                  <div className="flex space-x-3 text-xs font-semibold">
                    <button className="bg-slate-800 text-white rounded-md px-3 py-1">Week</button>
                    <button className="text-slate-500">Month</button>
                    <button className="text-slate-500">Year</button>
                  </div>
                </div>
                <div className="h-40 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg relative">
                  <svg className="w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="none">
                    <path 
                      d="M20,120 Q80,40 160,60 T320,20 L380,50" 
                      stroke="#1e293b" 
                      strokeWidth="2" 
                      fill="none"
                    />
                    <path 
                      d="M20,140 Q80,80 160,100 T320,70 L380,90" 
                      stroke="#94a3b8" 
                      strokeWidth="2" 
                      fill="none"
                    />
                    <circle cx="240" cy="20" r="3" fill="#1e293b" />
                    <text x="240" y="15" textAnchor="middle" className="text-xs fill-slate-800">$1,495</text>
                  </svg>
                </div>
                <div className="flex justify-start space-x-4 mt-3 text-xs text-slate-500">
                  <div className="flex items-center space-x-1">
                    <span className="w-3 h-3 rounded-full bg-slate-800 block"></span>
                    <span>Income</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-3 h-3 rounded-full bg-slate-400 block"></span>
                    <span>Expense</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Three Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Patient Overview by Departments */}
              <div className="bg-white rounded-xl p-5 border border-transparent hover:border-slate-300 transition">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Patient Overview</p>
                    <p className="text-xs text-slate-500">by Departments</p>
                  </div>
                  <span className="cursor-pointer text-slate-400">⋯</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-28 h-28 relative">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="#e2e8f0" strokeWidth="8" fill="none" />
                      <circle cx="50" cy="50" r="40" stroke="#1e293b" strokeWidth="8" fill="none" 
                        strokeDasharray="87.96" strokeDashoffset="26.4" />
                      <circle cx="50" cy="50" r="40" stroke="#94a3b8" strokeWidth="8" fill="none" 
                        strokeDasharray="70.37" strokeDashoffset="14.1" />
                      <circle cx="50" cy="50" r="40" stroke="#cbd5e1" strokeWidth="8" fill="none" 
                        strokeDasharray="50.27" strokeDashoffset="35.2" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="font-bold text-xl text-slate-800">1,890</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">This Week</p>
                </div>
                <div className="space-y-2 text-xs text-slate-500 mt-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-slate-800 block"></span>
                    <span>Emergency Medicine</span>
                    <span className="ml-auto font-semibold text-xs text-slate-500">35%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-slate-400 block"></span>
                    <span>General Medicine</span>
                    <span className="ml-auto font-semibold text-xs text-slate-500">28%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-slate-300 block"></span>
                    <span>Internal Medicine</span>
                    <span className="ml-auto font-semibold text-xs text-slate-500">20%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-slate-200 block"></span>
                    <span>Other Departments</span>
                    <span className="ml-auto font-semibold text-xs text-slate-500">17%</span>
                  </div>
                </div>
              </div>

              {/* Doctors Schedule */}
              <div className="bg-white rounded-xl p-5 border border-transparent hover:border-slate-300 transition">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs font-semibold text-slate-800">Doctors' Schedule</p>
                  <span className="cursor-pointer text-slate-400">⋯</span>
                </div>
                <div className="space-y-4">
                  {doctors.map((doctor, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                        <span className="text-slate-600 text-sm">{doctor.name.split(' ')[1].charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">{doctor.name}</p>
                        <p className="text-xs text-slate-400">{doctor.specialty}</p>
                      </div>
                      <div className={`text-xs font-semibold rounded-md px-2 py-0.5 whitespace-nowrap ${
                        doctor.available ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                      }`}>
                        {doctor.available ? 'Available' : 'Unavailable'}
                      </div>
                      {doctor.time && (
                        <div className="text-xs text-slate-500 whitespace-nowrap">
                          {doctor.time}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Reports */}
              <div className="bg-white rounded-xl p-5 border border-transparent hover:border-slate-300 transition">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs font-semibold text-slate-800">Report</p>
                  <span className="cursor-pointer text-slate-400">⋯</span>
                </div>
                <div className="space-y-3">
                  {reports.map((report, index) => (
                    <div key={index} className="flex items-center justify-between bg-sky-50 rounded-lg p-3 cursor-pointer hover:bg-sky-100 transition">
                      <div>
                        <p className="font-semibold text-sm text-slate-800">{report.title}</p>
                        <p className="text-xs text-slate-500">{report.time}</p>
                      </div>
                      <span className="text-slate-400">›</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Appointments Table */}
            <div className="bg-white rounded-xl p-5 border border-transparent hover:border-slate-300 transition">
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs font-semibold text-slate-800">Patient Appointment</p>
                <p className="text-xs text-slate-500 cursor-pointer hover:text-slate-800">View All</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3 font-semibold text-slate-500">Name</th>
                      <th className="py-2 px-3 font-semibold text-slate-500">Date</th>
                      <th className="py-2 px-3 font-semibold text-slate-500">Time</th>
                      <th className="py-2 px-3 font-semibold text-slate-500">Doctor</th>
                      <th className="py-2 px-3 font-semibold text-slate-500">Treatment</th>
                      <th className="py-2 px-3 font-semibold text-slate-500">Status</th>
                      <th className="py-2 px-3 font-semibold text-slate-500"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment, index) => (
                      <tr key={index} className="border-b border-slate-100">
                        <td className="py-3 px-3 font-semibold text-slate-800">{appointment.name}</td>
                        <td className="py-3 px-3">{appointment.date}</td>
                        <td className="py-3 px-3">{appointment.time}</td>
                        <td className="py-3 px-3">{appointment.doctor}</td>
                        <td className="py-3 px-3">{appointment.treatment}</td>
                        <td className="py-3 px-3">
                          <span className={`inline-block text-xs font-semibold rounded-md px-2 py-0.5 ${getStatusStyle(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400 cursor-pointer">⋯</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Date Selector */}
              <div className="mt-3 flex items-center justify-center space-x-1 text-xs text-slate-500 overflow-x-auto">
                <button className="px-2 py-1 rounded-md hover:bg-slate-100">‹</button>
                {[12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25].map((date) => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`px-2 py-1 rounded-md ${
                      selectedDate === date || date === 20 
                        ? 'bg-slate-800 text-white font-semibold' 
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    {date === 12 ? 'Wed 12' : date === 20 ? 'Thu 20' : `${date}`}
                  </button>
                ))}
                <button className="px-2 py-1 rounded-md hover:bg-slate-100">›</button>
              </div>
            </div>
          </div>

          {/* Right Section - Calendar and Activity */}
          <div className="space-y-6">
            
            {/* Calendar */}
            <div className="bg-white rounded-xl p-5 border border-transparent hover:border-slate-300 transition">
              <div className="flex justify-between items-center mb-3">
                <p className="font-semibold text-slate-800">{currentMonth}</p>
                <div className="flex space-x-3 text-slate-500 text-xs">
                  <button className="hover:text-slate-800">‹</button>
                  <button className="hover:text-slate-800">›</button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-xs text-slate-500 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-semibold">{day}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-xs">
                {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                  <div
                    key={day}
                    className={`text-center p-1 ${
                      day === 12 
                        ? 'bg-slate-800 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto font-semibold'
                        : day <= 15 
                        ? 'text-slate-800 font-semibold cursor-pointer hover:bg-slate-100 rounded'
                        : 'text-slate-400 cursor-pointer hover:bg-slate-100 rounded'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-slate-200 pt-4">
                <p className="text-xs font-semibold text-slate-800 mb-2">Wednesday, 12 July</p>
                <button className="bg-slate-800 text-white rounded-md w-7 h-7 flex items-center justify-center mb-4 hover:bg-slate-700">
                  +
                </button>
                
                <div className="space-y-3 text-xs">
                  <div className="bg-cyan-200 rounded-md p-2">
                    <p className="font-semibold text-xs text-slate-800">Morning Staff Meeting</p>
                    <p className="text-xs text-slate-700">08:00 AM - 09:00 AM</p>
                  </div>
                  <div className="bg-slate-200 rounded-md p-2 h-10"></div>
                  <div className="bg-cyan-200 rounded-md p-2">
                    <p className="font-semibold text-xs text-slate-800">Patient Consultation - General Medicine</p>
                    <p className="text-xs text-slate-700">10:00 AM - 12:00 PM</p>
                  </div>
                  <div className="bg-slate-200 rounded-md p-2 h-10"></div>
                  <div className="bg-cyan-200 rounded-md p-2">
                    <p className="font-semibold text-xs text-slate-800">Surgery - Orthopedics</p>
                    <p className="text-xs text-slate-700">01:00 PM - 03:00 PM</p>
                  </div>
                  <div className="bg-slate-200 rounded-md p-2 h-10"></div>
                  <div className="bg-cyan-200 rounded-md p-2">
                    <p className="font-semibold text-xs text-slate-800">Training Session</p>
                    <p className="text-xs text-slate-700">04:00 PM - 05:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-5 border border-transparent hover:border-slate-300 transition">
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs font-semibold text-slate-800">Recent Activity</p>
                <span className="cursor-pointer text-slate-400">⋯</span>
              </div>
              
              <div className="space-y-4 text-xs text-slate-600">
                {activities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-semibold text-slate-800 leading-tight">{activity.text}</p>
                      <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;