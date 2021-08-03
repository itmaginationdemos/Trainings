export const Positions = ['query', 'params'] as const;
export type Position = typeof Positions[number];

export interface FieldRequestPosition {field: string; position: Position;}
