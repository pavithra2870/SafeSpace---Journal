import React, { useState, useEffect } from 'react';
import './Affirmations.css';

const API_BASE_URL = 'http://localhost:5001/api/affirmation';
const GRID_SIZE = 20;

const tips = [
  "Write in the present tense, as if it's already true!",
  "Keep it positive and specific.",
  "Focus on what you want, not what you don't want.",
  "Use words that make you feel good and empowered.",
  "Repeat your affirmations daily for best results!"
];

const Affirmations = () => {
  const [affirmations, setAffirmations] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const fetchAffirmations = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(API_BASE_URL, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setAffirmations(data.data.slice(0, GRID_SIZE));
        else setAffirmations([]);
      } catch (err) {
        setAffirmations([]);
      }
      setLoading(false);
    };
    fetchAffirmations();
  }, []);

  // Fill grid with affirmations or blanks
  const gridAffirmations = Array(GRID_SIZE).fill(null).map((_, i) => affirmations[i] || null);

  const handleEdit = (idx) => {
    setEditingIndex(idx);
    setEditText(gridAffirmations[idx]?.text || '');
  };

  const handleSave = async (idx) => {
    const token = localStorage.getItem('token');
    const aff = gridAffirmations[idx];
    if (aff && aff._id) {
      // Update by _id
      const res = await fetch(`${API_BASE_URL}/${aff._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: editText })
      });
      const data = await res.json();
      if (data.success) {
        setAffirmations(prev => prev.map(a => a._id === aff._id ? data.data : a));
      }
    } else {
      // Create new
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: editText })
      });
      const data = await res.json();
      if (data.success) {
        setAffirmations(prev => {
          const newAffs = [...prev];
          newAffs[idx] = data.data;
          return newAffs;
        });
      }
    }
    setEditingIndex(null);
    setEditText('');
  };

  const handleDelete = async (idx) => {
    const aff = gridAffirmations[idx];
    if (!aff || !aff._id) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/${aff._id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      setAffirmations(prev => prev.filter(a => a._id !== aff._id));
    }
    setEditingIndex(null);
    setEditText('');
  };

  if (loading) {
    return (
      <div className="affirmations-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Loading your affirmations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="affirmations-container">
      <div className="affirmations-guidance">
        <h2 className="affirmations-title">Affirmations Board</h2>
        <p className="affirmations-message">
          Affirmations are powerful positive statements that help you challenge and overcome self-sabotaging and negative thoughts. Write your own or edit any box below. <br/>
          <b>Tip:</b> {tips[tipIndex]} <button className="tip-next-btn" onClick={() => setTipIndex((tipIndex+1)%tips.length)}>Next Tip</button>
        </p>
      </div>
      <div className="affirmations-grid">
        {gridAffirmations.map((aff, idx) => (
          <div className="affirmation-box" key={idx}>
            {editingIndex === idx ? (
              <div className="affirmation-edit-form">
                <textarea
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  maxLength={200}
                  className="affirmation-input-box"
                  placeholder="Write your affirmation..."
                  autoFocus
                />
                <div className="affirmation-edit-actions">
                  <button className="affirmation-save-btn" onClick={() => handleSave(idx)}>Save</button>
                  <button className="affirmation-cancel-btn" onClick={() => { setEditingIndex(null); setEditText(''); }}>Cancel</button>
                  {aff && <button className="affirmation-delete-btn" onClick={() => handleDelete(idx)}>Delete</button>}
                </div>
              </div>
            ) : (
              <div className="affirmation-display" onClick={() => handleEdit(idx)}>
                {aff ? (
                  <span className="affirmation-text">{aff.text}</span>
                ) : (
                  <span className="affirmation-placeholder">+ Write your affirmation...</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Affirmations;