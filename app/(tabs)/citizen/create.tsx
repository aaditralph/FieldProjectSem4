import { useRequestStore } from '@/src/store/requestStore';
import { Category } from '@/src/types';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function CreateRequestScreen() {
  const [items, setItems] = useState<{ category: Category; quantity: number }[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category>(Category.MOBILE);
  const [currentQuantity, setCurrentQuantity] = useState('');
  
  const [address, setAddress] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [type, setType] = useState<'HOME_PICKUP' | 'DRIVE'>('HOME_PICKUP');
  
  const { createRequest, isLoading, error, clearError } = useRequestStore();
  const router = useRouter();

  const handleAddItem = () => {
    if (!currentQuantity || parseInt(currentQuantity) < 1) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity');
      return;
    }
    
    // Check if category already exists, update quantity
    const existingIndex = items.findIndex(i => i.category === currentCategory);
    if (existingIndex >= 0) {
      const newItems = [...items];
      newItems[existingIndex].quantity += parseInt(currentQuantity);
      setItems(newItems);
    } else {
      setItems([...items, { category: currentCategory, quantity: parseInt(currentQuantity) }]);
    }
    
    setCurrentQuantity('');
    setCurrentCategory(Category.MOBILE);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleSubmit = async () => {
    if (type === 'HOME_PICKUP' && items.length === 0) {
      Alert.alert('Empty Request', 'Please add at least one item');
      return;
    }

    if (!address.trim()) {
      Alert.alert('Missing Address', 'Please enter pickup address');
      return;
    }

    if (type === 'DRIVE') {
       if (!scheduledTime.trim()) {
           Alert.alert('Missing Date', 'Please specify a requested date for the drive');
           return;
       }
       if (isNaN(new Date(scheduledTime).getTime())) {
           Alert.alert('Invalid Date', 'Please specify a valid date in YYYY-MM-DD format');
           return;
       }
    }

    try {
      clearError();
      await createRequest({
        items,
        address: address.trim(),
        type,
        scheduledTime: type === 'DRIVE' ? new Date(scheduledTime).toISOString() : undefined,
      } as any);
      
      Alert.alert('Success', 'Request created successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', error || 'Failed to create request');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        
        {/* CART LIST */}
        {type === 'HOME_PICKUP' && items.length > 0 && (
          <View style={styles.cartContainer}>
            <Text style={styles.label}>Items to Pickup</Text>
            {items.map((item, idx) => (
              <View key={idx} style={styles.cartItem}>
                <Text style={styles.cartItemText}>{item.category} x {item.quantity}</Text>
                <TouchableOpacity onPress={() => handleRemoveItem(idx)}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {type === 'HOME_PICKUP' && (
        <View style={styles.addItemSection}>
          <Text style={styles.label}>Select Electronic Item</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {Object.values(Category).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  currentCategory === cat && styles.categoryChipActive,
                ]}
                onPress={() => setCurrentCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    currentCategory === cat && styles.categoryTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Quantity</Text>
          <View style={styles.addItemRow}>
            <TextInput
              style={[styles.input, styles.quantityInput]}
              placeholder="e.g., 2"
              keyboardType="number-pad"
              value={currentQuantity}
              onChangeText={setCurrentQuantity}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
              <Text style={styles.addButtonText}>Add Item</Text>
            </TouchableOpacity>
          </View>
        </View>
        )}

        <Text style={styles.label}>Pickup Address / Location</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter your complete address or location"
          value={address}
          onChangeText={setAddress}
          multiline
          numberOfLines={3}
        />

        {type === 'DRIVE' && (
          <>
            <Text style={styles.label}>Requested Drive Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2026-05-15"
              value={scheduledTime}
              onChangeText={setScheduledTime}
            />
          </>
        )}

        <Text style={styles.label}>Request Type</Text>
        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'HOME_PICKUP' && styles.typeButtonActive,
            ]}
            onPress={() => setType('HOME_PICKUP')}
          >
            <Text
              style={[
                styles.typeText,
                type === 'HOME_PICKUP' && styles.typeTextActive,
              ]}
            >
              Home Pickup
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'DRIVE' && styles.typeButtonActive,
            ]}
            onPress={() => setType('DRIVE')}
          >
            <Text
              style={[
                styles.typeText,
                type === 'DRIVE' && styles.typeTextActive,
              ]}
            >
              Community Drive
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Bulk Request</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 20,
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  cartContainer: {
    backgroundColor: '#e8f8f5',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1abc9c',
    marginBottom: 8,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#d1f2eb',
  },
  cartItemText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16a085',
  },
  removeText: {
    color: '#e74c3c',
    fontWeight: 'bold',
    fontSize: 14,
  },
  addItemSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  categoryScroll: {
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  categoryChipActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  categoryText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  addItemRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quantityInput: {
    flex: 1,
    marginBottom: 0,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dee2e6',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#27ae60',
    borderColor: '#27ae60',
  },
  typeText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  typeTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#27ae60',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
