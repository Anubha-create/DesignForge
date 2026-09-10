import { StructuredDesign } from '@designforge/shared';
import { DeterministicValidationResult, ValidationIssue } from '../domain/evaluator.js';

export class DeterministicEvaluator {
  public static validate(design: StructuredDesign): DeterministicValidationResult {
    const issues: ValidationIssue[] = [];

    // Check classes existence
    if (!design.classes || design.classes.length === 0) {
      issues.push({
        field: 'classes',
        message: 'A valid Low-Level Design must define at least one core class with defined responsibilities.',
        severity: 'ERROR'
      });
      return { isValid: false, issues };
    }

    const classNames = new Set<string>();
    const interfaceNames = new Set<string>();

    // Duplicate class names & responsibilities
    for (const cls of design.classes) {
      if (!cls.name || cls.name.trim().length === 0) {
        issues.push({
          field: 'classes',
          message: 'Found an unnamed class definition.',
          severity: 'ERROR'
        });
      } else if (classNames.has(cls.name)) {
        issues.push({
          field: `classes.${cls.name}`,
          message: `Duplicate class identifier '${cls.name}' detected. Class names must be unique.`,
          severity: 'ERROR'
        });
      } else {
        classNames.add(cls.name);
      }

      if (!cls.responsibility || cls.responsibility.trim().length < 5) {
        issues.push({
          field: `classes.${cls.name}.responsibility`,
          message: `Class '${cls.name}' is missing a concrete single-responsibility description.`,
          severity: 'WARNING'
        });
      }

      // Check method/attribute completeness
      if ((!cls.methods || cls.methods.length === 0) && (!cls.attributes || cls.attributes.length === 0)) {
        issues.push({
          field: `classes.${cls.name}`,
          message: `Class '${cls.name}' defines neither attributes nor methods. Anemic classes should be justified.`,
          severity: 'WARNING'
        });
      }
    }

    // Interfaces check
    if (design.interfaces) {
      for (const iface of design.interfaces) {
        if (!iface.name || iface.name.trim().length === 0) {
          issues.push({
            field: 'interfaces',
            message: 'Found an unnamed interface definition.',
            severity: 'ERROR'
          });
        } else if (interfaceNames.has(iface.name) || classNames.has(iface.name)) {
          issues.push({
            field: `interfaces.${iface.name}`,
            message: `Identifier '${iface.name}' conflicts with another class or interface.`,
            severity: 'ERROR'
          });
        } else {
          interfaceNames.add(iface.name);
        }

        if (!iface.methods || iface.methods.length === 0) {
          issues.push({
            field: `interfaces.${iface.name}`,
            message: `Interface '${iface.name}' contains no methods. Marker interfaces are discouraged unless explicitly justified.`,
            severity: 'WARNING'
          });
        }
      }
    }

    // Relationship reference integrity
    const allKnownEntities = new Set([...classNames, ...interfaceNames]);
    if (design.relationships) {
      for (const rel of design.relationships) {
        if (!allKnownEntities.has(rel.source)) {
          issues.push({
            field: `relationships.${rel.source}->${rel.target}`,
            message: `Relationship references unknown source entity '${rel.source}'.`,
            severity: 'ERROR'
          });
        }
        if (!allKnownEntities.has(rel.target)) {
          issues.push({
            field: `relationships.${rel.source}->${rel.target}`,
            message: `Relationship references unknown target entity '${rel.target}'.`,
            severity: 'ERROR'
          });
        }
        if (rel.source === rel.target) {
          issues.push({
            field: `relationships.${rel.source}`,
            message: `Self-referential relationship on '${rel.source}' must be modeled as an explicit pattern (e.g. Composite).`,
            severity: 'WARNING'
          });
        }
      }
    }

    // High coupling warning (if a class has > 6 direct relationships)
    const relationshipCounts = new Map<string, number>();
    for (const rel of design.relationships || []) {
      relationshipCounts.set(rel.source, (relationshipCounts.get(rel.source) || 0) + 1);
      relationshipCounts.set(rel.target, (relationshipCounts.get(rel.target) || 0) + 1);
    }
    for (const [entity, count] of relationshipCounts.entries()) {
      if (count >= 7) {
        issues.push({
          field: `coupling.${entity}`,
          message: `Entity '${entity}' is engaged in ${count} relationships. High coupling detected; consider applying Facade, Mediator, or Strategy patterns.`,
          severity: 'WARNING'
        });
      }
    }

    const hasErrors = issues.some(i => i.severity === 'ERROR');
    return {
      isValid: !hasErrors,
      issues
    };
  }
}
