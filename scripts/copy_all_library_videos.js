const fs = require('fs');
const path = require('path');

const SOURCE_DIR = '/Users/saba/Documents/Personal/GYM/exercise/men';
const TARGET_DIR = path.join(__dirname, '../public/videos/workouts');

// 1. Define exercise names from all plan constants for mapping
const PLAN_EXERCISES = [
  // Phase 1
  'Incline Dumbbell Press',
  'Pec Deck Fly',
  'Lat Pulldown',
  'Face Pulls',
  'Leg Extension',
  'Leg Curl',
  'Calf Raises',
  'Lateral Delt Raises',
  'Plank',
  'Cardio',

  // Phase 2
  'Incline Bench Press',
  'Flat Dumbbell Fly',
  'Machine Incline Press',
  'Dumbbell Shoulder Press',
  'Side Lateral Raises',
  'Tricep Pushdown',
  'Skull Crushers',
  'T-Bar Row',
  'Seated Cable Row',
  'Dumbbell Shrugs',
  'Dumbbell Bicep Curls',
  'Preacher Curls',
  'Barbell Squats',
  'Leg Press',
  'Walking Lunges',
  'Back Extension',

  // Phase 3
  'Incline Barbell Press',
  'Flat Dumbbell Press',
  'Cable Fly (Low to High) [SS]',
  'Push-Ups [SS]',
  'Seated DB Shoulder Press',
  'Lateral Raises [DS]',
  'Tricep Rope Pushdown [DS]',
  'Deadlift / Rack Pulls',
  'Weighted Pull-Ups / Lat Pulldown',
  'Romanian Deadlifts (RDL)',
  'Hammer Curls [DS]',
  'Incline Dumbbell Press [GS A]',
  'Cable Pulley Row (Overhand grip) [GS A]',
  'EZ Barbell Preacher Curl [GS A]',
  'Incline DB Fly [GS B]',
  'Lat Pulldown (Neutral grip) [GS B]',
  'Incline DB Dumbbell Curls [GS B]',
  'Barbell Chest Press [GS A]',
  'Lat Pulldown (Wide grip) [GS A]',
  'Hammer Curls [GS A]',
  'Cable Fly (High to Low) [GS B]',
  'One Arm DB Row [GS B]',
  'Concentration Curls [GS B]',
  'Overhead DB Extension [GS A]',
  'DB Kickbacks (Both arms) [GS A]',
  'Lying DB Tricep Extension [GS B]',
  'Tricep Pushdown (V-Bar) [GS B]',
  'Overhead Cable Extension [GS A]',
  'Cable Pushdown (Underhand grip) [GS A]',
  'Dumbbell Curls (Alternate) [GS B]',
  'Cable Curl (Straight Bar) [GS B]',
  'Behind the Neck Press',
  'DB Lateral Raises (Standing)',
  'Dumbbell Front Raises',
  'Smith Machine Shrugs',
  'Smith Machine Calf Raises',
  'Leg Curls [SS]',
  'Leg Extension [SS]',
  'Calf Raises [DS]'
];

// Helper to normalize strings for comparison
function normalize(str) {
  return str
    .toLowerCase()
    .replace(/\[ss\]|\[ds\]|\[gs a\]|\[gs b\]/gi, '')
    .replace(/\(.*\)/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Clean video names for browsing (e.g. "Cable Lying Fly, Flat Bench Cable Fly" -> "Cable Lying Fly")
function getCleanName(filename) {
  const base = path.basename(filename, '.mp4');
  return base
    .split(',')[0] // Take first alternate name
    .replace(/ - /g, ': ')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Capitalize category names for Sidebar
function capitalize(str) {
  if (str.toLowerCase() === 'abs') return 'Abs';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

if (!fs.existsSync(SOURCE_DIR)) {
  console.error(`Source directory not found: ${SOURCE_DIR}`);
  process.exit(1);
}

// Clean target directory
if (fs.existsSync(TARGET_DIR)) {
  fs.rmSync(TARGET_DIR, { recursive: true, force: true });
}
fs.mkdirSync(TARGET_DIR, { recursive: true });

const categories = fs.readdirSync(SOURCE_DIR)
  .filter(f => fs.statSync(path.join(SOURCE_DIR, f)).isDirectory() && !f.startsWith('.'));

console.log(`Scanning categories: ${categories.join(', ')}`);

const libraryData = [];
const allCopiedVideos = []; // Flat list of copied videos to feed plan mapping search

categories.forEach(cat => {
  const catSourcePath = path.join(SOURCE_DIR, cat);
  const catTargetPath = path.join(TARGET_DIR, cat.toLowerCase());
  
  fs.mkdirSync(catTargetPath, { recursive: true });

  const videos = fs.readdirSync(catSourcePath)
    .filter(f => f.endsWith('.mp4') && !f.startsWith('.'));

  const catVideosData = [];

  videos.forEach(vid => {
    const srcPath = path.join(catSourcePath, vid);
    const destPath = path.join(catTargetPath, vid);
    
    try {
      fs.copyFileSync(srcPath, destPath);
      const relativePath = `/videos/workouts/${cat.toLowerCase()}/${encodeURIComponent(vid)}`;
      const cleanName = getCleanName(vid);
      
      const videoItem = {
        name: cleanName,
        path: relativePath,
        filename: vid
      };

      catVideosData.push(videoItem);
      allCopiedVideos.push({
        exerciseName: cleanName,
        path: relativePath,
        originalFilename: vid,
        category: cat.toLowerCase()
      });
    } catch (err) {
      console.error(`Error copying ${vid}:`, err.message);
    }
  });

  if (catVideosData.length > 0) {
    libraryData.push({
      name: capitalize(cat),
      slug: cat.toLowerCase(),
      videos: catVideosData.sort((a, b) => a.name.localeCompare(b.name))
    });
  }
});

// Sort categories alphabetically
libraryData.sort((a, b) => a.name.localeCompare(b.name));

// Save lib/workoutLibrary.ts
const libFilePath = path.join(__dirname, '../lib/workoutLibrary.ts');
fs.writeFileSync(libFilePath, `/**
 * Structured exercise library database.
 * Generated on: ${new Date().toISOString()}
 */

export interface LibraryVideo {
  name: string;
  path: string;
  filename: string;
}

export interface LibraryCategory {
  name: string;
  slug: string;
  videos: LibraryVideo[];
}

export const WORKOUT_LIBRARY: LibraryCategory[] = ${JSON.stringify(libraryData, null, 2)};
`, 'utf8');

console.log(`Generated exercise library config: ${libFilePath}`);
console.log(`Total copied video assets: ${allCopiedVideos.length}`);

// Perform dynamic fuzzy matching of plan exercises against all copied videos
const mapping = {};
PLAN_EXERCISES.forEach(exercise => {
  const normEx = normalize(exercise);
  const exWords = normEx.split(' ').filter(w => w.length > 0);
  
  let bestMatch = null;
  let bestScore = 0;

  allCopiedVideos.forEach(vid => {
    const normVid = normalize(vid.exerciseName);
    const vidWords = normVid.split(' ').filter(w => w.length > 0);

    // Exact matches
    if (normVid === normEx) {
      bestMatch = vid;
      bestScore = 1000;
      return;
    }

    // Stemmed matching
    const stemmedExWords = exWords.map(w => w.toLowerCase().replace(/s$/, '').replace(/ies$/, 'y').replace(/ing$/, ''));
    const stemmedVidWords = vidWords.map(w => w.toLowerCase().replace(/s$/, '').replace(/ies$/, 'y').replace(/ing$/, ''));

    let intersectCount = 0;
    stemmedExWords.forEach(w => {
      if (stemmedVidWords.includes(w)) intersectCount++;
    });

    if (intersectCount > 0) {
      const allWordsMatched = (intersectCount === stemmedExWords.length);
      let score = (intersectCount / Math.max(stemmedExWords.length, stemmedVidWords.length)) * 100;
      if (allWordsMatched) {
        score += 300;
      }
      
      if (normVid.includes(normEx) || normEx.includes(normVid)) {
        score += 50;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = vid;
      }
    }
  });

  if (bestMatch && bestScore > 20) {
    mapping[exercise] = bestMatch.path;
    console.log(`Plan Match: "${exercise}" -> "${bestMatch.exerciseName}" (${bestMatch.category}) (Score: ${bestScore.toFixed(1)})`);
  } else {
    console.warn(`No match found for plan exercise: "${exercise}"`);
  }
});

// Save lib/workoutVideos.ts
const mappingFilePath = path.join(__dirname, '../lib/workoutVideos.ts');
fs.writeFileSync(mappingFilePath, `/**
 * Automatically generated exercise plan video mapping links.
 * Generated on: ${new Date().toISOString()}
 */

export const WORKOUT_VIDEO_MAPPING: Record<string, string> = ${JSON.stringify(mapping, null, 2)};
`, 'utf8');

console.log(`Updated plan video mappings configuration in: ${mappingFilePath}`);
