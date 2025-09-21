// Test if audio URLs are actually accessible
const testAudioUrls = async () => {
  const testUrls = [
    "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
    "https://sample-videos.com/zip/10/mp3/SampleAudio_0.4mb_mp3.mp3",
    "https://file-examples.com/storage/fe68c1b7c1a9d6c2b2d3b9c/2017/11/file_example_MP3_700KB.mp3",
    "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
  ];

  console.log('🎵 Testing Audio URL Accessibility\n');

  for (let i = 0; i < testUrls.length; i++) {
    const url = testUrls[i];
    try {
      console.log(`${i + 1}. Testing: ${url.substring(0, 50)}...`);
      
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      
      if (response.ok) {
        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   📄 Type: ${contentType}`);
        console.log(`   📏 Size: ${contentLength ? Math.round(contentLength / 1024) + 'KB' : 'Unknown'}`);
      } else {
        console.log(`   ❌ Status: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.log(`   🚨 Error: ${err.message}`);
    }
    console.log('');
  }
};

testAudioUrls().catch(console.error);