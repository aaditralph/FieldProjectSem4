import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRequestStore } from '../store/requestStore';
import { RequestStatus } from '../types';
import './TicketDetail.css';

const STATUS_OPTIONS = [
  { value: 'CREATED', label: 'Pending' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const TicketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentRequest, fetchRequestById, updateRequestStatus, isLoading, error } = useRequestStore();
  
  const [newStatus, setNewStatus] = useState<RequestStatus | ''>('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTimeSlot, setScheduledTimeSlot] = useState('');
  const [completedNotes, setCompletedNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchRequestById(id);
    }
  }, [id]);

  useEffect(() => {
    if (currentRequest) {
      setNewStatus(currentRequest.status);
      setScheduledDate(currentRequest.scheduledDate ? currentRequest.scheduledDate.split('T')[0] : '');
      setScheduledTimeSlot(currentRequest.scheduledTimeSlot || '');
    }
  }, [currentRequest]);

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case 'CREATED':
        return '#f39c12';
      case 'SCHEDULED':
        return '#3498db';
      case 'IN_PROGRESS':
        return '#9b59b6';
      case 'COMPLETED':
        return '#27ae60';
      case 'CANCELLED':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleUpdateStatus = async () => {
    if (!newStatus || !id) return;

    setUpdateError(null);
    setIsUpdating(true);

    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'SCHEDULED') {
        if (!scheduledDate) {
          setUpdateError('Please enter a scheduled date');
          return;
        }
        updateData.scheduledDate = scheduledDate;
        updateData.scheduledTimeSlot = scheduledTimeSlot || currentRequest?.preferredTimeSlot;
      }
      
      if (newStatus === 'COMPLETED' && completedNotes.trim()) {
        updateData.completedNotes = completedNotes.trim();
      }

      await updateRequestStatus(id, updateData);
      alert('Status updated successfully!');
    } catch (err: any) {
      setUpdateError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusLabel = (status: RequestStatus) => {
    return STATUS_OPTIONS.find(opt => opt.value === status)?.label || status;
  };

  if (isLoading || !currentRequest) {
    return (
      <div className="ticket-detail-page">
        <div className="loading-screen">Loading ticket details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ticket-detail-page">
        <div className="error-message">{error}</div>
        <button className="back-button" onClick={() => navigate('/tickets')}>
          Back to Tickets
        </button>
      </div>
    );
  }

  return (
    <div className="ticket-detail-page">
      <div className="page-header">
        <button className="back-link" onClick={() => navigate('/tickets')}>
          ← Back to Tickets
        </button>
        <h1>Ticket Details</h1>
        <span
          className="status-badge"
          style={{ backgroundColor: getStatusColor(currentRequest.status) }}
        >
          {getStatusLabel(currentRequest.status)}
        </span>
      </div>

      <div className="detail-grid">
        {/* Update Status Card */}
        <div className="detail-card">
          <h3>Update Status</h3>
          
          <div className="form-group">
            <label>New Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as RequestStatus)}
              disabled={isUpdating}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {newStatus === 'SCHEDULED' && (
            <>
              <div className="form-group">
                <label>Scheduled Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  disabled={isUpdating}
                />
              </div>
              <div className="form-group">
                <label>Scheduled Time Slot</label>
                <input
                  type="text"
                  value={scheduledTimeSlot}
                  onChange={(e) => setScheduledTimeSlot(e.target.value)}
                  placeholder="e.g., 09:00 AM - 12:00 PM"
                  disabled={isUpdating}
                />
              </div>
            </>
          )}

          {newStatus === 'COMPLETED' && (
            <div className="form-group">
              <label>Completion Notes</label>
              <textarea
                value={completedNotes}
                onChange={(e) => setCompletedNotes(e.target.value)}
                placeholder="Add notes about the pickup completion..."
                rows={3}
                disabled={isUpdating}
              />
            </div>
          )}

          {updateError && <div className="error-text">{updateError}</div>}

          <button
            className="update-button"
            onClick={handleUpdateStatus}
            disabled={isUpdating || newStatus === currentRequest.status}
          >
            {isUpdating ? 'Updating...' : 'Update Status'}
          </button>
        </div>

        {/* Request Info Card */}
        <div className="detail-card">
          <h3>Request Information</h3>
          
          <div className="info-row">
            <span className="label">Request ID</span>
            <span className="value mono">{currentRequest.id.slice(-8)}</span>
          </div>
          
          <div className="info-row">
            <span className="label">Preferred Date</span>
            <span className="value">{formatDate(currentRequest.preferredDate)}</span>
          </div>
          
          <div className="info-row">
            <span className="label">Preferred Time</span>
            <span className="value">{currentRequest.preferredTimeSlot}</span>
          </div>

          {currentRequest.scheduledDate && (
            <>
              <div className="info-row">
                <span className="label">Scheduled Date</span>
                <span className="value">{formatDate(currentRequest.scheduledDate)}</span>
              </div>
              <div className="info-row">
                <span className="label">Scheduled Time</span>
                <span className="value">{currentRequest.scheduledTimeSlot}</span>
              </div>
            </>
          )}
          
          <div className="info-row">
            <span className="label">Address</span>
            <span className="value">{currentRequest.address}</span>
          </div>
          
          <div className="info-row">
            <span className="label">Contact Phone</span>
            <span className="value">{currentRequest.contactPhone}</span>
          </div>
          
          {currentRequest.notes && (
            <div className="info-row">
              <span className="label">Notes</span>
              <span className="value">{currentRequest.notes}</span>
            </div>
          )}
          
          <div className="info-row">
            <span className="label">Submitted</span>
            <span className="value">{formatDateTime(currentRequest.createdAt)}</span>
          </div>
          
          {currentRequest.completedAt && (
            <>
              <div className="info-row">
                <span className="label">Completed</span>
                <span className="value">{formatDateTime(currentRequest.completedAt)}</span>
              </div>
              {currentRequest.completedNotes && (
                <div className="info-row">
                  <span className="label">Completion Notes</span>
                  <span className="value">{currentRequest.completedNotes}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Image Card */}
        {currentRequest.imageUrl && (
          <div className="detail-card image-card">
            <h3>Uploaded Image</h3>
            <img 
              src={currentRequest.imageUrl} 
              alt="Request" 
              className="request-image"
            />
          </div>
        )}

        {/* Status Timeline */}
        <div className="detail-card timeline-card">
          <h3>Status Timeline</h3>
          <div className="timeline">
            {['CREATED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].map((status, index) => {
              const isActive = ['CREATED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].indexOf(currentRequest.status) >= index;
              const isCurrent = currentRequest.status === status;
              
              return (
                <div key={status} className="timeline-item">
                  <div
                    className={`timeline-dot ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
                  />
                  {index < 3 && (
                    <div className={`timeline-line ${isActive ? 'active' : ''}`} />
                  )}
                  <span className={`timeline-label ${isActive ? 'active' : ''}`}>
                    {getStatusLabel(status as RequestStatus)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
