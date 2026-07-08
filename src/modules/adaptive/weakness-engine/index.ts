// analysis layer detecting student learning gaps from incorrect assessment questions
export interface QuestionMetadata {
  id: string;
  concept: string;
  pattern: string;
  questionType: string;
  difficulty: string;
}

export interface WeaknessAnalysisResult {
  weakConcepts: string[];
  weakPatterns: string[];
  weakQuestionTypes: string[];
}

export class WeaknessEngine {
  // analyze incorrect questions and return compiled weak metrics
  async analyze(wrongQuestionIds: string[], questionMetadata: QuestionMetadata[]): Promise<WeaknessAnalysisResult> {
    const wrongMetadata = questionMetadata.filter((q) => wrongQuestionIds.includes(q.id));

    const conceptsMap: Record<string, number> = {};
    const patternsMap: Record<string, number> = {};
    const typesMap: Record<string, number> = {};

    for (const q of wrongMetadata) {
      if (q.concept) {
        conceptsMap[q.concept] = (conceptsMap[q.concept] || 0) + 1;
      }
      if (q.pattern) {
        patternsMap[q.pattern] = (patternsMap[q.pattern] || 0) + 1;
      }
      if (q.questionType) {
        typesMap[q.questionType] = (typesMap[q.questionType] || 0) + 1;
      }
    }

    // sort and return unique weak concept list
    const weakConcepts = Object.keys(conceptsMap).sort((a, b) => conceptsMap[b] - conceptsMap[a]);
    const weakPatterns = Object.keys(patternsMap).sort((a, b) => patternsMap[b] - patternsMap[a]);
    const weakQuestionTypes = Object.keys(typesMap).sort((a, b) => typesMap[b] - typesMap[a]);

    return {
      weakConcepts,
      weakPatterns,
      weakQuestionTypes,
    };
  }
}

export const weaknessEngine = new WeaknessEngine();
