import { verify } from '../verifier';
import { callModel } from '../providers';

jest.mock('../providers', () => ({
  callModel: jest.fn(),
}));

describe('verify', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('self uncertainty check', () => {
    it('should return a fallback VerificationSignal when an error occurs', async () => {
      // Suppress the expected console.error log
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const mockedCallModel = callModel as jest.MockedFunction<typeof callModel>;
      mockedCallModel.mockRejectedValue(new Error('Simulated network failure'));

      const prompt = 'What is the capital of France?';
      const primaryAnswer = 'Paris';

      const result = await verify(prompt, primaryAnswer);

      expect(result.signals).toContainEqual(
        expect.objectContaining({
          type: 'self_uncertainty',
          passed: false,
          detail: 'The uncertainty check failed.',
        })
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'Uncertainty verification failed:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});
