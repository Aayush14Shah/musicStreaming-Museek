// Test the fallback preview generation function
function generateFallbackPreview(trackData) {
  const fallbackTracks = [
    "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
    "https://sample-videos.com/zip/10/mp3/SampleAudio_0.4mb_mp3.mp3",
    "https://file-examples.com/storage/fe68c1b7c1a9d6c2b2d3b9c/2017/11/file_example_MP3_700KB.mp3",
    "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
  ];
  
  const trackId = trackData.id || 'default';
  let hash = 0;
  for (let i = 0; i < trackId.length; i++) {
    const char = trackId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const index = Math.abs(hash) % fallbackTracks.length;
  
  console.log(`🎲 Fallback selection for ${trackId}: index ${index} -> ${fallbackTracks[index]}`);
  return fallbackTracks[index];
}

// Test with the problematic track ID
const testTrack = { id: '2Fv2injs4qAm8mJBGaxVKU', name: 'Tujhe Kitna Chahne Lage' };
const fallbackUrl = generateFallbackPreview(testTrack);
console.log('Generated fallback URL:', fallbackUrl);
console.log('URL type:', typeof fallbackUrl);
console.log('URL length:', fallbackUrl.length);