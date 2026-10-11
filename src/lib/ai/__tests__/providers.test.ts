import { callModel } from '../providers';

// Mock the GoogleGenAI module to avoid missing API key errors on import
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn(),
    },
  })),
}));

describe('providers', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    // Save original environment
    originalEnv = process.env;
  });

  beforeEach(() => {
    // Reset process.env and module cache to allow setting keys per test
    jest.resetModules();
    process.env = { ...originalEnv };

    // Mock the global fetch
    global.fetch = jest.fn();
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('callGroq via callModel', () => {
    it('should throw an error when GROQ_API_KEY is not configured', async () => {
      delete process.env.GROQ_API_KEY;

      // We must dynamically import the module so it picks up the current process.env
      const { callModel } = await import('../providers');

      await expect(callModel('groq', 'Hello World')).rejects.toThrow(
        'GROQ_API_KEY is not configured'
      );
    });

    it('should successfully make an API request with correct payload', async () => {
      process.env.GROQ_API_KEY = 'test-groq-key';

      // Mock successful fetch response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            { message: { content: 'This is the mocked response.' } },
          ],
        }),
      });

      const { callModel } = await import('../providers');

      const response = await callModel('groq', 'Tell me a joke.');

      expect(response).toEqual({
        text: 'This is the mocked response.',
        provider: 'groq',
        model: 'openai/gpt-oss-20b',
        tools_used: [],
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-groq-key',
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-20b',
            messages: [{ role: 'user', content: 'Tell me a joke.' }],
            temperature: 0.2,
          }),
        }
      );
    });

    it('should correctly format payload when history and attachment are provided', async () => {
      process.env.GROQ_API_KEY = 'test-groq-key';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            { message: { content: 'Mocked response with history/attachment.' } },
          ],
        }),
      });

      const { callModel } = await import('../providers');

      const history = [
        { role: 'user', content: 'What is this?' },
        { role: 'assistant', content: 'A mystery.' },
      ];

      const attachment = { url: 'data:image/jpeg;base64,mockbase64', type: 'image' as const };

      await callModel('groq', 'Analyze this image.', undefined, false, attachment, history);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-groq-key',
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-20b',
            messages: [
              { role: 'user', content: 'What is this?' },
              { role: 'assistant', content: 'A mystery.' },
              {
                role: 'user',
                content: [
                  { type: 'text', text: 'Analyze this image.' },
                  { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,mockbase64' } },
                ],
              },
            ],
            temperature: 0.2,
          }),
        }
      );
    });

    it('should remove hidden reasoning <think> blocks from the response', async () => {
      process.env.GROQ_API_KEY = 'test-groq-key';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            { message: { content: '<think>This is some inner reasoning.\nIt spans lines.</think>\n\nHere is the actual response.' } },
          ],
        }),
      });

      const { callModel } = await import('../providers');

      const response = await callModel('groq', 'Prompt');

      expect(response.text).toBe('Here is the actual response.');
    });

    it('should throw an error when the API returns a non-ok status', async () => {
      process.env.GROQ_API_KEY = 'test-groq-key';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad Request: Invalid model',
      });

      const { callModel } = await import('../providers');

      await expect(callModel('groq', 'Prompt')).rejects.toThrow(
        'Groq API error 400: Bad Request: Invalid model'
      );
    });
  });
});
