import { 
  StructuredDesign, 
  EvaluationResult, 
  DesignDiff, 
  EvaluationDimension,
  RelationshipType
} from '@designforge/shared';

export class DiffEngine {
  public static compare(
    prevAttemptId: string,
    prevAttemptNumber: number,
    prevDesign: StructuredDesign,
    prevEval: EvaluationResult,
    currAttemptId: string,
    currAttemptNumber: number,
    currDesign: StructuredDesign,
    currEval: EvaluationResult
  ): DesignDiff {
    const prevClassMap = new Map(prevDesign.classes.map(c => [c.name, c]));
    const currClassMap = new Map(currDesign.classes.map(c => [c.name, c]));

    const prevInterfaceMap = new Map((prevDesign.interfaces || []).map(i => [i.name, i]));
    const currInterfaceMap = new Map((currDesign.interfaces || []).map(i => [i.name, i]));

    // Added / Removed Classes
    const addedClasses: string[] = [];
    const removedClasses: string[] = [];
    const modifiedClasses: Array<{ name: string; changes: string[] }> = [];

    for (const [name, currClass] of currClassMap.entries()) {
      if (!prevClassMap.has(name)) {
        addedClasses.push(name);
      } else {
        const prevClass = prevClassMap.get(name)!;
        const changes: string[] = [];

        if (prevClass.responsibility !== currClass.responsibility) {
          changes.push(`Refined responsibility: "${currClass.responsibility}"`);
        }

        const prevMethods = new Set(prevClass.methods?.map(m => m.name) || []);
        const currMethods = new Set(currClass.methods?.map(m => m.name) || []);

        for (const m of currMethods) {
          if (!prevMethods.has(m)) changes.push(`Added method +${m}()`);
        }
        for (const m of prevMethods) {
          if (!currMethods.has(m)) changes.push(`Removed method -${m}()`);
        }

        if (changes.length > 0) {
          modifiedClasses.push({ name, changes });
        }
      }
    }

    for (const name of prevClassMap.keys()) {
      if (!currClassMap.has(name)) {
        removedClasses.push(name);
      }
    }

    // Added / Removed Interfaces
    const addedInterfaces: string[] = [];
    const removedInterfaces: string[] = [];

    for (const name of currInterfaceMap.keys()) {
      if (!prevInterfaceMap.has(name)) {
        addedInterfaces.push(name);
      }
    }
    for (const name of prevInterfaceMap.keys()) {
      if (!currInterfaceMap.has(name)) {
        removedInterfaces.push(name);
      }
    }

    // Relationships diff
    const makeRelKey = (r: { source: string; target: string; type: RelationshipType }) => 
      `${r.source}::${r.type}::${r.target}`;

    const prevRelMap = new Map((prevDesign.relationships || []).map(r => [makeRelKey(r), r]));
    const currRelMap = new Map((currDesign.relationships || []).map(r => [makeRelKey(r), r]));

    const addedRelationships: Array<{ source: string; target: string; type: RelationshipType }> = [];
    const removedRelationships: Array<{ source: string; target: string; type: RelationshipType }> = [];

    for (const [key, rel] of currRelMap.entries()) {
      if (!prevRelMap.has(key)) {
        addedRelationships.push({ source: rel.source, target: rel.target, type: rel.type });
      }
    }
    for (const [key, rel] of prevRelMap.entries()) {
      if (!currRelMap.has(key)) {
        removedRelationships.push({ source: rel.source, target: rel.target, type: rel.type });
      }
    }

    // Dimension Deltas
    const prevScoreMap = new Map(prevEval.dimensionScores.map(d => [d.dimension, d.score]));
    const currScoreMap = new Map(currEval.dimensionScores.map(d => [d.dimension, d.score]));

    const dimensionDeltas: Array<{
      dimension: EvaluationDimension;
      previousScore: number;
      currentScore: number;
      delta: number;
    }> = [];

    const improvements: string[] = [];
    const regressions: string[] = [];

    for (const [dimension, currScore] of currScoreMap.entries()) {
      const prevScore = prevScoreMap.get(dimension) || 0;
      const delta = Math.round((currScore - prevScore) * 10) / 10;

      dimensionDeltas.push({
        dimension,
        previousScore: prevScore,
        currentScore: currScore,
        delta
      });

      if (delta >= 1.0) {
        improvements.push(`${dimension} improved (+${delta})`);
      } else if (delta <= -1.0) {
        regressions.push(`${dimension} regressed (${delta})`);
      }
    }

    const scoreDelta = currEval.overallScore - prevEval.overallScore;
    let verdict: 'IMPROVED' | 'REGRESSED' | 'STABLE' = 'STABLE';
    if (scoreDelta > 3) verdict = 'IMPROVED';
    else if (scoreDelta < -3) verdict = 'REGRESSED';

    // Narrative generation
    let narrative = '';
    if (verdict === 'IMPROVED') {
      narrative = `Between Attempt ${prevAttemptNumber} and Attempt ${currAttemptNumber}, your design health increased from ${prevEval.overallScore} to ${currEval.overallScore} (+${scoreDelta} pts). Key architectural evolution: ${
        addedInterfaces.length > 0 ? `introduced abstraction interfaces (${addedInterfaces.join(', ')}), ` : ''
      }${addedClasses.length > 0 ? `decomposed responsibilities across new entities (${addedClasses.join(', ')}), ` : ''}improving cohesion and decoupling core business logic.`;
    } else if (verdict === 'REGRESSED') {
      narrative = `Between Attempt ${prevAttemptNumber} and Attempt ${currAttemptNumber}, design health decreased from ${prevEval.overallScore} to ${currEval.overallScore} (${scoreDelta} pts). The changes introduced higher coupling or unnecessary abstraction complexity.`;
    } else {
      narrative = `Attempt ${currAttemptNumber} maintained a stable score (${currEval.overallScore}) compared to Attempt ${prevAttemptNumber} (${prevEval.overallScore}). Responsibilities remained largely consistent.`;
    }

    return {
      previousAttemptId: prevAttemptId,
      previousAttemptNumber: prevAttemptNumber,
      currentAttemptId: currAttemptId,
      currentAttemptNumber: currAttemptNumber,
      previousScore: prevEval.overallScore,
      currentScore: currEval.overallScore,
      scoreDelta,
      addedClasses,
      removedClasses,
      modifiedClasses,
      addedInterfaces,
      removedInterfaces,
      addedRelationships,
      removedRelationships,
      dimensionDeltas,
      improvements,
      regressions,
      verdict,
      narrativeSummary: narrative
    };
  }
}
