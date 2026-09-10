import { 
  StructuredDesign, 
  BreakMyDesignInput, 
  BreakMyDesignEvaluation, 
  EvaluationRating, 
  RequirementChangeSpec 
} from '@designforge/shared';

export class ResilienceEngine {
  public static evaluateResilience(
    design: StructuredDesign,
    challenge: RequirementChangeSpec,
    submission: BreakMyDesignInput
  ): BreakMyDesignEvaluation {
    const totalClasses = design.classes.length || 1;
    const affectedClassesCount = submission.affectedClasses.length;
    const affectedInterfacesCount = submission.affectedInterfaces.length;

    // Calculate blast radius (ratio of affected classes to total classes)
    const blastRadiusRatio = affectedClassesCount / totalClasses;

    // Open-Closed Principle analysis:
    // If user solves the new requirement by EXTENDING via new classes/interfaces rather than
    // modifying many core classes, resilience is high!
    let baseResilience = 88;
    const evidence: string[] = [];

    if (blastRadiusRatio <= 0.25) {
      baseResilience += 8;
      evidence.push(`Low blast radius: only ${affectedClassesCount} of ${totalClasses} classes (${Math.round(blastRadiusRatio * 100)}%) require modification.`);
    } else if (blastRadiusRatio > 0.5) {
      baseResilience -= 18;
      evidence.push(`High blast radius: ${affectedClassesCount} of ${totalClasses} classes (${Math.round(blastRadiusRatio * 100)}%) require structural modification, indicating tight coupling.`);
    } else {
      evidence.push(`Moderate blast radius: ${affectedClassesCount} classes affected (${Math.round(blastRadiusRatio * 100)}% of architecture).`);
    }

    // Interface stability
    if (affectedInterfacesCount === 0) {
      baseResilience += 4;
      evidence.push('Core interfaces remain 100% stable; existing contracts do not break client code.');
    } else {
      baseResilience -= affectedInterfacesCount * 3;
      evidence.push(`${affectedInterfacesCount} interface contracts altered; check whether existing consumers require recompilation.`);
    }

    // Check reasoning depth
    if (submission.reasoning.length > 80) {
      baseResilience += 2;
      evidence.push('Detailed architectural rationale provided defending separation of new concerns.');
    }

    // Check trade-offs
    if (submission.tradeoffs.length > 0) {
      baseResilience += 2;
      evidence.push(`Acknowledged architectural trade-offs: ${submission.tradeoffs.slice(0, 2).join('; ')}.`);
    }

    const resilienceScore = Math.min(100, Math.max(35, Math.round(baseResilience)));

    let rating: EvaluationRating = 'GOOD';
    if (resilienceScore >= 85) rating = 'STRONG';
    else if (resilienceScore < 60) rating = 'NEEDS ATTENTION';

    const couplingImpact: 'LOW' | 'MEDIUM' | 'HIGH' = 
      blastRadiusRatio <= 0.3 ? 'LOW' : blastRadiusRatio <= 0.6 ? 'MEDIUM' : 'HIGH';

    const extensibilityRating: 'STRONG' | 'MODERATE' | 'POOR' =
      resilienceScore >= 80 ? 'STRONG' : resilienceScore >= 60 ? 'MODERATE' : 'POOR';

    const regressionRisk: 'LOW' | 'MEDIUM' | 'HIGH' =
      affectedInterfacesCount > 1 || blastRadiusRatio > 0.5 ? 'HIGH' : blastRadiusRatio > 0.25 ? 'MEDIUM' : 'LOW';

    const modificationVsExtension = blastRadiusRatio <= 0.35
      ? 'Adheres strongly to Open/Closed Principle (OCP): new behavior is added predominantly through extension.'
      : 'Violates Open/Closed Principle: requires invasive modifications to existing concrete orchestrators.';

    const recommendations: string[] = [];
    if (couplingImpact !== 'LOW') {
      recommendations.push('Introduce a specialized strategy or pluggable decorator instead of modifying core entity methods.');
    }
    if (affectedInterfacesCount > 0) {
      recommendations.push('Apply Interface Segregation: create an optional sub-interface (e.g., ChargeableSpot) rather than bloating the base contract.');
    }
    if (recommendations.length === 0) {
      recommendations.push('Maintain backward compatibility by providing default no-op implementations for non-EV spots.');
      recommendations.push('Ensure billing calculations handle concurrent charging and parking durations safely.');
    }

    const verdictSummary = `Your architecture demonstrated ${resilienceScore}% resilience against the '${challenge.title}' requirement change. ${modificationVsExtension}`;

    return {
      resilienceScore,
      rating,
      affectedClassesCount,
      affectedInterfacesCount,
      newAbstractionsCount: Math.max(1, affectedClassesCount > 0 ? 1 : 0),
      couplingImpact,
      extensibilityRating,
      modificationVsExtension,
      regressionRisk,
      evidence,
      verdictSummary,
      recommendations
    };
  }
}
