describe("callModel - openrouter", () => {
  const originalEnv = process.env;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.resetAllMocks();
  });

  it("should throw an error if OPENROUTER_API_KEY is not configured", async () => {
    delete process.env.OPENROUTER_API_KEY;
    const { callModel } = await import("../providers");

    await expect(callModel("openrouter", "Hello")).rejects.toThrow(
      "OPENROUTER_API_KEY is not configured"
    );
  });

  it("should successfully fetch a response (happy path) and pass correct request formatting", async () => {
    process.env.OPENROUTER_API_KEY = "test-openrouter-key";
    process.env.NEXT_PUBLIC_APP_URL = "http://test-app.local";
    const { callModel } = await import("../providers");

    const mockResponse = {
      model: "openrouter/free",
      choices: [
        {
          message: { content: "Test response" }
        }
      ]
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await callModel("openrouter", "Hello");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-openrouter-key",
          "HTTP-Referer": "http://test-app.local",
          "X-Title": "AI Router",
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [
            {
              role: "user",
              content: "Hello",
            },
          ],
          temperature: 0.2,
        }),
      })
    );

    expect(result).toEqual({
      text: "Test response",
      provider: "openrouter",
      model: "openrouter/free",
      tools_used: [],
    });
  });

  it("should fallback to default Referer if NEXT_PUBLIC_APP_URL is not set", async () => {
    process.env.OPENROUTER_API_KEY = "test-openrouter-key";
    delete process.env.NEXT_PUBLIC_APP_URL;
    const { callModel } = await import("../providers");

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "Test response" } }] }),
    });

    await callModel("openrouter", "Hello");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          "HTTP-Referer": "http://localhost:3000",
        }),
      })
    );
  });

  it("should format request correctly with history and attachment", async () => {
    process.env.OPENROUTER_API_KEY = "test-openrouter-key";
    const { callModel } = await import("../providers");

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "Test response" } }] }),
    });

    const history = [
      { role: "user", content: "Hi" },
      { role: "assistant", content: "Hello there" },
    ];

    const attachment: any = { type: "image", url: "data:image/png;base64,1234" };

    await callModel("openrouter", "What is this?", "openrouter/paid", false, attachment, history);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({
          model: "openrouter/paid",
          messages: [
            { role: "user", content: "Hi" },
            { role: "assistant", content: "Hello there" },
            {
              role: "user",
              content: [
                { type: "text", text: "What is this?" },
                { type: "image_url", image_url: { url: "data:image/png;base64,1234" } },
              ],
            },
          ],
          temperature: 0.2,
        }),
      })
    );
  });

  it("should remove <think> reasoning blocks from the response", async () => {
    process.env.OPENROUTER_API_KEY = "test-openrouter-key";
    const { callModel } = await import("../providers");

    const mockResponse = {
      choices: [
        {
          message: { content: "<think>I need to answer this...</think>\n\nHere is the answer." }
        }
      ]
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await callModel("openrouter", "Hello");

    expect(result.text).toBe("Here is the answer.");
  });

  it("should throw an error when API returns a non-OK response", async () => {
    process.env.OPENROUTER_API_KEY = "test-openrouter-key";
    const { callModel } = await import("../providers");

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => "Bad Request",
    });

    await expect(callModel("openrouter", "Hello")).rejects.toThrow(
      "OpenRouter API error 400: Bad Request"
    );
  });
});
