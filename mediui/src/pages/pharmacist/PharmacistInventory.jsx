import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../api/client';
import './PharmacistInventory.css';

const PharmacistInventory = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, alerts, prescriptions, add, dispense
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [updateModal, setUpdateModal] = useState({ open: false, item: null, quantity: '' });
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });
  
  const [form, setForm] = useState({
    drugName: '',
    batchNumber: '',
    expiryDate: '',
    stockQuantity: '',
    threshold: '10',
    unitPrice: '',
    manufacturer: '',
  });

  const [dispenseForm, setDispenseForm] = useState({
    inventoryId: '',
    medicineName: '',
    quantity: '',
    patientName: '',
    prescriptionId: ''
  });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const [inventoryData, lowStockData, expiringData, prescriptionsData] = await Promise.all([
        apiFetch('/pharmacist/inventory', { token: user?.token }),
        apiFetch('/pharmacist/inventory/low-stock', { token: user?.token }),
        apiFetch('/pharmacist/inventory/expiring?daysAhead=60', { token: user?.token }),
        apiFetch('/pharmacist/prescriptions', { token: user?.token })
      ]);
      
      setItems(Array.isArray(inventoryData) ? inventoryData : []);
      setLowStock(Array.isArray(lowStockData) ? lowStockData : []);
      setExpiring(Array.isArray(expiringData) ? expiringData : []);
      setPrescriptions(Array.isArray(prescriptionsData) ? prescriptionsData : []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/pharmacist/inventory/add', {
        method: 'POST',
        token: user?.token,
        body: {
          ...form,
          stockQuantity: Number(form.stockQuantity),
          threshold: Number(form.threshold),
          unitPrice: form.unitPrice ? Number(form.unitPrice) : null,
        },
      });
      
      setForm({
        drugName: '',
        batchNumber: '',
        expiryDate: '',
        stockQuantity: '',
        threshold: '10',
        unitPrice: '',
        manufacturer: '',
      });
      
      loadInventory();
      setActiveTab('all');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDispense = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/pharmacist/inventory/dispense', {
        method: 'POST',
        token: user?.token,
        body: {
          inventoryId: Number(dispenseForm.inventoryId),
          quantity: Number(dispenseForm.quantity),
          patientName: dispenseForm.patientName,
          prescriptionId: dispenseForm.prescriptionId ? Number(dispenseForm.prescriptionId) : null
        }
      });
      
      setDispenseForm({
        inventoryId: '',
        medicineName: '',
        quantity: '',
        patientName: '',
        prescriptionId: ''
      });
      
      loadInventory();
      setActiveTab('all');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateStock = async (itemId, newQuantity) => {
    const numericQty = Number(newQuantity);
    if (Number.isNaN(numericQty)) {
      setError('Please enter a valid quantity.');
      return;
    }

    try {
      await apiFetch(`/pharmacist/inventory/${itemId}/update-stock?quantity=${numericQty}`, {
        method: 'PUT',
        token: user?.token
      });
      
      loadInventory();
    } catch (err) {
      setError(err.message);
    }
  };

  const openUpdateModal = (item) => {
    setUpdateModal({ open: true, item, quantity: item.stockQuantity });
  };

  const closeUpdateModal = () => {
    setUpdateModal({ open: false, item: null, quantity: '' });
  };

  const submitUpdateModal = async (e) => {
    e.preventDefault();
    if (!updateModal.item) return;
    await handleUpdateStock(updateModal.item.id, updateModal.quantity);
    closeUpdateModal();
  };

  const openDeleteModal = (item) => {
    setDeleteModal({ open: true, item });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ open: false, item: null });
  };

  const confirmDelete = async () => {
    if (!deleteModal.item) return;
    try {
      await apiFetch(`/pharmacist/inventory/${deleteModal.item.id}`, {
        method: 'DELETE',
        token: user?.token
      });
      loadInventory();
    } catch (err) {
      setError(err.message);
    } finally {
      closeDeleteModal();
    }
  };

  const getStockStatus = (item) => {
    if (item.stockQuantity === 0) return { text: 'Out of Stock', color: '#f44336', icon: '🚫' };
    if (item.stockQuantity <= item.threshold) return { text: 'Low Stock', color: '#ff9800', icon: '⚠️' };
    return { text: 'In Stock', color: '#4caf50', icon: '✅' };
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (expiryDate) => {
    const days = getDaysUntilExpiry(expiryDate);
    
    if (days < 0) return { text: 'Expired', color: '#f44336', icon: '❌' };
    if (days <= 30) return { text: `${days} days left`, color: '#ff5722', icon: '⏰' };
    if (days <= 60) return { text: `${days} days left`, color: '#ff9800', icon: '⚡' };
    return { text: `${days} days left`, color: '#4caf50', icon: '✓' };
  };

  const filteredItems = items.filter(item =>
    item.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAlerts = lowStock.length + expiring.length;

  if (loading) {
    return <div className="pharmacy-inventory loading">Loading inventory...</div>;
  }

  return (
    <div className="pharmacy-inventory">
      <div className="inventory-header">
        <div>
          <h1>🏥 Pharmacy Inventory</h1>
          <p className="subtitle">Manage medication stock and alerts</p>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <span className="stat-value">{items.length}</span>
            <span className="stat-label">Total Items</span>
          </div>
          <div className="stat-card alert">
            <span className="stat-value">{totalAlerts}</span>
            <span className="stat-label">Alerts</span>
          </div>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="inventory-tabs">
        <button 
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          📦 All Inventory ({items.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'prescriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('prescriptions')}
        >
          📋 Prescriptions ({prescriptions.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          🚨 Alerts ({totalAlerts})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          ➕ Add Item
        </button>
        <button 
          className={`tab-btn ${activeTab === 'dispense' ? 'active' : ''}`}
          onClick={() => setActiveTab('dispense')}
        >
          💊 Dispense
        </button>
      </div>

      {/* All Inventory Tab */}
      {activeTab === 'all' && (
        <div className="tab-content">
          <div className="search-bar">
            <input
              type="text"
              placeholder="🔍 Search by drug name, batch number, or manufacturer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {filteredItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No inventory items found</h3>
              <p>{searchTerm ? 'Try a different search term' : 'Add your first inventory item to get started'}</p>
            </div>
          ) : (
            <div className="inventory-grid">
              {filteredItems.map((item) => {
                const stockStatus = getStockStatus(item);
                const expiryStatus = getExpiryStatus(item.expiryDate);
                
                return (
                  <div key={item.id} className="inventory-card">
                    <div className="card-header-row">
                      <h3>{item.drugName}</h3>
                      <div className="status-badges">
                        <span className="status-badge" style={{ backgroundColor: stockStatus.color }}>
                          {stockStatus.icon} {stockStatus.text}
                        </span>
                      </div>
                    </div>

                    <div className="card-details">
                      <div className="detail-row">
                        <span className="label">Batch:</span>
                        <span className="value">{item.batchNumber}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Stock:</span>
                        <span className="value">
                          <strong>{item.stockQuantity}</strong> units
                          <span className="threshold-info">(min: {item.threshold})</span>
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Expiry:</span>
                        <span className="value expiry" style={{ color: expiryStatus.color }}>
                          {expiryStatus.icon} {new Date(item.expiryDate).toLocaleDateString()} 
                          <small> ({expiryStatus.text})</small>
                        </span>
                      </div>
                      {item.manufacturer && (
                        <div className="detail-row">
                          <span className="label">Manufacturer:</span>
                          <span className="value">{item.manufacturer}</span>
                        </div>
                      )}
                      {item.unitPrice && (
                        <div className="detail-row">
                          <span className="label">Unit Price:</span>
                          <span className="value">${item.unitPrice.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    <div className="card-actions">
                      <button 
                        className="action-btn"
                        onClick={() => {
                          setDispenseForm({ ...dispenseForm, inventoryId: item.id });
                          setActiveTab('dispense');
                        }}
                      >
                        Dispense
                      </button>
                      <button 
                        className="action-btn secondary"
                        onClick={() => openUpdateModal(item)}
                      >
                        Update Stock
                      </button>
                      <button 
                        className="action-btn danger"
                        onClick={() => openDeleteModal(item)}
                        title="Delete this inventory item"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Prescriptions Tab */}
      {activeTab === 'prescriptions' && (
        <div className="tab-content">
          {prescriptions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No Active Prescriptions</h3>
              <p>There are no prescriptions awaiting dispensing</p>
            </div>
          ) : (
            <div className="inventory-grid">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="inventory-card">
                  <div className="card-header-row">
                    <h3>Prescription #{prescription.id}</h3>
                    <div className="status-badges">
                      <span className="status-badge" style={{ backgroundColor: '#4caf50' }}>
                        ✓ {prescription.status}
                      </span>
                    </div>
                  </div>

                  <div className="card-details">
                    <div className="detail-row">
                      <span className="label">Patient:</span>
                      <span className="value">{prescription.patientName || prescription.patientEmail}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Doctor:</span>
                      <span className="value">{prescription.doctorName || prescription.doctorEmail}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Issued:</span>
                      <span className="value">{new Date(prescription.issuedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Expires:</span>
                      <span className="value">{new Date(prescription.expiryDate).toLocaleDateString()}</span>
                    </div>
                    {prescription.diagnosis && (
                      <div className="detail-row">
                        <span className="label">Diagnosis:</span>
                        <span className="value">{prescription.diagnosis}</span>
                      </div>
                    )}
                    
                    <div className="detail-row" style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                      <span className="label"><strong>Medications:</strong></span>
                    </div>
                    {prescription.medicines && prescription.medicines.map((med, idx) => (
                      <div key={idx} style={{ 
                        background: '#f8f9fa', 
                        padding: '10px', 
                        marginBottom: '8px', 
                        borderRadius: '6px',
                        fontSize: '13px'
                      }}>
                        <div><strong>{med.medicineName}</strong></div>
                        <div>Dosage: {med.dosage}</div>
                        <div>Frequency: {med.frequency}</div>
                        <div>Duration: {med.durationDays} days</div>
                        {med.instructions && <div>Notes: {med.instructions}</div>}
                      </div>
                    ))}
                  </div>

                  <div className="card-actions">
                    <button 
                      className="action-btn"
                      onClick={() => {
                        // Calculate total quantity: frequency × dosage × duration
                        let totalQuantity = 0;
                        if (prescription.medicines && prescription.medicines.length > 0) {
                          const firstMed = prescription.medicines[0];
                          
                          // Parse frequency (e.g., "2 times daily", "Once daily" -> extract number)
                          const frequencyMatch = firstMed.frequency?.match(/\d+/);
                          const frequency = frequencyMatch ? parseInt(frequencyMatch[0]) : 1;
                          
                          // Parse dosage (e.g., "500mg", "2 tablets", "1" -> extract number)
                          const dosageMatch = firstMed.dosage?.match(/\d+/);
                          const dosage = dosageMatch ? parseInt(dosageMatch[0]) : 1;
                          
                          // Parse duration (e.g., "30 days" -> extract number)
                          const durationMatch = firstMed.durationDays?.toString().match(/\d+/);
                          const duration = durationMatch ? parseInt(durationMatch[0]) : 30;
                          
                          // Total quantity = frequency × dosage × duration
                          totalQuantity = frequency * dosage * duration;
                        }

                        const medicineName = prescription.medicines && prescription.medicines.length > 0
                          ? prescription.medicines[0].medicineName
                          : '';
                        
                        setDispenseForm({ 
                          ...dispenseForm, 
                          prescriptionId: prescription.id,
                          medicineName: medicineName,
                          patientName: prescription.patientName || prescription.patientEmail,
                          quantity: totalQuantity > 0 ? totalQuantity.toString() : '',
                          inventoryId: ''
                        });
                        setActiveTab('dispense');
                      }}
                    >
                      Dispense Medication
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="tab-content">
          {totalAlerts === 0 ? (
            <div className="empty-state success">
              <div className="empty-icon">✅</div>
              <h3>No Alerts</h3>
              <p>All inventory levels are healthy</p>
            </div>
          ) : (
            <div className="alerts-section">
              {lowStock.length > 0 && (
                <div className="alert-group">
                  <h2>⚠️ Low Stock Alerts</h2>
                  <div className="alerts-list">
                    {lowStock.map((item) => (
                      <div key={item.id} className="alert-card low-stock">
                        <div className="alert-icon">📉</div>
                        <div className="alert-content">
                          <h4>{item.drugName}</h4>
                          <p>Batch: {item.batchNumber}</p>
                          <div className="alert-detail">
                            <strong>Stock: {item.stockQuantity}</strong> (Threshold: {item.threshold})
                          </div>
                        </div>
                        <button className="alert-action" onClick={() => {
                          const newQty = prompt(`Restock ${item.drugName}:`, item.threshold * 2);
                          if (newQty !== null) handleUpdateStock(item.id, newQty);
                        }}>
                          Restock
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {expiring.length > 0 && (
                <div className="alert-group">
                  <h2>⏰ Expiring Soon</h2>
                  <div className="alerts-list">
                    {expiring.map((item) => {
                      const days = getDaysUntilExpiry(item.expiryDate);
                      return (
                        <div key={item.id} className="alert-card expiring">
                          <div className="alert-icon">📅</div>
                          <div className="alert-content">
                            <h4>{item.drugName}</h4>
                            <p>Batch: {item.batchNumber}</p>
                            <div className="alert-detail">
                              Expires: <strong>{new Date(item.expiryDate).toLocaleDateString()}</strong>
                              <span className="days-left"> ({days} days left)</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add Item Tab */}
      {activeTab === 'add' && (
        <div className="tab-content">
          <div className="form-container">
            <h2>Add New Inventory Item</h2>
            <form onSubmit={handleAddItem} className="inventory-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Drug Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="drugName"
                    value={form.drugName}
                    onChange={(e) => setForm({ ...form, drugName: e.target.value })}
                    placeholder="e.g., Paracetamol"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Batch Number <span className="required">*</span></label>
                  <input
                    type="text"
                    name="batchNumber"
                    value={form.batchNumber}
                    onChange={(e) => setForm({ ...form, batchNumber: e.target.value })}
                    placeholder="e.g., BATCH001"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Expiry Date <span className="required">*</span></label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={form.expiryDate}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Stock Quantity <span className="required">*</span></label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={form.stockQuantity}
                    onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                    placeholder="e.g., 100"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Low Stock Threshold <span className="required">*</span></label>
                  <input
                    type="number"
                    name="threshold"
                    value={form.threshold}
                    onChange={(e) => setForm({ ...form, threshold: e.target.value })}
                    placeholder="e.g., 10"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Unit Price</label>
                  <input
                    type="number"
                    name="unitPrice"
                    value={form.unitPrice}
                    onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                    placeholder="e.g., 5.99"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Manufacturer</label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={form.manufacturer}
                    onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                    placeholder="e.g., Pfizer"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setActiveTab('all')}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Add to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispense Tab */}
      {activeTab === 'dispense' && (
        <div className="tab-content">
          <div className="form-container">
            <h2>Dispense Medication</h2>
            <form onSubmit={handleDispense} className="inventory-form">
              <div className="form-grid">
                {dispenseForm.medicineName && (
                  <div className="form-group full-width">
                    <label>Medicine from Prescription</label>
                    <div className="form-readonly-field">📋 {dispenseForm.medicineName}</div>
                  </div>
                )}
                <div className="form-group full-width">
                  <label>Select Inventory Item <span className="required">*</span></label>
                  <select
                    value={dispenseForm.inventoryId}
                    onChange={(e) => setDispenseForm({ ...dispenseForm, inventoryId: e.target.value })}
                    required
                  >
                    <option value="">Choose medication from inventory...</option>
                    {items.filter(i => i.stockQuantity > 0).map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.drugName} - Batch: {item.batchNumber} (Stock: {item.stockQuantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Quantity <span className="required">*</span></label>
                  <input
                    type="number"
                    value={dispenseForm.quantity}
                    onChange={(e) => setDispenseForm({ ...dispenseForm, quantity: e.target.value })}
                    placeholder="e.g., 10"
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Patient Name <span className="required">*</span></label>
                  <input
                    type="text"
                    value={dispenseForm.patientName}
                    onChange={(e) => setDispenseForm({ ...dispenseForm, patientName: e.target.value })}
                    placeholder="Patient's full name"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Prescription ID (Optional)</label>
                  <input
                    type="number"
                    value={dispenseForm.prescriptionId}
                    onChange={(e) => setDispenseForm({ ...dispenseForm, prescriptionId: e.target.value })}
                    placeholder="Enter prescription ID if available"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setActiveTab('all')}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Dispense Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {updateModal.open && (
        <div className="modal-overlay" role="presentation" onClick={closeUpdateModal}>
          <div className="modal" role="dialog" aria-modal="true" aria-label="Update stock" onClick={(e) => e.stopPropagation()}>
            <h3>Update Stock</h3>
            <p className="modal-subtitle">{updateModal.item?.drugName}</p>
            <form onSubmit={submitUpdateModal} className="modal-form">
              <label htmlFor="updateQuantity">New quantity</label>
              <input
                id="updateQuantity"
                type="number"
                min="0"
                step="1"
                value={updateModal.quantity}
                onChange={(e) => setUpdateModal((prev) => ({ ...prev, quantity: e.target.value }))}
                autoFocus
              />
              <div className="modal-actions">
                <button type="button" className="action-btn secondary" onClick={closeUpdateModal}>Cancel</button>
                <button type="submit" className="action-btn">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteModal.open && (
        <div className="modal-overlay" role="presentation" onClick={closeDeleteModal}>
          <div className="modal" role="dialog" aria-modal="true" aria-label="Delete inventory item" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Inventory Item</h3>
            <p className="modal-subtitle">{deleteModal.item?.drugName}</p>
            <p className="modal-warning">This will remove the item and its dispense records. This action cannot be undone.</p>
            <div className="modal-actions">
              <button type="button" className="action-btn secondary" onClick={closeDeleteModal}>Cancel</button>
              <button type="button" className="action-btn danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacistInventory;
