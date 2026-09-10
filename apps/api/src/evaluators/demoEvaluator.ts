import { 
  EvaluationResult, 
  EvaluationRating, 
  EvaluationDimension, 
  EvaluationCriterionResult, 
  DimensionScore 
} from '@designforge/shared';
import { Evaluator, EvaluationInput } from '../domain/evaluator.js';

export class DemoEvaluator implements Evaluator {
  public async evaluate(input: EvaluationInput): Promise<EvaluationResult> {
    const { problem, design, attemptNumber } = input;
    const classNames = new Set(design.classes.map(c => c.name.toLowerCase()));
    const interfaceNames = new Set(design.interfaces.map(i => i.name.toLowerCase()));
    const allEntities = new Set([...classNames, ...interfaceNames]);
    const patternNames = new Set(design.patterns.map(p => p.name.toLowerCase()));

    // Heuristic inspections on structural signals
    const hasStrategy = Array.from(patternNames).some(p => p.includes('strategy')) ||
      Array.from(interfaceNames).some(i => i.includes('strategy') || i.includes('policy') || i.includes('calculator'));
    
    const hasFactory = Array.from(patternNames).some(p => p.includes('factory')) ||
      Array.from(classNames).some(c => c.includes('factory'));
    
    const hasObserver = Array.from(patternNames).some(p => p.includes('observer') || p.includes('listener')) ||
      Array.from(interfaceNames).some(i => i.includes('observer') || i.includes('listener') || i.includes('subscriber'));

    const godClass = design.classes.find(c => (c.methods?.length || 0) + (c.attributes?.length || 0) > 10);
    const hasInterfaces = design.interfaces.length > 0;
    const hasClearTradeoffs = design.tradeoffs && design.tradeoffs.length > 0;
    const hasEdgeCases = design.edgeCases && design.edgeCases.length > 0;
    const hasAssumptions = design.assumptions && design.assumptions.length > 0;

    // Build 12 dimension results
    const criterionResults: EvaluationCriterionResult[] = [];

    // 1. Requirement Understanding
    const reqScore = Math.min(10, Math.max(6, 6 + (hasAssumptions ? 2 : 0) + (design.classes.length >= 3 ? 2 : 0)));
    criterionResults.push({
      dimension: 'Requirement Understanding',
      score: reqScore,
      status: this.getRating(reqScore),
      evidence: hasAssumptions
        ? `Found ${design.assumptions.length} explicit engineering assumptions covering functional scope.`
        : `Design models ${design.classes.length} entities for '${problem.title}' without explicit assumptions.`,
      concern: hasAssumptions ? 'None identified.' : 'Missing explicit boundaries for capacity and concurrency.',
      suggestion: 'Document concurrency guarantees and throughput boundaries in assumptions.',
      confidence: 'HIGH'
    });

    // 2. Responsibility Assignment
    let respScore = 7;
    let respEvidence = 'Responsibilities mapped to isolated domain entities.';
    let respConcern = 'Adequate responsibility boundary.';
    let respSuggestion = 'Keep domain entities focused on state management.';
    if (godClass) {
      respScore = 5.5;
      respEvidence = `Class '${godClass.name}' aggregates ${godClass.methods?.length || 0} methods and ${godClass.attributes?.length || 0} attributes.`;
      respConcern = `'${godClass.name}' acts as a Coordinator and God Object, violating Single Responsibility Principle (SRP).`;
      respSuggestion = `Extract orchestrator or domain sub-services from '${godClass.name}' into dedicated delegates.`;
    } else if (design.classes.length >= 4) {
      respScore = 9.0;
      respEvidence = `Clean decomposition across ${design.classes.map(c => c.name).join(', ')}.`;
      respConcern = 'Minor overlap in lifecycle coordination.';
      respSuggestion = 'Verify that state transitions are managed inside the respective entity.';
    }
    criterionResults.push({
      dimension: 'Responsibility Assignment',
      score: respScore,
      status: this.getRating(respScore),
      evidence: respEvidence,
      concern: respConcern,
      suggestion: respSuggestion,
      confidence: 'HIGH'
    });

    // 3. Coupling
    const relCount = design.relationships.length;
    const couplingScore = relCount > design.classes.length * 2.5 ? 5.5 : 8.5;
    criterionResults.push({
      dimension: 'Coupling',
      score: couplingScore,
      status: this.getRating(couplingScore),
      evidence: `${relCount} explicit structural relationships declared across ${design.classes.length} classes.`,
      concern: couplingScore < 7 ? 'High direct reference density increases ripple effects during requirement evolution.' : 'Coupling is well bounded.',
      suggestion: couplingScore < 7 ? 'Introduce event notification or mediator abstractions to decouple peer components.' : 'Maintain loose coupling using dependency inversion.',
      confidence: 'HIGH'
    });

    // 4. Cohesion
    const cohesionScore = godClass ? 6.0 : 8.5;
    criterionResults.push({
      dimension: 'Cohesion',
      score: cohesionScore,
      status: this.getRating(cohesionScore),
      evidence: godClass ? `Multiple unrelated operations located inside '${godClass.name}'.` : 'Entities contain focused methods operating on their respective attributes.',
      concern: godClass ? 'Low functional cohesion.' : 'No major cohesion smells detected.',
      suggestion: 'Group methods that mutate shared state together and isolate auxiliary utilities.',
      confidence: 'HIGH'
    });

    // 5. Encapsulation
    let hasPrivateAttrs = true;
    for (const c of design.classes) {
      if (c.attributes.some(a => a.visibility === 'public')) {
        hasPrivateAttrs = false;
        break;
      }
    }
    const encScore = hasPrivateAttrs ? 9.0 : 6.0;
    criterionResults.push({
      dimension: 'Encapsulation',
      score: encScore,
      status: this.getRating(encScore),
      evidence: hasPrivateAttrs ? 'All model attributes enforce private or protected visibility.' : 'Direct public attribute exposure detected on domain models.',
      concern: hasPrivateAttrs ? 'Encapsulation is strongly preserved.' : 'Breaches Law of Demeter and allows arbitrary external state mutations.',
      suggestion: 'Encapsulate attributes with protected getters and domain-specific mutators.',
      confidence: 'HIGH'
    });

    // 6. Interfaces
    const ifaceScore = hasInterfaces ? 8.5 : 5.0;
    criterionResults.push({
      dimension: 'Interfaces',
      score: ifaceScore,
      status: this.getRating(ifaceScore),
      evidence: hasInterfaces 
        ? `Defined ${design.interfaces.length} explicit interfaces: ${design.interfaces.map(i => i.name).join(', ')}.`
        : 'Zero interfaces defined; concrete classes are directly coupled to implementations.',
      concern: hasInterfaces ? 'Ensure interfaces adhere to Interface Segregation Principle (ISP).' : 'Violates Dependency Inversion Principle (DIP).',
      suggestion: hasInterfaces ? 'Verify clients only depend on methods they actually consume.' : 'Abstract external dependencies behind polymorphic contracts.',
      confidence: 'HIGH'
    });

    // 7. Abstraction
    const absScore = hasStrategy || hasInterfaces ? 8.5 : 6.0;
    criterionResults.push({
      dimension: 'Abstraction',
      score: absScore,
      status: this.getRating(absScore),
      evidence: hasStrategy ? 'Employs Strategy/Policy abstractions for variable algorithms.' : 'Direct conditional procedural branches used for behavior selection.',
      concern: hasStrategy ? 'Avoid speculative generality if requirements are uniform.' : 'Open/Closed Principle (OCP) violation on behavioral branching.',
      suggestion: 'Replace switch/case branching with polymorphism where behaviors vary by type.',
      confidence: 'HIGH'
    });

    // 8. Pattern Fit
    const patScore = design.patterns.length > 0 ? 8.5 : 6.0;
    criterionResults.push({
      dimension: 'Pattern Fit',
      score: patScore,
      status: this.getRating(patScore),
      evidence: design.patterns.length > 0
        ? `Selected patterns: ${design.patterns.map(p => p.name).join(', ')}.`
        : 'No formalized GoF patterns declared in design metadata.',
      concern: design.patterns.length > 0 ? 'Ensure patterns are justified by clear domain trade-offs.' : 'Missed opportunity to leverage established patterns.',
      suggestion: 'Always document the trade-off costs of introduced patterns.',
      confidence: 'HIGH'
    });

    // 9. Extensibility
    const extScore = hasStrategy && hasInterfaces ? 9.0 : 6.5;
    criterionResults.push({
      dimension: 'Extensibility',
      score: extScore,
      status: this.getRating(extScore),
      evidence: hasStrategy ? 'New variations can be added by implementing existing interfaces without altering core engines.' : 'Adding new types requires modifying existing core classes.',
      concern: extScore < 8 ? 'Violates OCP when expanding to accommodate new requirement variants.' : 'Extensibility points are well isolated.',
      suggestion: 'Decouple core dispatch mechanisms from concrete subtypes using polymorphic registration.',
      confidence: 'HIGH'
    });

    // 10. Edge Cases
    const edgeScore = hasEdgeCases ? 8.5 : 5.5;
    criterionResults.push({
      dimension: 'Edge Cases',
      score: edgeScore,
      status: this.getRating(edgeScore),
      evidence: hasEdgeCases 
        ? `Declared ${design.edgeCases.length} edge cases: ${design.edgeCases.slice(0, 2).join('; ')}.`
        : 'No edge case handling declared in architectural specifications.',
      concern: hasEdgeCases ? 'Ensure domain invariants defend against declared edge conditions.' : 'High risk of unhandled runtime exceptions during boundary states.',
      suggestion: 'Specify fallback and retry semantics for full-capacity and race-condition states.',
      confidence: 'HIGH'
    });

    // 11. Testability
    const testScore = hasInterfaces ? 8.5 : 6.0;
    criterionResults.push({
      dimension: 'Testability',
      score: testScore,
      status: this.getRating(testScore),
      evidence: hasInterfaces ? 'Interfaces allow unit testing with mock implementations.' : 'Hard dependencies on concrete implementations impede isolated unit testing.',
      concern: testScore < 8 ? 'Unit tests would require end-to-end component instantiation.' : 'System components can be tested in isolation.',
      suggestion: 'Inject dependencies via constructor rather than instantiating them internally.',
      confidence: 'HIGH'
    });

    // 12. Explanation Quality
    const expScore = hasClearTradeoffs ? 8.5 : 6.0;
    criterionResults.push({
      dimension: 'Explanation Quality',
      score: expScore,
      status: this.getRating(expScore),
      evidence: hasClearTradeoffs 
        ? `Articulated ${design.tradeoffs.length} engineering trade-offs.`
        : 'Trade-offs are not documented.',
      concern: hasClearTradeoffs ? 'Good reasoning.' : 'Senior interviewers require explicit defense of architectural trade-offs.',
      suggestion: 'Explicitly explain memory vs performance and simplicity vs flexibility trade-offs.',
      confidence: 'HIGH'
    });

    // Calculate aggregated overall score
    const totalScore = criterionResults.reduce((acc, c) => acc + c.score, 0);
    const overallScore = Math.round((totalScore / (criterionResults.length * 10)) * 100);
    const overallRating = this.getRating(overallScore / 10);

    const dimensionScores: DimensionScore[] = criterionResults.map(c => ({
      dimension: c.dimension,
      score: Math.round(c.score * 10) / 10,
      maxScore: 10
    }));

    // Generate Senior Engineer Review summary
    const seniorReviewSummary = this.generateSeniorReview(
      problem.title,
      overallScore,
      godClass?.name,
      hasStrategy,
      hasInterfaces
    );

    const topRecommendations = this.generateTopRecommendations(godClass?.name, hasStrategy, hasInterfaces);

    return {
      overallScore,
      rating: overallRating,
      seniorReviewSummary,
      topRecommendations,
      dimensionScores,
      criterionResults,
      evaluatorType: 'DEMO',
      evaluatedAt: new Date().toISOString()
    };
  }

  private getRating(scoreOutOfTen: number): EvaluationRating {
    if (scoreOutOfTen >= 8.2) return 'STRONG';
    if (scoreOutOfTen >= 7.0) return 'GOOD';
    if (scoreOutOfTen >= 5.5) return 'NEEDS ATTENTION';
    return 'CRITICAL';
  }

  private generateSeniorReview(
    problemTitle: string,
    score: number,
    godClassName?: string,
    hasStrategy?: boolean,
    hasInterfaces?: boolean
  ): string {
    if (score >= 82) {
      return `Your design for ${problemTitle} demonstrates senior-level architectural maturity. Key domain responsibilities are cleanly decoupled, domain entities encapsulate internal state, and polymorphic contracts protect the core workflow from cascading change. The primary opportunity for improvement lies in documenting explicit concurrency bounds and defensive exception fallbacks.`;
    } else if (score >= 70) {
      return `Solid foundational design for ${problemTitle}. The domain entities model the problem domain effectively. However, responsibility boundaries remain somewhat blurry${godClassName ? ` around '${godClassName}'` : ''}, which limits extensibility. To advance this to an L5/L6 architectural standard, decouple algorithmic policies using interfaces and dependency injection.`;
    } else {
      return `Your design captures the basic operational requirements for ${problemTitle}, but exhibits significant architectural coupling. Core logic is centralized rather than delegated, violating Single Responsibility and Open/Closed principles. Extract interfaces for variable behaviors and eliminate direct concrete dependencies before taking this to production.`;
    }
  }

  private generateTopRecommendations(godClassName?: string, hasStrategy?: boolean, hasInterfaces?: boolean): string[] {
    const recs: string[] = [];
    if (godClassName) {
      recs.push(`Decompose '${godClassName}' by extracting calculation or state persistence responsibilities into dedicated worker delegates.`);
    }
    if (!hasStrategy) {
      recs.push('Introduce Strategy or Policy interfaces to decouple variable business algorithms from structural domain entities.');
    }
    if (!hasInterfaces) {
      recs.push('Invert dependencies by defining explicit interface contracts for external collaborators to boost testability.');
    }
    if (recs.length < 3) {
      recs.push('Specify explicit concurrency locks or thread-safety guarantees for shared mutable resource pools.');
    }
    if (recs.length < 3) {
      recs.push('Document the trade-off costs of added abstractions to justify architectural complexity in technical reviews.');
    }
    return recs.slice(0, 3);
  }
}
