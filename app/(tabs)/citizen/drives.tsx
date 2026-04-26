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
import { MotiView } from 'moti';

const COLORS = {
  background: '#0B0F19',
  surface: 'rgba(255, 255, 255, 0.05)',
  primary: '#10B981',
  text: '#FFFFFF',
  textDim: '#9CA3AF',
  border: 'rgba(255, 255, 255, 0.1)',
  danger: '#EF4444',
  registered: 'rgba(255, 255, 255, 0.1)',
  progressBg: 'rgba(255, 255, 255, 0.1)',
};

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

  const renderDrive = ({ item, index }: { item: Drive; index: number }) => {
    const isFull = item.registeredCount >= item.capacity;
    const isRegistered = item.registeredUsers && user && item.registeredUsers.includes((user as any)._id || user.id);
    const percentage = (item.registeredCount / item.capacity) * 100;

    return (
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: index * 100 }}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.location}>{item.location}</Text>
            <View style={[styles.badge, { backgroundColor: isFull ? `${COLORS.danger}20` : `${COLORS.primary}20` }]}>
              <Text style={[styles.badgeText, { color: isFull ? COLORS.danger : COLORS.primary }]}>
                {isFull ? 'Full' : 'Available'}
              </Text>
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
                  { width: `${percentage}%`, backgroundColor: isFull ? COLORS.danger : COLORS.primary },
                ]}
              />
            </View>
            {isRegistered ? (
              <View style={[styles.joinButton, styles.registeredButton]}>
                <Text style={[styles.joinButtonText, { color: COLORS.text }]}>✓ Registered</Text>
              </View>
            ) : !isFull && (
              <TouchableOpacity style={styles.joinButton} onPress={() => handleJoinDrive(item)}>
                <Text style={styles.joinButtonText}>Join Drive</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </MotiView>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
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
        showsVerticalScrollIndicator={false}
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
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  location: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardBody: {
    padding: 16,
    paddingTop: 12,
    gap: 12,
  },
  detail: {
    fontSize: 14,
    color: COLORS.textDim,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.progressBg,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  joinButton: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  joinButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  registeredButton: {
    backgroundColor: COLORS.registered,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  empty: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textDim,
    marginTop: 8,
  },
});
