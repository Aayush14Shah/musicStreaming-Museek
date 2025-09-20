import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function testSpotifyAPI() {
  try {
    console.log('🧪 Testing Spotify API Integration...');
    console.log('📋 Client ID:', process.env.SPOTIFY_CLIENT_ID ? 'SET' : 'NOT SET');
    console.log('📋 Client Secret:', process.env.SPOTIFY_CLIENT_SECRET ? 'SET' : 'NOT SET');
    
    // Step 1: Get Access Token
    console.log('\n🔑 Step 1: Getting Access Token...');
    
    const body = new URLSearchParams({ grant_type: 'client_credentials' });
    const basic = Buffer.from(
      process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
    ).toString('base64');
    
    const tokenResponse = await axios.post(
      'https://accounts.spotify.com/api/token',
      body,
      {
        headers: {
          'Authorization': `Basic ${basic}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    const accessToken = tokenResponse.data.access_token;
    console.log('✅ Access Token received:', accessToken ? 'YES' : 'NO');
    console.log('⏰ Token expires in:', tokenResponse.data.expires_in, 'seconds');
    
    // Step 2: Test Track API with multiple markets
    console.log('\n🎵 Step 2: Testing Track API across multiple markets...');
    
    const testTracks = [
      { id: '4iV5W9uYEdYUVa79Axb7Rh', name: 'Blinding Lights - The Weeknd' },
      { id: '7qiZfU4dY1lWllzX7mPBI3', name: 'Shape of You - Ed Sheeran' },
      { id: '3n3Ppam7vgaVa1iaRUc9Lp', name: 'Shape of You (Alternative)' }
    ];
    
    const markets = ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'SE', 'IN', 'BR', 'MX', 'JP'];
    
    let successCount = 0;
    let previewCount = 0;
    let bestMarket = null;
    let bestPreviewCount = 0;
    
    for (const market of markets) {
      console.log(`\n🌍 Testing market: ${market}`);
      let marketPreviewCount = 0;
      
      for (const track of testTracks) {
        try {
          const trackResponse = await axios.get(
            `https://api.spotify.com/v1/tracks/${track.id}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
              params: { market }
            }
          );
          
          const trackData = trackResponse.data;
          successCount++;
          
          if (trackData.preview_url) {
            marketPreviewCount++;
            previewCount++;
            console.log(`   ✅ "${trackData.name}" - Preview available`);
            if (marketPreviewCount === 1) {
              console.log(`      Sample URL: ${trackData.preview_url}`);
            }
          }
          
        } catch (error) {
          // Skip errors for this test
        }
      }
      
      console.log(`   📊 Market ${market}: ${marketPreviewCount}/${testTracks.length} tracks with previews`);
      
      if (marketPreviewCount > bestPreviewCount) {
        bestPreviewCount = marketPreviewCount;
        bestMarket = market;
      }
      
      if (marketPreviewCount === testTracks.length) {
        console.log(`   🎯 Perfect market found: ${market}`);
        break;
      }
    }
    
    console.log(`\n🏆 Best market: ${bestMarket} with ${bestPreviewCount}/${testTracks.length} previews`);
    
    // Step 3: Test Playlist API
    console.log('\n📋 Step 3: Testing Playlist API...');
    
    const playlistId = '37i9dQZF1DXcBWIGoYBM5M'; // Today's Top Hits
    
    try {
      const playlistResponse = await axios.get(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { limit: 10, market: 'US' }
        }
      );
      
      const tracks = playlistResponse.data.items;
      const withPreview = tracks.filter(item => item.track?.preview_url);
      const withoutPreview = tracks.filter(item => !item.track?.preview_url);
      
      console.log(`📊 Playlist tracks fetched: ${tracks.length}`);
      console.log(`✅ With preview URLs: ${withPreview.length}`);
      console.log(`❌ Without preview URLs: ${withoutPreview.length}`);
      console.log(`📈 Preview success rate: ${Math.round((withPreview.length / tracks.length) * 100)}%`);
      
      if (withPreview.length > 0) {
        console.log('\n🎵 Sample tracks with previews:');
        withPreview.slice(0, 3).forEach((item, index) => {
          console.log(`   ${index + 1}. "${item.track.name}" by ${item.track.artists[0]?.name}`);
          console.log(`      Preview: ${item.track.preview_url}`);
        });
      }
      
    } catch (error) {
      console.log(`❌ Playlist test failed: ${error.message}`);
    }
    
    // Summary
    console.log('\n📊 FINAL SUMMARY:');
    console.log(`🔑 Access Token: ${accessToken ? 'Working' : 'Failed'}`);
    console.log(`🎵 Track API: ${successCount}/${testTracks.length} successful`);
    console.log(`🎧 Preview URLs: ${previewCount}/${testTracks.length} found`);
    console.log(`📈 Overall Success Rate: ${Math.round((previewCount / testTracks.length) * 100)}%`);
    
    if (previewCount > 0) {
      console.log('\n✅ SUCCESS: Spotify API is working and returning preview URLs!');
    } else {
      console.log('\n❌ ISSUE: No preview URLs found - this might be a regional or API limitation');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('📋 Response status:', error.response.status);
      console.error('📋 Response data:', error.response.data);
    }
  }
}

// Run the test
testSpotifyAPI();
