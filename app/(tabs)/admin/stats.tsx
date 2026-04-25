import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 1) => `rgba(142, 68, 173, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
  decimalPlaces: 0,
};

export default function AdminStatsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const token = await require('@/src/utils/storage').getItemAsync('auth_token');
      const response = await fetch('http://192.168.1.45:5000/api/admin/dashboard-analytics', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics: ' + response.statusText);
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Error fetching stats');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics(true);
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8e44ad" />
        <Text style={styles.loadingText}>Loading Analytics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!data) return null;

  // Prepare Pie Chart Data
  const pieData = data.categoryStats.map((item: any, index: number) => {
    const colors = ['#f1c40f', '#3498db', '#e74c3c', '#2ecc71', '#9b59b6', '#34495e'];
    return {
      name: item.category,
      count: item.count,
      color: colors[index % colors.length],
      legendFontColor: '#7f8c8d',
      legendFontSize: 12,
    };
  });

  // Prepare Line Chart Data
  const lineLabels = data.trendStats.map((item: any) => {
    const d = new Date(item.date);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  });
  const lineData = data.trendStats.map((item: any) => item.count);

  const lineChartData = {
    labels: lineLabels.length ? lineLabels : ['No data'],
    datasets: [
      {
        data: lineData.length ? lineData : [0],
      },
    ],
  };

  // Prepare Bar Chart Data
  const barChartData = {
    labels: ['Pending', 'Assigned', 'Completed'],
    datasets: [
      {
        data: [
          data.statusStats.pending || 0,
          data.statusStats.assigned || 0,
          data.statusStats.completed || 0,
        ],
      },
    ],
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>System Analytics</Text>
        <Text style={styles.subtitle}>Insights and performance metrics</Text>
      </View>

      {/* Key Metrics */}
      <View style={styles.metricsWrapper}>
        <View style={[styles.metricCard, { backgroundColor: '#8e44ad' }]}>
          <Text style={styles.metricVal}>{data.totalRequests}</Text>
          <Text style={styles.metricLabel}>Total Requests</Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: '#2ecc71' }]}>
          <Text style={styles.metricVal}>{data.completionRate}%</Text>
          <Text style={styles.metricLabel}>Completion Rate</Text>
        </View>
      </View>

      {/* Pie Chart: Waste Category Distribution */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Waste Category Distribution</Text>
        {pieData.length > 0 ? (
          <PieChart
            data={pieData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            accessor={"count"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            absolute
          />
        ) : (
          <Text style={styles.noData}>No waste category data available.</Text>
        )}
      </View>

      {/* Line Chart: Requests Over Time (Last 7 Days) */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Requests Over Time (Last 7 Days)</Text>
        {lineData.length > 0 ? (
          <View>
            <Text style={styles.axisLabelY}>Requests Count</Text>
            <LineChart
              data={lineChartData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              fromZero={true}
              style={styles.chartStyle}
            />
            <Text style={styles.axisLabelX}>Date</Text>
          </View>
        ) : (
          <Text style={styles.noData}>No trend data available for last 7 days.</Text>
        )}
      </View>

      {/* Bar Chart: Status Distribution */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Status Distribution</Text>
        <Text style={styles.axisLabelY}>Requests Count</Text>
        <BarChart
          data={barChartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(41, 128, 185, ${opacity})`,
          }}
          style={styles.chartStyle}
          fromZero={true}
          showValuesOnTopOfBars={true}
          yAxisLabel=""
          yAxisSuffix=""
        />
        <Text style={styles.axisLabelX}>Status</Text>
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
  },
  loadingText: {
    marginTop: 16,
    color: '#7f8c8d',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: 'bold',
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
  metricsWrapper: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  metricLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  chartCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noData: {
    textAlign: 'center',
    color: '#95a5a6',
    marginVertical: 20,
  },
  axisLabelY: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: -10,
    marginLeft: 10,
    zIndex: 1,
  },
  axisLabelX: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: -10,
  },
});
