const express = require("express");
const cors = require("cors");
const oracledb = require("oracledb");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); 

async function connectDB() {
  try {
    return await oracledb.getConnection({
      user: "System",
      password: "Keerthi",
      connectString: "localhost/XEPDB1"
    });
  } catch (err) {
    console.error("Oracle DB Connection Error:", err);
    throw err;
  }
}


app.post("/signup", async (req, res) => {
  const { name, email, password, role, extra } = req.body; 
  try {
    const conn = await connectDB();
    await conn.execute(
      `INSERT INTO USERS (NAME, EMAIL, PASSWORD, ROLE, EXTRA) VALUES (:1,:2,:3,:4,:5)`,
      [name, email, password, role, extra],
      { autoCommit: true }
    );
    await conn.close();
    res.json({ success: true, message: "Signup successful!" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Signup failed" });
  }
});


app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const conn = await connectDB();
    const result = await conn.execute(
      `SELECT ID, NAME, ROLE FROM USERS WHERE EMAIL=:1 AND PASSWORD=:2`,
      [email, password]
    );
    await conn.close();
    if (result.rows.length > 0) {
      const [id, name, role] = result.rows[0];
      res.json({ success: true, id, name, role });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

app.post("/addPrescription", async (req, res) => {
  const { patientId, meds, doctorId } = req.body; 
  try {
    const conn = await connectDB();
    for (const med of meds) {
      await conn.execute(
        `INSERT INTO PRESCRIPTIONS (PATIENT_ID, MEDICINE, DOSAGE, DAYS, TIME, STATUS, DOCTOR_ID)
         VALUES (:1,:2,:3,:4,:5,'ACTIVE',:6)`,
        [patientId, med.name, med.dose, med.duration, med.time, doctorId],
        { autoCommit: true }
      );
    }
    await conn.close();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});


app.get("/getPrescriptions/:patientId", async (req, res) => {
  const { patientId } = req.params;
  try {
    const conn = await connectDB();
    const result = await conn.execute(
      `SELECT ID, MEDICINE, DOSAGE, DAYS, TIME, STATUS FROM PRESCRIPTIONS
       WHERE PATIENT_ID=:1 ORDER BY ID`,
      [patientId]
    );
    await conn.close();
    res.json({ success: true, prescriptions: result.rows });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});


app.post("/completePrescription", async (req, res) => {
  const { prescriptionId } = req.body;
  try {
    const conn = await connectDB();
    await conn.execute(
      `UPDATE PRESCRIPTIONS SET STATUS='PAST' WHERE ID=:1`,
      [prescriptionId],
      { autoCommit: true }
    );
    await conn.close();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});


app.post("/setReminder", async (req, res) => {
  const { patientId, medicine, time, days } = req.body;
  try {
    const conn = await connectDB();
    await conn.execute(
      `INSERT INTO REMINDERS (PATIENT_ID, MEDICINE, TIME, DAYS_LEFT, STATUS)
       VALUES (:1,:2,:3,:4,'ACTIVE')`,
      [patientId, medicine, time, days],
      { autoCommit: true }
    );
    await conn.close();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});


app.post("/takeMedicine", async (req, res) => {
  const { reminderId } = req.body;
  try {
    const conn = await connectDB();
    await conn.execute(
      `UPDATE REMINDERS SET DAYS_LEFT = DAYS_LEFT - 1 WHERE ID = :1`,
      [reminderId]
    );
    await conn.execute(
      `UPDATE REMINDERS SET STATUS = 'COMPLETED' WHERE DAYS_LEFT <= 0`,
      [],
      { autoCommit: true }
    );
    await conn.close();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});


app.post("/updateStock", async (req, res) => {
  const { name, dosage, expiry, qty } = req.body;
  try {
    const conn = await connectDB();
    
    const result = await conn.execute(
      `SELECT ID, QTY FROM STOCK WHERE NAME=:1 AND DOSAGE=:2 AND EXPIRY=:3`,
      [name, dosage, expiry]
    );
    if (result.rows.length > 0) {
      const id = result.rows[0][0];
      await conn.execute(
        `UPDATE STOCK SET QTY = QTY + :1 WHERE ID=:2`,
        [qty, id],
        { autoCommit: true }
      );
    } else {
      await conn.execute(
        `INSERT INTO STOCK (NAME, DOSAGE, EXPIRY, QTY) VALUES (:1,:2,:3,:4)`,
        [name, dosage, expiry, qty],
        { autoCommit: true }
      );
    }
    await conn.close();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});


app.get("/getStock", async (req, res) => {
  try {
    const conn = await connectDB();
    const result = await conn.execute(`SELECT NAME, DOSAGE, EXPIRY, QTY FROM STOCK`);
    await conn.close();
    res.json({ success: true, stock: result.rows });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});

