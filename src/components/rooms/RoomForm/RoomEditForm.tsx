import { useForm, SubmitHandler } from "react-hook-form";
import { useEffect } from "react";
import "react-phone-input-2/lib/style.css";

interface RoomFormInputs {
  name: string;
  type: string;
  price: number;
  status: "Available" | "Booked" | "Maintenance"; // <-- updated
}

interface Room {
  id: string;
  name: string;
  type: string;
  price: number;
  status: "Available" | "Booked" | "Maintenance";
}

interface RoomEditFormProps {
  roomData?: Room; 
  save: (data: RoomFormInputs) => void;
  close: () => void;
  isEditing?: boolean; 
}

export default function RoomEditForm({ roomData, save, close, isEditing = false }: RoomEditFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<RoomFormInputs>({ mode: "onChange" });

  // Pre-fill form when editing
  useEffect(() => {
    if (isEditing && roomData) {
      setValue("name", roomData.name);
      setValue("type", roomData.type);
      setValue("price", roomData.price);
      setValue("status", roomData.status);
    }
  }, [isEditing, roomData, setValue]);

  const onSubmit: SubmitHandler<RoomFormInputs> = (data) => {
    console.log("Form data:", data);
    save(data);
    reset();
    close();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4 bg-white rounded-md shadow-md dark:bg-gray-900 dark:text-white">
      <div className="font-medium text-lg">
        {isEditing ? `Edit Room ${roomData?.name || ''}` : 'New Room'}
      </div>
      
      {/* Room Name */}
      <div className="w-full md:w-1/2">
        <label className="block mb-1 text-sm">Room Name</label>
        <input
          type="text"
          {...register("name", { required: "Room name is required" })}
          className="w-full border border-gray-300 p-2 rounded-lg dark:border-gray-600 dark:bg-gray-800"
          placeholder="Enter room name"
        />
        {errors.name && <p className="text-red-400 text-sm">{errors.name.message}</p>}
      </div>
      
      {/* Room Type */}
      <div className="w-full md:w-1/2">
        <label className="block mb-1 text-sm">Room Type</label>
        <select
          {...register("type", { required: "Room type is required" })}
          className="w-full border border-gray-300 p-2 rounded-lg dark:border-gray-600 dark:bg-gray-800"
        >
          <option value="">Select room type</option>
          <option value="Single">Single</option>
          <option value="Double">Double</option>
          <option value="Suite">Suite</option>
          <option value="Deluxe">Deluxe</option>
          <option value="Standard">Standard</option>
        </select>
        {errors.type && <p className="text-red-400 text-sm">{errors.type.message}</p>}
      </div>

      {/* Room Price */}
      <div className="w-full md:w-1/2">
        <label className="block mb-1 text-sm">Price (PKR)</label>
        <input
          type="number"
          {...register("price", {
            required: "Price is required",
            min: { value: 1, message: "Price must be greater than 0" },
            valueAsNumber: true,
          })}
          className="w-full border border-gray-300 p-2 rounded-lg dark:border-gray-600 dark:bg-gray-800"
          placeholder="Enter price in PKR"
        />
        {errors.price && <p className="text-red-400 text-sm">{errors.price.message}</p>}
      </div>
      
      {/* Status Dropdown */}
      <div className="w-full md:w-1/2">
        <label className="block mb-1 text-sm">Room Status</label>
        <select
          {...register("status", { required: "Room status is required" })}
          className="w-full border border-gray-300 p-2 rounded-lg dark:border-gray-600 dark:bg-gray-800"
        >
          <option value="">Select room status</option>
          <option value="Available">Available</option>
          <option value="Booked">Booked</option>
          <option value="Maintenance">Maintenance</option>
        </select>
        {errors.status && <p className="text-red-400 text-sm">{errors.status.message}</p>}
      </div>

      {/* Buttons */}
      <div className="flex justify-start gap-2 pt-4">
        <button
          type="button"
          onClick={close}
          className="px-4 py-2 text-sm rounded-md bg-gray-300 hover:bg-gray-400 dark:text-gray-600 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 rounded-md text-white text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
        >
          {isEditing ? 'Update Room' : 'Save Room'}
        </button>
      </div>
    </form>
  );
}
