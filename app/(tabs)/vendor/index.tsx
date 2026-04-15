import { useVendorStore } from '@/src/store/vendorStore';
import { Condition, Pickup, Request } from '@/src/types';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type PickupWithRequest = Pickup & { request: Request };

export default function VendorHomeScreen() {
  const { pickups: storePickups, isLoading, fetchPickups, completePickup } = useVendorStore();
  const [selectedPickup, setSelectedPickup] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [evaluations, setEvaluations] = useState<Record<string, { weight: string; condition: Condition }>>({});
  const [finalPrice, setFinalPrice] = useState('');

  // Cast store pickups to the correct type (backend returns Request objects)
  const pickups = storePickups as any[];

  useEffect(() => {
    fetchPickups();
  }, []);

  const handleAcceptPickup = async (pickupId: string) => {
    Alert.alert(
      'Accept Pickup',
      'Do you want to accept this pickup?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              const token = await require('expo-secure-store').getItemAsync('auth_token');
              const response = await fetch(`http://192.168.1.45:5000/api/vendor/pickups/${pickupId}/accept`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });
              
              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
              }
              
              Alert.alert('Success', 'Pickup accepted!');
              fetchPickups();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to accept pickup');
            }
          },
        },
      ]
    );
  };

  const handleCompletePickup = async () => {
    if (!selectedPickup) return;

    // Validate evaluations
    const items = selectedPickup.items || selectedPickup.request?.items || [];
    for (const item of items) {
      if (!evaluations[item.category] || !evaluations[item.category].weight) {
        Alert.alert('Missing Info', `Please enter weight for ${item.category}`);
        return;
      }
    }

    try {
      const pickupId = selectedPickup._id || selectedPickup.id;
      
      const evaluatedItems = items.map((item: any) => ({
        category: item.category,
        weight: parseFloat(evaluations[item.category].weight),
        condition: evaluations[item.category].condition,
      }));

      const payload: any = {
        otp,
        evaluatedItems,
      };

      if (finalPrice && !isNaN(parseFloat(finalPrice))) {
        payload.finalPrice = parseFloat(finalPrice);
      }

      await completePickup(pickupId, payload);

      Alert.alert('Success', 'Pickup completed successfully!');
      setModalVisible(false);
      setOtp('');
      setEvaluations({});
      setFinalPrice('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to complete pickup');
    }
  };

  const openCompleteModal = (pickup: any) => {
    setSelectedPickup(pickup);
    const initialEvals: any = {};
    const items = pickup.items || pickup.request?.items || [];
    items.forEach((item: any) => {
      initialEvals[item.category] = { weight: '', condition: Condition.WORKING };
    });
    setEvaluations(initialEvals);
    setModalVisible(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderPickup = ({ item }: { item: any }) => {
    // Backend returns Request objects directly, not PickupWithRequest
    const itemId = item._id || item.id;
    const request = item.request || item; // Handle both structures
    
    // Skip if request data is missing
    if (!request || !request.items || request.items.length === 0) {
      return (
        <View style={styles.card}>
          <Text style={styles.emptyText}>Invalid pickup data</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.category}>
            {request.items.length > 1 
              ? `Multiple Items (${request.items.length})` 
              : request.items[0]?.category}
          </Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{request.status}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.detail}>
            Items: {request.items.map((i: any) => `${i.category} x${i.quantity}`).join(', ')}
          </Text>
          <Text style={styles.detail}>Address: {request.address}</Text>
          <Text style={styles.detail}>Scheduled: {formatDate(request.scheduledTime || request.createdAt)}</Text>
          
          {request.status === 'COMPLETED' || item.completedAt ? (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>✓ Completed</Text>
            </View>
          ) : (
            <>
              {request.status === 'SCHEDULED' && (
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => handleAcceptPickup(itemId)}
                >
                  <Text style={styles.acceptButtonText}>Accept Pickup</Text>
                </TouchableOpacity>
              )}
              
              {request.status === 'IN_PROGRESS' && (
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => openCompleteModal({ ...item, request })}
                >
                  <Text style={styles.completeButtonText}>Complete Pickup</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2980b9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={pickups.filter(p => (p.request || p).status !== 'COMPLETED')}
        renderItem={renderPickup}
        keyExtractor={(item) => (item as any)._id || item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No pickups assigned</Text>
            <Text style={styles.emptySubtext}>
              New pickups will appear here when scheduled
            </Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Complete Pickup</Text>
            
            <Text style={styles.label}>Customer OTP</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 4-digit OTP"
              keyboardType="number-pad"
              maxLength={4}
              value={otp}
              onChangeText={setOtp}
            />

            <Text style={styles.label}>Evaluate Items</Text>
            {selectedPickup && (selectedPickup.items || selectedPickup.request?.items || []).map((item: any) => (
              <View key={item.category} style={styles.evaluationCard}>
                <Text style={styles.evalTitle}>{item.category} (Qty: {item.quantity})</Text>
                
                <Text style={styles.subLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.evalInput}
                  placeholder="Enter weight in kg"
                  keyboardType="decimal-pad"
                  value={evaluations[item.category]?.weight || ''}
                  onChangeText={(val) => setEvaluations({
                    ...evaluations,
                    [item.category]: { ...evaluations[item.category], weight: val }
                  })}
                />

                <Text style={styles.subLabel}>Condition</Text>
                <View style={styles.conditionContainer}>
                  {Object.values(Condition).map((cond) => (
                    <TouchableOpacity
                      key={cond}
                      style={[
                        styles.conditionButton,
                        evaluations[item.category]?.condition === cond && styles.conditionButtonActive,
                      ]}
                      onPress={() => setEvaluations({
                        ...evaluations,
                        [item.category]: { ...evaluations[item.category], condition: cond }
                      })}
                    >
                      <Text
                        style={[
                          styles.conditionText,
                          evaluations[item.category]?.condition === cond && styles.conditionTextActive,
                        ]}
                      >
                        {cond}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}

            <Text style={styles.label}>Final Price Override (₹) - Optional</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter calculated payout"
              keyboardType="decimal-pad"
              value={finalPrice}
              onChangeText={setFinalPrice}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleCompletePickup}
              >
                <Text style={styles.submitButtonText}>Complete</Text>
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
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
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
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  category: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  statusBadge: {
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    padding: 16,
    paddingTop: 12,
    gap: 8,
  },
  detail: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  acceptButton: {
    backgroundColor: '#9b59b6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#2980b9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  completedBadge: {
    backgroundColor: '#27ae60',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  completedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  conditionContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  evaluationCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  evalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
    fontWeight: '600',
  },
  evalInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  conditionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    alignItems: 'center',
  },
  conditionButtonActive: {
    backgroundColor: '#2980b9',
    borderColor: '#2980b9',
  },
  conditionText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  conditionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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
    backgroundColor: '#2980b9',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
