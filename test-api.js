// Enhanced test script to verify API endpoints and preview system
const testEndpoints = async () => {
  const baseUrl = 'http://localhost:5000';
  
  // Test different types of tracks
  const testTracks = [
    { id: '2Fv2injs4qAm8mJBGaxVKU', name: 'Tujhe Kitna Chahne Lage', type: 'Bollywood' },
    { id: '4iV5W9uYEdYUVa79Axb7Rh', name: 'New Rules', type: 'Pop' },
    { id: '7qiZfU4dY1lWllzX7mPBI3', name: 'Shape of You', type: 'Pop' }
  ];
  
  console.log('🎵 Testing Enhanced Preview System\n');
  
  // Test fallback generation
  console.log('1️⃣ Testing Fallback Generation:');
  for (const track of testTracks) {
    try {
      const response = await fetch(`${baseUrl}/api/test/fallback?trackId=${track.id}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`   ${track.type}: ${data.fallbackUrl}`);
      }
    } catch (err) {
      console.log(`   Error for ${track.name}: ${err.message}`);
    }
  }
  
  // Test actual track endpoint
  console.log('\n2️⃣ Testing Track Endpoint with Market Fallback:');
  for (const track of testTracks) {
    try {
      const response = await fetch(`${baseUrl}/api/spotify/track?trackId=${track.id}&market=US`);
      if (response.ok) {
        const data = await response.json();
        console.log(`   ${track.name}:`);
        console.log(`     Preview: ${data.preview_url ? 'YES' : 'NO'}`);
        console.log(`     Fallback: ${data.fallback_preview ? 'YES' : 'NO'}`);
        console.log(`     Alt Market: ${data.alternative_market || 'NONE'}`);
        console.log(`     URL: ${data.preview_url?.substring(0, 50)}...`);
      }
    } catch (err) {
      console.log(`   Error for ${track.name}: ${err.message}`);
    }
  }
  
  // Test top tracks
  console.log('\n3️⃣ Testing Top Tracks:');
  try {
    const response = await fetch(`${baseUrl}/api/top-tracks?limit=3`);
    if (response.ok) {
      const data = await response.json();
      console.log(`   Found ${data.items?.length || 0} tracks`);
      data.items?.slice(0, 2).forEach((item, i) => {
        const track = item.track || item;
        console.log(`   ${i + 1}. ${track.name} - Preview: ${track.preview_url ? 'YES' : 'NO'}`);
      });
    }
  } catch (err) {
    console.log(`   Error: ${err.message}`);
  }
};

// Run tests
testEndpoints().catch(console.error);