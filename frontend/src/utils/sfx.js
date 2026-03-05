// --- Onboarding sound ---
const onBoardingSound = new Audio('/assets/sounds/onboarding.mp3');
onBoardingSound.volume = 0.3;
onBoardingSound.preload = 'auto';
onBoardingSound.loop = true;

// --- Home Page sound ---
const homePageSound = new Audio('/assets/sounds/homePage.mp3');
homePageSound.volume = 0.3;
homePageSound.preload = 'auto';
homePageSound.loop = true;

// --- Lesson List sound ---
const lessonListSound = new Audio('/assets/sounds/lessonlist.mp3');
lessonListSound.volume = 0.3;
lessonListSound.preload = 'auto';
lessonListSound.loop = true;

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


function playSound(audio) {
  try {
    audio.currentTime = 0;

    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Playback prevented:", err);
      });
    }
  } catch (err) {
    console.warn("Sound playback blocked:", err);
  }
}


function stopSound(audio) {
  try {
    if (!audio.paused) {
      audio.pause();
    }
    audio.currentTime = 0;
  } catch (err) {
    console.warn("Sound stop blocked:", err);
  }
}



// --- Exported functions ---
export function playOnBoardingSound() {
  playSound(onBoardingSound);
}

export function stopOnBoardingSound() {
  stopSound(onBoardingSound);
}

export function playHomePageSound() {
  playSound(homePageSound);
}

export function stopHomePageSound() {
  stopSound(homePageSound);
}

export function playLessonListSound() {
  playSound(lessonListSound);
}

export function stopLessonListSound() {
  stopSound(lessonListSound);
}

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
