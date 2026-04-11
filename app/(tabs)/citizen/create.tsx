import { useRequestStore } from '@/src/store/requestStore';
import { useAuthStore } from '@/src/store/authStore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadApi } from '@/src/api/endpoints';

interface TimeSlotOption {
  slot: string;
  available: number;
}

interface DateSlotOption {
  date: string;
  timeSlots: TimeSlotOption[];
}

export default function CreateRequestScreen() {
  const [address, setAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<DateSlotOption[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const { user } = useAuthStore();
  const { createRequest, fetchAvailableSlots, availableSlots: storeSlots, isLoading, error, clearError } = useRequestStore();
  const router = useRouter();

  useEffect(() => {
    loadAvailableSlots();
  }, []);

  useEffect(() => {
    if (storeSlots.length > 0) {
      setAvailableSlots(storeSlots);
    }
  }, [storeSlots]);

  const loadAvailableSlots = async () => {
    try {
      setIsLoadingSlots(true);
      await fetchAvailableSlots();
    } catch (error) {
      console.error('Failed to load available slots:', error);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Set default contact phone from user profile
  useEffect(() => {
    if (user?.phone) {
      setContactPhone(user.phone);
    }
  }, [user]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!image) return null;

    try {
      setUploading(true);
      
      // Create form data
      const formData = new FormData();
      const filename = image.split('/').pop() || 'image.jpg';
      const match = /\.\w+$/.exec(filename);
      const type = match ? `image/${match[0].substring(1)}` : 'image/jpeg';

      formData.append('image', {
        uri: Platform.OS === 'ios' ? image.replace('file://', '') : image,
        name: filename,
        type,
      } as any);

      const response = await uploadApi.uploadImage(formData);
      return response.data.url;
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!address.trim()) {
      Alert.alert('Missing Address', 'Please enter your pickup address');
      return;
    }

    if (!contactPhone.trim() || contactPhone.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid contact phone number');
      return;
    }

    if (!selectedDate || !selectedTimeSlot) {
      Alert.alert('Missing Date/Time', 'Please select a preferred date and time slot');
      return;
    }

    try {
      clearError();
      
      // Upload image if selected
      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImage();
        if (!imageUrl) return; // Upload failed
      }

      await createRequest({
        address: address.trim(),
        contactPhone: contactPhone.trim(),
        preferredDate: selectedDate,
        preferredTimeSlot: selectedTimeSlot,
        notes: notes.trim(),
        imageUrl: imageUrl || undefined,
      });

      Alert.alert(
        'Success',
        'Your e-waste pickup request has been submitted successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert('Error', error || 'Failed to create request');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const selectedDateSlots = availableSlots.find(s => s.date === selectedDate)?.timeSlots || [];

  if (isLoadingSlots) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#27ae60" />
        <Text style={styles.loadingText}>Loading available slots...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Request E-Waste Pickup</Text>
        <Text style={styles.subtitle}>Fill in the details below</Text>
      </View>

      <View style={styles.form}>
        {/* Address */}
        <Text style={styles.label}>Pickup Address *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter your complete pickup address"
          value={address}
          onChangeText={setAddress}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {/* Contact Phone */}
        <Text style={styles.label}>Contact Phone *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter contact phone number"
          keyboardType="phone-pad"
          maxLength={10}
          value={contactPhone}
          onChangeText={setContactPhone}
        />

        {/* Date Selection */}
        <Text style={styles.label}>Preferred Date *</Text>
        {availableSlots.length === 0 ? (
          <Text style={styles.noSlotsText}>No available dates at the moment</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
            {availableSlots.map((slot) => (
              <TouchableOpacity
                key={slot.date}
                style={[
                  styles.dateChip,
                  selectedDate === slot.date && styles.dateChipActive,
                ]}
                onPress={() => {
                  setSelectedDate(slot.date);
                  setSelectedTimeSlot(null);
                }}
              >
                <Text
                  style={[
                    styles.dateText,
                    selectedDate === slot.date && styles.dateTextActive,
                  ]}
                >
                  {formatDate(slot.date)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Time Slot Selection */}
        {selectedDate && (
          <>
            <Text style={styles.label}>Preferred Time Slot *</Text>
            <View style={styles.timeSlotContainer}>
              {selectedDateSlots.length === 0 ? (
                <Text style={styles.noSlotsText}>No available time slots for this date</Text>
              ) : (
                selectedDateSlots.map((ts) => (
                  <TouchableOpacity
                    key={ts.slot}
                    style={[
                      styles.timeSlotButton,
                      selectedTimeSlot === ts.slot && styles.timeSlotButtonActive,
                      ts.available === 0 && styles.timeSlotButtonDisabled,
                    ]}
                    onPress={() => ts.available > 0 && setSelectedTimeSlot(ts.slot)}
                    disabled={ts.available === 0}
                  >
                    <Text
                      style={[
                        styles.timeSlotText,
                        selectedTimeSlot === ts.slot && styles.timeSlotTextActive,
                        ts.available === 0 && styles.timeSlotTextDisabled,
                      ]}
                    >
                      {ts.slot}
                    </Text>
                    <Text
                      style={[
                        styles.availabilityText,
                        selectedTimeSlot === ts.slot && styles.timeSlotTextActive,
                        ts.available === 0 && styles.timeSlotTextDisabled,
                      ]}
                    >
                      {ts.available > 0 ? `${ts.available} spots left` : 'Full'}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </>
        )}

        {/* Notes */}
        <Text style={styles.label}>Additional Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Any special instructions or notes (optional)"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {/* Image Upload */}
        <Text style={styles.label}>Upload Image (Optional)</Text>
        <View style={styles.imageSection}>
          {image ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setImage(null)}
              >
                <Text style={styles.removeImageText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadButtons}>
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <Text style={styles.uploadButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
                <Text style={styles.uploadButtonText}>Take Photo</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, (isLoading || uploading) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading || uploading}
        >
          {isLoading || uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Request</Text>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
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
  dateScroll: {
    marginBottom: 8,
  },
  dateChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 25,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dee2e6',
    minWidth: 100,
    alignItems: 'center',
  },
  dateChipActive: {
    backgroundColor: '#27ae60',
    borderColor: '#27ae60',
  },
  dateText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  dateTextActive: {
    color: '#fff',
  },
  timeSlotContainer: {
    gap: 12,
  },
  timeSlotButton: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  timeSlotButtonActive: {
    backgroundColor: '#27ae60',
    borderColor: '#27ae60',
  },
  timeSlotButtonDisabled: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
  timeSlotTextActive: {
    color: '#fff',
  },
  timeSlotTextDisabled: {
    color: '#adb5bd',
  },
  availabilityText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  noSlotsText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
    padding: 12,
  },
  imageSection: {
    marginBottom: 8,
  },
  imagePreviewContainer: {
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(231, 76, 60, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  removeImageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dee2e6',
    alignItems: 'center',
  },
  uploadButtonText: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#27ae60',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
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
