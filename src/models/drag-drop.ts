// Drag & Drop Interfaces
export interface Draggable {
  dragStartHandler(e: DragEvent): void; // DragEvent 與先前 SubmitEvent 同為 TypeScript 內建類型 (由 lib.dom 庫提供支持)
  dragEndHandler(e: DragEvent): void;
}

export interface DragTarget {
  dragOverHandler(e: DragEvent): void;
  dropHandler(e: DragEvent): void;
  dragLeaveHandler(e: DragEvent): void;
}
