import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

type Job = {
  id: number;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  client_id: number;
  freelancer_id?: number;
  status: string;
};

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams();
  const { token, userId } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Application form state
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [proposalText, setProposalText] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchJob = useCallback(async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setJob(data);
      }
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const handleApply = async () => {
    if (!proposalText.trim() || !bidAmount.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/applications/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          job_id: job?.id,
          proposal_text: proposalText,
          bid_amount: parseFloat(bidAmount),
          proposed_deadline: null
        })
      });

      if (response.ok) {
        Alert.alert('Success', 'Application submitted successfully!');
        setShowApplicationForm(false);
        setProposalText('');
        setBidAmount('');
      } else {
        const error = await response.json();
        Alert.alert('Error', error.detail || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Application error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLeaveReview = () => {
    if (!job) return;
    const revieweeId = userId === job.client_id ? job.freelancer_id : job.client_id;
    
    if (!revieweeId) {
      Alert.alert('Error', 'No one to review yet');
      return;
    }

    router.push({
      pathname: '/(tabs)/job-reviews',
      params: {
        jobId: job.id.toString(),
        revieweeId: revieweeId.toString()
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Job not found</Text>
      </View>
    );
  }

  const isOwner = userId === job.client_id;
  const canApply = !isOwner && job.status === 'open' && !job.freelancer_id;
  const canReview = job.status === 'completed' && (userId === job.client_id || userId === job.freelancer_id);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{job.title}</Text>
        <View style={[styles.statusBadge, job.status === 'completed' && styles.completedBadge]}>
          <Text style={styles.statusText}>{job.status}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{job.description}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Budget:</Text>
          <Text style={styles.detailValue}>${job.budget}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Deadline:</Text>
          <Text style={styles.detailValue}>{job.deadline}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status:</Text>
          <Text style={styles.detailValue}>{job.status}</Text>
        </View>
      </View>

      {/* Apply Button (Freelancers only) */}
      {canApply && !showApplicationForm && (
        <View style={styles.section}>
          <TouchableOpacity style={styles.applyButton} onPress={() => setShowApplicationForm(true)}>
            <Text style={styles.applyButtonText}>📝 Apply for this Job</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Application Form */}
      {showApplicationForm && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Submit Your Application</Text>
          
          <Text style={styles.inputLabel}>Your Proposal</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Explain why you're the best fit for this job..."
            value={proposalText}
            onChangeText={setProposalText}
            multiline
            numberOfLines={6}
          />

          <Text style={styles.inputLabel}>Your Bid Amount ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your bid amount"
            value={bidAmount}
            onChangeText={setBidAmount}
            keyboardType="numeric"
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={() => setShowApplicationForm(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.submitButton, submitting && styles.buttonDisabled]} 
              onPress={handleApply}
              disabled={submitting}
            >
              <Text style={styles.submitButtonText}>
                {submitting ? 'Submitting...' : 'Submit Application'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Message Button (both users) */}
      <View style={styles.section}>
  <TouchableOpacity
    style={styles.applyButton}
    onPress={() => {
      const recipientId = isOwner ? job.freelancer_id : job.client_id;
      if (!recipientId) return; // Prevents navigation if recipient is missing
      router.push(`/messages?jobId=${job.id}&otherUserId=${recipientId}`);
    }}
    disabled={isOwner && !job.freelancer_id}
  >
    <Text style={styles.applyButtonText}>
      💬 Message {isOwner ? 'Freelancer' : 'Client'}
    </Text>
  </TouchableOpacity>
</View>


      {/* View Applicants Button (Job Owner only) */}
      {isOwner && (
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.viewApplicantsButton} 
            onPress={() => router.push(`/jobs/${job.id}/applicants` as any)}
          >
            <Text style={styles.viewApplicantsButtonText}>👥 View Applicants</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Payment Button (Job Owner, only when job assigned and in progress) */}
      {job && job.status === 'inprogress' && job.freelancer_id && job.client_id === userId && (
        <View style={styles.section}>
          <Text style={{ marginBottom: 8 }}>Ready to pay your freelancer?</Text>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() =>
              router.push(
                `/modal/job-payment?jobId=${job.id}&freelancerId=${job.freelancer_id}&amount=${job.budget}`
              )
            }
          >
            <Text style={styles.applyButtonText}>💰 Pay Freelancer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Leave Review Button */}
      {canReview && (
        <View style={styles.section}>
          <TouchableOpacity style={styles.reviewButton} onPress={handleLeaveReview}>
            <Text style={styles.reviewButtonText}>⭐ Leave a Review</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* View Reviews Button */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.viewReviewsButton} 
          onPress={() => router.push({
            pathname: '/(tabs)/job-reviews',
            params: { jobId: job.id.toString() }
          })}
        >
          <Text style={styles.viewReviewsButtonText}>View Reviews for this Job</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ff0000',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  completedBadge: {
    backgroundColor: '#34C759',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 100,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  applyButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 120,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  viewApplicantsButton: {
    backgroundColor: '#5856D6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewApplicantsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewButton: {
    backgroundColor: '#FFD700',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  reviewButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  viewReviewsButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewReviewsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
