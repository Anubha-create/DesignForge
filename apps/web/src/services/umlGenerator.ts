import { StructuredDesign, RelationshipType } from '@designforge/shared';

export class UmlGenerator {
  public static toMermaid(design: StructuredDesign): string {
    if (!design.classes || design.classes.length === 0) {
      return 'classDiagram\n    note "No classes defined yet. Add classes to generate UML diagram."';
    }

    const lines: string[] = ['classDiagram'];

    // 1. Render Interfaces
    if (design.interfaces) {
      for (const iface of design.interfaces) {
        lines.push(`    class ${iface.name} {`);
        lines.push(`        <<interface>>`);
        if (iface.methods) {
          for (const m of iface.methods) {
            const params = (m.parameters || []).map(p => `${p.type} ${p.name}`).join(', ');
            lines.push(`        +${m.name}(${params}) ${m.returnType}`);
          }
        }
        lines.push(`    }`);
      }
    }

    // 2. Render Classes
    for (const cls of design.classes) {
      lines.push(`    class ${cls.name} {`);
      
      // Attributes
      if (cls.attributes) {
        for (const attr of cls.attributes) {
          const vis = attr.visibility === 'public' ? '+' : attr.visibility === 'protected' ? '#' : '-';
          lines.push(`        ${vis}${attr.type} ${attr.name}`);
        }
      }

      // Methods
      if (cls.methods) {
        for (const m of cls.methods) {
          const vis = m.visibility === 'public' ? '+' : m.visibility === 'protected' ? '#' : '-';
          const params = (m.parameters || []).map(p => `${p.type} ${p.name}`).join(', ');
          lines.push(`        ${vis}${m.name}(${params}) ${m.returnType}`);
        }
      }

      lines.push(`    }`);
    }

    // 3. Render Relationships
    if (design.relationships) {
      for (const rel of design.relationships) {
        const symbol = this.getMermaidRelationSymbol(rel.type);
        const label = rel.label ? ` : "${rel.label}"` : '';
        lines.push(`    ${rel.source} ${symbol} ${rel.target}${label}`);
      }
    }

    return lines.join('\n');
  }

  private static getMermaidRelationSymbol(type: RelationshipType): string {
    switch (type) {
      case 'INHERITANCE':
        return '--|>';
      case 'IMPLEMENTATION':
        return '..|>';
      case 'COMPOSITION':
        return '*--';
      case 'AGGREGATION':
        return 'o--';
      case 'DEPENDENCY':
      default:
        return '..>';
    }
  }
}
