import { useRequestStore } from '@/src/store/requestStore';
import { useAuthStore } from '@/src/store/authStore';
import { Drive } from '@/src/types';
import React, { useEffect } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function DrivesScreen() {
  const { drives, isLoading, fetchDrives, joinDrive } = useRequestStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchDrives();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleJoinDrive = async (item: Drive) => {
    try {
      const driveId = (item as any)._id || item.id;
      await joinDrive(driveId);
      Alert.alert('Success', 'Successfully joined the community drive!');
      await fetchDrives();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to join drive');
    }
  };

  const renderDrive = ({ item }: { item: Drive }) => {
    const isFull = item.registeredCount >= item.capacity;
    const isRegistered = item.registeredUsers && user && item.registeredUsers.includes((user as any)._id || user.id);
    const percentage = (item.registeredCount / item.capacity) * 100;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.location}>{item.location}</Text>
          <View style={[styles.badge, isFull ? styles.badgeFull : styles.badgeAvailable]}>
            <Text style={styles.badgeText}>{isFull ? 'Full' : 'Available'}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.detail}>📅 Date: {formatDate(item.date)}</Text>
          <Text style={styles.detail}>
            👥 Registrations: {item.registeredCount} / {item.capacity}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${percentage}%`, backgroundColor: isFull ? '#e74c3c' : '#27ae60' },
              ]}
            />
          </View>
          {isRegistered ? (
            <View style={[styles.joinButton, styles.registeredButton]}>
              <Text style={styles.joinButtonText}>✓ Registered</Text>
            </View>
          ) : !isFull && (
            <TouchableOpacity style={styles.joinButton} onPress={() => handleJoinDrive(item)}>
              <Text style={styles.joinButtonText}>Join Drive</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#27ae60" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={drives}
        renderItem={renderDrive}
        keyExtractor={(item) => (item as any)._id || item.id || Math.random().toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No upcoming drives</Text>
            <Text style={styles.emptySubtext}>
              Check back later for community e-waste drives
            </Text>
          </View>
        }
      />
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
  location: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeAvailable: {
    backgroundColor: '#27ae60',
  },
  badgeFull: {
    backgroundColor: '#e74c3c',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    padding: 16,
    paddingTop: 12,
    gap: 10,
  },
  detail: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  joinButton: {
    backgroundColor: '#27ae60',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  registeredButton: {
    backgroundColor: '#95a5a6',
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
});
