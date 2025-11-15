import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

interface Review {
  id: number;
  job_id: number;
  reviewer_id: number;
  reviewee_id: number;
  rating: number;
  review_text: string;
  created_at: string;
}

interface ReviewsListProps {
  jobId?: number;
  userId?: number;
}

export default function ReviewsList({ jobId, userId }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReviews = useCallback(async () => {
    if (!jobId && !userId) {
      setError('Please provide either jobId or userId');
      setLoading(false);
      return;
    }

    try {
      let url = 'http://127.0.0.1:8000/reviews/';
      if (jobId) {
        url += `job/${jobId}`;
      } else if (userId) {
        url += `user/${userId}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      } else {
        setError('Failed to fetch reviews');
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [jobId, userId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderReview = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.header}>
        <Text style={styles.stars}>{renderStars(item.rating)}</Text>
        <Text style={styles.date}>{formatDate(item.created_at)}</Text>
      </View>
      <Text style={styles.reviewText}>{item.review_text}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (reviews.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No reviews yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reviews ({reviews.length})</Text>
      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 16,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stars: {
    fontSize: 18,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  reviewText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
  },
});
