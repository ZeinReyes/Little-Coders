// --- Activity sound ---
const activitySound = new Audio('/assets/sounds/activity.mp3');
activitySound.volume = 0.3;
activitySound.preload = 'auto';
activitySound.loop = true;

// --- Correct sound ---
const correctSound = new Audio('/assets/sounds/correct.mp3');
correctSound.volume = 0.6;
correctSound.preload = 'auto';

// --- Delete sound ---
const deleteSound = new Audio('/assets/sounds/deletesound.mp3');
deleteSound.volume = 0.6;
deleteSound.preload = 'auto';

// --- Error sound ---
const errorSound = new Audio('/assets/sounds/error.mp3');
errorSound.volume = 0.6;
errorSound.preload = 'auto';

// --- Lesson sound ---
const lessonSound = new Audio('/assets/sounds/lesson.mp3');
lessonSound.volume = 0.6;
lessonSound.preload = 'auto';
lessonSound.loop = true;

// --- Object creation sound ---
const objectSound = new Audio('/assets/sounds/objectsound.mp3');
objectSound.volume = 0.6;
objectSound.preload = 'auto';

// --- Print block sound ---
const printSound = new Audio('/assets/sounds/printsound.mp3');
printSound.volume = 0.6;
printSound.preload = 'auto';

// --- Success sound ---
const successSound = new Audio('/assets/sounds/success.mp3');
successSound.volume = 0.6;
successSound.preload = 'auto';

// --- Variable creation sound ---
const variableSound = new Audio('/assets/sounds/variablesound.mp3');
variableSound.volume = 0.6;
variableSound.preload = 'auto';

// --- Helper for instant replay ---
function playSound(audio) {
  try {
    audio.currentTime = 0;
    audio.play();
  } catch (err) {
    console.warn('Sound playback blocked:', err);
  }
}

function stopSound(audio) {
  try {
    audio.pause();
    audio.currentTime = 0;
  } catch (err) {
    console.warn('Sound stop blocked:', err);
  }
}

// --- Exported functions ---
export function playActivitySound() {
  playSound(activitySound);
}

export function stopActivitySound() {
  stopSound(activitySound);
}

export function playCorrectSound() {
  playSound(correctSound);
}

export function playDeleteSound() {
  playSound(deleteSound);
}

export function playErrorSound() {
  playSound(errorSound);
}

export function playLessonSound() {
  playSound(lessonSound);
}

export function stopLessonSound() {
  stopSound(lessonSound);
}

export function playObjectSound() {
  playSound(objectSound);
}

export function playPrintSound() {
  playSound(printSound);
}

export function playSuccessSound() {
  playSound(successSound);
}

export function playVariableSound() {
  playSound(variableSound);
}
