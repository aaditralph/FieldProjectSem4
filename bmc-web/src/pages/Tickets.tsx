import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRequestStore } from '../store/requestStore';
import { Request, RequestStatus } from '../types';
import './Tickets.css';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'CREATED', label: 'Pending' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const Tickets = () => {
  const { requests, fetchRequests, isLoading, error } = useRequestStore();
  const [filterStatus, setFilterStatus] = useState<RequestStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter((request) => {
    const matchesStatus = filterStatus === 'ALL' || request.status === filterStatus;
    const matchesSearch = 
      request.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.contactPhone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

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

  const getStatusLabel = (status: RequestStatus) => {
    switch (status) {
      case 'CREATED':
        return 'Pending';
      case 'SCHEDULED':
        return 'Scheduled';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="tickets-page">
        <div className="loading-screen">Loading tickets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tickets-page">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="tickets-page">
      <div className="page-header">
        <h1>Tickets</h1>
        <p>Manage e-waste pickup requests</p>
      </div>

      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by address or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="status-filters">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={`filter-btn ${filterStatus === option.value ? 'active' : ''}`}
              onClick={() => setFilterStatus(option.value as RequestStatus | 'ALL')}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="tickets-list">
        {filteredRequests.length === 0 ? (
          <div className="empty-state">
            <p>No tickets found</p>
          </div>
        ) : (
          filteredRequests.map((ticket) => (
            <Link
              key={ticket.id}
              to={`/tickets/${ticket.id}`}
              className="ticket-card"
            >
              <div className="ticket-header">
                <div className="ticket-date">
                  <span className="date-label">Preferred Date</span>
                  <span className="date-value">{formatDate(ticket.preferredDate)}</span>
                </div>
                <span
                  className="ticket-status"
                  style={{ backgroundColor: getStatusColor(ticket.status) }}
                >
                  {getStatusLabel(ticket.status)}
                </span>
              </div>
              
              <div className="ticket-body">
                <div className="ticket-info">
                  <span className="info-label">Time Slot:</span>
                  <span className="info-value">{ticket.preferredTimeSlot}</span>
                </div>
                <div className="ticket-info">
                  <span className="info-label">Address:</span>
                  <span className="info-value">{ticket.address}</span>
                </div>
                <div className="ticket-info">
                  <span className="info-label">Contact:</span>
                  <span className="info-value">{ticket.contactPhone}</span>
                </div>
                {ticket.notes && (
                  <div className="ticket-info">
                    <span className="info-label">Notes:</span>
                    <span className="info-value notes">{ticket.notes}</span>
                  </div>
                )}
              </div>
              
              <div className="ticket-footer">
                <span className="ticket-id">ID: {ticket.id.slice(-8)}</span>
                <span className="created-at">
                  Created: {formatDate(ticket.createdAt)}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Tickets;
