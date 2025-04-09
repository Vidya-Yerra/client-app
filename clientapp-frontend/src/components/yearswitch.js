'use client';
export default function YearSwitcher({ year, setYear }) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => setYear(year - 1)}
        className="text-lg bg-[#2d3748] hover:bg-[#374151] text-white px-3 py-1 rounded transition-all duration-200"
      >
        ⬅
      </button>
      <span className="text-xl font-semibold text-blue-500">{year}</span>
      <button
        onClick={() => setYear(year + 1)}
        className="text-lg bg-[#2d3748] hover:bg-[#374151] text-white px-3 py-1 rounded transition-all duration-200"
      >
        ➡
      </button>
    </div>
  );
}
