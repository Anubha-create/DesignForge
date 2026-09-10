import { Evaluator } from '../domain/evaluator.js';
import { DemoEvaluator } from './demoEvaluator.js';
import { AiEvaluator } from './aiEvaluator.js';

export class EvaluatorFactory {
  public static getEvaluator(): Evaluator {
    const isDemoMode = process.env.DEMO_MODE === 'true';
    const apiKey = process.env.OPENAI_API_KEY;

    if (isDemoMode || !apiKey || apiKey.trim().length === 0) {
      return new DemoEvaluator();
    }

    return new AiEvaluator(apiKey);
  }
}
