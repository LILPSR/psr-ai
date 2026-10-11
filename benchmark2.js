const { performance } = require('perf_hooks');

const ITERATIONS = 100000;

function runBenchmark(size) {
    const history = Array.from({ length: size }, (_, i) => ({
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
      return history ? history.map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      })) : [];
    }

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

    console.log(`Size: ${size}`);
    console.log(`For loop: ${endFor - startFor} ms`);
    console.log(`Map: ${endMap - startMap} ms`);
    console.log(`Improvement: ${(((endFor - startFor) - (endMap - startMap)) / (endFor - startFor) * 100).toFixed(2)}%\n`);
}

runBenchmark(10);
runBenchmark(50);
runBenchmark(100);
