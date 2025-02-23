import { Button } from "@/components/ui/button";

interface KeypadProps {
  onNumberPress: (num: number) => void;
  onClear: () => void;
}

export function Keypad({ onNumberPress, onClear }: KeypadProps) {
  return (
    <div className="grid grid-cols-3 gap-2 p-4 bg-gray-100 rounded-lg shadow-inner">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <Button
          key={num}
          variant="outline"
          className="h-16 text-2xl font-bold bg-white hover:bg-gray-50"
          onClick={() => onNumberPress(num)}
        >
          {num}
        </Button>
      ))}
      <Button
        variant="outline"
        className="h-16 text-2xl font-bold bg-red-50 hover:bg-red-100 text-red-600"
        onClick={onClear}
      >
        Clear
      </Button>
      <Button
        variant="outline"
        className="h-16 text-2xl font-bold bg-white hover:bg-gray-50"
        onClick={() => onNumberPress(0)}
      >
        0
      </Button>
      <div /> {/* Empty space where Enter button was */}
    </div>
  );
}