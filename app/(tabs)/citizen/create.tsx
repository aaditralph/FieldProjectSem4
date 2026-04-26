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
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';

const COLORS = {
  background: '#0B0F19',
  surface: 'rgba(255, 255, 255, 0.05)',
  primary: '#10B981',
  secondary: '#14B8A6',
  text: '#FFFFFF',
  textDim: '#9CA3AF',
  border: 'rgba(255, 255, 255, 0.1)',
  danger: '#EF4444',
  dangerSurface: 'rgba(239, 68, 68, 0.1)',
};

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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        
        {/* CART LIST */}
        {type === 'HOME_PICKUP' && items.length > 0 && (
          <MotiView 
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.cartContainer}
          >
            <Text style={styles.label}>Items to Pickup</Text>
            {items.map((item, idx) => (
              <View key={idx} style={styles.cartItem}>
                <Text style={styles.cartItemText}>{item.category} x {item.quantity}</Text>
                <TouchableOpacity onPress={() => handleRemoveItem(idx)}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </MotiView>
        )}

        {type === 'HOME_PICKUP' && (
        <MotiView 
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={styles.addItemSection}
        >
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
              placeholderTextColor={COLORS.textDim}
              keyboardType="number-pad"
              value={currentQuantity}
              onChangeText={setCurrentQuantity}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
              <Text style={styles.addButtonText}>Add Item</Text>
            </TouchableOpacity>
          </View>
        </MotiView>
        )}

        <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 100 }}>
          <Text style={styles.label}>Pickup Address / Location</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter your complete address or location"
            placeholderTextColor={COLORS.textDim}
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
          />
        </MotiView>

        {type === 'DRIVE' && (
          <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }}>
            <Text style={styles.label}>Requested Drive Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2026-05-15"
              placeholderTextColor={COLORS.textDim}
              value={scheduledTime}
              onChangeText={setScheduledTime}
            />
          </MotiView>
        )}

        <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 200 }}>
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
        </MotiView>

        <MotiView from={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 300 }}>
          <TouchableOpacity
            style={[styles.submitButtonContainer, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              {isLoading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Bulk Request</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </MotiView>
        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  form: {
    padding: 20,
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  cartContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: 8,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16, 185, 129, 0.2)',
  },
  cartItemText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  removeText: {
    color: COLORS.danger,
    fontWeight: 'bold',
    fontSize: 14,
  },
  addItemSection: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.textDim,
  },
  categoryTextActive: {
    color: '#000',
    fontWeight: '700',
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
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 12,
  },
  addButtonText: {
    color: '#000',
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
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: COLORS.primary,
  },
  typeText: {
    fontSize: 14,
    color: COLORS.textDim,
  },
  typeTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  submitButtonContainer: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  submitGradient: {
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
});
