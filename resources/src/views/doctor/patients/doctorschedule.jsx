import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

// Enhanced API functions for proper blockchain integration
const canisterAPI = {
  getDoctors: async (actorInstance) => {
    if (!actorInstance) throw new Error('Actor not available');
    try {
      const doctors = await actorInstance.getDoctors();
      console.log('Raw doctors from blockchain:', doctors);
      
      // Convert blockchain response to proper format
      return doctors.map(doctor => ({
        id: Number(doctor.id),
        name: doctor.name,
        specialty: doctor.specialty,
        hospitalId: Number(doctor.hospitalId),
        walletAddress: typeof doctor.walletAddress === 'object' && doctor.walletAddress.toText 
          ? doctor.walletAddress.toText() 
          : doctor.walletAddress.toString(),
        photoURL: doctor.photoURL,
        isActive: doctor.isActive
      }));
    } catch (error) {
      console.error('Error getting doctors:', error);
      throw error;
    }
  },
  
  getDoctorSchedule: async (actorInstance, doctorId) => {
    if (!actorInstance) throw new Error('Actor not available');
    try {
      const schedules = await actorInstance.getDoctorSchedule(Number(doctorId));
      console.log('Raw schedules from blockchain:', schedules);
      
      // Convert blockchain response to proper format
      return schedules.map(schedule => ({
        id: Number(schedule.id),
        doctorId: Number(schedule.doctorId),
        dayOfWeek: Number(schedule.dayOfWeek),
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        isAvailable: schedule.isAvailable
      }));
    } catch (error) {
      console.error('Error getting doctor schedule:', error);
      throw error;
    }
  },
  
  addDoctorSchedule: async (actorInstance, doctorId, dayOfWeek, startTime, endTime) => {
    if (!actorInstance) throw new Error('Actor not available');
    try {
      console.log('Adding schedule to blockchain:', { doctorId, dayOfWeek, startTime, endTime });
      
      const result = await actorInstance.addDoctorSchedule(
        Number(doctorId), 
        Number(dayOfWeek), 
        startTime, 
        endTime
      );
      
      console.log('Blockchain response for add schedule:', result);
      
      // Check if result contains error message
      if (typeof result === 'string' && result.includes('Unauthorized')) {
        throw new Error(result);
      }
      
      return { success: true, message: result };
    } catch (error) {
      console.error('Error adding schedule to blockchain:', error);
      throw error;
    }
  },
  
  updateDoctorSchedule: async (actorInstance, scheduleId, startTime, endTime, isAvailable) => {
    if (!actorInstance) throw new Error('Actor not available');
    try {
      console.log('Updating schedule in blockchain:', { scheduleId, startTime, endTime, isAvailable });
      
      const result = await actorInstance.updateDoctorSchedule(
        Number(scheduleId), 
        startTime, 
        endTime, 
        Boolean(isAvailable)
      );
      
      console.log('Blockchain response for update schedule:', result);
      
      // Check if result contains error message
      if (typeof result === 'string' && result.includes('Unauthorized')) {
        throw new Error(result);
      }
      
      return { success: true, message: result };
    } catch (error) {
      console.error('Error updating schedule in blockchain:', error);
      throw error;
    }
  },

  // New function to get available doctors by day and hospital
  getAvailableDoctors: async (actorInstance, hospitalId, dayOfWeek) => {
    if (!actorInstance) throw new Error('Actor not available');
    try {
      const availableDoctors = await actorInstance.getAvailableDoctors(
        Number(hospitalId), 
        Number(dayOfWeek)
      );
      
      return availableDoctors.map(doctor => ({
        id: Number(doctor.id),
        name: doctor.name,
        specialty: doctor.specialty,
        hospitalId: Number(doctor.hospitalId),
        walletAddress: typeof doctor.walletAddress === 'object' && doctor.walletAddress.toText 
          ? doctor.walletAddress.toText() 
          : doctor.walletAddress.toString(),
        photoURL: doctor.photoURL,
        isActive: doctor.isActive
      }));
    } catch (error) {
      console.error('Error getting available doctors:', error);
      throw error;
    }
  }
};

function DoctorSchedule() {
  // Get principal and actor from parent layout via context
  const { principal, actor } = useOutletContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [doctors, setDoctors] = useState([]);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [doctorSchedules, setDoctorSchedules] = useState([]); // Raw blockchain schedules
  const [loading, setLoading] = useState(false);
  const [showAddButtons, setShowAddButtons] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showAllSchedulesModal, setShowAllSchedulesModal] = useState(false);
  const [selectedDaySchedules, setSelectedDaySchedules] = useState({ date: null, schedules: [] });
  const [newSchedule, setNewSchedule] = useState({
    startTime: '',
    endTime: '',
    description: ''
  });
  const [error, setError] = useState(null);

  // Debug: Log principal and actor status
  useEffect(() => {
    console.log('DoctorSchedule - Principal:', principal);
    console.log('DoctorSchedule - Actor available:', !!actor);
  }, [principal, actor]);

  // Load doctors when actor becomes available
  useEffect(() => {
    if (actor) {
      loadDoctors();
    }
  }, [actor, principal]);

  // Load schedules when selectedDoctorId changes
  useEffect(() => {
    if (selectedDoctorId && actor) {
      loadDoctorSchedules(selectedDoctorId);
    }
  }, [selectedDoctorId, actor]);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const doctorList = await canisterAPI.getDoctors(actor);
      console.log('Loaded doctors:', doctorList);
      setDoctors(doctorList);
      
      // Find current doctor based on principal
      if (principal) {
        console.log('Looking for doctor with principal:', principal);
        
        const currentDoc = doctorList.find(d => {
          console.log('Comparing:', d.walletAddress, 'with', principal);
          return d.walletAddress === principal && d.isActive;
        });
        
        console.log('Current doctor found:', currentDoc);
        setCurrentDoctor(currentDoc);
        
        // Auto-select current doctor's schedule
        if (currentDoc) {
          setSelectedDoctorId(currentDoc.id);
        }
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
      setError('Failed to load doctors: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDoctorSchedules = async (doctorId) => {
    if (!doctorId || !actor) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log('Loading schedules for doctor ID:', doctorId);
      
      // Get schedules from blockchain
      const schedules = await canisterAPI.getDoctorSchedule(actor, doctorId);
      console.log('Loaded schedules from blockchain:', schedules);
      
      // Filter only active schedules
      const activeSchedules = schedules.filter(s => s.isAvailable);
      setDoctorSchedules(activeSchedules);
      
    } catch (error) {
      console.error('Error loading schedules:', error);
      setError('Failed to load schedules: ' + error.message);
      setDoctorSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  // Generate calendar data for current month with blockchain schedules
  const generateCalendarData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const calendarDays = [];
    const currentDateObj = new Date(startDate);
    
    // Find selected doctor info
    const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);
    
    for (let i = 0; i < 42; i++) {
      const day = currentDateObj.getDate();
      const isCurrentMonth = currentDateObj.getMonth() === month;
      const dateKey = currentDateObj.toISOString().split('T')[0];
      const dayOfWeek = currentDateObj.getDay();
      
      // Get schedules for this day of week from blockchain data
      const daySchedules = doctorSchedules
        .filter(schedule => schedule.dayOfWeek === dayOfWeek)
        .map(schedule => ({
          id: schedule.id,
          doctor: selectedDoctor ? selectedDoctor.name : 'Unknown Doctor',
          time: `${schedule.startTime} - ${schedule.endTime}`,
          description: 'Available for consultation',
          doctorId: schedule.doctorId,
          blockchainScheduleId: schedule.id,
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          isBlockchainSchedule: true
        }));
      
      calendarDays.push({
        day,
        date: new Date(currentDateObj),
        dateKey,
        dayOfWeek,
        month: currentDateObj.toLocaleDateString('en-US', { month: 'long' }),
        isOtherMonth: !isCurrentMonth,
        isSunday: currentDateObj.getDay() === 0,
        isHighlighted: dateKey === new Date().toISOString().split('T')[0],
        schedules: daySchedules
      });
      
      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }
    
    return calendarDays;
  };

  const handleAddSchedule = async () => {
    if (!principal) {
      alert('Please connect your wallet using the login button in the header');
      return;
    }
    
    if (!currentDoctor) {
      alert('You must be a registered doctor to add schedules');
      return;
    }
    
    if (!newSchedule.startTime || !newSchedule.endTime) {
      alert('Please fill start time and end time');
      return;
    }

    if (!selectedDate) {
      alert('No date selected');
      return;
    }

    // Validate time format and logic
    if (newSchedule.startTime >= newSchedule.endTime) {
      alert('End time must be after start time');
      return;
    }

    try {
      setLoading(true);
      const dayOfWeek = selectedDate.getDay();
      console.log('Adding schedule for day of week:', dayOfWeek);
      
      const result = await canisterAPI.addDoctorSchedule(
        actor,
        currentDoctor.id,
        dayOfWeek,
        newSchedule.startTime,
        newSchedule.endTime
      );

      if (result.success) {
        console.log('Schedule added successfully to blockchain:', result.message);
        
        // Reload schedules to get updated data from blockchain
        await loadDoctorSchedules(currentDoctor.id);

        // Reset form and close modal
        setNewSchedule({ startTime: '', endTime: '', description: '' });
        setShowAddModal(false);
        setSelectedDate(null);
        
        alert(`Schedule added successfully for ${getDayName(dayOfWeek)}s!`);
      }
    } catch (error) {
      console.error('Error adding schedule:', error);
      alert('Error adding schedule: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSchedule = async () => {
    if (!selectedSchedule || !selectedSchedule.blockchainScheduleId) {
      alert('Invalid schedule selected');
      return;
    }

    if (!newSchedule.startTime || !newSchedule.endTime) {
      alert('Please fill start time and end time');
      return;
    }

    // Validate time format and logic
    if (newSchedule.startTime >= newSchedule.endTime) {
      alert('End time must be after start time');
      return;
    }

    try {
      setLoading(true);
      console.log('Updating schedule:', selectedSchedule.blockchainScheduleId);
      
      const result = await canisterAPI.updateDoctorSchedule(
        actor,
        selectedSchedule.blockchainScheduleId,
        newSchedule.startTime,
        newSchedule.endTime,
        true // isAvailable
      );

      if (result.success) {
        console.log('Schedule updated successfully in blockchain:', result.message);
        
        // Reload schedules to get updated data from blockchain
        await loadDoctorSchedules(selectedDoctorId);

        // Close modal and reset form
        setShowEditModal(false);
        setSelectedSchedule(null);
        setSelectedDate(null);
        setNewSchedule({ startTime: '', endTime: '', description: '' });
        
        alert('Schedule updated successfully!');
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      alert('Error updating schedule: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateSchedule = async (schedule) => {
    if (!schedule.blockchainScheduleId) {
      alert('Invalid schedule selected');
      return;
    }

    if (!confirm('Are you sure you want to deactivate this schedule?')) {
      return;
    }

    try {
      setLoading(true);
      
      const result = await canisterAPI.updateDoctorSchedule(
        actor,
        schedule.blockchainScheduleId,
        schedule.startTime,
        schedule.endTime,
        false // isAvailable = false (deactivate)
      );

      if (result.success) {
        console.log('Schedule deactivated successfully');
        
        // Reload schedules
        await loadDoctorSchedules(selectedDoctorId);
        
        alert('Schedule deactivated successfully!');
      }
    } catch (error) {
      console.error('Error deactivating schedule:', error);
      alert('Error deactivating schedule: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const openAllSchedulesModal = (date, schedules) => {
    setSelectedDaySchedules({ date, schedules });
    setShowAllSchedulesModal(true);
  };

  const openAddModal = (date) => {
    if (!principal) {
      alert('Please connect your wallet to add schedules');
      return;
    }
    
    if (!currentDoctor) {
      alert('You must be a registered doctor to add schedules');
      return;
    }
    
    console.log('Opening add modal for date:', date.toISOString().split('T')[0]);
    setSelectedDate(date);
    setNewSchedule({ startTime: '', endTime: '', description: '' });
    setShowAddModal(true);
    setShowAddButtons(false);
  };

  const openEditModal = (schedule, date) => {
    if (!principal) {
      alert('Please connect your wallet to edit schedules');
      return;
    }
    
    if (!currentDoctor || schedule.doctorId !== currentDoctor.id) {
      alert('You can only edit your own schedules');
      return;
    }
    
    console.log('Opening edit modal for schedule:', schedule);
    setSelectedSchedule(schedule);
    setSelectedDate(date);
    setNewSchedule({
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      description: schedule.description || ''
    });
    setShowEditModal(true);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getDayName = (dayOfWeek) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek] || 'Unknown';
  };

  // Handle doctor selection change
  const handleDoctorChange = (doctorId) => {
    setSelectedDoctorId(Number(doctorId));
    setDoctorSchedules([]); // Clear current schedules
  };

  const calendarData = generateCalendarData();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-[960px] mx-auto border border-gray-200 rounded-xl p-4 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm sm:text-base">
          <span>{monthName}</span>
          <button
            onClick={() => navigateMonth(-1)}
            aria-label="Previous month"
            className="flex items-center justify-center w-7 h-7 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            <i className="fas fa-chevron-left text-xs"></i>
          </button>
          <button
            onClick={() => navigateMonth(1)}
            aria-label="Next month"
            className="flex items-center justify-center w-7 h-7 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            <i className="fas fa-chevron-right text-xs"></i>
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          {/* Doctor Selection Dropdown */}
          {doctors.length > 0 && (
            <select
              value={selectedDoctorId || ''}
              onChange={(e) => handleDoctorChange(e.target.value)}
              className="rounded-full border border-gray-300 text-gray-600 text-xs sm:text-sm px-3 py-1.5 bg-white cursor-pointer"
            >
              <option value="">Select Doctor</option>
              {doctors.filter(d => d.isActive).map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} ({doctor.specialty})
                </option>
              ))}
            </select>
          )}
          
          {/* Add Schedule Button */}
          {principal && currentDoctor && selectedDoctorId === currentDoctor.id && (
            <button
              onClick={() => setShowAddButtons(!showAddButtons)}
              className={`rounded-full px-3 py-1.5 transition-colors flex items-center gap-1 ${
                showAddButtons 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
              type="button"
            >
              <i className={`fas ${showAddButtons ? 'fa-check' : 'fa-plus'} text-xs`}></i>
              {showAddButtons ? 'Adding Mode' : 'Add Schedule'}
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <i className="fas fa-exclamation-circle text-red-500 mr-2"></i>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Connection Status */}
      {!principal && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <i className="fas fa-info-circle text-blue-500 mr-2"></i>
            <p className="text-sm text-blue-800">
              Connect your wallet using the login button in the header to manage doctor schedules.
            </p>
          </div>
        </div>
      )}

      {/* Doctor Status */}
      {principal && !currentDoctor && !loading && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center">
            <i className="fas fa-exclamation-triangle text-orange-500 mr-2"></i>
            <p className="text-sm text-orange-800">
              You are not registered as a doctor. Only registered doctors can manage schedules.
            </p>
          </div>
        </div>
      )}

      {/* Current Doctor Info */}
      {currentDoctor && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <i className="fas fa-user-md text-green-500 mr-2"></i>
              <div>
                <p className="text-sm font-medium text-green-800">Logged in as: {currentDoctor.name}</p>
                <p className="text-xs text-green-600">{currentDoctor.specialty} (Hospital ID: {currentDoctor.hospitalId})</p>
              </div>
            </div>
            {selectedDoctorId === currentDoctor.id && (
              <div className="text-xs text-green-600">
                Click dates to add weekly recurring schedules
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schedule Info */}
      {selectedDoctorId && selectedDoctorId !== currentDoctor?.id && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <i className="fas fa-eye text-blue-500 mr-2"></i>
            <p className="text-sm text-blue-800">
              Viewing schedules for: {doctors.find(d => d.id === selectedDoctorId)?.name}
            </p>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 flex items-center">
            <i className="fas fa-spinner fa-spin mr-2"></i>
            Loading from blockchain...
          </p>
        </div>
      )}

      {/* Schedule Summary */}
      {selectedDoctorId && doctorSchedules.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">
            <i className="fas fa-calendar-alt text-gray-500 mr-2"></i>
            Active Schedules ({doctorSchedules.length}):
          </p>
          <div className="flex flex-wrap gap-2">
            {doctorSchedules.map(schedule => (
              <span 
                key={schedule.id}
                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {getDayName(schedule.dayOfWeek)} {schedule.startTime}-{schedule.endTime}
                {currentDoctor && schedule.doctorId === currentDoctor.id && (
                  <button
                    onClick={() => handleDeactivateSchedule(schedule)}
                    className="ml-1 text-red-600 hover:text-red-800"
                    title="Deactivate this schedule"
                  >
                    <i className="fas fa-times text-xs"></i>
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center text-gray-500 text-[11px] sm:text-xs font-semibold border-b border-gray-200 pb-2 select-none">
        <div>Sunday</div>
        <div>Monday</div>
        <div>Tuesday</div>
        <div>Wednesday</div>
        <div>Thursday</div>
        <div>Friday</div>
        <div>Saturday</div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 border-t border-gray-200 text-[10px] sm:text-xs text-gray-400 select-none">
        {calendarData.map((dayData, index) => (
          <div
            key={index}
            className={`h-[130px] ${index % 7 === 6 ? '' : 'border-r'} border-b border-gray-200 ${dayData.isOtherMonth ? 'diagonal-stripes' : ''} p-1 relative overflow-hidden`}
          >
            <span
              className={`absolute top-1 right-1 text-[9px] select-none z-10 ${
                dayData.isSunday ? 'text-red-500' : 
                dayData.isHighlighted ? 'bg-blue-900 text-white rounded-full w-5 h-5 flex items-center justify-center' : 
                dayData.isOtherMonth ? 'text-gray-300' : 'text-gray-400'
              }`}
            >
              {dayData.day}
            </span>
            
            {/* Add Schedule Button */}
            {!dayData.isOtherMonth && showAddButtons && selectedDoctorId === currentDoctor?.id && (
              <button
                onClick={() => openAddModal(dayData.date)}
                className="absolute top-5 left-1 w-4 h-4 bg-green-500 text-white rounded-full text-[8px] hover:bg-green-600 flex items-center justify-center transition-colors shadow-sm z-10"
                title={`Add weekly recurring schedule for ${getDayName(dayData.dayOfWeek)}s`}
              >
                +
              </button>
            )}

            {/* Schedules Container */}
            <div className="mt-6 space-y-1 max-h-[90px] overflow-hidden">
              {dayData.schedules.slice(0, 3).map((schedule, idx) => {
                const isOwnSchedule = schedule.doctorId === currentDoctor?.id;
                return (
                  <div
                    key={`${schedule.id}-${idx}`}
                    className={`${
                      isOwnSchedule ? 'bg-cyan-200' : 'bg-blue-100'
                    } rounded-md p-1 cursor-pointer select-text group relative transition-all hover:scale-[1.02]`}
                    title={`${schedule.doctor} - ${schedule.description} - ${schedule.time}`}
                    onClick={() => isOwnSchedule && openEditModal(schedule, dayData.date)}
                  >
                    <p className={`font-bold text-[10px] ${
                      isOwnSchedule ? 'text-cyan-900' : 'text-blue-900'
                    } leading-tight truncate`}>
                      {schedule.doctor.length > 12 ? schedule.doctor.substring(0, 12) + '...' : schedule.doctor}
                    </p>
                    
                    <p className={`flex items-center gap-1 text-[8px] ${
                      isOwnSchedule ? 'text-cyan-700' : 'text-blue-700'
                    } leading-tight`}>
                      <i className="far fa-clock"></i> 
                      <span className="truncate">{schedule.time}</span>
                    </p>
                    
                    {/* Indicators */}
                    <div className="absolute top-0 right-0 flex gap-1">
                      {/* Edit indicator untuk jadwal sendiri */}
                      {isOwnSchedule && (
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full opacity-70" title="Click to edit"></div>
                      )}
                      
                      {/* Blockchain indicator */}
                      {schedule.isBlockchainSchedule && (
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full opacity-70" title="Stored on blockchain"></div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {/* Show more indicator */}
              {dayData.schedules.length > 3 && (
                <div className="text-center">
                  <div 
                    className="inline-flex items-center justify-center w-full py-1 bg-gray-100 text-gray-600 rounded-md cursor-pointer hover:bg-gray-200 transition-colors"
                    title={`${dayData.schedules.length - 3} more schedules. Click to view all.`}
                    onClick={() => {
                      openAllSchedulesModal(dayData.date, dayData.schedules);
                    }}
                  >
                    <span className="text-[8px] font-medium">+{dayData.schedules.length - 3} more</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw] shadow-xl">
            <h3 className="text-lg font-semibold mb-4">
              Add Weekly Schedule for {getDayName(selectedDate?.getDay())}s
            </h3>
            
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <i className="fas fa-info-circle mr-2"></i>
                This will create a recurring weekly schedule for every {getDayName(selectedDate?.getDay())}
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                  <input
                    type="time"
                    value={newSchedule.startTime}
                    onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
                  <input
                    type="time"
                    value={newSchedule.endTime}
                    onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  value={newSchedule.description}
                  onChange={(e) => setNewSchedule({...newSchedule, description: e.target.value})}
                  placeholder="e.g., General consultation, Routine check-up"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedDate(null);
                  setNewSchedule({ startTime: '', endTime: '', description: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleAddSchedule}
                className="flex-1 px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors disabled:opacity-50"
                disabled={loading || !newSchedule.startTime || !newSchedule.endTime}
              >
                {loading ? 'Adding to Blockchain...' : 'Add Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw] shadow-xl">
            <h3 className="text-lg font-semibold mb-4">
              Edit Schedule for {getDayName(selectedSchedule?.dayOfWeek)}s
            </h3>
            
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                This will update the recurring weekly schedule stored on blockchain
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                  <input
                    type="time"
                    value={newSchedule.startTime}
                    onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
                  <input
                    type="time"
                    value={newSchedule.endTime}
                    onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  value={newSchedule.description}
                  onChange={(e) => setNewSchedule({...newSchedule, description: e.target.value})}
                  placeholder="e.g., General consultation, Routine check-up"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {/* Schedule Info */}
              {selectedSchedule && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Blockchain ID:</strong> {selectedSchedule.blockchainScheduleId}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Current:</strong> {selectedSchedule.time}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedSchedule(null);
                  setSelectedDate(null);
                  setNewSchedule({ startTime: '', endTime: '', description: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleEditSchedule}
                className="flex-1 px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors disabled:opacity-50"
                disabled={loading || !newSchedule.startTime || !newSchedule.endTime}
              >
                {loading ? 'Updating...' : 'Update Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View All Schedules Modal */}
      {showAllSchedulesModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px] max-w-[90vw] max-h-[80vh] shadow-xl overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                All Schedules - {selectedDaySchedules.date?.toLocaleDateString()}
              </h3>
              <button
                onClick={() => setShowAllSchedulesModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <i className="fas fa-calendar-day mr-2"></i>
                {getDayName(selectedDaySchedules.date?.getDay())} - Total {selectedDaySchedules.schedules.length} schedules
              </p>
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {selectedDaySchedules.schedules.map((schedule, idx) => {
                const isOwnSchedule = schedule.doctorId === currentDoctor?.id;
                return (
                  <div
                    key={`modal-${schedule.id}-${idx}`}
                    className={`${
                      isOwnSchedule ? 'bg-cyan-50 border-cyan-200' : 'bg-blue-50 border-blue-200'
                    } border rounded-lg p-4 transition-all hover:shadow-md`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className={`font-semibold text-base ${
                            isOwnSchedule ? 'text-cyan-900' : 'text-blue-900'
                          }`}>
                            {schedule.doctor}
                          </h4>
                          <div className="flex gap-1">
                            {isOwnSchedule && (
                              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                <i className="fas fa-edit mr-1"></i>
                                Your Schedule
                              </span>
                            )}
                            {schedule.isBlockchainSchedule && (
                              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                <i className="fas fa-link mr-1"></i>
                                Blockchain
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <p className={`flex items-center gap-2 text-sm ${
                            isOwnSchedule ? 'text-cyan-700' : 'text-blue-700'
                          }`}>
                            <i className="far fa-clock"></i>
                            <span className="font-medium">{schedule.time}</span>
                          </p>
                          
                          {schedule.description && (
                            <p className={`text-sm ${
                              isOwnSchedule ? 'text-cyan-600' : 'text-blue-600'
                            }`}>
                              <i className="fas fa-info-circle mr-2"></i>
                              {schedule.description}
                            </p>
                          )}
                          
                          {schedule.blockchainScheduleId && (
                            <p className="text-xs text-gray-500">
                              Blockchain ID: {schedule.blockchainScheduleId}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Action buttons */}
                      {isOwnSchedule && (
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => {
                              setShowAllSchedulesModal(false);
                              openEditModal(schedule, selectedDaySchedules.date);
                            }}
                            className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                            title="Edit Schedule"
                          >
                            <i className="fas fa-edit text-xs"></i>
                          </button>
                          <button
                            onClick={() => {
                              setShowAllSchedulesModal(false);
                              handleDeactivateSchedule(schedule);
                            }}
                            className="flex items-center justify-center w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            title="Deactivate Schedule"
                          >
                            <i className="fas fa-trash text-xs"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowAllSchedulesModal(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {selectedDoctorId && doctorSchedules.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <i className="fas fa-calendar-times text-2xl"></i>
          </div>
          <p className="text-gray-600 text-sm">
            No schedules found for {doctors.find(d => d.id === selectedDoctorId)?.name}
          </p>
          {selectedDoctorId === currentDoctor?.id && (
            <p className="text-gray-500 text-xs mt-2">
              Click "Add Schedule" button then click on specific dates to add weekly recurring schedules
            </p>
          )}
        </div>
      )}

      {/* No Doctor Selected State */}
      {!selectedDoctorId && !loading && doctors.length > 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <i className="fas fa-user-md text-2xl"></i>
          </div>
          <p className="text-gray-600 text-sm">
            Select a doctor from the dropdown to view their schedules
          </p>
        </div>
      )}

      {/* No Doctors Available */}
      {doctors.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <i className="fas fa-users text-2xl"></i>
          </div>
          <p className="text-gray-600 text-sm">
            No doctors found in the system
          </p>
        </div>
      )}

      <style jsx>{`
        .diagonal-stripes {
          background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(0,0,0,.1) 10px,
            rgba(0,0,0,.1) 20px
          );
        }
      `}</style>
    </div>
  );
}

export default DoctorSchedule;