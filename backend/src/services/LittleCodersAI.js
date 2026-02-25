/**
 * LittleCoders AI — Adaptive Difficulty Neural Network
 * With Continuous Learning + Persistent Weights
 *
 * HOW IT LEARNS OVER TIME:
 *  1. First startup  → trains on bootstrap data, saves weights to disk
 *  2. Every restart  → loads saved weights instantly (no retraining)
 *  3. After each assessment → saves session to ai_data.json
 *  4. Every RETRAIN_EVERY sessions → retrains on bootstrap + ALL real data
 *  5. New weights saved → next restart is still instant
 *
 * Files saved to /ai_model/:
 *   weights.json  — neural network weights
 *   metadata.json — version, accuracy, counters
 *   ai_data.json  — growing dataset of real student sessions
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODEL_DIR     = path.join(__dirname, "../ai_model");
const WEIGHTS_PATH  = path.join(MODEL_DIR, "weights.json");
const METADATA_PATH = path.join(MODEL_DIR, "metadata.json");
const DATA_PATH     = path.join(MODEL_DIR, "ai_data.json");

const RETRAIN_EVERY = 10;
const INPUT_SIZE    = 8;
const HIDDEN1       = 12;
const HIDDEN2       = 8;
const OUTPUT_SIZE   = 3;
const LABELS        = ["Easy", "Medium", "Hard"];

// ── Bootstrap training data ──────────────────────────────────
const BOOTSTRAP_DATA = [
  { f: [3/3, 0.33, 2/3, 0.0,  0.0,  0.67, 0,   0.8], label: 0 },
  { f: [2.7/3, 0.33, 1.5/3, 0.0, 0.0, 0.67, 0, 0.6], label: 0 },
  { f: [3/3, 0.0,  2/3, 0.0,  0.0,  1.0,  0,   0.9], label: 0 },
  { f: [2.5/3, 0.33, 2/3, 0.5, 0.0,  0.5,  0,  0.5], label: 0 },
  { f: [3/3, 0.33, 3/3, 0.0,  0.0,  0.67, 0,   0.7], label: 0 },
  { f: [2.8/3, 0.0, 2.5/3, 0.0, 0.0, 1.0,  0,  0.4], label: 0 },
  { f: [3/3, 0.33, 1/3, 0.5,  0.0,  0.5,  0,   0.6], label: 0 },
  { f: [2.6/3, 0.33, 2/3, 0.0, 0.0,  0.67, 0,  0.8], label: 0 },
  { f: [1/3, 1.0,  0/3, 0.0,  1.0,  0.0,  1.0, 0.6], label: 1 },
  { f: [1/3, 1.0,  0/3, 0.0,  1.0,  0.0,  0.67,0.7], label: 1 },
  { f: [1/3, 1.0,  0/3, 0.0,  1.0,  0.0,  1.0, 0.4], label: 1 },
  { f: [1.5/3, 0.67, 0/3, 0.0, 0.67, 0.0, 0.33,0.5], label: 1 },
  { f: [1/3, 1.0,  0.5/3,0.0, 1.0,  0.0,  1.0, 0.8], label: 1 },
  { f: [1.2/3, 1.0, 0/3, 0.0, 0.67, 0.0,  0.67,0.6], label: 1 },
  { f: [2/3, 0.67, 0.5/3,0.0, 0.33, 0.0,  0.33,0.5], label: 1 },
  { f: [2/3, 0.67, 1/3, 0.5,  0.33, 0.33, 0,  0.5], label: 1 },
  { f: [1.5/3, 0.67,0.5/3,0.5, 0.67, 0.0, 0.33,0.6], label: 1 },
  { f: [2.5/3, 0.33,1/3, 0.5, 0.0,  0.33, 0,  0.4], label: 1 },
  { f: [2/3, 0.67, 1.5/3,0.5, 0.33, 0.0,  0,  0.7], label: 1 },
  { f: [1.8/3, 0.67,0.5/3,0.5, 0.33, 0.33, 0, 0.5], label: 1 },
  { f: [2/3, 0.67, 0.5/3,0.5, 0.33, 0.0,  0,  0.6], label: 1 },
  { f: [1.5/3, 1.0, 1/3, 0.5, 0.67, 0.0,  0.33,0.3], label: 1 },
  { f: [2.2/3, 0.33,1/3, 0.5, 0.0,  0.33, 0,  0.7], label: 1 },
  { f: [2/3, 1.0,  0/3, 0.5,  0.0,  0.0,  0,  0.5], label: 1 },
  { f: [2/3, 1.0,  0/3, 0.5,  0.0,  0.0,  0,  0.4], label: 1 },
  { f: [1/3, 1.0,  0/3, 0.5,  1.0,  0.0,  1.0, 0.5], label: 2 },
  { f: [1.2/3, 1.0, 0.2/3,0.5, 1.0, 0.0,  1.0, 0.6], label: 2 },
  { f: [1/3, 1.0,  0/3, 0.5,  1.0,  0.0,  1.0, 0.4], label: 2 },
  { f: [1.3/3, 1.0, 0/3, 0.5, 0.67, 0.0,  1.0, 0.7], label: 2 },
  { f: [1/3, 1.0,  0.3/3,0.5, 1.0,  0.0,  1.0, 0.3], label: 2 },
  { f: [1/3, 1.0,  0/3, 0.5,  1.0,  0.0,  1.0, 0.6], label: 2 },
  { f: [1/3, 1.0,  0/3, 0.5,  1.0,  0.0,  1.0, 0.5], label: 2 },
  { f: [1.1/3, 1.0, 0/3, 0.5, 1.0,  0.0,  1.0, 0.4], label: 2 },
  { f: [1/3, 1.0,  0/3, 0.5,  1.0,  0.0,  1.0, 0.3], label: 2 },
  { f: [1/3, 1.0,  0/3, 0.5,  1.0,  0.0,  1.0, 0.2], label: 2 },
  { f: [3/3, 0.0,  2/3, 0.5,  0.0,  1.0,  0,  0.7], label: 0 },
  { f: [2.8/3, 0.33,2/3, 0.5, 0.0,  0.67, 0,  0.6], label: 0 },
  { f: [3/3, 0.0,  3/3, 0.5,  0.0,  1.0,  0,  0.5], label: 0 },
  { f: [2.5/3, 0.0, 2/3, 0.5, 0.0,  0.67, 0,  0.8], label: 0 },
  { f: [1/3, 1.0,  0/3, 1.0,  1.0,  0.0,  1.0, 0.4], label: 2 },
  { f: [1.5/3, 1.0, 0.5/3,1.0, 0.67, 0.0, 1.0, 0.5], label: 2 },
  { f: [1.2/3, 1.0, 0/3, 1.0, 1.0,  0.0,  0.67,0.3], label: 2 },
  { f: [2/3, 0.67, 0.5/3,1.0, 0.67, 0.0,  0.33,0.6], label: 2 },
  { f: [1/3, 1.0,  0.5/3,1.0, 1.0,  0.0,  1.0, 0.2], label: 2 },
  { f: [3/3, 0.33, 2/3, 1.0,  0.0,  0.67, 0,  0.5], label: 1 },
  { f: [2.8/3, 0.0, 1.5/3,1.0, 0.0, 1.0,  0,  0.6], label: 1 },
  { f: [3/3, 0.33, 2/3, 1.0,  0.0,  0.67, 0,  0.4], label: 1 },
  { f: [2.5/3, 0.33,1/3, 1.0, 0.0,  0.5,  0,  0.7], label: 1 },
  { f: [2/3, 0.67, 0.5/3,0.0, 0.33, 0.0,  0,  0.1], label: 0 },
  { f: [1.5/3, 1.0, 0.3/3,0.0, 0.67, 0.0, 0.67,0.1], label: 1 },
  { f: [2/3, 0.67, 0.5/3,0.5, 0.33, 0.0,  0,  0.1], label: 1 },
  { f: [1/3, 1.0,  0/3, 0.5,  1.0,  0.0,  1.0, 0.1], label: 1 },
  { f: [1/3, 1.0,  0/3, 1.0,  1.0,  0.0,  1.0, 0.1], label: 2 },
  { f: [2/3, 1.0,  0/3, 0.5,  0.0,  0.0,  0,  0.6], label: 1 },
  { f: [2/3, 1.0,  0/3, 0.5,  0.0,  0.0,  0,  0.5], label: 1 },
  { f: [2/3, 1.0,  0.3/3,0.5, 0.0,  0.0,  0,  0.4], label: 1 },
  { f: [1.5/3, 0.67,0.5/3,0.0, 0.67, 0.0, 0.33,0.5], label: 1 },
  { f: [2/3, 0.33, 1/3, 0.5,  0.0,  0.33, 0,  0.4], label: 1 },
  { f: [1/3, 1.0,  0/3, 0.0,  1.0,  0.0,  1.0, 0.9], label: 1 },
  { f: [1/3, 1.0,  0/3, 1.0,  1.0,  0.0,  0.67,0.5], label: 2 },
];

// ── NN Math ──────────────────────────────────────────────────
function initWeights(rows, cols) {
  const scale = Math.sqrt(2.0 / (rows + cols));
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => (Math.random() * 2 - 1) * scale)
  );
}
function initBias(size) { return new Array(size).fill(0.01); }
const relu  = x => Math.max(0, x);
const reluD = x => x > 0 ? 1 : 0;
function softmax(arr) {
  const max = Math.max(...arr);
  const exps = arr.map(x => Math.exp(x - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sum);
}
function matVec(W, x) { return W.map(row => row.reduce((s, w, j) => s + w * x[j], 0)); }
function addBias(a, b) { return a.map((v, i) => v + b[i]); }

function forward(net, x) {
  const z1 = addBias(matVec(net.W1, x), net.b1); const a1 = z1.map(relu);
  const z2 = addBias(matVec(net.W2, a1), net.b2); const a2 = z2.map(relu);
  const z3 = addBias(matVec(net.W3, a2), net.b3); const out = softmax(z3);
  return { x, z1, a1, z2, a2, z3, out };
}

function backward(net, cache, labelIdx, lr) {
  const { x, z1, a1, z2, a2, out } = cache;
  const dOut = out.map((v, i) => v - (i === labelIdx ? 1 : 0));
  const dW3 = dOut.map(d => a2.map(a => d * a)); const db3 = [...dOut];
  const da2 = net.W3[0].map((_, j) => dOut.reduce((s, d, i) => s + d * net.W3[i][j], 0));
  const dz2 = da2.map((d, i) => d * reluD(z2[i]));
  const dW2 = dz2.map(d => a1.map(a => d * a)); const db2 = [...dz2];
  const da1 = net.W2[0].map((_, j) => dz2.reduce((s, d, i) => s + d * net.W2[i][j], 0));
  const dz1 = da1.map((d, i) => d * reluD(z1[i]));
  const dW1 = dz1.map(d => x.map(xi => d * xi)); const db1 = [...dz1];
  for (let i = 0; i < net.W1.length; i++) for (let j = 0; j < net.W1[i].length; j++) net.W1[i][j] -= lr * dW1[i][j];
  for (let i = 0; i < net.b1.length; i++) net.b1[i] -= lr * db1[i];
  for (let i = 0; i < net.W2.length; i++) for (let j = 0; j < net.W2[i].length; j++) net.W2[i][j] -= lr * dW2[i][j];
  for (let i = 0; i < net.b2.length; i++) net.b2[i] -= lr * db2[i];
  for (let i = 0; i < net.W3.length; i++) for (let j = 0; j < net.W3[i].length; j++) net.W3[i][j] -= lr * dW3[i][j];
  for (let i = 0; i < net.b3.length; i++) net.b3[i] -= lr * db3[i];
}

function computeAccuracy(net, data) {
  let c = 0;
  for (const s of data) { const { out } = forward(net, s.f); if (out.indexOf(Math.max(...out)) === s.label) c++; }
  return c / data.length;
}

function trainNetwork(data, epochs = 2500, startLr = 0.05) {
  const net = {
    W1: initWeights(HIDDEN1, INPUT_SIZE), b1: initBias(HIDDEN1),
    W2: initWeights(HIDDEN2, HIDDEN1),    b2: initBias(HIDDEN2),
    W3: initWeights(OUTPUT_SIZE, HIDDEN2), b3: initBias(OUTPUT_SIZE),
  };
  let lr = startLr;
  for (let e = 0; e < epochs; e++) {
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    for (const s of shuffled) { const cache = forward(net, s.f); backward(net, cache, s.label, lr); }
    if (e % 500 === 0 && e > 0) lr *= 0.7;
    if (e % 500 === 0) console.log(`  Epoch ${String(e).padStart(4)} | Acc: ${(computeAccuracy(net, data) * 100).toFixed(1)}%`);
  }
  return net;
}

// ── Persistence ───────────────────────────────────────────────
function ensureDir() { if (!fs.existsSync(MODEL_DIR)) fs.mkdirSync(MODEL_DIR, { recursive: true }); }

function saveWeights(net) { ensureDir(); fs.writeFileSync(WEIGHTS_PATH, JSON.stringify(net)); }
function loadWeights() {
  if (!fs.existsSync(WEIGHTS_PATH)) return null;
  try { return JSON.parse(fs.readFileSync(WEIGHTS_PATH, "utf8")); } catch { return null; }
}

function loadMetadata() {
  if (!fs.existsSync(METADATA_PATH)) return { version: 0, sampleCount: 0, accuracy: "0%", newSessionsSinceRetrain: 0, realStudentSamples: 0 };
  try { return JSON.parse(fs.readFileSync(METADATA_PATH, "utf8")); } catch { return { version: 0, sampleCount: 0, accuracy: "0%", newSessionsSinceRetrain: 0, realStudentSamples: 0 }; }
}
function saveMetadata(meta) { ensureDir(); fs.writeFileSync(METADATA_PATH, JSON.stringify(meta, null, 2)); }

function loadStudentData() {
  if (!fs.existsSync(DATA_PATH)) return [];
  try { return JSON.parse(fs.readFileSync(DATA_PATH, "utf8")); } catch { return []; }
}
function saveStudentData(data) { ensureDir(); fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2)); }

// ── Feature extraction ────────────────────────────────────────
export function extractFeatures(history, currentDifficulty, questionsRemaining) {
  if (!history || history.length === 0) return new Array(8).fill(0.5);
  const last3 = history.slice(-3);
  const totalQ = history.length;
  const avgAttempts = last3.reduce((s, q) => s + (q.attemptsUsed || 1), 0) / last3.length / 3;
  const solvedRate  = last3.filter(q => q.solved).length / last3.length;
  const avgHints    = last3.reduce((s, q) => s + (q.hintsUsed || 0), 0) / last3.length / 3;
  const diffEnc     = { Easy: 0.0, Medium: 0.5, Hard: 1.0 };
  const diffNorm    = diffEnc[currentDifficulty] ?? 0.0;
  const solvedFirst = last3.filter(q => q.attemptsUsed === 1 && q.solved).length / last3.length;
  const failedAll   = history.filter(q => q.attemptsUsed >= 3 && !q.solved).length / totalQ;
  let streak = 0;
  for (let i = history.length - 1; i >= 0; i--) { if (history[i].attemptsUsed === 1 && history[i].solved) streak++; else break; }
  return [Math.min(avgAttempts,1), solvedRate, Math.min(avgHints,1), diffNorm, solvedFirst, failedAll, Math.min(streak/3,1), Math.min((questionsRemaining||5)/10,1)];
}

// ── Convert a completed session into labeled training samples ──
function sessionToSamples(questions) {
  const samples = [];
  const diffEnc = { Easy: 0, Medium: 1, Hard: 2 };
  for (let i = 1; i < questions.length; i++) {
    const next = questions[i];
    if (next.solved) {
      samples.push({
        f: extractFeatures(questions.slice(0, i), questions[i-1].difficulty, questions.length - i),
        label: diffEnc[next.difficulty] ?? 0,
      });
    }
  }
  return samples;
}

// ── Singleton ─────────────────────────────────────────────────
let _net  = null;
let _meta = null;

export function initAI() {
  if (_net) return;
  ensureDir();
  _meta = loadMetadata();
  const saved = loadWeights();
  if (saved) {
    _net = saved;
    console.log(`🧠 [AI] Weights loaded — v${_meta.version} | acc: ${_meta.accuracy} | ${_meta.sampleCount} samples (${_meta.realStudentSamples || 0} real)`);
    return;
  }
  console.log("\n🧠 [AI] First run — training on bootstrap data...");
  _net = trainNetwork(BOOTSTRAP_DATA, 2500, 0.05);
  const acc = computeAccuracy(_net, BOOTSTRAP_DATA);
  _meta = { version: 1, sampleCount: BOOTSTRAP_DATA.length, realStudentSamples: 0, accuracy: (acc*100).toFixed(1)+"%", trainedAt: new Date().toISOString(), newSessionsSinceRetrain: 0 };
  saveWeights(_net);
  saveMetadata(_meta);
}

// ── Record completed session + trigger retrain if threshold hit ──
export function recordSession(completedQuestions) {
  if (!completedQuestions || completedQuestions.length < 2) return;
  const newSamples = sessionToSamples(completedQuestions);
  if (newSamples.length === 0) return;

  const allData = loadStudentData();
  allData.push(...newSamples);
  saveStudentData(allData);

  if (!_meta) _meta = loadMetadata();
  _meta.newSessionsSinceRetrain = (_meta.newSessionsSinceRetrain || 0) + 1;
  _meta.realStudentSamples = allData.length;
  saveMetadata(_meta);

  console.log(`📈 [AI] Session saved: +${newSamples.length} samples | Real total: ${allData.length} | ${_meta.newSessionsSinceRetrain}/${RETRAIN_EVERY} until retrain`);

  if (_meta.newSessionsSinceRetrain >= RETRAIN_EVERY) {
    setImmediate(() => retrainWithAllData());
  }
}

// ── Retrain on everything (bootstrap + all real student data) ──
export function retrainWithAllData() {
  if (!_meta) _meta = loadMetadata();
  const studentData = loadStudentData();
  const combined = [...BOOTSTRAP_DATA, ...studentData];
  console.log(`\n🔄 [AI] Retraining — ${BOOTSTRAP_DATA.length} bootstrap + ${studentData.length} real = ${combined.length} total...`);
  _net = trainNetwork(combined, 2500, 0.05);
  const acc = computeAccuracy(_net, combined);
  _meta = { ..._meta, version: (_meta.version||1)+1, sampleCount: combined.length, realStudentSamples: studentData.length, accuracy: (acc*100).toFixed(1)+"%", trainedAt: new Date().toISOString(), newSessionsSinceRetrain: 0 };
  saveWeights(_net);
  saveMetadata(_meta);
  console.log(`✅ [AI] Retrained! v${_meta.version} | acc: ${_meta.accuracy} | ${combined.length} samples`);
}

// ── Predict ───────────────────────────────────────────────────
export function suggestNextDifficulty(performanceData) {
  if (!_net) initAI();
  const { history, currentDifficulty, questionsRemaining } = performanceData;
  if (!history || history.length === 0) return { suggestedDifficulty: "Easy", confidence: "high", reasoning: "No history yet — starting Easy." };

  const features = extractFeatures(history, currentDifficulty, questionsRemaining);
  const { out }  = forward(_net, features);
  const predIdx  = out.indexOf(Math.max(...out));
  const topProb  = out[predIdx];
  const suggested = LABELS[predIdx];
  const confidence = topProb >= 0.75 ? "high" : topProb >= 0.5 ? "medium" : "low";

  const totalSolved = history.filter(q => q.solved).length;
  const avgAtt = (history.slice(-3).reduce((s,q)=>s+(q.attemptsUsed||1),0)/Math.min(history.length,3)).toFixed(1);
  let reasoning = `AI v${_meta?.version||"?"} (${_meta?.realStudentSamples||0} real samples): `;
  if (suggested === currentDifficulty) reasoning += `Mixed performance (${totalSolved}/${history.length} solved, avg ${avgAtt} attempts) — staying at ${currentDifficulty}.`;
  else if (suggested === "Hard") reasoning += `Strong performance (avg ${avgAtt} attempts, ${totalSolved}/${history.length} solved) — ready for Hard!`;
  else if (suggested === "Easy") reasoning += `Struggling (${totalSolved}/${history.length} solved) — stepping back to Easy.`;
  else if (currentDifficulty === "Easy") reasoning += `Solving Easy consistently — time for Medium!`;
  else reasoning += `Stepping down from Hard to rebuild on Medium.`;

  console.log(`🎯 [AI v${_meta?.version}] → ${suggested} | ${confidence} (${(topProb*100).toFixed(1)}%) | Easy:${(out[0]*100).toFixed(0)}% Med:${(out[1]*100).toFixed(0)}% Hard:${(out[2]*100).toFixed(0)}%`);
  return { suggestedDifficulty: suggested, confidence, reasoning };
}

export function getModelStatus() {
  const meta = loadMetadata();
  return { version: meta.version, accuracy: meta.accuracy, totalSamples: meta.sampleCount, realStudentSamples: meta.realStudentSamples||0, bootstrapSamples: BOOTSTRAP_DATA.length, sessionsSinceRetrain: meta.newSessionsSinceRetrain||0, retrainEvery: RETRAIN_EVERY, nextRetrainIn: RETRAIN_EVERY-(meta.newSessionsSinceRetrain||0), trainedAt: meta.trainedAt, weightsExist: fs.existsSync(WEIGHTS_PATH) };
}