'use client';

export default function Pagination({ currentPage, totalItems, pageSize, onPageChange }) {
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="mt-4 flex justify-center gap-2">
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index + 1}
          onClick={() => onPageChange(index + 1)}
          className={`px-3 py-1 border rounded ${
            currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-white'
          }`}
        >
          {index + 1}
        </button>
      ))}
    </div>
  );
}
