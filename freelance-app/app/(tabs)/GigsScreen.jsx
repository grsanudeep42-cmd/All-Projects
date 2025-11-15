import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function GigsScreen() {
  const { token, userId } = useAuth();
  console.log("userId:", userId, typeof userId); // Should show number
  const [gigs, setGigs] = useState([]);
  const [selectedGig, setSelectedGig] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    delivery_days: 7,
    is_active: true
  });

  // =========================================================================
  // Functions are now defined BEFORE they are used by useEffect to prevent crash
  // =========================================================================

  const fetchGigs = useCallback(async () => {
    try {
      if (!token) return; // Don't fetch if there's no token
      
      const res = await fetch('http://localhost:8000/gigs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await res.json();
      setGigs(Array.isArray(data) ? data : []);
    }
    catch (e) {
      console.error("Failed to fetch gigs:", e);
      setError('Failed to load gigs');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = selectedGig 
        ? `http://localhost:8000/gigs/${selectedGig.id}`
        : 'http://localhost:8000/gigs';
      const method = selectedGig ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price)
        })
      });

      if (res.ok) {
        fetchGigs();
        setShowForm(false);
        setSelectedGig(null);
        setFormData({
          title: '',
          description: '',
          category: '',
          price: '',
          delivery_days: 7,
          is_active: true
        });
      } else {
        const data = await res.json();
        setError(data.detail || 'Failed to save gig');
      }
    } catch (e) {
      console.error("Failed to save gig:", e);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (gig) => {
    setSelectedGig(gig);
    setFormData({
      title: gig.title,
      description: gig.description,
      category: gig.category,
      price: gig.price.toString(),
      delivery_days: gig.delivery_days,
      is_active: gig.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (gigId) => {
    if (!window.confirm('Delete this gig?')) return;
    
    try {
      const res = await fetch(`http://localhost:8000/gigs/${gigId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchGigs();
      } else {
        const data = await res.json();
        setError(data.detail || 'Failed to delete gig');
      }
    } catch (e) {
      console.error("Failed to delete gig:", e);
      setError('Failed to delete gig');
    }
  };

  // Fetch all gigs effect - now placed after the functions it uses
  useEffect(() => {
    fetchGigs();
  }, [fetchGigs]);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>My Gigs</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setSelectedGig(null);
            setFormData({
              title: '',
              description: '',
              category: '',
              price: '',
              delivery_days: 7,
              is_active: true
            });
          }}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Create New Gig
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px', padding: '10px', backgroundColor: '#fee' }}>
          {error}
        </div>
      )}

      {/* Gig Form */}
      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h2>{selectedGig ? 'Edit Gig' : 'Create New Gig'}</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Gig Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <textarea
                placeholder="Gig Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows="4"
                style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <input
                type="text"
                placeholder="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <input
                type="number"
                placeholder="Price ($)"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                min="0"
                step="0.01"
                style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <input
                type="number"
                placeholder="Delivery Days"
                value={formData.delivery_days}
                // FIX APPLIED: Handles empty input to prevent NaN error
                onChange={(e) => setFormData({ ...formData, delivery_days: parseInt(e.target.value) || '' })}
                required
                min="1"
                style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  style={{ marginRight: '10px' }}
                />
                Active Gig
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  {loading ? 'Saving...' : (selectedGig ? 'Update' : 'Create')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gigs List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
  {gigs.map(gig => {
    // =========================================================================
    // ===> ADD THIS LINE RIGHT HERE <===
    console.log(`Checking Gig ID ${gig.id}: gig.freelancer_id is ${gig.freelancer_id}, your logged-in userId is ${userId}`);
    // =========================================================================

    return (
      <div key={gig.id} style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: gig.is_active ? 'white' : '#f8f8f8'
      }}>
        <h3 style={{ marginTop: 0 }}>{gig.title}</h3>
        <p style={{ color: '#666', fontSize: '14px' }}>{gig.description}</p>
        <div style={{ marginBottom: '10px' }}>
          <strong>Category:</strong> {gig.category}<br />
          <strong>Price:</strong> ${gig.price}<br />
          <strong>Delivery:</strong> {gig.delivery_days} days<br />
          <strong>Status:</strong> {gig.is_active ? 'Active' : 'Inactive'}
        </div>
        {gig.freelancer_id === userId && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => handleEdit(gig)}
              style={{
                backgroundColor: '#ffc107',
                color: 'black',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(gig.id)}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    );
  })}
</div>

      {gigs.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
          No gigs found. Create your first gig to get started!
        </div>
      )}
    </div>
  );
}