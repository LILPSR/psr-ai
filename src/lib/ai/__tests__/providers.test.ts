import { GoogleGenAI } from "@google/genai"

jest.mock("@google/genai", () => {
  const generateContentMock = jest.fn()
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => {
      return {
        models: {
          generateContent: generateContentMock
        }
      }
    }),
    _generateContentMock: generateContentMock // Expose for assertion
  }
})

describe('callGemini via callModel', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, GEMINI_API_KEY: 'test-key' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should throw if GEMINI_API_KEY is not configured', async () => {
    delete process.env.GEMINI_API_KEY;
    const { callModel } = await import('../providers');

    await expect(callModel('gemini', 'hello')).rejects.toThrow("GEMINI_API_KEY is not configured");
  });

  it('should call gemini provider and return correct response format', async () => {
    const { callModel } = await import('../providers');
    const { _generateContentMock } = await import('@google/genai') as any;

    _generateContentMock.mockResolvedValueOnce({ text: 'Mocked Gemini response' });

    const response = await callModel('gemini', 'Hello world');

    expect(response).toEqual({
      text: 'Mocked Gemini response',
      provider: 'gemini',
      model: 'gemini-3.6-flash',
      tools_used: []
    });

    expect(_generateContentMock).toHaveBeenCalledWith({
      model: "gemini-3.6-flash",
      contents: [{
        role: "user",
        parts: [{ text: 'Hello world' }]
      }],
      config: { temperature: 0.2 }
    });
  });

  it('should handle history', async () => {
    const { callModel } = await import('../providers');
    const { _generateContentMock } = await import('@google/genai') as any;

    _generateContentMock.mockResolvedValueOnce({ text: 'Response with history' });

    const history = [
      { role: 'user', content: 'Hi' },
      { role: 'model', content: 'Hello' }
    ];

    const response = await callModel('gemini', 'How are you?', undefined, false, undefined, history);

    expect(response.text).toBe('Response with history');
    expect(_generateContentMock).toHaveBeenCalledWith(expect.objectContaining({
      contents: [
        { role: 'user', parts: [{ text: 'Hi' }] },
        { role: 'model', parts: [{ text: 'Hello' }] },
        { role: 'user', parts: [{ text: 'How are you?' }] }
      ]
    }));
  });

  it('should handle web search', async () => {
    const { callModel } = await import('../providers');
    const { _generateContentMock } = await import('@google/genai') as any;

    _generateContentMock.mockResolvedValueOnce({ text: 'Web search response' });

    const response = await callModel('gemini', 'Search this', undefined, true);

    expect(response.tools_used).toEqual(["google_search"]);
    expect(_generateContentMock).toHaveBeenCalledWith(expect.objectContaining({
      config: {
        temperature: 0.2,
        tools: [{ googleSearch: {} }]
      }
    }));
  });

  it('should handle image attachment', async () => {
    const { callModel } = await import('../providers');
    const { _generateContentMock } = await import('@google/genai') as any;

    _generateContentMock.mockResolvedValueOnce({ text: 'Image response' });

    const attachment = {
      type: "image" as const,
      url: "data:image/jpeg;base64,mockbase64data"
    };

    const response = await callModel('gemini', 'Analyze this image', undefined, false, attachment);

    expect(_generateContentMock).toHaveBeenCalledWith(expect.objectContaining({
      contents: [
        {
          role: "user",
          parts: [
            { text: 'Analyze this image' },
            { inlineData: { data: 'mockbase64data', mimeType: 'image/jpeg' } }
          ]
        }
      ]
    }));
  });

  it('should handle video attachment', async () => {
    const { callModel } = await import('../providers');
    const { _generateContentMock } = await import('@google/genai') as any;

    _generateContentMock.mockResolvedValueOnce({ text: 'Video response' });

    const attachment = {
      type: "video" as const,
      url: "data:video/mp4;base64,mockvideo64data"
    };

    const response = await callModel('gemini', 'Analyze this video', undefined, false, attachment);

    expect(_generateContentMock).toHaveBeenCalledWith(expect.objectContaining({
      contents: [
        {
          role: "user",
          parts: [
            { text: 'Analyze this video' },
            { inlineData: { data: 'mockvideo64data', mimeType: 'video/mp4' } }
          ]
        }
      ]
    }));
  });

  it('should fallback to empty string if text is undefined', async () => {
    const { callModel } = await import('../providers');
    const { _generateContentMock } = await import('@google/genai') as any;

    _generateContentMock.mockResolvedValueOnce({ });

    const response = await callModel('gemini', 'Hello');

    expect(response.text).toBe('');
  });
});
