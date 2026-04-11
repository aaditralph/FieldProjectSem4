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
  const [category, setCategory] = useState<Category>(Category.MOBILE);
  const [quantity, setQuantity] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState<'HOME_PICKUP' | 'DRIVE'>('HOME_PICKUP');
  
  const { createRequest, isLoading, error, clearError } = useRequestStore();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!quantity || parseInt(quantity) < 1) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity');
      return;
    }

    if (!address.trim()) {
      Alert.alert('Missing Address', 'Please enter pickup address');
      return;
    }

    try {
      clearError();
      await createRequest({
        category,
        quantity: parseInt(quantity),
        address: address.trim(),
        type,
      });
      
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
        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {Object.values(Category).map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                category === cat && styles.categoryChipActive,
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Quantity (number of items)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 2"
          keyboardType="number-pad"
          value={quantity}
          onChangeText={setQuantity}
        />

        <Text style={styles.label}>Pickup Address</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter your complete address"
          value={address}
          onChangeText={setAddress}
          multiline
          numberOfLines={3}
        />

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
            <Text style={styles.submitButtonText}>Create Request</Text>
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
  categoryScroll: {
    marginBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  categoryChipActive: {
    backgroundColor: '#27ae60',
    borderColor: '#27ae60',
  },
  categoryText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
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
