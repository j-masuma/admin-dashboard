import React, { ChangeEvent } from 'react';

interface RoomFilterProps {
  filters: {
    type: string;
    available: string;
  };
  onFilterChange: (filters: { type: string; available: string }) => void;
}

export const RoomFilter: React.FC<RoomFilterProps> = ({ filters, onFilterChange }) => {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <div className="flex space-x-4 mb-4">
      <select
        name="type"
        value={filters.type}
        onChange={handleChange}
        className="border p-2 rounded"
      >
        <option value="">All Types</option>
        <option value="Single">Single</option>
        <option value="Double">Double</option>
        <option value="Suite">Suite</option>
      </select>

      <select
        name="available"
        value={filters.available}
        onChange={handleChange}
        className="border p-2 rounded"
      >
        <option value="">All</option>
        <option value="true">Available</option>
        <option value="false">Not Available</option>
      </select>
    </div>
  );
};
