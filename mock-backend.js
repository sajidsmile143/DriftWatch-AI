const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// State to control whether the drift is active or not
let isDriftActive = false;

// 1. Test API Endpoint
app.get('/api/user', (req, res) => {
  if (!isDriftActive) {
    // Stable Baseline response
    console.log('✅ Serving Baseline Response (Stable)');
    return res.json({
      id: 101,
      name: 'Alex Mercer',
      email: 'alex@mercer.com',
      role: 'admin'
    });
  } else {
    // Drifted response (email is missing, and id type changed from Number to String)
    console.log('🚨 Serving Drifted Response (Breaking)');
    return res.json({
      id: '101', // Changed from Number to String
      name: 'Alex Mercer',
      role: 'admin'
      // email is missing!
    });
  }
});

// 2. Endpoint to toggle drift state
app.post('/api/toggle', (req, res) => {
  isDriftActive = !isDriftActive;
  console.log(`\n🔄 Drift State Toggled! isDriftActive = ${isDriftActive}\n`);
  res.json({ success: true, isDriftActive });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Mock Backend running at: http://localhost:${PORT}`);
  console.log(`====================================================`);
  console.log(`Endpoints:`);
  console.log(`👉 GET  http://localhost:${PORT}/api/user    (To fetch user data)`);
  console.log(`👉 POST http://localhost:${PORT}/api/toggle  (To toggle drift ON/OFF)`);
  console.log(`====================================================`);
  console.log(`Instructions for Test:`);
  console.log(`1. Fetch the user endpoint once to establish baseline.`);
  console.log(`2. Trigger a POST request to /api/toggle to enable drift.`);
  console.log(`3. Fetch the user endpoint again to trigger Drift notification!`);
  console.log(`====================================================`);
});
