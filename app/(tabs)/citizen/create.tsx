import { useRequestStore } from '@/src/store/requestStore';
import { Category } from '@/src/types';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSizes, Spacing, BorderRadius } from '../../../constants/theme';
import { CategoryCard } from '../../../src/components/ui/CategoryCard';
import DateTimePicker from '@react-native-community/datetimepicker';

const CATEGORIES = Object.values(Category);

type PickupType = 'HOME_PICKUP' | 'DRIVE';
type Step = 'type' | 'category' | 'details' | 'address';

export default function CreateRequestScreen() {
  const [pickupType, setPickupType] = useState<PickupType | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState('');
  const [driveDate, setDriveDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [step, setStep] = useState<Step>('type');

  const { createRequest, isLoading, clearError } = useRequestStore();
  const router = useRouter();

  const resetForm = () => {
    setPickupType(null);
    setCategory(null);
    setQuantity(1);
    setAddress('');
    setDriveDate('');
    setStep('type');
  };

  const handleSubmit = async () => {
    // Validation varies by pickup type
    if (!pickupType) {
      Alert.alert('Error', 'Please select a pickup type');
      return;
    }

    try {
      clearError();

      if (pickupType === 'DRIVE') {
        // Community drive request – address and date are required, category optional
        if (!address.trim()) {
          Alert.alert('Error', 'Please enter a location for the community drive');
          return;
        }
        if (!driveDate) {
          Alert.alert('Error', 'Please select a preferred date for the community drive');
          return;
        }

        await createRequest({
          // For community drives, category is optional – use a fallback value if none selected
          category: category || 'Other Electronics',
          quantity: 1,
          address: address.trim(),
          type: pickupType,
          scheduledTime: driveDate,
        });
      } else {
        // Home pickup – category, quantity, and address required
        if (!category) {
          Alert.alert('Error', 'Please select a category');
          return;
        }
        if (!address.trim()) {
          Alert.alert('Error', 'Please enter your pickup address');
          return;
        }

        await createRequest({
          category,
          quantity,
          address: address.trim(),
          type: pickupType,
        });
      }

      Alert.alert(
        'Success!',
        pickupType === 'DRIVE'
          ? 'Community drive request submitted! BMC will review and contact you with an OTP once approved.'
          : 'Request created! A vendor will contact you shortly.',
        [{
          text: 'OK',
          onPress: () => {
            resetForm();
            router.replace('/(tabs)/citizen/requests');
          }
        }]
      );
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to create request');
    }
  };

  const goBack = () => {
    if (step === 'address') {
      setStep('details');
    } else if (step === 'details') {
      // If drive request, go back to type selection; else go back to category
      if (pickupType === 'DRIVE') {
        setStep('type');
        setPickupType(null);
      } else {
        setStep('category');
      }
    } else if (step === 'category') {
      // Only possible for home pickup flow
      resetForm();
    } else {
      router.back();
    }
  };

  const handlePickupTypeSelect = (type: PickupType) => {
    setPickupType(type);
    if (type === 'HOME_PICKUP') {
      setStep('category');
    } else {
      // For community drive, skip category selection
      setCategory(null);
      setStep('details');
    }
  };

  const handleCategorySelect = (cat: Category) => {
    // Only applicable for home pickup flow
    setCategory(cat);
    setStep('details');
  };

  const incrementQuantity = () => setQuantity(q => Math.min(10, q + 1));
  const decrementQuantity = () => setQuantity(q => Math.max(1, q - 1));

  const handleContinueToAddress = () => {
    setStep('address');
  };

  // Step 1: Pickup Type
  if (step === 'type') {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>How would you like to drop off?</Text>
            <Text style={styles.stepSubtitle}>Choose your preferred method</Text>

            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[styles.typeButton, pickupType === 'HOME_PICKUP' && styles.typeButtonActive]}
                onPress={() => handlePickupTypeSelect('HOME_PICKUP')}
                activeOpacity={0.7}
              >
                <View style={[styles.typeIconContainer, pickupType === 'HOME_PICKUP' && styles.typeIconContainerActive]}>
                  <Ionicons name="car-outline" size={28} color={pickupType === 'HOME_PICKUP' ? '#FFFFFF' : Colors.light.tint} />
                </View>
                <Text style={[styles.typeLabel, pickupType === 'HOME_PICKUP' && styles.typeLabelActive]}>Home Pickup</Text>
                <Text style={styles.typeDescription}>We collect from your address</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeButton, pickupType === 'DRIVE' && styles.typeButtonActive]}
                onPress={() => handlePickupTypeSelect('DRIVE')}
                activeOpacity={0.7}
              >
                <View style={[styles.typeIconContainer, pickupType === 'DRIVE' && styles.typeIconContainerActive]}>
                  <Ionicons name="people-outline" size={28} color={pickupType === 'DRIVE' ? '#FFFFFF' : Colors.light.tint} />
                </View>
                <Text style={[styles.typeLabel, pickupType === 'DRIVE' && styles.typeLabelActive]}>Community Drive</Text>
                <Text style={styles.typeDescription}>Request a new drive in your area</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Step 2: Category (only for Home Pickup)
  if (step === 'category' && pickupType === 'HOME_PICKUP') {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What do you want to recycle?</Text>
            <Text style={styles.stepSubtitle}>Select a category</Text>
            
            <TouchableOpacity style={styles.backButtonSmall} onPress={resetForm}>
              <Ionicons name="arrow-back" size={18} color={Colors.light.muted} />
              <Text style={styles.backButtonTextSmall}>Back to pickup type</Text>
            </TouchableOpacity>
            
            <View style={styles.categoryGrid}>
              {CATEGORIES.map(cat => (
                <CategoryCard
                  key={cat}
                  category={cat}
                  selected={category === cat}
                  onPress={() => handleCategorySelect(cat)}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Step 3: Details (Quantity for Home Pickup, just Continue button for Drive)
  if (step === 'details') {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
          <View style={styles.stepContainer}>
            {pickupType === 'HOME_PICKUP' ? (
              <>
                <Text style={styles.stepTitle}>How many items?</Text>
                <Text style={styles.stepSubtitle}>Select quantity</Text>

                <TouchableOpacity style={styles.backButtonSmall} onPress={goBack}>
                  <Ionicons name="arrow-back" size={18} color={Colors.light.muted} />
                  <Text style={styles.backButtonTextSmall}>Back to category</Text>
                </TouchableOpacity>

                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                    onPress={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Ionicons name="remove" size={24} color={quantity <= 1 ? Colors.light.muted : Colors.light.tint} />
                  </TouchableOpacity>

                  <View style={styles.quantityValue}>
                    <Text style={styles.quantityNumber}>{quantity}</Text>
                    <Text style={styles.quantityLabel}>item(s)</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.quantityButton, quantity >= 10 && styles.quantityButtonDisabled]}
                    onPress={incrementQuantity}
                    disabled={quantity >= 10}
                  >
                    <Ionicons name="add" size={24} color={quantity >= 10 ? Colors.light.muted : Colors.light.tint} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.nextButton} onPress={handleContinueToAddress}>
                  <Text style={styles.nextButtonText}>Continue to Address</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.stepTitle}>Community Drive Request</Text>
                <Text style={styles.stepSubtitle}>You&apos;re requesting BMC to organize a drive</Text>

                <TouchableOpacity style={styles.backButtonSmall} onPress={goBack}>
                  <Ionicons name="arrow-back" size={18} color={Colors.light.muted} />
                  <Text style={styles.backButtonTextSmall}>Back to category</Text>
                </TouchableOpacity>

                <View style={styles.infoCard}>
                  <Ionicons name="information-circle-outline" size={24} color={Colors.light.tint} />
<Text style={styles.infoText}>
                     You&apos;ll need to provide a location and preferred date. BMC will review your request and send an OTP once approved.
                   </Text>
                </View>

                <TouchableOpacity style={styles.nextButton} onPress={handleContinueToAddress}>
                  <Text style={styles.nextButtonText}>Continue</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Step 4: Address (for Home Pickup) or Address + Date (for Community Drive)
  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.stepContainer}>
          {pickupType === 'HOME_PICKUP' ? (
            <>
              <Text style={styles.stepTitle}>Pickup address</Text>
              <Text style={styles.stepSubtitle}>Where should we collect from?</Text>
            </>
          ) : (
            <>
              <Text style={styles.stepTitle}>Community Drive Details</Text>
              <Text style={styles.stepSubtitle}>Enter location and preferred date</Text>
            </>
          )}

          <TouchableOpacity style={styles.backButtonSmall} onPress={goBack}>
            <Ionicons name="arrow-back" size={18} color={Colors.light.muted} />
            <Text style={styles.backButtonTextSmall}>Back</Text>
          </TouchableOpacity>

          {pickupType === 'DRIVE' && (
            <>
              <Text style={styles.inputLabel}>Drive Location</Text>
              <TextInput
                style={styles.addressInput}
                placeholder="Enter the location where you want the drive to be organized"
                placeholderTextColor={Colors.light.muted}
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

<Text style={styles.inputLabel}>Preferred Date</Text>
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                  <Text style={styles.dateButtonText}>{driveDate ? new Date(driveDate).toLocaleDateString() : 'Select a date'}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={driveDate ? new Date(driveDate) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        // Store as ISO string
                        setDriveDate(selectedDate.toISOString());
                      }
                    }}
                  />
                )}
            </>
          )}

          {pickupType === 'HOME_PICKUP' && (
            <TextInput
              style={styles.addressInput}
              placeholder="Enter your complete address"
              placeholderTextColor={Colors.light.muted}
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          )}

          <TouchableOpacity
            style={[styles.submitButton, (!address.trim() || (pickupType === 'DRIVE' && !driveDate) || isLoading) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!address.trim() || (pickupType === 'DRIVE' && !driveDate) || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="leaf-outline" size={18} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Submit Request</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  scrollView: { flex: 1 },
  contentContainer: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },

  stepContainer: { marginBottom: Spacing.xl },
  stepTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.light.text, marginBottom: Spacing.xs },
  stepSubtitle: { fontSize: FontSizes.md, color: Colors.light.muted, marginBottom: Spacing.xl },

  typeContainer: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl },
  typeButton: {
    flex: 1, backgroundColor: Colors.light.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.xl, alignItems: 'center', borderWidth: 2, borderColor: 'transparent',
  },
  typeButtonActive: { borderColor: Colors.light.tint, backgroundColor: `${Colors.light.tint}10` },
  typeIconContainer: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.light.background,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  typeIconContainerActive: { backgroundColor: Colors.light.tint },
  typeLabel: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.light.text, marginBottom: Spacing.xs },
  typeLabelActive: { color: Colors.light.tint },
  typeDescription: { fontSize: FontSizes.sm, color: Colors.light.muted },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },

  quantityContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.light.surface, borderRadius: BorderRadius.lg, padding: Spacing.xl, marginBottom: Spacing.xl,
  },
  quantityButton: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: `${Colors.light.tint}15`,
    alignItems: 'center', justifyContent: 'center',
  },
  quantityButtonDisabled: { backgroundColor: Colors.light.background },
  quantityValue: { alignItems: 'center', marginHorizontal: Spacing.xxl },
  quantityNumber: { fontSize: 56, fontWeight: '700', color: Colors.light.text },
  quantityLabel: { fontSize: FontSizes.lg, color: Colors.light.muted },

  addressInput: {
    backgroundColor: Colors.light.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg,
    fontSize: FontSizes.md, color: Colors.light.text, minHeight: 120, marginBottom: Spacing.xl,
    borderWidth: 1, borderColor: Colors.light.border,
  },

  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },

  textInput: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    fontSize: FontSizes.md,
    color: Colors.light.text,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  dateButton: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
  },
  dateButtonText: {
    color: Colors.light.muted,
    fontSize: FontSizes.md,
  },


  backButtonSmall: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.lg },
  backButtonTextSmall: { fontSize: FontSizes.sm, color: Colors.light.muted },

  nextButton: {
    padding: Spacing.lg, borderRadius: BorderRadius.md, alignItems: 'center', backgroundColor: Colors.light.tint,
  },
  nextButtonText: { fontSize: FontSizes.md, fontWeight: '600', color: '#FFFFFF' },

  submitButton: {
    padding: Spacing.lg, borderRadius: BorderRadius.md, alignItems: 'center', backgroundColor: Colors.light.tint,
    flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm,
  },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { fontSize: FontSizes.md, fontWeight: '600', color: '#FFFFFF' },

  // Community Drive specific
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${Colors.light.tint}10`,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.light.text,
    lineHeight: 20,
  },
});
