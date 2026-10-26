export interface HistorySnapshot {
  content: string;
  selectionStart: number;
  selectionEnd: number;
  timestamp: number;
  label?: string;
}

export class EditorHistory {
  private undoStack: HistorySnapshot[] = [];
  private redoStack: HistorySnapshot[] = [];
  private maxDepth: number;

  constructor(maxDepth: number = 100) {
    this.maxDepth = maxDepth;
  }

  public push(snapshot: HistorySnapshot): void {
    // Avoid pushing duplicate identical states
    const top = this.undoStack[this.undoStack.length - 1];
    if (top && top.content === snapshot.content) {
      return;
    }

    this.undoStack.push(snapshot);
    if (this.undoStack.length > this.maxDepth) {
      this.undoStack.shift();
    }
    // Clear redo stack on new modification
    this.redoStack = [];
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public undo(currentSnapshot: HistorySnapshot): HistorySnapshot | null {
    if (!this.canUndo()) return null;

    // Push current state to redo
    this.redoStack.push(currentSnapshot);
    return this.undoStack.pop() ?? null;
  }

  public redo(currentSnapshot: HistorySnapshot): HistorySnapshot | null {
    if (!this.canRedo()) return null;

    // Push current state to undo
    this.undoStack.push(currentSnapshot);
    return this.redoStack.pop() ?? null;
  }

  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  public size(): { undo: number; redo: number } {
    return {
      undo: this.undoStack.length,
      redo: this.redoStack.length,
    };
  }
}
