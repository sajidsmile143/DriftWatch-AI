
async function simulate() {
  const apiKey = 'pk_uclvq2g8k9';
  const url = 'http://localhost:3000/api/monitor';
  
  const payload = {
    serviceName: "Auth-Service",
    url: "/api/v1/login",
    method: "POST",
    body: {
      username: "sajid",
      password: "password123"
      // 'mfa' is missing here, which is in the baseline
    },
    timestamp: Date.now()
  };

  console.log('🚀 Triggering Real Drift...');
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-driftly-api-key': apiKey
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log('✅ Response:', JSON.stringify(result, null, 2));
    
    if (result.status === 'BREAKING') {
      console.log('⚠️ BREAKING DRIFT DETECTED! WhatsApp notification should be queued.');
    } else {
      console.log('ℹ️ Status:', result.status);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

simulate();
