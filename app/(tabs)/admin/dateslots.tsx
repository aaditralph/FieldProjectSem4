import { dateSlotApi } from '@/src/api/endpoints';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
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

interface TimeSlotInput {
  slot: string;
  maxTickets: string;
  isActive: boolean;
}

interface DateSlot {
  id: string;
  date: string;
  timeSlots: {
    slot: string;
    maxTickets: number;
    bookedTickets: number;
    isActive: boolean;
  }[];
  isActive: boolean;
}

export default function DateSlotsScreen() {
  const [dateSlots, setDateSlots] = useState<DateSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlotInput[]>([
    { slot: '09:00 AM - 12:00 PM', maxTickets: '10', isActive: true },
    { slot: '02:00 PM - 05:00 PM', maxTickets: '10', isActive: true },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadDateSlots();
    }, [])
  );

  const loadDateSlots = async () => {
    try {
      setIsLoading(true);
      const response = await dateSlotApi.getAll();
      setDateSlots(response.data);
    } catch (error) {
      console.error('Failed to load date slots:', error);
      Alert.alert('Error', 'Failed to load date slots');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDateSlots();
    setRefreshing(false);
  };

  const handleGenerateDefault = async () => {
    Alert.alert(
      'Generate Default Slots',
      'This will create time slots for the next 30 days. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: async () => {
            try {
              setIsGenerating(true);
              await dateSlotApi.generateDefault({
                days: 30,
                timeSlots: ['09:00 AM - 12:00 PM', '02:00 PM - 05:00 PM'],
                maxTickets: 10,
              });
              Alert.alert('Success', 'Default slots generated successfully');
              loadDateSlots();
            } catch (error) {
              Alert.alert('Error', 'Failed to generate slots');
            } finally {
              setIsGenerating(false);
            }
          },
        },
      ]
    );
  };

  const handleCreateSlot = async () => {
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date');
      return;
    }

    const validTimeSlots = timeSlots
      .filter(ts => ts.slot.trim() && parseInt(ts.maxTickets) > 0)
      .map(ts => ({
        slot: ts.slot.trim(),
        maxTickets: parseInt(ts.maxTickets),
        isActive: ts.isActive,
      }));

    if (validTimeSlots.length === 0) {
      Alert.alert('Error', 'Please add at least one valid time slot');
      return;
    }

    try {
      await dateSlotApi.create({
        date: selectedDate,
        timeSlots: validTimeSlots,
      });
      Alert.alert('Success', 'Date slot created successfully');
      setShowAddModal(false);
      setSelectedDate('');
      setTimeSlots([
        { slot: '09:00 AM - 12:00 PM', maxTickets: '10', isActive: true },
        { slot: '02:00 PM - 05:00 PM', maxTickets: '10', isActive: true },
      ]);
      loadDateSlots();
    } catch (error) {
      Alert.alert('Error', 'Failed to create date slot');
    }
  };

  const handleDeleteSlot = (id: string) => {
    Alert.alert(
      'Delete Date Slot',
      'Are you sure you want to delete this date slot?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dateSlotApi.delete(id);
              loadDateSlots();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete date slot');
            }
          },
        },
      ]
    );
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await dateSlotApi.update(id, { isActive: !isActive });
      loadDateSlots();
    } catch (error) {
      Alert.alert('Error', 'Failed to update date slot');
    }
  };

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, { slot: '', maxTickets: '10', isActive: true }]);
  };

  const removeTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index: number, field: keyof TimeSlotInput, value: any) => {
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
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8e44ad" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Date Slot Management</Text>
        <Text style={styles.subtitle}>Manage pickup time slots</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleGenerateDefault}>
          <Text style={styles.actionButtonText}>Auto Generate 30 Days</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.actionButtonPrimary]} onPress={() => setShowAddModal(true)}>
          <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>+ Add Custom Date</Text>
        </TouchableOpacity>
      </View>

      {/* Date Slots List */}
      <ScrollView
        style={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {dateSlots.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No date slots configured</Text>
            <Text style={styles.emptySubtext}>Generate slots or add manually</Text>
          </View>
        ) : (
          dateSlots.map((slot) => (
            <View key={slot.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardDate}>{formatDate(slot.date)}</Text>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.toggleButton, slot.isActive ? styles.toggleActive : styles.toggleInactive]}
                    onPress={() => handleToggleActive(slot.id, slot.isActive)}
                  >
                    <Text style={styles.toggleText}>{slot.isActive ? 'Active' : 'Inactive'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteSlot(slot.id)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.cardBody}>
                <View style={styles.statsRow}>
                  <Text style={styles.statsText}>
                    {getTotalBooked(slot.timeSlots)} / {getTotalCapacity(slot.timeSlots)} booked
                  </Text>
                  <Text style={[
                    styles.availabilityText,
                    getTotalBooked(slot.timeSlots) >= getTotalCapacity(slot.timeSlots) && styles.fullText
                  ]}>
                    {getTotalBooked(slot.timeSlots) >= getTotalCapacity(slot.timeSlots) ? 'Full' : 'Available'}
                  </Text>
                </View>
                {slot.timeSlots.map((ts, idx) => (
                  <View key={idx} style={styles.timeSlotRow}>
                    <Text style={styles.timeSlotText}>{ts.slot}</Text>
                    <Text style={styles.timeSlotStats}>
                      {ts.bookedTickets}/{ts.maxTickets}
                    </Text>
                    <View style={[styles.statusIndicator, ts.isActive ? styles.statusActive : styles.statusInactive]} />
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Date Slot</Text>
            
            <Text style={styles.modalLabel}>Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="2024-01-15"
              value={selectedDate}
              onChangeText={setSelectedDate}
            />

            <Text style={styles.modalLabel}>Time Slots</Text>
            {timeSlots.map((ts, index) => (
              <View key={index} style={styles.timeSlotInput}>
                <TextInput
                  style={[styles.modalInput, styles.timeSlotInputField]}
                  placeholder="e.g., 09:00 AM - 12:00 PM"
                  value={ts.slot}
                  onChangeText={(text) => updateTimeSlot(index, 'slot', text)}
                />
                <TextInput
                  style={[styles.modalInput, styles.maxTicketsInput]}
                  placeholder="Max"
                  value={ts.maxTickets}
                  onChangeText={(text) => updateTimeSlot(index, 'maxTickets', text)}
                  keyboardType="number-pad"
                />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeTimeSlot(index)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addSlotButton} onPress={addTimeSlot}>
              <Text style={styles.addSlotButtonText}>+ Add Time Slot</Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleCreateSlot}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  header: {
    backgroundColor: '#8e44ad',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#8e44ad',
    alignItems: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: '#8e44ad',
    borderWidth: 0,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#8e44ad',
    fontWeight: '600',
  },
  actionButtonTextPrimary: {
    color: '#fff',
  },
  list: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  toggleActive: {
    backgroundColor: '#27ae60',
  },
  toggleInactive: {
    backgroundColor: '#95a5a6',
  },
  toggleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e74c3c',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    gap: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statsText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  availabilityText: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '600',
  },
  fullText: {
    color: '#e74c3c',
  },
  timeSlotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  timeSlotText: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
  },
  timeSlotStats: {
    fontSize: 14,
    color: '#7f8c8d',
    marginRight: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: '#27ae60',
  },
  statusInactive: {
    backgroundColor: '#e74c3c',
  },
  empty: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    marginTop: 16,
  },
  modalInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  timeSlotInput: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  timeSlotInputField: {
    flex: 1,
  },
  maxTicketsInput: {
    width: 60,
  },
  removeButton: {
    width: 40,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    borderRadius: 8,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  addSlotButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#8e44ad',
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addSlotButtonText: {
    color: '#8e44ad',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  modalButtonPrimary: {
    backgroundColor: '#8e44ad',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
  },
  modalButtonTextPrimary: {
    color: '#fff',
  },
});
