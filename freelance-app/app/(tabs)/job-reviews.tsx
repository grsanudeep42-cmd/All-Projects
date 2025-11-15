import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ReviewForm from '../components/ui/ReviewForm';
import ReviewsList from '../components/ui/ReviewsList';

export default function JobReviewsScreen() {
  const params = useLocalSearchParams();
  
  const jobId = params.jobId ? Number(params.jobId) : undefined;
  const revieweeId = params.revieweeId ? Number(params.revieweeId) : undefined;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Job Reviews</Text>
        {jobId && <Text style={styles.subtitle}>Job ID: {jobId}</Text>}
      </View>

      {jobId && revieweeId && (
        <View style={styles.section}>
          <ReviewForm 
            jobId={jobId} 
            revieweeId={revieweeId}
            onSuccess={() => {
              console.log('Review submitted successfully');
            }}
          />
        </View>
      )}

      {jobId && (
        <View style={styles.section}>
          <ReviewsList jobId={jobId} />
        </View>
      )}

      {!jobId && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No job ID provided</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  errorContainer: {
    padding: 32,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
  },
});
