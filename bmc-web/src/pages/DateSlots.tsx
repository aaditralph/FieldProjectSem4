import { useEffect, useState } from 'react';
import { useDateSlotStore } from '../store/dateSlotStore';
import { DateSlot } from '../types';
import './DateSlots.css';

interface TimeSlotInput {
  slot: string;
  maxTickets: string;
}

const DateSlots = () => {
  const { dateSlots, fetchDateSlots, createDateSlot, deleteDateSlot, updateDateSlot, generateDefaultSlots, isLoading, error } = useDateSlotStore();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlotInput[]>([
    { slot: '09:00 AM - 12:00 PM', maxTickets: '10' },
    { slot: '02:00 PM - 05:00 PM', maxTickets: '10' },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchDateSlots();
  }, []);

  const handleGenerateDefault = async () => {
    if (window.confirm('This will create time slots for the next 30 days. Continue?')) {
      try {
        setIsGenerating(true);
        await generateDefaultSlots({
          days: 30,
          timeSlots: ['09:00 AM - 12:00 PM', '02:00 PM - 05:00 PM'],
          maxTickets: 10,
        });
        alert('Default slots generated successfully!');
      } catch (err) {
        // Error handled in store
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleCreateSlot = async () => {
    if (!selectedDate) {
      alert('Please select a date');
      return;
    }

    const validTimeSlots = timeSlots
      .filter(ts => ts.slot.trim() && parseInt(ts.maxTickets) > 0)
      .map(ts => ({
        slot: ts.slot.trim(),
        maxTickets: parseInt(ts.maxTickets),
        isActive: true,
      }));

    if (validTimeSlots.length === 0) {
      alert('Please add at least one valid time slot');
      return;
    }

    try {
      await createDateSlot({
        date: selectedDate,
        timeSlots: validTimeSlots,
      });
      setShowAddModal(false);
      setSelectedDate('');
      setTimeSlots([
        { slot: '09:00 AM - 12:00 PM', maxTickets: '10' },
        { slot: '02:00 PM - 05:00 PM', maxTickets: '10' },
      ]);
    } catch (err) {
      // Error handled in store
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this date slot?')) {
      deleteDateSlot(id);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateDateSlot(id, { isActive: !isActive });
    } catch (err) {
      // Error handled in store
    }
  };

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, { slot: '', maxTickets: '10' }]);
  };

  const removeTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index: number, field: keyof TimeSlotInput, value: string) => {
    const updated = [...timeSlots];
    updated[index] = { ...updated[index], [field]: value };
    setTimeSlots(updated);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getTotalBooked = (timeSlots: DateSlot['timeSlots']) => {
    return timeSlots.reduce((sum, ts) => sum + ts.bookedTickets, 0);
  };

  const getTotalCapacity = (timeSlots: DateSlot['timeSlots']) => {
    return timeSlots.reduce((sum, ts) => sum + ts.maxTickets, 0);
  };

  if (isLoading && dateSlots.length === 0) {
    return (
      <div className="dateslots-page">
        <div className="loading-screen">Loading date slots...</div>
      </div>
    );
  }

  return (
    <div className="dateslots-page">
      <div className="page-header">
        <div>
          <h1>Date Slot Management</h1>
          <p>Configure available pickup dates and time slots</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="actions-bar">
        <button 
          className="action-btn secondary" 
          onClick={handleGenerateDefault}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Auto Generate 30 Days'}
        </button>
        <button 
          className="action-btn primary" 
          onClick={() => setShowAddModal(true)}
        >
          + Add Custom Date
        </button>
      </div>

      <div className="slots-grid">
        {dateSlots.length === 0 ? (
          <div className="empty-state">
            <p>No date slots configured</p>
            <p>Generate slots or add manually</p>
          </div>
        ) : (
          dateSlots
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((slot) => {
              const totalBooked = getTotalBooked(slot.timeSlots);
              const totalCapacity = getTotalCapacity(slot.timeSlots);
              const isFull = totalBooked >= totalCapacity;
              
              return (
                <div key={slot.id} className={`slot-card ${!slot.isActive ? 'inactive' : ''}`}>
                  <div className="slot-header">
                    <div className="slot-date">
                      <span className="date-text">{formatDate(slot.date)}</span>
                      <span className={`availability ${isFull ? 'full' : ''}`}>
                        {totalBooked}/{totalCapacity} booked
                      </span>
                    </div>
                    <div className="slot-actions">
                      <button
                        className={`toggle-btn ${slot.isActive ? 'active' : 'inactive'}`}
                        onClick={() => handleToggleActive(slot.id, slot.isActive)}
                      >
                        {slot.isActive ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(slot.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className="time-slots-list">
                    {slot.timeSlots.map((ts, idx) => (
                      <div key={idx} className={`time-slot-item ${!ts.isActive ? 'inactive' : ''}`}>
                        <span className="time-text">{ts.slot}</span>
                        <div className="slot-stats">
                          <span className="booking-count">
                            {ts.bookedTickets}/{ts.maxTickets}
                          </span>
                          <span className={`status-dot ${ts.isActive ? 'active' : 'inactive'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add Date Slot</h3>
            
            <div className="form-group">
              <label>Date (YYYY-MM-DD)</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Time Slots</label>
              {timeSlots.map((ts, index) => (
                <div key={index} className="time-slot-input">
                  <input
                    type="text"
                    value={ts.slot}
                    onChange={(e) => updateTimeSlot(index, 'slot', e.target.value)}
                    placeholder="e.g., 09:00 AM - 12:00 PM"
                  />
                  <input
                    type="number"
                    value={ts.maxTickets}
                    onChange={(e) => updateTimeSlot(index, 'maxTickets', e.target.value)}
                    placeholder="Max"
                    min="1"
                  />
                  <button
                    className="remove-btn"
                    onClick={() => removeTimeSlot(index)}
                    disabled={timeSlots.length === 1}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button className="add-slot-btn" onClick={addTimeSlot}>
                + Add Time Slot
              </button>
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="create-btn" onClick={handleCreateSlot}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateSlots;
