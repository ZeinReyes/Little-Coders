/**
 * ============================================================
 *  LittleCoders AI — Custom Difficulty Suggestion Neural Net
 * ============================================================
 *
 *  A fully custom-trained feedforward neural network built
 *  entirely from scratch in JavaScript (no external libs).
 *
 *  Architecture:
 *    Input  → 8 features extracted from question history
 *    Hidden → 12 neurons (ReLU)
 *    Hidden → 8 neurons  (ReLU)
 *    Output → 3 neurons  (Softmax) → [Easy, Medium, Hard]
 *
 *  Trained on 50 labeled student performance samples.
 * ============================================================
 */

// ─────────────────────────────────────────────────────────────
// SECTION 1: TRAINING DATA (60 samples)
//
// Each sample = { features: [...8 values], label: 0|1|2 }
//   label 0 = Easy, 1 = Medium, 2 = Hard
//
// Features:
//   [0] avgAttemptsLast3       (1.0–3.0, normalized /3)
//   [1] solvedRateLast3        (0.0–1.0)
//   [2] avgHintsLast3          (0.0–1.0, normalized /3)
//   [3] currentDifficultyEnc   (Easy=0, Medium=0.5, Hard=1)
//   [4] solvedFirst1stAttemptLast3  (ratio in last 3 questions)
//   [5] failedAll3Attempts     (ratio of all questions where all 3 failed)
//   [6] streakNorm             (consecutive perfect streak / 3, capped at 1)
//   [7] questionsRemainingNorm (remaining/10, capped at 1)
// ─────────────────────────────────────────────────────────────
const TRAINING_DATA = [
  // ── EASY → STAY EASY (struggling students) ──
  { f: [3/3, 0.33, 2/3, 0.0,  0.0,  0.67, 0,   0.8], label: 0 },
  { f: [2.7/3, 0.33, 1.5/3, 0.0, 0.0, 0.67, 0, 0.6], label: 0 },
  { f: [3/3, 0.0,  2/3, 0.0,  0.0,  1.0,  0,   0.9], label: 0 },
  { f: [2.5/3, 0.33, 2/3, 0.5,  0.0,  0.5,  0,  0.5], label: 0 },
  { f: [3/3, 0.33, 3/3, 0.0,  0.0,  0.67, 0,   0.7], label: 0 },
  { f: [2.8/3, 0.0, 2.5/3, 0.0, 0.0, 1.0,  0,  0.4], label: 0 },
  { f: [3/3, 0.33, 1/3, 0.5,  0.0,  0.5,  0,   0.6], label: 0 },
  { f: [2.6/3, 0.33, 2/3, 0.0,  0.0,  0.67, 0,  0.8], label: 0 },

  // ── EASY → MOVE UP TO MEDIUM (doing well on easy) ──
  { f: [1/3, 1.0,  0/3, 0.0,  1.0,  0.0,  1.0, 0.6], label: 1 },
  { f: [1/3, 1.0,  0/3, 0.0,  1.0,  0.0,  0.67,0.7], label: 1 },
  { f: [1/3, 1.0,  0/3, 0.0,  1.0,  0.0,  1.0, 0.4], label: 1 },
  { f: [1.5/3, 0.67,0/3, 0.0,  0.67, 0.0, 0.33,0.5], label: 1 },
  { f: [1/3, 1.0,  0.5/3,0.0, 1.0,  0.0,  1.0, 0.8], label: 1 },
  { f: [1.2/3, 1.0, 0/3, 0.0,  0.67, 0.0, 0.67,0.6], label: 1 },
  { f: [2/3, 0.67, 0.5/3,0.0,  0.33, 0.0, 0.33,0.5], label: 1 },

  // ── MEDIUM → STAY MEDIUM (mixed performance) ──
  { f: [2/3, 0.67, 1/3, 0.5,  0.33, 0.33, 0,  0.5], label: 1 },
  { f: [1.5/3, 0.67,0.5/3,0.5, 0.67, 0.0, 0.33,0.6], label: 1 },
  { f: [2.5/3, 0.33,1/3, 0.5,  0.0,  0.33, 0,  0.4], label: 1 },
  { f: [2/3, 0.67, 1.5/3,0.5,  0.33, 0.0,  0,  0.7], label: 1 },
  { f: [1.8/3, 0.67,0.5/3,0.5, 0.33, 0.33, 0,  0.5], label: 1 },
  { f: [2/3, 0.67, 0.5/3,0.5,  0.33, 0.0,  0,  0.6], label: 1 },
  { f: [1.5/3, 1.0, 1/3, 0.5,  0.67, 0.0, 0.33,0.3], label: 1 },
  { f: [2.2/3, 0.33,1/3, 0.5,  0.0,  0.33, 0,  0.7], label: 1 },
  // solved all but needed 2 attempts each → stay medium
  { f: [2/3, 1.0,  0/3, 0.5,  0.0,  0.0,  0,  0.5], label: 1 },
  { f: [2/3, 1.0,  0/3, 0.5,  0.0,  0.0,  0,  0.4], label: 1 },

  // ── MEDIUM → MOVE UP TO HARD (mastering medium) ──
  { f: [1/3, 1.0,  0/3, 0.5,  1.0,  0.0,  1.0, 0.5], label: 2 },
  { f: [1.2/3, 1.0, 0.2/3,0.5, 1.0,  0.0,  1.0, 0.6], label: 2 },
  { f: [1/3, 1.0,  0/3, 0.5,  1.0,  0.0,  1.0, 0.4], label: 2 },
  { f: [1.3/3, 1.0, 0/3, 0.5,  0.67, 0.0,  1.0, 0.7], label: 2 },
  { f: [1/3, 1.0,  0.3/3,0.5, 1.0,  0.0,  1.0, 0.3], label: 2 },
  { f: [1/3, 1.0,  0/3, 0.5,  1.0,  0.0,  1.0, 0.6], label: 2 },
  { f: [1/3, 1.0,  0/3, 0.5,  1.0,  0.0,  1.0, 0.5], label: 2 },
  { f: [1.1/3, 1.0, 0/3, 0.5,  1.0,  0.0,  1.0, 0.4], label: 2 },
  // 4 questions all solved 1st attempt on medium → definitely Hard
  { f: [1/3, 1.0,  0/3, 0.5,  1.0,  0.0,  1.0, 0.3], label: 2 },
  { f: [1/3, 1.0,  0/3, 0.5,  1.0,  0.0,  1.0, 0.2], label: 2 },

  // ── MEDIUM → BACK TO EASY (struggling on medium) ──
  { f: [3/3, 0.0,  2/3, 0.5,  0.0,  1.0,  0,  0.7], label: 0 },
  { f: [2.8/3, 0.33,2/3, 0.5,  0.0,  0.67, 0,  0.6], label: 0 },
  { f: [3/3, 0.0,  3/3, 0.5,  0.0,  1.0,  0,  0.5], label: 0 },
  { f: [2.5/3, 0.0, 2/3, 0.5,  0.0,  0.67, 0,  0.8], label: 0 },

  // ── HARD → STAY HARD (doing well) ──
  { f: [1/3, 1.0,  0/3, 1.0,  1.0,  0.0,  1.0, 0.4], label: 2 },
  { f: [1.5/3, 1.0, 0.5/3,1.0, 0.67, 0.0,  1.0, 0.5], label: 2 },
  { f: [1.2/3, 1.0, 0/3, 1.0,  1.0,  0.0,  0.67,0.3], label: 2 },
  { f: [2/3, 0.67, 0.5/3,1.0,  0.67, 0.0,  0.33,0.6], label: 2 },
  { f: [1/3, 1.0,  0.5/3,1.0,  1.0,  0.0,  1.0, 0.2], label: 2 },

  // ── HARD → BACK TO MEDIUM (struggling on hard) ──
  { f: [3/3, 0.33, 2/3, 1.0,  0.0,  0.67, 0,  0.5], label: 1 },
  { f: [2.8/3, 0.0, 1.5/3,1.0, 0.0,  1.0,  0,  0.6], label: 1 },
  { f: [3/3, 0.33, 2/3, 1.0,  0.0,  0.67, 0,  0.4], label: 1 },
  { f: [2.5/3, 0.33,1/3, 1.0,  0.0,  0.5,  0,  0.7], label: 1 },

  // ── FEW QUESTIONS REMAINING → BE CONSERVATIVE ──
  { f: [2/3, 0.67, 0.5/3,0.0,  0.33, 0.0,  0,  0.1], label: 0 },
  { f: [1.5/3, 1.0, 0.3/3,0.0, 0.67, 0.0,  0.67,0.1], label: 1 },
  { f: [2/3, 0.67, 0.5/3,0.5,  0.33, 0.0,  0,  0.1], label: 1 },
  { f: [1/3, 1.0,  0/3, 0.5,  1.0,  0.0,  1.0, 0.1], label: 1 },
  { f: [1/3, 1.0,  0/3, 1.0,  1.0,  0.0,  1.0, 0.1], label: 2 },

  // ── REAL-WORLD: solved with 2 attempts (needs medium, not hard) ──
  { f: [2/3, 1.0,  0/3, 0.5,  0.0,  0.0,  0,  0.6], label: 1 },
  { f: [2/3, 1.0,  0/3, 0.5,  0.0,  0.0,  0,  0.5], label: 1 },
  { f: [2/3, 1.0,  0.3/3,0.5, 0.0,  0.0,  0,  0.4], label: 1 },

  // ── EDGE CASES ──
  { f: [1.5/3, 0.67,0.5/3,0.0, 0.67, 0.0,  0.33,0.5], label: 1 },
  { f: [2/3, 0.33, 1/3, 0.5,  0.0,  0.33, 0,  0.4], label: 1 },
  { f: [1/3, 1.0,  0/3, 0.0,  1.0,  0.0,  1.0, 0.9], label: 1 },
  { f: [1/3, 1.0,  0/3, 1.0,  1.0,  0.0,  0.67,0.5], label: 2 },
];

// ─────────────────────────────────────────────────────────────
// SECTION 2: NEURAL NETWORK CORE
// ─────────────────────────────────────────────────────────────

const INPUT_SIZE  = 8;
const HIDDEN1     = 12;
const HIDDEN2     = 8;
const OUTPUT_SIZE = 3;  // Easy, Medium, Hard

/** Xavier weight initialization */
function initWeights(rows, cols) {
  const scale = Math.sqrt(2.0 / (rows + cols));
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => (Math.random() * 2 - 1) * scale)
  );
}

function initBias(size) {
  return new Array(size).fill(0.01);
}

/** Activation functions */
const relu    = x => Math.max(0, x);
const reluD   = x => x > 0 ? 1 : 0;

function softmax(arr) {
  const max = Math.max(...arr);
  const exps = arr.map(x => Math.exp(x - max));
  const sum  = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sum);
}

/** Matrix × vector multiplication */
function matVec(W, x) {
  return W.map(row => row.reduce((sum, w, j) => sum + w * x[j], 0));
}

/** Add bias vector to activation vector */
function addBias(a, b) {
  return a.map((v, i) => v + b[i]);
}

// ─────────────────────────────────────────────────────────────
// SECTION 3: FORWARD + BACKWARD PASS
// ─────────────────────────────────────────────────────────────

function forward(net, x) {
  // Layer 1
  const z1 = addBias(matVec(net.W1, x), net.b1);
  const a1 = z1.map(relu);

  // Layer 2
  const z2 = addBias(matVec(net.W2, a1), net.b2);
  const a2 = z2.map(relu);

  // Output
  const z3 = addBias(matVec(net.W3, a2), net.b3);
  const out = softmax(z3);

  return { x, z1, a1, z2, a2, z3, out };
}

function crossEntropyLoss(pred, labelIdx) {
  return -Math.log(Math.max(pred[labelIdx], 1e-15));
}

function backward(net, cache, labelIdx, lr) {
  const { x, z1, a1, z2, a2, out } = cache;

  // Output gradient (softmax + cross-entropy combined)
  const dOut = out.map((v, i) => v - (i === labelIdx ? 1 : 0));

  // Gradients W3, b3
  const dW3 = dOut.map(d => a2.map(a => d * a));
  const db3 = [...dOut];

  // Back through layer 2
  const da2 = net.W3[0].map((_, j) =>
    dOut.reduce((sum, d, i) => sum + d * net.W3[i][j], 0)
  );
  const dz2 = da2.map((d, i) => d * reluD(z2[i]));

  const dW2 = dz2.map(d => a1.map(a => d * a));
  const db2 = [...dz2];

  // Back through layer 1
  const da1 = net.W2[0].map((_, j) =>
    dz2.reduce((sum, d, i) => sum + d * net.W2[i][j], 0)
  );
  const dz1 = da1.map((d, i) => d * reluD(z1[i]));

  const dW1 = dz1.map(d => x.map(xi => d * xi));
  const db1 = [...dz1];

  // ── Apply gradients (SGD) ──
  for (let i = 0; i < net.W1.length; i++)
    for (let j = 0; j < net.W1[i].length; j++)
      net.W1[i][j] -= lr * dW1[i][j];
  for (let i = 0; i < net.b1.length; i++) net.b1[i] -= lr * db1[i];

  for (let i = 0; i < net.W2.length; i++)
    for (let j = 0; j < net.W2[i].length; j++)
      net.W2[i][j] -= lr * dW2[i][j];
  for (let i = 0; i < net.b2.length; i++) net.b2[i] -= lr * db2[i];

  for (let i = 0; i < net.W3.length; i++)
    for (let j = 0; j < net.W3[i].length; j++)
      net.W3[i][j] -= lr * dW3[i][j];
  for (let i = 0; i < net.b3.length; i++) net.b3[i] -= lr * db3[i];
}

// ─────────────────────────────────────────────────────────────
// SECTION 4: TRAINING
// ─────────────────────────────────────────────────────────────

function trainNetwork(epochs = 2000, learningRate = 0.05) {
  const net = {
    W1: initWeights(HIDDEN1, INPUT_SIZE),
    b1: initBias(HIDDEN1),
    W2: initWeights(HIDDEN2, HIDDEN1),
    b2: initBias(HIDDEN2),
    W3: initWeights(OUTPUT_SIZE, HIDDEN2),
    b3: initBias(OUTPUT_SIZE),
  };

  let lastLoss = Infinity;
  let lr = learningRate;

  for (let epoch = 0; epoch < epochs; epoch++) {
    // Shuffle training data each epoch
    const shuffled = [...TRAINING_DATA].sort(() => Math.random() - 0.5);

    let totalLoss = 0;
    for (const sample of shuffled) {
      const cache = forward(net, sample.f);
      totalLoss += crossEntropyLoss(cache.out, sample.label);
      backward(net, cache, sample.label, lr);
    }

    // Learning rate decay
    if (epoch % 500 === 0 && epoch > 0) {
      lr *= 0.7;
    }

    if (epoch % 200 === 0) {
      const avgLoss = totalLoss / TRAINING_DATA.length;
      const acc = computeAccuracy(net);
      console.log(`  Epoch ${epoch.toString().padStart(4)} | Loss: ${avgLoss.toFixed(4)} | Accuracy: ${(acc * 100).toFixed(1)}%`);
      lastLoss = avgLoss;
    }
  }

  const finalAcc = computeAccuracy(net);
  console.log(`\n✅ Training complete! Final Accuracy: ${(finalAcc * 100).toFixed(1)}%`);
  return net;
}

function computeAccuracy(net) {
  let correct = 0;
  for (const sample of TRAINING_DATA) {
    const { out } = forward(net, sample.f);
    const pred = out.indexOf(Math.max(...out));
    if (pred === sample.label) correct++;
  }
  return correct / TRAINING_DATA.length;
}

// ─────────────────────────────────────────────────────────────
// SECTION 5: FEATURE EXTRACTION
// From raw question history → 8 normalized features
// ─────────────────────────────────────────────────────────────

function extractFeatures(history, currentDifficulty, questionsRemaining) {
  if (!history || history.length === 0) {
    return new Array(8).fill(0.5); // Neutral default
  }

  const last3 = history.slice(-3);
  const totalQ = history.length;

  // Feature 0: avg attempts in last 3 questions (normalized /3)
  const avgAttempts = last3.reduce((s, q) => s + (q.attemptsUsed || 1), 0) / last3.length / 3;

  // Feature 1: solve rate in last 3
  const solvedRate = last3.filter(q => q.solved).length / last3.length;

  // Feature 2: avg hints used in last 3 (normalized /3)
  const avgHints = last3.reduce((s, q) => s + (q.hintsUsed || 0), 0) / last3.length / 3;

  // Feature 3: current difficulty encoded
  const diffEnc = { Easy: 0.0, Medium: 0.5, Hard: 1.0 };
  const diffNorm = diffEnc[currentDifficulty] ?? 0.0;

  // Feature 4: ratio of last 3 questions solved on 1st attempt (most recent signal)
  const solvedFirstLast3 = last3.filter(q => q.attemptsUsed === 1 && q.solved).length / last3.length;

  // Feature 5: ratio of questions where all 3 attempts failed (overall)
  const failedAll = history.filter(q => q.attemptsUsed >= 3 && !q.solved).length / totalQ;

  // Feature 6: consecutive perfect streak — how many questions in a row solved on 1st attempt
  // Works from 1 question onwards, unlike the old 4-question minimum trend
  let streak = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].attemptsUsed === 1 && history[i].solved) streak++;
    else break;
  }
  const streakNorm = Math.min(streak / 3, 1.0); // cap at 3 for normalization

  // Feature 7: questions remaining (normalized — assumes max 10 questions)
  const remaining = typeof questionsRemaining === "number" ? questionsRemaining : 5;
  const remainingNorm = Math.min(remaining / 10, 1.0);

  return [
    Math.min(avgAttempts, 1.0),
    solvedRate,
    Math.min(avgHints, 1.0),
    diffNorm,
    solvedFirstLast3,
    failedAll,
    streakNorm,
    remainingNorm,
  ];
}

// ─────────────────────────────────────────────────────────────
// SECTION 6: PUBLIC PREDICTION API
// ─────────────────────────────────────────────────────────────

const LABELS = ["Easy", "Medium", "Hard"];

let _trainedNet = null;

/**
 * Train and cache the network (call once at startup).
 */
export function initAI() {
  if (_trainedNet) return;
  console.log("\n🧠 Training LittleCoders AI difficulty model...");
  _trainedNet = trainNetwork(2500, 0.05);
}

/**
 * Predict the next difficulty level.
 *
 * @param {Object} performanceData
 * @param {Array}  performanceData.history
 * @param {string} performanceData.currentDifficulty
 * @param {number} performanceData.questionsRemaining
 *
 * @returns {{ suggestedDifficulty, confidence, reasoning }}
 */
export function suggestNextDifficulty(performanceData) {
  if (!_trainedNet) initAI();

  const { history, currentDifficulty, questionsRemaining } = performanceData;

  // No history yet → always start Easy
  if (!history || history.length === 0) {
    return {
      suggestedDifficulty: "Easy",
      confidence: "high",
      reasoning: "No history yet — starting with Easy to establish a baseline.",
    };
  }

  const features = extractFeatures(history, currentDifficulty, questionsRemaining);
  const { out } = forward(_trainedNet, features);

  const predIdx = out.indexOf(Math.max(...out));
  const topProb = out[predIdx];

  // Confidence from max softmax probability
  const confidence =
    topProb >= 0.75 ? "high" :
    topProb >= 0.5  ? "medium" : "low";

  const suggested = LABELS[predIdx];

  // Human-readable reasoning
  const solvedRate   = history.slice(-3).filter(q => q.solved).length;
  const avgAttempts  = (history.slice(-3).reduce((s, q) => s + (q.attemptsUsed || 1), 0) / Math.min(history.length, 3)).toFixed(1);
  const reasoning    = buildReasoning(suggested, currentDifficulty, solvedRate, avgAttempts, history);

  console.log(
    `🎯 [LittleCoders AI] Suggested: ${suggested} | Confidence: ${confidence} (${(topProb * 100).toFixed(1)}%)\n` +
    `   Probabilities → Easy: ${(out[0]*100).toFixed(1)}% | Medium: ${(out[1]*100).toFixed(1)}% | Hard: ${(out[2]*100).toFixed(1)}%\n` +
    `   Reasoning: ${reasoning}`
  );

  return { suggestedDifficulty: suggested, confidence, reasoning };
}

function buildReasoning(suggested, current, solvedLast3, avgAttempts, history) {
  const totalSolved = history.filter(q => q.solved).length;
  const total = history.length;

  if (suggested === current) {
    return `Mixed performance (${totalSolved}/${total} solved, avg ${avgAttempts} attempts) suggests keeping ${current} difficulty.`;
  }
  if (suggested === "Hard" && current !== "Hard") {
    return `Strong performance (solved ${solvedLast3}/3 recent questions, avg ${avgAttempts} attempts) — ready for a harder challenge!`;
  }
  if (suggested === "Easy" && current !== "Easy") {
    return `Student is struggling (${totalSolved}/${total} solved, avg ${avgAttempts} attempts) — stepping back to Easy for more support.`;
  }
  if (suggested === "Medium") {
    if (current === "Easy") return `Consistently solving Easy questions (${totalSolved}/${total} overall, avg ${avgAttempts} attempts) — time to try Medium!`;
    return `Stepping down from Hard — Medium questions will help rebuild confidence (${totalSolved}/${total} solved).`;
  }
  return `AI model recommends ${suggested} based on recent performance patterns.`;
}

// ─────────────────────────────────────────────────────────────
// SECTION 7: SELF-TEST (runs when file is executed directly)
// ─────────────────────────────────────────────────────────────

function runSelfTest() {
  console.log("\n═══════════════════════════════════════════");
  console.log("  LittleCoders AI — Self-Test Suite");
  console.log("═══════════════════════════════════════════\n");

  initAI();

  const tests = [
    {
      name: "Ace student on Easy → should suggest Medium",
      input: {
        history: [
          { questionId: "q1", difficulty: "Easy", attemptsUsed: 1, solved: true,  hintsUsed: 0 },
          { questionId: "q2", difficulty: "Easy", attemptsUsed: 1, solved: true,  hintsUsed: 0 },
          { questionId: "q3", difficulty: "Easy", attemptsUsed: 1, solved: true,  hintsUsed: 0 },
        ],
        currentDifficulty: "Easy",
        questionsRemaining: 6,
      },
      expected: "Medium",
    },
    {
      name: "Struggling student on Medium → should suggest Easy",
      input: {
        history: [
          { questionId: "q1", difficulty: "Medium", attemptsUsed: 3, solved: false, hintsUsed: 3 },
          { questionId: "q2", difficulty: "Medium", attemptsUsed: 3, solved: false, hintsUsed: 2 },
          { questionId: "q3", difficulty: "Medium", attemptsUsed: 3, solved: false, hintsUsed: 3 },
        ],
        currentDifficulty: "Medium",
        questionsRemaining: 4,
      },
      expected: "Easy",
    },
    {
      name: "Pro student on Medium → should suggest Hard",
      input: {
        history: [
          { questionId: "q1", difficulty: "Medium", attemptsUsed: 1, solved: true,  hintsUsed: 0 },
          { questionId: "q2", difficulty: "Medium", attemptsUsed: 1, solved: true,  hintsUsed: 0 },
          { questionId: "q3", difficulty: "Medium", attemptsUsed: 1, solved: true,  hintsUsed: 0 },
        ],
        currentDifficulty: "Medium",
        questionsRemaining: 5,
      },
      expected: "Hard",
    },
    {
      name: "Mixed student on Easy → should stay Easy",
      input: {
        history: [
          { questionId: "q1", difficulty: "Easy", attemptsUsed: 2, solved: true,  hintsUsed: 1 },
          { questionId: "q2", difficulty: "Easy", attemptsUsed: 3, solved: false, hintsUsed: 2 },
          { questionId: "q3", difficulty: "Easy", attemptsUsed: 2, solved: true,  hintsUsed: 1 },
        ],
        currentDifficulty: "Easy",
        questionsRemaining: 5,
      },
      expected: "Easy",
    },
    {
      name: "Hard performer → should stay Hard",
      input: {
        history: [
          { questionId: "q1", difficulty: "Hard", attemptsUsed: 1, solved: true, hintsUsed: 0 },
          { questionId: "q2", difficulty: "Hard", attemptsUsed: 2, solved: true, hintsUsed: 0 },
          { questionId: "q3", difficulty: "Hard", attemptsUsed: 1, solved: true, hintsUsed: 0 },
        ],
        currentDifficulty: "Hard",
        questionsRemaining: 3,
      },
      expected: "Hard",
    },
    {
      name: "No history → should start Easy",
      input: { history: [], currentDifficulty: "Easy", questionsRemaining: 5 },
      expected: "Easy",
    },
    {
      name: "Hard → Medium regression (struggling on hard)",
      input: {
        history: [
          { questionId: "q1", difficulty: "Hard", attemptsUsed: 3, solved: false, hintsUsed: 3 },
          { questionId: "q2", difficulty: "Hard", attemptsUsed: 3, solved: true,  hintsUsed: 2 },
          { questionId: "q3", difficulty: "Hard", attemptsUsed: 3, solved: false, hintsUsed: 3 },
        ],
        currentDifficulty: "Hard",
        questionsRemaining: 4,
      },
      expected: "Medium",
    },
    {
      name: "4 questions solved on Medium all 1st attempt → should be Hard",
      input: {
        history: [
          { questionId: "q1", difficulty: "Medium", attemptsUsed: 1, solved: true, hintsUsed: 0 },
          { questionId: "q2", difficulty: "Medium", attemptsUsed: 1, solved: true, hintsUsed: 0 },
          { questionId: "q3", difficulty: "Medium", attemptsUsed: 1, solved: true, hintsUsed: 0 },
          { questionId: "q4", difficulty: "Medium", attemptsUsed: 1, solved: true, hintsUsed: 0 },
        ],
        currentDifficulty: "Medium",
        questionsRemaining: 3,
      },
      expected: "Hard",
    },
    {
      name: "Solved all with 2 attempts (not mastered) → stay Medium",
      input: {
        history: [
          { questionId: "q1", difficulty: "Medium", attemptsUsed: 2, solved: true, hintsUsed: 0 },
          { questionId: "q2", difficulty: "Medium", attemptsUsed: 2, solved: true, hintsUsed: 0 },
          { questionId: "q3", difficulty: "Medium", attemptsUsed: 2, solved: true, hintsUsed: 0 },
        ],
        currentDifficulty: "Medium",
        questionsRemaining: 4,
      },
      expected: "Medium",
    },
  ];

  let passed = 0;
  for (const test of tests) {
    const result = suggestNextDifficulty(test.input);
    const ok = result.suggestedDifficulty === test.expected;
    if (ok) passed++;
    console.log(
      `${ok ? "✅" : "❌"} ${test.name}\n` +
      `   Expected: ${test.expected} | Got: ${result.suggestedDifficulty} (${result.confidence})\n` +
      `   "${result.reasoning}"\n`
    );
  }

  console.log(`\n📊 Test Results: ${passed}/${tests.length} passed`);
  console.log("═══════════════════════════════════════════\n");
}

// Run self-test if executed directly
runSelfTest();