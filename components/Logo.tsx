import { Enso } from "./Ink";

export function Logo() {
  return (
    <span className="logo">
      <Enso size={30} stroke={11} />
      <span>koan</span>
    </span>
  );
}
