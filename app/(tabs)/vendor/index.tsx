import { useVendorStore } from '@/src/store/vendorStore';
import { Category, Condition, Pickup, Request } from '@/src/types';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';

type PickupWithRequest = Pickup & { request: Request };

export default function VendorHomeScreen() {
  const { pickups: storePickups, isLoading, fetchPickups, completePickup } = useVendorStore();
  const [selectedPickup, setSelectedPickup] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [evaluations, setEvaluations] = useState<Record<string, { weight: string; condition: Condition }>>({});
  const [finalPrice, setFinalPrice] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);

  // Cast store pickups to the correct type (backend returns Request objects)
  const pickups = storePickups as any[];

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchPickups();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchPickups();

    const interval = setInterval(() => {
      fetchPickups(true);
    }, 5000);

    return () => clearInterval(interval);
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
              const token = await require('@/src/utils/storage').getItemAsync('auth_token');
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
    const evalKeys = Object.keys(evaluations);
    if (evalKeys.length === 0) {
      Alert.alert('Missing Info', 'Please add at least one evaluated item');
      return;
    }

    for (const cat of evalKeys) {
      if (!evaluations[cat] || !evaluations[cat].weight) {
        Alert.alert('Missing Info', `Please enter weight for ${cat}`);
        return;
      }
    }

    try {
      const pickupId = selectedPickup._id || selectedPickup.id;

      const evaluatedItems = evalKeys.map((cat: string) => ({
        category: cat,
        weight: parseFloat(evaluations[cat].weight),
        condition: evaluations[cat].condition,
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
    setShowAddCategory(false);
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
    const items = (request.items && request.items.length > 0)
      ? request.items
      : (request.category ? [{ category: request.category, quantity: request.quantity }] : []);

    // Skip if request data is missing
    if (!request || (items.length === 0 && request.type !== 'DRIVE')) {
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
            {request.type === 'DRIVE' ? 'Community Drive' : (items.length > 1
              ? `Multiple Items (${items.length})`
              : items[0]?.category)}
          </Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{request.status}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.detail}>
            Items: {items.map((i: any) => `${i.category} x${i.quantity}`).join(', ')}
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
            {Object.keys(evaluations).map((cat: string) => {
              const reqItems = selectedPickup?.items || selectedPickup?.request?.items || [];
              const matchedReqItem = reqItems.find((i: any) => i.category === cat);
              return (
                <View key={cat} style={styles.evaluationCard}>
                  <View style={styles.evalHeader}>
                    <Text style={styles.evalTitle}>
                      {cat} {matchedReqItem ? `(Qty: ${matchedReqItem.quantity})` : '(Added)'}
                    </Text>
                    {!matchedReqItem && (
                      <TouchableOpacity onPress={() => {
                        const newEvals = { ...evaluations };
                        delete newEvals[cat];
                        setEvaluations(newEvals);
                      }}>
                        <Text style={styles.removeText}>Remove</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <Text style={styles.subLabel}>Weight (kg)</Text>
                  <TextInput
                    style={styles.evalInput}
                    placeholder="Enter weight in kg"
                    keyboardType="decimal-pad"
                    value={evaluations[cat]?.weight || ''}
                    onChangeText={(val) => setEvaluations({
                      ...evaluations,
                      [cat]: { ...evaluations[cat], weight: val }
                    })}
                  />

                  <Text style={styles.subLabel}>Condition</Text>
                  <View style={styles.conditionContainer}>
                    {Object.values(Condition).map((cond) => (
                      <TouchableOpacity
                        key={cond}
                        style={[
                          styles.conditionButton,
                          evaluations[cat]?.condition === cond && styles.conditionButtonActive,
                        ]}
                        onPress={() => setEvaluations({
                          ...evaluations,
                          [cat]: { ...evaluations[cat], condition: cond }
                        })}
                      >
                        <Text
                          style={[
                            styles.conditionText,
                            evaluations[cat]?.condition === cond && styles.conditionTextActive,
                          ]}
                        >
                          {cond}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )
            })}

            <TouchableOpacity style={styles.addCategoryBtn} onPress={() => setShowAddCategory(!showAddCategory)}>
              <Text style={styles.addCategoryBtnText}>{showAddCategory ? 'Close' : '+ Add Item Category'}</Text>
            </TouchableOpacity>

            {showAddCategory && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {Object.values(Category).filter(c => !evaluations[c]).map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={styles.categoryChip}
                    onPress={() => {
                      setEvaluations({ ...evaluations, [cat]: { weight: '', condition: Condition.WORKING } });
                      setShowAddCategory(false);
                    }}
                  >
                    <Text style={styles.categoryChipText}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

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
    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
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
  addCategoryBtn: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  addCategoryBtnText: {
    color: '#2980b9',
    fontWeight: 'bold',
    fontSize: 14,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryChip: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  categoryChipText: {
    color: '#2c3e50',
    fontSize: 12,
  },
  evalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  removeText: {
    color: '#e74c3c',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
