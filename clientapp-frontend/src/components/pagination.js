'use client';

export default function Pagination({ currentPage, totalItems, pageSize, onPageChange }) {
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="mt-4 flex justify-center gap-2">
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index + 1}
          onClick={() => onPageChange(index + 1)}
          className={`px-3 py-1 border border-[#475569] rounded text-white transition-all duration-200 ${
            currentPage === index + 1 
              ? 'bg-[#2d3748] hover:bg-[#374151] font-semibold' 
              : 'bg-[#1f2937] hover:bg-[#2d3748]'
          }`}
        >
          {index + 1}
        </button>
      ))}
    </div>
  );
}
