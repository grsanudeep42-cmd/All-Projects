import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

type Profile = {
  email: string;
  name?: string;
  phone?: string;
  bio?: string;
  skills?: string;
  location?: string;
  avatar?: string;
};

export default function EditProfileScreen() {
  const { token } = useAuth(); // get the true token from context!
  const [profile, setProfile] = useState<Profile | null>(null);
  const [edit, setEdit] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return; // don't try fetch if no token
    fetch('http://127.0.0.1:8000/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized. Please login again.");
        return res.json();
      })
      .then(data => {
        setProfile(data);
        setEdit(data);
      })
      .catch(() => setProfile(null));
  }, [token]);

  const saveProfile = async () => {
    setLoading(true);
    if (!token) {
      alert('You must be logged in to edit your profile.');
      setLoading(false);
      return;
    }
    // Only send supported fields
    const payload = {
      name: edit.name || "",
      phone: edit.phone || ""
    };
    const res = await fetch('http://127.0.0.1:8000/users/me', {
      method: "PUT",
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      alert("Could not save profile (unauthorized?)");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setProfile(data);
    setLoading(false);
    alert("Profile updated!");
  };

  if (!profile) return <div style={{color:"white"}}>Loading...</div>;

  return (
    <div style={{ maxWidth:400, margin:'0 auto', padding:20, background:'#222', color:'white', borderRadius:12 }}>
      <h2>Edit Profile</h2>
      <label>Name</label>
      <input value={edit.name || ''} onChange={e => setEdit({...edit, name:e.target.value})} style={{width:"100%"}} />

      <label>Phone</label>
      <input value={edit.phone || ''} onChange={e => setEdit({...edit, phone:e.target.value})} style={{width:"100%"}} />

      <label>Bio</label>
      <textarea value={edit.bio || ''} onChange={e => setEdit({...edit, bio:e.target.value})} style={{width:"100%"}}/>
      <label>Skills (comma separated)</label>
      <input value={edit.skills || ''} onChange={e => setEdit({...edit, skills:e.target.value})} style={{width:"100%"}} />
      <label>Location</label>
      <input value={edit.location || ''} onChange={e => setEdit({...edit, location:e.target.value})} style={{width:"100%"}} />
      <label>Avatar URL</label>
      <input value={edit.avatar || ''} onChange={e => setEdit({...edit, avatar:e.target.value})} style={{width:"100%"}} />
      <button onClick={saveProfile} disabled={loading} style={{marginTop:20}}>Save</button>
    </div>
  );
}
