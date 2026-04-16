import { useAdminStore } from '@/src/store/adminStore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AdminHomeScreen() {
  const { isLoading, fetchStats } = useAdminStore();
  const [stats, setStats] = useState<any>({
    totalRequests: 0,
    completedRequests: 0,
    pendingRequests: 0,
    totalAmount: 0,
  });
  const [requests, setRequests] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');

  // New vendor management state
  const [createVendorModalVisible, setCreateVendorModalVisible] = useState(false);
  const [newVendor, setNewVendor] = useState({ name: '', email: '', phone: '', password: '' });
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(() => {
      loadDashboard(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async (silent = false) => {
    try {
      // Load requests and vendors in parallel
      await Promise.all([
        loadRequests(silent),
        loadVendors(),
      ]);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  };

  useEffect(() => {
    calculateStats();
  }, [requests]);

  const calculateStats = () => {
    const totalRequests = requests.length;
    const completedRequests = requests.filter(r => r.status === 'COMPLETED').length;
    const pendingRequests = requests.filter(r => r.status === 'CREATED' || r.status === 'SCHEDULED').length;
    const totalAmount = requests
      .filter(r => r.status === 'COMPLETED')
      .reduce((sum, r) => sum + (r.finalPrice || 0), 0);

    setStats({
      totalRequests,
      completedRequests,
      pendingRequests,
      totalAmount,
    });
  };

  const loadRequests = async (silent = false) => {
    try {
      if (!silent) setIsLoadingRequests(true);
      const token = await require('expo-secure-store').getItemAsync('auth_token');
      const response = await fetch('http://192.168.137.66:5000/api/admin/requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Failed to load requests:', error);
      setRequests([]);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const loadVendors = async () => {
    try {
      const token = await require('expo-secure-store').getItemAsync('auth_token');
      const response = await fetch('http://192.168.137.66:5000/api/admin/vendors', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vendors');
      }

      const data = await response.json();
      setVendors(data);
    } catch (error) {
      console.error('Failed to load vendors:', error);
      setVendors([]);
    }
  };

  const handleAssignVendor = async () => {
    if (!selectedRequest || !selectedVendorId) {
      Alert.alert('Error', 'Please select a vendor');
      return;
    }

    try {
      const response = await fetch(`http://192.168.137.66:5000/api/admin/requests/${selectedRequest._id}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await require('expo-secure-store').getItemAsync('auth_token'))}`,
        },
        body: JSON.stringify({ vendorId: selectedVendorId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      Alert.alert('Success', 'Vendor assigned successfully!');
      setAssignModalVisible(false);
      setSelectedRequest(null);
      setSelectedVendorId('');
      loadRequests();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to assign vendor');
    }
  };

  const handleCreateVendor = async () => {
    if (!newVendor.name || !newVendor.phone || !newVendor.password) {
      Alert.alert('Error', 'Name, phone, and password are required');
      return;
    }
    try {
      const response = await fetch('http://192.168.137.66:5000/api/admin/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await require('expo-secure-store').getItemAsync('auth_token'))}`,
        },
        body: JSON.stringify(newVendor),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      Alert.alert('Success', 'Vendor created successfully!');
      setCreateVendorModalVisible(false);
      setNewVendor({ name: '', email: '', phone: '', password: '' });
      loadVendors();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create vendor');
    }
  };

  const handleToggleVendorStatus = async (vendorId: string) => {
    try {
      const response = await fetch(`http://192.168.137.66:5000/api/admin/vendors/${vendorId}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${(await require('expo-secure-store').getItemAsync('auth_token'))}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to toggle status');
      }
      loadVendors();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update vendor');
    }
  };

  const openAssignModal = (request: any) => {
    setSelectedRequest(request);
    setSelectedVendorId('');
    setAssignModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CREATED': return '#f39c12';
      case 'SCHEDULED': return '#3498db';
      case 'IN_PROGRESS': return '#9b59b6';
      case 'COMPLETED': return '#27ae60';
      case 'CANCELLED': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  if (isLoadingRequests) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8e44ad" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>BMC E-Waste Management System</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.statCardBlue]}>
          <Text style={styles.statNumber}>{stats.totalRequests}</Text>
          <Text style={styles.statLabel}>Total Requests</Text>
        </View>

        <View style={[styles.statCard, styles.statCardGreen]}>
          <Text style={styles.statNumber}>{stats.completedRequests}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>

        <View style={[styles.statCard, styles.statCardOrange]}>
          <Text style={styles.statNumber}>{stats.pendingRequests}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>

        <View style={[styles.statCard, styles.statCardPurple]}>
          <Text style={styles.statNumber}>₹{stats.totalAmount.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Paid</Text>
        </View>
      </View>

      {/* Pending Requests Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pending Assignments</Text>
        {isLoadingRequests ? (
          <ActivityIndicator size="small" color="#8e44ad" />
        ) : requests.filter(r => r.status === 'CREATED' || r.status === 'SCHEDULED').length === 0 ? (
          <Text style={styles.emptyText}>No pending requests</Text>
        ) : (
          requests.filter(r => r.status === 'CREATED' || r.status === 'SCHEDULED').map((request) => {
            const items = (request.items && request.items.length > 0)
              ? request.items
              : (request.category ? [{ category: request.category, quantity: request.quantity }] : []);
            if (items.length === 0) return null;

            return (
              <View key={request._id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <Text style={styles.requestCategory}>
                    {items.length > 1
                      ? `Multiple Items (${items.length})`
                      : items[0]?.category}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                    <Text style={styles.statusText}>{request.status}</Text>
                  </View>
                </View>
                <Text style={styles.requestDetail}>
                  Items: {items.map((i: any) => `${i.category} x${i.quantity}`).join(', ')}
                </Text>
                <Text style={styles.requestDetail}>Customer: {request.userId?.name || 'N/A'}</Text>
                <Text style={styles.requestDetail}>Phone: {request.userId?.phone || 'N/A'}</Text>
                <Text style={styles.requestDetail}>Address: {request.address}</Text>
                {request.assignedVendorId ? (
                  <View style={styles.vendorInfo}>
                    <Text style={styles.vendorText}>Assigned: {request.assignedVendorId.name}</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.assignButton}
                    onPress={() => openAssignModal(request)}
                  >
                    <Text style={styles.assignButtonText}>Assign Vendor</Text>
                  </TouchableOpacity>
                )}
              </View>
            )
          })
        )}
      </View>



      {/* Vendor Management Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Vendor Management</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setCreateVendorModalVisible(true)}>
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>
        {vendors.length === 0 ? (
          <Text style={styles.emptyText}>No vendors found</Text>
        ) : (
          vendors.map((vendor) => (
            <View key={vendor._id} style={styles.manageVendorCard}>
              <View style={styles.manageVendorInfo}>
                <Text style={styles.manageVendorName}>{vendor.name}</Text>
                <Text style={styles.manageVendorDetail}>📞 {vendor.phone}</Text>
                {!!vendor.email && <Text style={styles.manageVendorDetail}>✉️ {vendor.email}</Text>}
                <Text style={[styles.statusBadgeText, vendor.isActive ? styles.activeText : styles.inactiveText]}>
                  {vendor.isActive ? 'Active' : 'Disabled'}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.toggleBtn, vendor.isActive ? styles.disableBtn : styles.enableBtn]}
                onPress={() => handleToggleVendorStatus(vendor._id)}
              >
                <Text style={styles.toggleBtnText}>
                  {vendor.isActive ? 'Disable' : 'Enable'}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Assign Vendor Modal */}
      <Modal
        visible={assignModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAssignModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assign Vendor</Text>
            {selectedRequest && (
              <>
                <Text style={styles.modalLabel}>
                  Request: {(() => {
                    const reqItems = (selectedRequest.items && selectedRequest.items.length > 0)
                      ? selectedRequest.items
                      : (selectedRequest.category ? [{ category: selectedRequest.category }] : []);
                    return reqItems.length > 1
                      ? `Multiple Items (${reqItems.length})`
                      : reqItems[0]?.category || 'Unknown';
                  })()}
                </Text>
                <Text style={styles.modalLabel}>Customer: {selectedRequest.userId?.name}</Text>
              </>
            )}

            <Text style={styles.label}>Select Vendor</Text>
            {vendors.map((vendor) => (
              <TouchableOpacity
                key={vendor._id}
                style={[
                  styles.vendorOption,
                  selectedVendorId === vendor._id && styles.vendorOptionSelected,
                ]}
                onPress={() => setSelectedVendorId(vendor._id)}
              >
                <Text style={[styles.vendorOptionText, selectedVendorId === vendor._id && styles.vendorOptionTextSelected]}>
                  {vendor.name}
                </Text>
                <Text style={styles.vendorOptionPhone}>{vendor.phone}</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setAssignModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleAssignVendor}
              >
                <Text style={styles.submitButtonText}>Assign</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Vendor Modal */}
      <Modal
        visible={createVendorModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCreateVendorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Vendor</Text>

            <Text style={styles.label}>Name *</Text>
            <TextInput style={styles.input} value={newVendor.name} onChangeText={t => setNewVendor({ ...newVendor, name: t })} />

            <Text style={styles.label}>Phone *</Text>
            <TextInput style={styles.input} value={newVendor.phone} keyboardType="phone-pad" onChangeText={t => setNewVendor({ ...newVendor, phone: t })} />

            <Text style={styles.label}>Email (optional)</Text>
            <TextInput style={styles.input} value={newVendor.email} keyboardType="email-address" onChangeText={t => setNewVendor({ ...newVendor, email: t })} />

            <Text style={styles.label}>Password *</Text>
            <TextInput style={styles.input} value={newVendor.password} secureTextEntry onChangeText={t => setNewVendor({ ...newVendor, password: t })} />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setCreateVendorModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.submitButton]} onPress={handleCreateVendor}>
                <Text style={styles.submitButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statCardBlue: {
    backgroundColor: '#3498db',
  },
  statCardGreen: {
    backgroundColor: '#27ae60',
  },
  statCardOrange: {
    backgroundColor: '#f39c12',
  },
  statCardPurple: {
    backgroundColor: '#9b59b6',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
    marginTop: 8,
    opacity: 0.9,
  },
  section: {
    margin: 16,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  requestCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  requestDetail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  vendorInfo: {
    backgroundColor: '#d5f5e3',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  vendorText: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '600',
  },
  assignButton: {
    backgroundColor: '#8e44ad',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  assignButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    marginTop: 8,
  },
  vendorOption: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#dee2e6',
  },
  vendorOptionSelected: {
    backgroundColor: '#8e44ad',
    borderColor: '#8e44ad',
  },
  vendorOptionText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
  },
  vendorOptionTextSelected: {
    color: '#fff',
  },
  vendorOptionPhone: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#8e44ad',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  manageVendorCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
    alignItems: 'center',
  },
  manageVendorInfo: {
    flex: 1,
  },
  manageVendorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  manageVendorDetail: {
    fontSize: 13,
    color: '#7f8c8d',
    marginTop: 2,
  },
  statusBadgeText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeText: { color: '#27ae60' },
  inactiveText: { color: '#e74c3c' },
  toggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 10,
  },
  disableBtn: { backgroundColor: '#e74c3c' },
  enableBtn: { backgroundColor: '#2ecc71' },
  toggleBtnText: { color: '#fff', fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    fontSize: 16,
  },
});
