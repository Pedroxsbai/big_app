const fs = require('fs');
const path = require('path');

// Configuration
const INPUT_FILE = path.join(__dirname, '../assets/quran_json/quran.json');
const OUTPUT_DIR = path.join(__dirname, '../assets/quran_json/quran_json_by_surah');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('🔄 Starting Quran JSON split process...');
console.log(`📁 Input file: ${INPUT_FILE}`);
console.log(`📁 Output directory: ${OUTPUT_DIR}`);

try {
  // Read the main Quran JSON file
  console.log('📖 Reading Quran JSON file...');
  const quranData = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
  
  // Group verses by surah
  const surahs = {};
  
  console.log('🔄 Processing verses...');
  quranData.forEach((verse, index) => {
    const suraNo = verse.sura_no;
    const suraNameEn = verse.sura_name_en;
    
    // Initialize surah if it doesn't exist
    if (!surahs[suraNo]) {
      surahs[suraNo] = {
        sura_no: suraNo,
        sura_name_en: suraNameEn,
        sura_name_ar: verse.sura_name_ar,
        verses: []
      };
    }
    
    // Add verse to surah
    surahs[suraNo].verses.push({
      id: verse.id,
      jozz: verse.jozz,
      page: verse.page,
      line_start: verse.line_start,
      line_end: verse.line_end,
      aya_no: verse.aya_no,
      aya_text: verse.aya_text,
      aya_text_emlaey: verse.aya_text_emlaey
    });
    
    // Progress indicator
    if ((index + 1) % 1000 === 0) {
      console.log(`   Processed ${index + 1} verses...`);
    }
  });
  
  console.log(`✅ Processed ${quranData.length} verses`);
  console.log(`📊 Found ${Object.keys(surahs).length} surahs`);
  
  // Write individual surah files
  console.log('💾 Writing individual surah files...');
  let totalVerses = 0;
  
  Object.values(surahs).forEach((surah, index) => {
    // Create filename from sura_name_en (sanitized)
    const fileName = surah.sura_name_en
      .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .toLowerCase() + '.json';
    
    const filePath = path.join(OUTPUT_DIR, fileName);
    
    // Add metadata
    const surahData = {
      metadata: {
        sura_no: surah.sura_no,
        sura_name_en: surah.sura_name_en,
        sura_name_ar: surah.sura_name_ar,
        total_verses: surah.verses.length,
        created_at: new Date().toISOString()
      },
      verses: surah.verses
    };
    
    // Write file
    fs.writeFileSync(filePath, JSON.stringify(surahData, null, 2), 'utf8');
    
    totalVerses += surah.verses.length;
    
    // Progress indicator
    if ((index + 1) % 10 === 0) {
      console.log(`   Written ${index + 1}/${Object.keys(surahs).length} surahs...`);
    }
  });
  
  // Create index file for easy reference
  console.log('📋 Creating index file...');
  const indexData = {
    metadata: {
      total_surahs: Object.keys(surahs).length,
      total_verses: totalVerses,
      created_at: new Date().toISOString(),
      description: 'Index of all Quran surahs with file references'
    },
    surahs: Object.values(surahs).map(surah => ({
      sura_no: surah.sura_no,
      sura_name_en: surah.sura_name_en,
      sura_name_ar: surah.sura_name_ar,
      total_verses: surah.verses.length,
      filename: surah.sura_name_en
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '_')
        .toLowerCase() + '.json'
    }))
  };
  
  const indexPath = path.join(OUTPUT_DIR, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2), 'utf8');
  
  // Summary
  console.log('\n🎉 Quran JSON split completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`   • Total surahs: ${Object.keys(surahs).length}`);
  console.log(`   • Total verses: ${totalVerses}`);
  console.log(`   • Output directory: ${OUTPUT_DIR}`);
  console.log(`   • Index file: ${indexPath}`);
  
  // List first few files as example
  console.log('\n📁 Example files created:');
  const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.json') && f !== 'index.json').slice(0, 5);
  files.forEach(file => {
    console.log(`   • ${file}`);
  });
  
  if (files.length < Object.keys(surahs).length) {
    console.log(`   • ... and ${Object.keys(surahs).length - files.length} more files`);
  }
  
} catch (error) {
  console.error('❌ Error splitting Quran JSON:', error.message);
  process.exit(1);
}
