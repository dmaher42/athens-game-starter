// Stub InputMap – logic will be added in Step 3
export class InputMap {
  private keys = new Set<string>();
  public pointerLocked = false;

  constructor(_canvas: HTMLCanvasElement | null = null) {}
  onLook(_dx: number, _dy: number) {}
  isDown(_code: string) { return false; }

  // convenience getters
  get forward() { return false; }
  get back()    { return false; }
  get left()    { return false; }
  get right()   { return false; }
  get sprint()  { return false; }
  get jump()    { return false; }
}
export default InputMap;
