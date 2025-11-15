import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

type Profile = {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  verified?: boolean;
  joined_at?: string;
  profile_data?: {
    bio?: string;
    skills?: string;
    location?: string;
    avatar?: string;
  };
};

type Review = {
  id: number;
  rating: number;
  review_text: string;
  created_at: string;
  reviewer_id: number;
};

export default function ProfileView() {
  const { token } = useAuth();
  const params = useLocalSearchParams();
  const userId = params.userId ? Number(params.userId) : null;
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [avgRating, setAvgRating] = useState(0);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    
    try {
      // Fetch profile - either /me or /users/{id}
      const profileUrl = userId 
        ? `http://127.0.0.1:8000/users/${userId}`
        : 'http://127.0.0.1:8000/me';
      
      const profileRes = await fetch(profileUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!profileRes.ok) throw new Error("Failed to load profile");
      const profileData = await profileRes.json();
      setProfile(profileData);

      // Fetch reviews if viewing someone's profile
      if (userId || profileData.id) {
        const reviewUserId = userId || profileData.id;
        const reviewsRes = await fetch(`http://127.0.0.1:8000/reviews/user/${reviewUserId}`);
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData);
          
          // Calculate average rating
          if (reviewsData.length > 0) {
            const sum = reviewsData.reduce((acc: number, r: Review) => acc + r.rating, 0);
            setAvgRating(sum / reviewsData.length);
          }
        }
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const renderStars = (rating: number) => {
    return '⭐'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Profile not found</Text>
      </View>
    );
  }

  const pd = profile.profile_data || {};

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        {pd.avatar && (
          <Image source={{ uri: pd.avatar }} style={styles.avatar} />
        )}
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.role}>{profile.role || "freelancer"}</Text>
        
        {/* Average Rating */}
        {reviews.length > 0 && (
          <View style={styles.ratingContainer}>
            <Text style={styles.stars}>{renderStars(avgRating)}</Text>
            <Text style={styles.ratingText}>
              {avgRating.toFixed(1)} ({reviews.length} reviews)
            </Text>
          </View>
        )}
      </View>

      {/* Profile Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        <DetailRow label="Email" value={profile.email} />
        <DetailRow label="Phone" value={profile.phone || "N/A"} />
        <DetailRow label="Location" value={pd.location || "N/A"} />
        <DetailRow label="Joined" value={profile.joined_at || "N/A"} />
        <DetailRow label="Verified" value={profile.verified ? "✓ Yes" : "✗ No"} />
      </View>

      {/* Bio */}
      {pd.bio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bio</Text>
          <Text style={styles.bioText}>{pd.bio}</Text>
        </View>
      )}

      {/* Skills */}
      {pd.skills && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <Text style={styles.skillsText}>{pd.skills}</Text>
        </View>
      )}

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
          {reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewStars}>{renderStars(review.rating)}</Text>
                <Text style={styles.reviewDate}>{formatDate(review.created_at)}</Text>
              </View>
              <Text style={styles.reviewText}>{review.review_text}</Text>
            </View>
          ))}
        </View>
      )}

      {reviews.length === 0 && (
        <View style={styles.section}>
          <Text style={styles.noReviewsText}>No reviews yet</Text>
        </View>
      )}
    </ScrollView>
  );
}

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

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
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  role: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  stars: {
    fontSize: 20,
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
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
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 8,
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
  bioText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  skillsText: {
    fontSize: 14,
    color: '#333',
  },
  reviewCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewStars: {
    fontSize: 16,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  reviewText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  noReviewsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 16,
  },
});
