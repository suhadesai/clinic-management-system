import { useState, useEffect, useMemo } from 'react'
import { Routes, Route } from 'react-router-dom'
import axios from 'axios'
import BasicsFull from './BasicsFull.jsx'
import Card from './components/Card.jsx'
import Navbar from './components/Navbar.jsx'
import './App.css'

function App() {
  const [allBasics, setAllReps] = useState([])
  const [allMeds, setAllMeds] = useState([])
  const [availableTags, setAvailableTags] = useState([])
  const [newTagInput, setNewTagInput] = useState("") 
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMedModalOpen, setIsMedModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  const [repForm, setRepForm] = useState({
    repName: "", facilityAndDrug: "", phoneNumber: "", faxNumber: "", location: "", tags: []
  })

  const [medForm, setMedForm] = useState({
    medName: "", expiryDate:""
  })

  const API = import.meta.env.VITE_API_URL;

  const fetchTags = async () => {
    try {
      const response = await axios.get(API + "/get-all-tags");
      setAvailableTags(response.data);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    }
  }

  const fetchData = async () => {
    const reps = await axios.get(API + "/get-all");
    const meds = await axios.get(API + "/get-all-meds");
    setAllReps(reps.data);
    setAllMeds(meds.data);
    fetchTags();
  }

  const handleDeleteMed = async (id) => {
    setAllMeds(prev => prev.filter(med => med._id !== id))
  
    try {
      await axios.delete(API + `/delete-med/${id}`)
    } catch (err) {
      fetchData()
    }
  }

  const handleDeleteRep = async (id) => {
    setAllReps(prev => prev.filter(rep => rep._id !== id))
  
    try {
      await axios.delete(API + `/delete/${id}`)
    } catch (err) {
      fetchData() 
    }
  }

  useEffect(() => { fetchData() }, [])

  const handlePostRep = async () => {
    await axios.post(API + "/post", repForm);
    setRepForm({ repName: "", facilityAndDrug: "", phoneNumber: "", faxNumber: "", location: "", tags: [] });
    fetchData();
    setIsModalOpen(false);
  }

  const handlePostMed = async () => {
    await axios.post(API + "/post-med", medForm);
    setMedForm({ medName: "", expiryDate: "" });
    fetchData();
    setIsMedModalOpen(false);
  }

  const handleAddNewTag = async () => {
    const tagName = newTagInput.trim();
    if (!tagName) return;
    
    if (availableTags.includes(tagName)) {
      alert("Tag already exists!");
      setNewTagInput("");
      return;
    }
    
    try {
      await axios.post(API + "/create-tag", { tagName });
      setAvailableTags(prev => [...prev, tagName]);
      
      setRepForm(prev => ({
        ...prev,
        tags: [...prev.tags, tagName]
      }));
      
      setNewTagInput("");
    } catch (error) {
      console.error("Failed to create tag:", error);
      alert("Failed to create tag. It might already exist.");
    }
  }

  const toggleTag = (tag) => {
    setRepForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
    }));
  }

  const filteredReps = useMemo(() => {
    if (!searchQuery.trim()) return allBasics;
    
    const query = searchQuery.toLowerCase().trim();
    
    return allBasics.filter(rep => {
      const searchableFields = [
        rep.repName,
        rep.facilityAndDrug,
        rep.location,
        rep.phoneNumber,
        ...(rep.tags || [])
      ];
      
      return searchableFields.some(field => 
        field && field.toString().toLowerCase().includes(query)
      );
    });
  }, [allBasics, searchQuery]);
  
  const clearSearch = () => {
    setSearchQuery("");
  };
  
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

  const sortedMeds = useMemo(() => {
    return [...allMeds].sort((a, b) => {
      const dateA = new Date(a.expiryDate);
      const dateB = new Date(b.expiryDate);
      return dateA - dateB;
    });
  }, [allMeds]);

const getExpiryInfo = (dateString) => {
  if (!dateString) return { status: 'no-date', daysRemaining: null };
  
  const expiryDate = new Date(dateString);
  const today = new Date();
  const timeDiff = expiryDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  if (daysRemaining < 0) return { status: 'expired', daysRemaining };
  if (daysRemaining <= 30) return { status: 'warning', daysRemaining };
  return { status: 'ok', daysRemaining };
};


  return (
    <div className="app-container">
      <Navbar 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <Routes>
        <Route path="/" element={
          <div className="dashboard-layout">
            {/*  sidebar -- meds */}
            <aside className="meds-sidebar">
              <div className="sidebar-header">
                <h3>Inventory Expiry</h3>
                <span className="count-badge" onClick={() => setIsMedModalOpen(true)} > + </span>
              </div>
              <div className="meds-list">
                {sortedMeds.map((med) => {
                  const expiryInfo = getExpiryInfo(med.expiryDate);
                  
                  return (
                    <div 
                      key={med._id} 
                      className={`med-item ${expiryInfo.status}`}
                      title={
                        expiryInfo.status === 'expired' ? 'EXPIRED' : 
                        expiryInfo.status === 'warning' ? `Expires in ${expiryInfo.daysRemaining} days` : 
                        `Expires in ${expiryInfo.daysRemaining} days`
                      }
                    >
                      <div className="med-item-content">
                        <div className="med-info">
                          <strong>{med.medName}</strong>
                          <p className={`expiry-text ${expiryInfo.status}`}>
                            Expires: {formatExpiryDate(med.expiryDate)}
                            {expiryInfo.status === 'expired'}
                            {expiryInfo.status === 'warning'}
                            {expiryInfo.status === 'ok'}
                          </p>
                        </div>
                        <button 
                          className="delete-btn" 
                          onClick={(e) => {
                            e.stopPropagation()
                            if (window.confirm(`Delete ${med.medName}?`)) {
                              handleDeleteMed(med._id)
                            }
                          }}
                          title="Delete medication"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </aside>

            {/* main content -- cards */}
            <main className="reps-content">
              <div className="content-header">
                <h2>Medical Representatives</h2>
                
              </div>
             
              {searchQuery && (
                  <div className="search-results-info">
                    <span className="search-results-count">
                      Found {filteredReps.length} of {allBasics.length} reps
                    </span>
                    <span className="search-query">
                      Search: "{searchQuery}"
                    </span>
                    <button 
                      className="clear-search-button"
                      onClick={clearSearch}
                    >
                      Clear Search
                    </button>
                  </div>
                )}
                
                {/* no results? */}
                {searchQuery && filteredReps.length === 0 ? (
                  <div className="no-results-container">
                    <div className="no-results-icon">🔍</div>
                    <h3 className="no-results-title">No representatives found</h3>
                    <p className="no-results-message">
                      No results for "<strong>{searchQuery}</strong>"
                    </p>
                    <button 
                      className="clear-search-button"
                      onClick={clearSearch}
                    >
                      Show All Representatives
                    </button>
                  </div>
                ) : (
                  <div className="rep-grid">
                    {filteredReps.map((rep) => (
                      <Card 
                        basics={rep} 
                        key={rep._id} 
                        onDelete={handleDeleteRep}
                        searchQuery={searchQuery}
                      />
                    ))}
                  </div>
                )}
              
            </main>

            <button className="fab-add" onClick={() => setIsModalOpen(true)}>+</button>

            {isModalOpen && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h2>New Representative</h2>
                  <div className="form-grid">
                    <input placeholder="Name" value={repForm.repName} onChange={e => setRepForm({...repForm, repName: e.target.value})} />
                    <input placeholder="Facility" value={repForm.facilityAndDrug} onChange={e => setRepForm({...repForm, facilityAndDrug: e.target.value})} />
                    <input placeholder="Phone" value={repForm.phoneNumber} onChange={e => setRepForm({...repForm, phoneNumber: e.target.value})} />
                    <input placeholder="Fax" value={repForm.faxNumber} onChange={e => setRepForm({...repForm, faxNumber: e.target.value})} />
                    <input placeholder="Location" value={repForm.location} onChange={e => setRepForm({...repForm, location: e.target.value})} />
                  </div>
                  <div className="tag-selector">
                    {availableTags.map(tag => (
                      <button key={tag} className={repForm.tags.includes(tag) ? 'active' : ''} onClick={() => toggleTag(tag)}>{tag}</button>
                    ))}
                    <div className="add-tag-section">
                      <div className="add-tag-input">
                        <input
                          type="text"
                          placeholder="Add new tag..."
                          value={newTagInput}
                          onChange={(e) => setNewTagInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddNewTag()}
                        />
                        <button 
                          className="add-tag-btn"
                          onClick={handleAddNewTag}
                          disabled={!newTagInput.trim()}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button className="save-btn" onClick={handlePostRep}>Save</button>
                  </div>
                </div>
              </div>
            )}

            {isMedModalOpen && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h2>New Med</h2>
                  <div className="form-grid">
                    <input placeholder="Name" value={medForm.medName} onChange={e => setMedForm({...medForm, medName: e.target.value})} />
                    <input placeholder="Date" type='date' value={medForm.expiryDate} onChange={e => setMedForm({...medForm, expiryDate: e.target.value})} />
                  </div>
                  
                  <div className="modal-actions">
                    <button onClick={() => setIsMedModalOpen(false)}>Cancel</button>
                    <button className="save-btn" onClick={handlePostMed}>Save</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        } />
        <Route path="/basics" element={<BasicsFull />} />
      </Routes>
    </div>
  )
}

export default App
