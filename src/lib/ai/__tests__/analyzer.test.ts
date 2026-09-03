import { analyzePrompt } from '../analyzer';

describe('analyzePrompt', () => {
  it('should throw an error if the prompt is empty', async () => {
    await expect(analyzePrompt('')).rejects.toThrow('Prompt cannot be empty');
  });

  it('should throw an error if the prompt contains only whitespace', async () => {
    await expect(analyzePrompt('   ')).rejects.toThrow('Prompt cannot be empty');
  });

  it('should throw an error if the prompt contains only tabs and newlines', async () => {
    await expect(analyzePrompt('\t\n')).rejects.toThrow('Prompt cannot be empty');
  });
});
