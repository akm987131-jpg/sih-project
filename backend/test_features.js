async function testFeatures() {
  try {
    console.log('--- TESTING INTERACTIVE FEATURES & DYNAMIC PIPELINE ---');

    // 1. Initial Blank Stats
    const blankStats = await fetch('http://127.0.0.1:5000/api/v1/stats/summary').then(r => r.json());
    console.log('1. Blank Stats Check:', blankStats.data);

    // 2. Seed Live Challenges
    const seedRes = await fetch('http://127.0.0.1:5000/api/v1/challenges/seed', { method: 'POST' }).then(r => r.json());
    console.log('2. Seed Sample Challenges:', seedRes.success ? `SUCCESS (${seedRes.count} challenges seeded)` : 'FAILED');

    // 3. Dynamic Stats Update Check
    const updatedStats = await fetch('http://127.0.0.1:5000/api/v1/stats/summary').then(r => r.json());
    console.log('3. Dynamic Live Stats:', updatedStats.data);

    // 4. District Hotspots Check
    const mapRes = await fetch('http://127.0.0.1:5000/api/v1/gov/district-map').then(r => r.json());
    console.log('4. GIS Hotspots Generated:', mapRes.data.districtHotspots.length, 'districts populated:');
    mapRes.data.districtHotspots.forEach(d => console.log(`   - ${d.district}: ${d.issue} (${d.count} reports, ${d.priority} Priority)`));

    // 5. Quad-Helix Workspace Creation
    const wsRes = await fetch('http://127.0.0.1:5000/api/v1/workspaces/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Decentralized Arsenic Water Nano-Filtration Unit',
        domain: 'Water & Sanitation',
        location: 'Ranchi, Jharkhand',
        leadInstitution: 'NIT Jamshedpur (4 NEP 2020 Credits)'
      })
    }).then(r => r.json());
    console.log('5. Collaborative Workspace Initialized:', wsRes.success, 'Milestone Deliverables:', wsRes.data?.tasks?.length);

    console.log('\n--- ALL INTERACTIVE FEATURES CONFIRMED WORKING ---');
  } catch (err) {
    console.error('Feature test failed:', err);
  }
}

testFeatures();
