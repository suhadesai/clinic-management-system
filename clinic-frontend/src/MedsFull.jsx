import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
const API = import.meta.env.VITE_API_URL;

export default function MedsFull() {
  const navigate = useNavigate()
  const { state: medData } = useLocation()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(medData || {})
  const [isSaving, setIsSaving] = useState(false)
  const [availableTags, setAvailableTags] = useState([])
  const [newTagInput, setNewTagInput] = useState("")

  useEffect(() => {
    if (medData) {
      setFormData(medData)
    }
    fetchTags();
  }, [medData])

  const fetchTags = async () => {
    try {
      const response = await axios.get(API + "/get-all-med-tags");
      setAvailableTags(response.data);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    }
  }

  if (!medData) {
    return <p className="empty-state">No data provided</p>
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    if (!formData._id) {
      console.error("No _id found in formData");
      return;
    }

    setIsSaving(true);
    try {
      const response = await axios.put(`${API}/update-med`, formData);
      console.log("Update successful:", response.data);
      setIsEditing(false);
      alert("Saved successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  const handleAddNewTag = async () => {
    const tagName = newTagInput.trim();
    if (!tagName) return;
    
    try {
      await axios.post(API + "/create-med-tag", { tagName });
      
      setAvailableTags(prev => [...prev, tagName]);
      
      setFormData(prev => ({
        ...prev,
        medTags: [...(prev.medTags || []), tagName]
      }));
      
      setNewTagInput("");
    } catch (error) {
      console.error("Failed to create tag:", error);
      alert("Failed to create tag. It might already exist.");
    }
  }

  const toggleTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      medTags: prev.medTags?.includes(tag)
        ? prev.medTags.filter(t => t !== tag)
        : [...(prev.medTags || []), tag]
    }))
  }

  const handleCancel = () => {
    setFormData(medData);
    setIsEditing(false);
  }

  const formatExpiryDate = (dateString) => {
    if (!dateString) return 'No expiry date';
    
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        //if it is already in a string format, return as is
        return dateString;
      }
      
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${month}-${day}-${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  return (
    <div className="basics-page">
      {/* heading */}
      <div className="basics-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

        <div className="header-actions">
          {isEditing ? (
            <>
              <button
                className="cancel-btn"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className="save-btn"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <button
              className="edit-btn"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* big card */}
      <div className="basics-card">
        <h1 className="rep-name">
          {isEditing ? (
            <input
              name="medName"
              value={formData.medName || ''}
              onChange={handleChange}
              disabled={isSaving}
            />
          ) : (
            formData.medName
          )}
        </h1>

        {/* tags first */}
        <div className="tags-section">
          {isEditing ? (
            <div className="tag-editor">
              {/* new tag input - only show when editing */}
              <div className="add-tag-container">
                <input
                  type="text"
                  placeholder="New Tag? (Press Enter)"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddNewTag()}
                  disabled={isSaving}
                  className="new-tag-input"
                />
              </div>
              
              <div className="available-tags-grid">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    className={`tag-pill ${formData.medTags?.includes(tag) ? 'active' : ''}`}
                    onClick={() => toggleTag(tag)}
                    disabled={isSaving}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="tag-display">
              {formData.medTags?.length
                ? formData.medTags.map(tag => (
                    <span key={tag} className="tag-pill active">{tag}</span>
                  ))
                : <span className="no-tags">No tags</span>
              }
            </div>
          )}
        </div>

        {/* all info */}
        <div className="info-grid">
          <InfoField
            label="Expiry Date"
            name="expiryDate"
            value={formatExpiryDate(formData.expiryDate) || ''}
            isEditing={isEditing}
            onChange={handleChange}
            disabled={isSaving}
          />

          <InfoField
            label="Lot Number"
            name="lotNumber"
            value={formData.lotNumber || ''}
            isEditing={isEditing}
            onChange={handleChange}
            disabled={isSaving}
          />

          <InfoField
            label="Dosage"
            name="dosage"
            value={formData.dosage || ''}
            isEditing={isEditing}
            onChange={handleChange}
            disabled={isSaving}
          />
          
        </div>
      </div>
    </div>
  )
}

function InfoField({ label, value, isEditing, name, onChange, disabled }) {
  return (
    <div className="info-field">
      <span className="info-label">{label}</span>
      {isEditing ? (
        <input
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      ) : (
        <p className="info-value">{value || '—'}</p>
      )}
    </div>
  )
}
