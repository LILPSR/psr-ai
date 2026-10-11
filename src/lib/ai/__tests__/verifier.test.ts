import { verify } from '../verifier';
import { callModel } from '../providers';

jest.mock('../providers');

describe('verifier', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a fallback VerificationSignal when checkAgreement fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mock checkAgreement (first call) to reject
    (callModel as jest.Mock).mockRejectedValueOnce(new Error('Simulated API failure'));
    // Mock checkSelfUncertainty (second call) to succeed
    (callModel as jest.Mock).mockResolvedValueOnce({ text: '{"passed": true, "detail": "ok"}' });

    const result = await verify('User prompt', 'Primary answer', 'Secondary answer');

    expect(result.signals).toContainEqual({
      type: 'model_agreement',
      passed: false,
      detail: 'The independent agreement check failed.',
    });

    // Also assert that the whole verification returns passed: false since one signal failed
    expect(result.passed).toBe(false);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Agreement verification failed:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});
