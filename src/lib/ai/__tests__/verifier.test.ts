import { verify } from '../verifier';
import { callModel } from '../providers';

jest.mock('../providers', () => ({
  callModel: jest.fn(),
}));

describe('verifier', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('checkMath error path', () => {
    it('should return a fallback VerificationSignal when math check fails', async () => {
      // In verify, it calls checkSelfUncertainty as well, so we need to mock a successful response for it
      // if we only reject once. Alternatively, we can mock it so the first call (for math check) fails
      // and the second call (for self uncertainty) succeeds, or we can just reject both.
      // Let's reject the first one (math check) and succeed the second one (self uncertainty)
      (callModel as jest.Mock)
        .mockRejectedValueOnce(new Error('Math check failed')) // First call for math_check
        .mockResolvedValueOnce({ text: '{"passed": true}' }); // Second call for self_uncertainty

      const result = await verify('What is 2+2?', 'The answer is 4.', undefined, 'math_reasoning');

      // Assertions
      expect(result.passed).toBe(false);
      expect(result.needs_regeneration).toBe(true);
      expect(result.signals).toHaveLength(2);

      const mathSignal = result.signals.find((s) => s.type === 'math_check');
      expect(mathSignal).toBeDefined();
      expect(mathSignal?.passed).toBe(false);
      expect(mathSignal?.detail).toBe('The independent mathematical check failed.');

      expect(console.error).toHaveBeenCalledWith('Math verification failed:', expect.any(Error));
    });

    it('should pass all checks successfully when model returns success', async () => {
      // Mock both calls to succeed
      (callModel as jest.Mock)
        .mockResolvedValueOnce({ text: '```json\n{"passed": true, "detail": "Correct math."}\n```' }) // First call for math_check
        .mockResolvedValueOnce({ text: '```json\n{"passed": true, "detail": "No uncertainty."}\n```' }); // Second call for self_uncertainty

      const result = await verify('What is 2+2?', 'The answer is 4.', undefined, 'math_reasoning');

      // Assertions
      expect(result.passed).toBe(true);
      expect(result.needs_regeneration).toBe(false);
      expect(result.signals).toHaveLength(2);

      const mathSignal = result.signals.find((s) => s.type === 'math_check');
      expect(mathSignal).toBeDefined();
      expect(mathSignal?.passed).toBe(true);
      expect(mathSignal?.detail).toBe('Correct math.');
    });
  });
});
