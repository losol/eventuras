interface NumberCardProps {
  number: number | undefined;
  label: string;
}

const NumberCard: React.FC<NumberCardProps> = ({ number, label }) => {
  return (
    <div className="flex flex-col items-center justify-center p-2 bg-white rounded-md shadow-md dark:bg-black">
      <span className="text-3xl font-bold text-gray-800 dark:text-white">{number ?? '?'}</span>
      <span className="text-sm font-semibold text-gray-400 dark:text-gray-300">{label}</span>
    </div>
  );
};

export default NumberCard;
