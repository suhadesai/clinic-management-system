import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
const API = "https://clinic-management-system-backend-u5c9.onrender.com/"

export default function BasicsFull() {
  const navigate = useNavigate()
  const { state: basicData } = useLocation()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(basicData || {})
  const [isSaving, setIsSaving] = useState(false)
  const [availableTags, setAvailableTags] = useState([])
  const [newTagInput, setNewTagInput] = useState("")

  useEffect(() => {
    if (basicData) {
      setFormData(basicData)
    }
    fetchTags();
  }, [basicData])

  const fetchTags = async () => {
    try {
      const response = await axios.get(API + "get-all-tags");
      setAvailableTags(response.data);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    }
  }

  if (!basicData) {
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
      const response = await axios.put(`${API}update`, formData);
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
      await axios.post(API + "create-tag", { tagName });
      
      setAvailableTags(prev => [...prev, tagName]);
      
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagName]
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
      tags: prev.tags?.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...(prev.tags || []), tag]
    }))
  }

  const handleCancel = () => {
    setFormData(basicData);
    setIsEditing(false);
  }

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
              name="repName"
              value={formData.repName || ''}
              onChange={handleChange}
              disabled={isSaving}
            />
          ) : (
            formData.repName
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
                    className={`tag-pill ${formData.tags?.includes(tag) ? 'active' : ''}`}
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
              {formData.tags?.length
                ? formData.tags.map(tag => (
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
            label="Facility / Drug"
            name="facilityAndDrug"
            value={formData.facilityAndDrug || ''}
            isEditing={isEditing}
            onChange={handleChange}
            disabled={isSaving}
          />

          <InfoField
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber || ''}
            isEditing={isEditing}
            onChange={handleChange}
            disabled={isSaving}
          />

          <InfoField
            label="Location"
            name="location"
            value={formData.location || ''}
            isEditing={isEditing}
            onChange={handleChange}
            disabled={isSaving}
          />
            <InfoField
              label="Fax Number"
              name="faxNumber"
              value={formData.faxNumber || ''}
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
