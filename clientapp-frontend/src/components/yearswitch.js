'use client';
export default function YearSwitcher({ year, setYear }) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => setYear(year - 1)}
        className="text-lg bg-gray-200 px-3 py-1 rounded"
      >
        ⬅
      </button>
      <span className="text-xl font-semibold">{year}</span>
      <button
        onClick={() => setYear(year + 1)}
        className="text-lg bg-gray-200 px-3 py-1 rounded"
      >
        ➡
      </button>
    </div>
  );
}
