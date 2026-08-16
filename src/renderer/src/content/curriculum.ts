export interface CurriculumEntry {
  id: string
  title: string
  level: 'beginner' | 'intermediate' | 'advanced'
  available: boolean
}

/**
 * The full roadmap of the vision — beginner through advanced. Only
 * `variables-and-data-types` has real content wired up right now; the
 * rest are the map CoreTana is going to walk you through next.
 */
export const CURRICULUM: CurriculumEntry[] = [
  { id: 'variables-and-data-types', title: 'Variables & Data Types', level: 'beginner', available: true },
  { id: 'operators-and-control-flow', title: 'Operators & Control Flow', level: 'beginner', available: false },
  { id: 'collections', title: 'Lists, Sets & Maps', level: 'beginner', available: false },
  { id: 'sobjects-and-dml', title: 'sObjects & DML', level: 'beginner', available: false },
  { id: 'soql-basics', title: 'SOQL Basics', level: 'beginner', available: false },
  { id: 'classes-and-methods', title: 'Classes, Methods & Objects', level: 'intermediate', available: false },
  { id: 'triggers', title: 'Triggers & Trigger Context', level: 'intermediate', available: false },
  { id: 'governor-limits', title: 'Governor Limits & Bulkification', level: 'intermediate', available: false },
  { id: 'exceptions', title: 'Exception Handling', level: 'intermediate', available: false },
  { id: 'testing', title: 'Test Classes & Test Data', level: 'intermediate', available: false },
  { id: 'async-apex', title: 'Async Apex: Future, Queueable, Batch', level: 'advanced', available: false },
  { id: 'design-patterns', title: 'Apex Design Patterns', level: 'advanced', available: false },
  { id: 'integrations', title: 'Callouts & Integrations', level: 'advanced', available: false }
]
