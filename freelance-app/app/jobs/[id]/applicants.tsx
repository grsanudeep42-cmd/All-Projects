import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../../context/AuthContext';

type Applicant = {
  id: number;
  freelancer_id: number;
  freelancer_name: string;
  freelancer_email: string;
  proposal_text: string;
  bid_amount: number;
  proposed_deadline: string | null;
  status: string;
  created_at: string | null;
};

export default function JobApplicantsScreen() {
  const { id } = useLocalSearchParams(); // job id from route
  const { token } = useAuth();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  

  const fetchApplicants = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/applications/job/2`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setApplicants(data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  // Accept/Reject handler
  const updateStatus = async (applicationId: number, newStatus: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      if (res.ok) {
        Alert.alert('Success', `Application ${newStatus}`);
        fetchApplicants(); // refresh list
      } else {
        Alert.alert('Error', result.detail || 'Error updating status');
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      Alert.alert('Error', 'Network error');
    }
  };

  const renderItem = ({ item }: { item: Applicant }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.freelancer_name}</Text>
      <Text style={styles.email}>{item.freelancer_email}</Text>
      <Text style={styles.bid}>Bid: ₹{item.bid_amount}</Text>
      <Text>{item.proposal_text}</Text>
      <Text>Status: {item.status}</Text>
      <View style={styles.buttonRow}>
        {item.status === 'pending' && (
          <>
            <TouchableOpacity style={styles.acceptBtn} onPress={() => updateStatus(item.id, 'accepted')}>
              <Text style={styles.btnText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectBtn} onPress={() => updateStatus(item.id, 'rejected')}>
              <Text style={styles.btnText}>Reject</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <FlatList
      data={applicants}
      keyExtractor={item => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 16 }}
      ListEmptyComponent={<Text>No applicants yet.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
  },
  name: { fontWeight: 'bold', fontSize: 16 },
  email: { color: '#656565', marginBottom: 8 },
  bid: { color: '#34C759', fontSize: 16, marginBottom: 6 },
  buttonRow: { flexDirection: 'row', marginTop: 12, gap: 10 },
  acceptBtn: { backgroundColor: '#34C759', padding: 10, borderRadius: 8, marginRight: 6 },
  rejectBtn: { backgroundColor: '#F44336', padding: 10, borderRadius: 8 },
  btnText: { color: 'white', fontWeight: '700' }
});
