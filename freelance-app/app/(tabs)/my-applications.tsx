import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

type Application = {
  id: number;
  job_id: number;
  job_title: string;
  job_budget: number;
  proposal_text: string;
  bid_amount: number;
  status: string;
  created_at: string | null;
};

export default function MyApplicationsScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/applications/my-applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setApplications(data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const renderItem = ({ item }: { item: Application }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/jobs/${item.job_id}` as any)}
    >
      <Text style={styles.title}>{item.job_title}</Text>
      <Text style={styles.label}>
        Bid: <Text style={styles.value}>${item.bid_amount}</Text>
      </Text>
      <Text style={styles.label}>
        Status: <Text style={[
          styles.value,
          item.status === 'pending' ? styles.statusPending :
          item.status === 'accepted' ? styles.statusAccepted :
          styles.statusRejected
        ]}>
          {item.status}
        </Text>
      </Text>
      <Text numberOfLines={2} style={styles.proposal}>
        {item.proposal_text}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator style={{ flex: 1, marginTop: 48 }} size="large" color="#007AFF" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Applications</Text>
      {applications.length === 0 ? (
        <Text style={styles.empty}>You have not applied to any jobs yet.</Text>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  header: { fontSize: 22, fontWeight: "bold", margin: 18 },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4
  },
  title: { fontSize: 17, fontWeight: "bold", marginBottom: 5 },
  label: { fontSize: 14, color: "#333" },
  value: { fontWeight: "600" },
  statusPending: { color: "#FFA500", fontWeight: "bold" },
  statusAccepted: { color: "#34C759", fontWeight: "bold" },
  statusRejected: { color: "#FF3B30", fontWeight: "bold" },
  proposal: { color: "#555", fontSize: 13, paddingTop: 6 },
  empty: { textAlign: "center", fontSize: 15, marginTop: 24, color: "#888" }
});
