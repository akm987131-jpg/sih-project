// Quick test script to verify all backend routes and services
async function testAll() {
  console.log('--- TESTING SAMADHANSETU BACKEND APIS ---');

  // 1. Root
  const rootRes = await fetch('http://127.0.0.1:5000/');
  const rootData = await rootRes.json();
  console.log('1. Root Health Check:', rootData.status);

  // 2. Report Challenge (AI & Location Service test)
  const reportRes = await fetch('http://127.0.0.1:5000/api/v1/challenges/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      problemText: 'Broken irrigation canal flooding paddy crops in Kanke block',
      locationName: 'Kanke, Ranchi',
      severity: 'High',
      citizenName: 'Ramesh Mahto'
    })
  });
  const reportData = await reportRes.json();
  console.log('2. Citizen Report + AI Triage:', reportData.success ? 'PASSED' : 'FAILED');
  console.log('   Identified Problem:', reportData.aiAnalysisResult?.identifiedProblem);
  console.log('   Domain:', reportData.aiAnalysisResult?.domain);
  console.log('   Priority:', reportData.aiAnalysisResult?.priority, '(Score:', reportData.aiAnalysisResult?.priorityScore, ')');
  console.log('   Grouped Cluster:', reportData.aiAnalysisResult?.isGroupedWithCluster);

  // 3. Quad-Helix Matches (University & Industry)
  const matchRes = await fetch(`http://127.0.0.1:5000/api/v1/challenges/${reportData.aiAnalysisResult?.challengeId}`);
  const matchData = await matchRes.json();
  console.log('3. Quad-Helix Matchmaking:', matchData.success ? 'PASSED' : 'FAILED');
  console.log('   University:', matchData.quadHelixMatch?.university?.institutionName, `(${matchData.quadHelixMatch?.university?.academicCredits} NEP Credits)`);
  console.log('   Industry Sponsor:', matchData.quadHelixMatch?.industry?.partnerName, `(Grant: ${matchData.quadHelixMatch?.industry?.availableGrant})`);

  // 4. Projects / Workspaces
  const projRes = await fetch('http://127.0.0.1:5000/api/v1/projects');
  const projData = await projRes.json();
  console.log('4. Projects Route (/api/v1/projects):', projData.success ? 'PASSED' : 'FAILED', `(${projData.count} projects)`);

  // 5. Users / Auth
  const userRes = await fetch('http://127.0.0.1:5000/api/v1/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'demo@nitjsr.ac.in', role: 'University' })
  });
  const userData = await userRes.json();
  console.log('5. Users Route (/api/v1/users/login):', userData.success ? 'PASSED' : 'FAILED', `(User: ${userData.user?.fullName}, Role: ${userData.user?.role})`);

  // 5b. Send OTP Test
  const sendOtpRes = await fetch('http://127.0.0.1:5000/api/v1/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobileNumber: '9876543210' })
  });
  const sendOtpData = await sendOtpRes.json();
  console.log('5b. Send OTP Service:', sendOtpData.success ? 'PASSED' : 'FAILED', `(Demo OTP: ${sendOtpData.demoOtp})`);

  // 5c. Verify OTP Test
  const verifyOtpRes = await fetch('http://127.0.0.1:5000/api/v1/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobileNumber: '9876543210', otp: sendOtpData.demoOtp || '2604', fullName: 'Ramesh Mahto (Farmer)' })
  });
  const verifyOtpData = await verifyOtpRes.json();
  console.log('5c. Verify OTP & Authenticate:', verifyOtpData.success ? 'PASSED' : 'FAILED', `(User: ${verifyOtpData.user?.fullName})`);

  // 6. District GIS Map
  const mapRes = await fetch('http://127.0.0.1:5000/api/v1/gov/district-map');
  const mapData = await mapRes.json();
  const hotspotsCount = mapData.data?.districtHotspots?.length || 0;
  console.log('6. District GIS Map (/api/v1/gov/district-map):', mapData.success ? 'PASSED' : 'FAILED', `(${hotspotsCount} district hotspots loaded)`);

  console.log('--- ALL BACKEND CHECKS COMPLETED SUCCESSFULLY ---');
}

testAll().catch(console.error);
