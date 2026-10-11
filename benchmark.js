const { performance } = require('perf_hooks');

const history = Array.from({ length: 1000 }, (_, i) => ({
  role: i % 2 === 0 ? "user" : "model",
  content: `This is message number ${i}`
}));

function testForLoop() {
  const contents = [];
  if (history && history.length > 0) {
    for (const msg of history) {
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      });
    }
  }
  return contents;
}

function testMap() {
  const contents = history ? history.map(msg => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }]
  })) : [];
  return contents;
}

const ITERATIONS = 10000;

// warmup
for (let i = 0; i < 1000; i++) {
  testForLoop();
  testMap();
}

const startFor = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  testForLoop();
}
const endFor = performance.now();

const startMap = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  testMap();
}
const endMap = performance.now();

console.log(`For loop: ${endFor - startFor} ms`);
console.log(`Map: ${endMap - startMap} ms`);
