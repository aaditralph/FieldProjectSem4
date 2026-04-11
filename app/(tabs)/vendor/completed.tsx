import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function CompletedScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Completed Pickups</Text>
      <Text style={styles.subtext}>Your completed pickup history will appear here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtext: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 8,
  },
});
