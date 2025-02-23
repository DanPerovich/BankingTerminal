import { Button } from "@/components/ui/button";

interface KeypadProps {
  onNumberPress: (num: number) => void;
  onClear: () => void;
  onDecimalPoint: () => void;
}

export function Keypad({ onNumberPress, onClear, onDecimalPoint }: KeypadProps) {
  return (
    <div className="grid grid-cols-3 gap-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-inner">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <Button
          key={num}
          variant="outline"
          className="h-16 text-2xl font-bold bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 dark:text-gray-100"
          onClick={() => onNumberPress(num)}
        >
          {num}
        </Button>
      ))}
      <Button
        variant="outline"
        className="h-16 text-2xl font-bold bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
        onClick={onClear}
      >
        Clear
      </Button>
      <Button
        variant="outline"
        className="h-16 text-2xl font-bold bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 dark:text-gray-100"
        onClick={() => onNumberPress(0)}
      >
        0
      </Button>
      <Button
        variant="outline"
        className="h-16 text-2xl font-bold bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 dark:text-gray-100"
        onClick={onDecimalPoint}
      >
        .
      </Button>
    </div>
  );
}