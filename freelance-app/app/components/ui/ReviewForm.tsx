import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type ReviewFormProps = {
  jobId: number;
  revieweeId: number;
  onSuccess: () => void;
};

export default function ReviewForm({ jobId, revieweeId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rating.trim() || !feedback.trim()) {
      Alert.alert('Error', 'Please enter both rating and feedback.');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/reviews/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // Add Authorization header if needed
        },
        body: JSON.stringify({
          job_id: jobId,
          reviewee_id: revieweeId,
          rating: parseInt(rating),
          feedback: feedback,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert('Error', errorData.detail || 'Failed to submit review');
      } else {
        Alert.alert('Success', 'Review submitted!');
        setRating('');
        setFeedback('');
        onSuccess();
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      Alert.alert('Network Error', 'Could not submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Leave a Review</Text>
      <Text style={styles.label}>Rating (1–5):</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter rating"
        value={rating}
        onChangeText={setRating}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Feedback:</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Write your review..."
        value={feedback}
        onChangeText={setFeedback}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
      <TouchableOpacity
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Submit Review</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    height: 80,
    backgroundColor: '#f5f5f5',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }
});
