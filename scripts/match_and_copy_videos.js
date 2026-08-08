const fs = require('fs');
const path = require('path');

// 1. Define exercise names from all plan constants
const EXERCISES = [
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

// Sluggify for public filenames
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// 2. Read the full video files list we generated
const videosListPath = path.join(__dirname, '../workout_videos_list.txt');
if (!fs.existsSync(videosListPath)) {
  console.error("workout_videos_list.txt not found. Please generate it first.");
  process.exit(1);
}

const allVideoPaths = fs.readFileSync(videosListPath, 'utf8')
  .split('\n')
  .map(p => p.trim())
  .filter(p => p.length > 0);

console.log(`Loaded ${allVideoPaths.length} video files from catalog.`);

const mapping = {};
const outputDir = path.join(__dirname, '../public/videos/workouts');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Keep track of copied files to avoid duplicates
const copiedPaths = new Set();

EXERCISES.forEach(exercise => {
  const normEx = normalize(exercise);
  const exWords = normEx.split(' ').filter(w => w.length > 0);
  
  let bestMatch = null;
  let bestScore = 0;

  allVideoPaths.forEach(videoPath => {
    const videoFilename = path.basename(videoPath, '.mp4');
    const normVid = normalize(videoFilename);
    const vidWords = normVid.split(' ').filter(w => w.length > 0);

    // Score 1: Exact matches or contains match
    if (normVid === normEx) {
      bestMatch = videoPath;
      bestScore = 1000;
      return;
    }

    // Word-level matching with stemming
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
        score += 300; // Boost heavily if all words in exercise name are present in the video path
      }
      
      // If substring exists, add a small extra bonus
      if (normVid.includes(normEx) || normEx.includes(normVid)) {
        score += 50;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = videoPath;
      }
    }
  });

  // Strict threshold to avoid completely wrong matches
  if (bestMatch && bestScore > 20) {
    const slug = slugify(exercise);
    const destinationFilename = `${slug}.mp4`;
    const destinationPath = path.join(outputDir, destinationFilename);

    console.log(`Match: "${exercise}" -> "${path.basename(bestMatch)}" (Score: ${bestScore.toFixed(1)})`);

    try {
      fs.copyFileSync(bestMatch, destinationPath);
      mapping[exercise] = `/videos/workouts/${destinationFilename}`;
      copiedPaths.add(destinationPath);
    } catch (err) {
      console.error(`Failed to copy "${bestMatch}":`, err.message);
    }
  } else {
    console.warn(`No match found for: "${exercise}"`);
  }
});

// 3. Write mappings to lib/workoutVideos.ts
const mappingFilePath = path.join(__dirname, '../lib/workoutVideos.ts');
const fileContent = `/**
 * Automatically generated exercise demonstration video mappings.
 * Generated on: ${new Date().toISOString()}
 */

export const WORKOUT_VIDEO_MAPPING: Record<string, string> = ${JSON.stringify(mapping, null, 2)};
`;

fs.writeFileSync(mappingFilePath, fileContent, 'utf8');
console.log(`\nSuccessfully created mapping configuration in ${mappingFilePath}`);
console.log(`Copied ${copiedPaths.size} video assets into public/videos/workouts/`);
