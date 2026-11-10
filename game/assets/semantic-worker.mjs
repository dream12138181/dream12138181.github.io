import { env, pipeline } from './runtime/transformers.min.js';

// 模型、分词器和 WASM 均从站点同一目录加载。推理留在 Worker 内。
env.allowRemoteModels = false;
env.allowLocalModels = true;
env.localModelPath = new URL('./models/', import.meta.url).href;
env.backends.onnx.wasm.wasmPaths = new URL('./runtime/', import.meta.url).href;
env.backends.onnx.wasm.numThreads = 1;

const model = pipeline('feature-extraction', 'bge-small-zh-v1.5', {
  device: 'wasm',
  dtype: 'int8'
}).then(extract => {
  self.postMessage({ type: 'ready' });
  return extract;
}).catch(() => {
  self.postMessage({ type: 'unavailable' });
  return null;
});

const targetVectors = new Map();
let queue = Promise.resolve();

self.addEventListener('message', ({ data: { id, guess, target } }) => {
  // 换局后可能还有上一局的请求在运行，按顺序使用同一个推理会话。
  queue = queue.then(async () => {
    const extract = await model;
    if (!extract) return;
    const options = { pooling: 'cls', normalize: true };
    if (!targetVectors.has(target)) {
      targetVectors.set(target, (await extract(target, options)).data);
    }
    const targetVector = targetVectors.get(target);
    const { data: vector } = await extract(guess, options);
    const cosine = vector.reduce((sum, value, index) => sum + value * targetVector[index], 0);
    if (!Number.isFinite(cosine)) throw new Error('Invalid semantic score');

    // 相似度是排序信号，映射为游戏分数，100 分留给精确命中。
    const score = Math.max(0, Math.min(99, Math.round(100 * (cosine - 0.35) / 0.58)));
    self.postMessage({ type: 'score', id, score });
  }).catch(() => {
    self.postMessage({ type: 'error', id });
  });
});
