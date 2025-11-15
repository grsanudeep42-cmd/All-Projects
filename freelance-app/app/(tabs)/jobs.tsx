import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Button, FlatList, Text, TouchableOpacity, View } from 'react-native';

export default function JobsScreen() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchJobs = async () => {
    console.log('Fetching jobs...');
    try {
      const res = await fetch('http://127.0.0.1:8000/jobs');
      console.log('Got response:', res.status, res.statusText);
      const data = await res.json();
      console.log('Jobs data:', data);

      if (!res.ok) throw new Error(data.detail || 'Error loading jobs');
      setJobs(data);
      setError(null);
    } catch (err: any) {
      setJobs([]);
      setError(err.message);
      console.log('Jobs fetch error:', err);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button title="Load Jobs" onPress={fetchJobs} />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      <FlatList
        data={jobs}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/jobs/${item.id}`)}
            style={{ backgroundColor: '#222', margin: 8, padding: 16, borderRadius: 8 }}
          >
            <Text style={{ color: 'white' }}>Job: {item.title || item.id}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
