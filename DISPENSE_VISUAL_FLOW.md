# Pharmacist Dispense Feature - Visual Flow & Examples

## What Happens When a Pharmacist Dispenses Medication

### Scenario 1: Simple Dispense (No Prescription)

**Pharmacist Actions:**
1. Open Pharmacist Dashboard → All Inventory tab
2. Find "Aspirin - Batch: B001 - Stock: 50" 
3. Click "Dispense" button
4. See form pre-filled with: Drug name, Available stock
5. Enter:
   - Quantity: `10`
   - Patient Name: `Michael Johnson`
   - Prescription ID: (leave empty)
6. Click Submit

**Backend Processing:**
```
1. Authenticate: ✓ User is pharmacist
2. Validate:
   - inventoryId (Aspirin) exists ✓
   - pharmacist owns this inventory ✓
   - quantity (10) > 0 ✓
   - patient name not empty ✓
   - available stock (50) >= requested (10) ✓
3. Update DrugInventory:
   - Old stock: 50
   - Dispensed: 10
   - New stock: 40 ← DATABASE UPDATED
4. Create MedicationDispense record:
   - inventory_id: 1 (Aspirin)
   - pharmacist_id: 5 (Current user)
   - prescription_id: NULL
   - patient_name: "Michael Johnson"
   - quantity_dispensed: 10
   - dispensed_at: 2026-01-22 14:30:45
5. Log Audit:
   - Action: MEDICATION_DISPENSED
   - Details: "Dispensed 10 of Aspirin to patient: Michael Johnson"
6. Return to Frontend:
   {
     "success": true,
     "dispenseId": 15,
     "quantityDispensed": 10,
     "patientName": "Michael Johnson",
     "dispensedAt": "2026-01-22T14:30:45.123"
   }
```

**Frontend Response:**
- ✓ Shows success message
- ✓ Clears form
- ✓ Returns to All Inventory tab
- ✓ Stock shows as 40 (auto-refreshed)

**Database State After:**
```
drug_inventory table:
- Aspirin stock changed from 50 → 40

medication_dispense table:
- NEW record: Aspirin × 10 to Michael Johnson

audit_logs table:
- NEW record: MEDICATION_DISPENSED by pharmacist 5
```

---

### Scenario 2: Dispense from Prescription

**Pharmacist Actions:**
1. Open Pharmacist Dashboard → Prescriptions tab
2. See prescription: "Dr. Smith prescribed Amoxicillin 500mg × 3 to Sarah Chen"
3. Click "Dispense Medication" button
4. See form pre-filled with:
   - Drug from inventory: Amoxicillin-Batch-B123
   - Prescription ID: 42
5. Enter:
   - Quantity: `3`
   - Patient Name: (already knows: Sarah Chen)
6. Click Submit

**Backend Processing:**
```
1. Authenticate: ✓ User is pharmacist
2. Validate:
   - inventoryId (Amoxicillin) exists ✓
   - pharmacist owns this inventory ✓
   - stock (25) >= requested (3) ✓
   - patient name not empty ✓
3. Check prescription:
   - prescriptionId (42) exists ✓
   - Links to prescription record
4. Update DrugInventory:
   - Old stock: 25
   - New stock: 22
5. Create MedicationDispense:
   - inventory_id: 3
   - pharmacist_id: 5
   - prescription_id: 42 ← LINKED TO PRESCRIPTION
   - patient_name: "Sarah Chen"
   - quantity_dispensed: 3
   - dispensed_at: 2026-01-22 14:35:20
6. Log Audit:
   - "Dispensed 3 of Amoxicillin to patient: Sarah Chen (Prescription ID: 42)"
7. Return success
```

**Database State After:**
```
drug_inventory: Amoxicillin stock 25 → 22

medication_dispense:
- NEW: Links to prescription 42, patient Sarah Chen, qty 3

prescriptions: UNAFFECTED (status still ACTIVE)

audit_logs: NEW action recorded
```

---

### Scenario 3: Error - Insufficient Stock

**Pharmacist Actions:**
1. Open All Inventory tab
2. Find "Vitamin D - Stock: 5"
3. Click Dispense
4. Enter Quantity: `10` (more than available)
5. Click Submit

**Backend Processing:**
```
1. Authenticate: ✓
2. Validate inventoryId: ✓
3. Check stock:
   Available: 5
   Requested: 10
   5 < 10 → ✗ FAIL
4. Return error without updating anything
```

**Response to Frontend:**
```json
{
  "success": false,
  "message": "Insufficient stock. Available: 5, Requested: 10"
}
```

**Frontend Response:**
- Shows error message in red
- Form remains filled (user can adjust)
- No database changes (nothing saved)
- Still in dispense tab

---

### Scenario 4: Error - Missing Patient Name

**Pharmacist Actions:**
1. Open Dispense tab
2. Select medication from dropdown
3. Enter Quantity: `5`
4. Leave Patient Name empty ← ERROR
5. Click Submit

**Backend Processing:**
```
1. Authenticate: ✓
2. Validate fields:
   - inventoryId: ✓ Present
   - quantity: ✓ Present (5 > 0)
   - patientName: ✗ EMPTY OR MISSING
3. Return validation error without processing
```

**Response:**
```json
{
  "success": false,
  "message": "Patient name is required"
}
```

**Frontend:**
- Shows error message
- No database changes
- User can correct and resubmit

---

## Data Flow Diagram

### Complete Request-Response Cycle

```
┌─────────────────────────────────────────────────────────────────┐
│                        PHARMACIST UI                            │
│  PharmacistInventory.jsx - Dispense Tab                         │
│                                                                 │
│  [Select Medication]  [Enter Qty]  [Enter Patient]  [DISPENSE]  │
│           ↓                  ↓              ↓             ↓       │
│         Form Value         Form Value    Form Value    onClick   │
│                                              ↓                   │
│                                 handleDispense() {               │
│                                   apiFetch POST /dispense        │
│                                 }                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓↑
                    HTTP POST with JSON Body
                    {inventoryId, quantity, 
                     patientName, prescriptionId}
                              ↓↑
┌─────────────────────────────────────────────────────────────────┐
│                    SPRING BOOT BACKEND                          │
│                  (Port 8080 - typically)                         │
│                                                                 │
│  PharmacistController.dispenseMedication()                      │
│    ├─ Extract authentication (pharmacist ID)                    │
│    ├─ Validate request fields                                   │
│    │  ├─ inventoryId != null                                    │
│    │  ├─ quantity > 0                                           │
│    │  └─ patientName not empty                                  │
│    │                                                             │
│    └─ Call service: inventoryService.dispenseMedication()       │
│         ↓                                                        │
│    DrugInventoryService.dispenseMedication()                    │
│    ├─ Load DrugInventory record                                 │
│    ├─ Verify pharmacist ownership                               │
│    ├─ Check stock >= quantity                                   │
│    ├─ Decrement stock                                           │
│    ├─ Save updated inventory                                    │
│    ├─ Create MedicationDispense object                          │
│    ├─ Link prescription (if provided)                           │
│    ├─ Save dispense record                                      │
│    ├─ Log audit action                                          │
│    └─ Return MedicationDispense object                          │
│         ↓                                                        │
│    Controller builds response Map                               │
│    └─ Return ResponseEntity with success/data                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓↑
                  HTTP 200 OK with JSON Response
                {success: true, dispenseId, 
                 quantityDispensed, patientName, 
                 dispensedAt, message}
                              ↓↑
┌─────────────────────────────────────────────────────────────────┐
│                    PHARMACIST UI (Frontend)                     │
│                                                                 │
│  handleDispense() completes                                     │
│  ├─ If success:                                                 │
│  │  ├─ Show success toast/modal                                 │
│  │  ├─ Clear form                                               │
│  │  ├─ Refresh inventory list                                   │
│  │  └─ Switch to "All Inventory" tab                            │
│  │                                                              │
│  └─ If error:                                                   │
│     ├─ Show error message                                       │
│     ├─ Keep form filled                                         │
│     └─ Stay on "Dispense" tab                                   │
│                                                                 │
│  All Inventory Tab now shows:                                   │
│  "Aspirin - Stock: 40" (was 50, down by 10)                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────────┐
│                      PostgreSQL DATABASE                        │
│              (Supabase or local PostgreSQL)                     │
│                                                                 │
│  Tables Updated:                                                │
│                                                                 │
│  drug_inventory:                                                │
│  ┌─────────────────────────────────────────────────┐           │
│  │ id  │ drug_name  │ stock_quantity │ ...         │           │
│  ├─────────────────────────────────────────────────┤           │
│  │  1  │ Aspirin    │ 40 (was 50)    │ ...         │           │
│  └─────────────────────────────────────────────────┘           │
│                                                                 │
│  medication_dispense: [NEW]                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ id │ inventory │ pharmacist │ patient_name │ qty │ time  │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ 15 │    1      │     5      │ Michael...   │ 10  │ 14:30 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  audit_logs: [NEW]                                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ action          │ pharmacist │ details      │ timestamp  │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ MEDICATION_...  │     5      │ Dispensed... │ 14:30:45   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## State Changes Summary

### Before Dispense
```
Inventory:     Aspirin, Stock: 50
MedicationDispense: (no records for this dispense)
AuditLog:      (no record of this action)
Pharmacist UI: Dispense Tab, Form Ready
```

### After Successful Dispense
```
Inventory:     Aspirin, Stock: 40 ← CHANGED
MedicationDispense: Record created with ID 15 ← NEW
AuditLog:      MEDICATION_DISPENSED action logged ← NEW
Pharmacist UI: All Inventory Tab, Form Cleared
```

### If Error Occurred
```
Inventory:     Aspirin, Stock: 50 ← UNCHANGED
MedicationDispense: No record created
AuditLog:      No entry (error occurred)
Pharmacist UI: Dispense Tab, Error shown, Form kept filled
```

---

## Real-World Example Timeline

**14:25** - Pharmacist logs in to dashboard
**14:26** - Views "All Inventory" - sees Aspirin stock: 50
**14:27** - Patient Michael Johnson arrives at pharmacy window
**14:28** - Pharmacist clicks "Dispense" on Aspirin
**14:29** - Form pre-filled, pharmacist enters qty: 10, patient name: Michael Johnson
**14:30** - Pharmacist clicks "DISPENSE" button

**Backend Processing (< 50ms)**:
- Validates pharmacist
- Checks Aspirin exists and belongs to pharmacist
- Verifies 50 >= 10 ✓
- Updates: Aspirin stock 50 → 40
- Creates dispense record
- Logs audit action

**14:30:01** - Pharmacist sees success message
**14:30:02** - Form clears, tab switches to All Inventory
**14:30:03** - Aspirin shows stock: 40
**14:30:04** - Pharmacist labels medication and gives to patient

---

## Integration Points

### With Drug Inventory System
- ✓ Reads current stock
- ✓ Updates stock quantity
- ✓ Validates inventory ownership

### With Prescription System
- ✓ Optional linking to prescriptions
- ✓ Pre-fills form from active prescriptions
- ✓ Does NOT change prescription status
- ✓ Does NOT create side effects

### With Audit System
- ✓ Every dispense logged
- ✓ Logs action, actor, entity, details
- ✓ Auto-timestamped
- ✓ Immutable for compliance

### With Authentication/Authorization
- ✓ Requires valid user session
- ✓ Requires PHARMACIST role
- ✓ Validates pharmacist ownership of inventory
- ✓ Single pharmacist can't access another's inventory

---

## Summary

The dispense feature is **complete, integrated, and ready to test**. It handles:

✅ The happy path (successful dispense)
✅ Error cases (stock, validation, authorization)
✅ Stock decrement (single operation, consistent)
✅ Record tracking (for audit and history)
✅ Optional prescription linking (flexible workflow)
✅ Comprehensive error messages (user-friendly)

Just resolve the database connection and start testing!
