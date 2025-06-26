
export type Operator = '+' | '-' | '×' | '÷';

export interface EquationDetail {
  id: number;
  op1Pos: [number, number];
  op2Pos: [number, number];
  resPos: [number, number];
  operator: Operator;
  operatorPos: [number, number];
  equalsPos: [number, number];
  // One correct canonical solution
  solution: { op1: number; op2: number; result: number };
}

export interface LevelFormat {
  id: number;
  rows: number;
  cols: number;
  fixedCells: Record<string, number | Operator | '='>; // Key: "row-col"
  equations: EquationDetail[];
  draggableNumbers: number[];
  name: string; // e.g. "Niveli 1: Mbledhje e Thjeshtë"
}

export interface CellState {
  value: number | string | null; // Current value, null if empty blank
  type: 'fixed' | 'blank' | 'operator' | 'equals' | 'empty';
  isTarget: boolean; // Is it a droppable blank cell?
  isCorrect?: boolean; // For styling if part of a correct equation
  isFilled?: boolean; // If a blank cell has been filled
  row: number;
  col: number;
  fixedValue?: number | string; // Original fixed value
  equationMember?: { equationId: number; role: 'op1' | 'op2' | 'result' };
}

export interface FilledValues {
  [key: string]: number; // "row-col": number
}

export interface DraggableNumberItem {
  id: string; // Unique ID for dnd, e.g., `num-${value}-${index}`
  value: number;
  isUsed: boolean; // To track if it's currently placed on the board
}
