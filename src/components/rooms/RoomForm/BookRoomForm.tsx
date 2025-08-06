
import { useForm, SubmitHandler } from "react-hook-form";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState, useEffect } from "react";

interface CustomerFormInputs {
  name: string;
  cnic: string;
  email: string;
  phone: string;
  bookings: number;
  checkInDate: string;
  checkOutDate: string;
  recieveables: number;
}

interface CustomerFormProps {
  save: (data: CustomerFormInputs[]) => Promise<void>;
  close: () => void;
  initialCheckInDate?: string;
  initialCheckOutDate?: string;
  totalGuests?: number;
  roomPrice?: number; // Add roomPrice prop
}

export default function BookRoomForm({
  save,
  close,
  initialCheckInDate,
  initialCheckOutDate,
  totalGuests = 1,
  roomPrice = 0, // Default to 0 if not provided
}: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
    reset,
  } = useForm<CustomerFormInputs>({ 
    mode: "onChange",
    defaultValues: {
      bookings: 1,
      recieveables: 0
    }
  });

  const phoneValue = watch("phone");
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [currentGuest, setCurrentGuest] = useState(1);
  const [completedGuests, setCompletedGuests] = useState<CustomerFormInputs[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  // Calculate total price whenever dates change
  useEffect(() => {
    if (checkInDate && checkOutDate && roomPrice > 0) {
      const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
      const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
      const calculatedTotal = nights * roomPrice;
      setTotalPrice(calculatedTotal);
      setValue("recieveables", calculatedTotal, { shouldValidate: true });
    }
  }, [checkInDate, checkOutDate, roomPrice, setValue]);

  // Pre-fill dates if provided
  useEffect(() => {
    if (initialCheckInDate) {
      const date = new Date(initialCheckInDate);
      setCheckInDate(isNaN(date.getTime()) ? null : date);
    }
    if (initialCheckOutDate) {
      const date = new Date(initialCheckOutDate);
      setCheckOutDate(isNaN(date.getTime()) ? null : date);
    }
  }, [initialCheckInDate, initialCheckOutDate]);

  const handleSaveAndContinue = async (data: CustomerFormInputs) => {
    if (!checkInDate || !checkOutDate) return;

    const guestData = {
      ...data,
      checkInDate: checkInDate.toISOString().split("T")[0],
      checkOutDate: checkOutDate.toISOString().split("T")[0],
      recieveables: totalPrice, // Use the calculated total price
    };

    if (currentGuest < totalGuests) {
      setCompletedGuests([...completedGuests, guestData]);
      setCurrentGuest(currentGuest + 1);
      reset();
    } else {
      const allGuests = [...completedGuests, guestData];
      setIsSubmitting(true);
      try {
        await save(allGuests);
        reset();
        close();
      } catch (error) {
        console.error("Failed to save booking:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleFinalSubmit: SubmitHandler<CustomerFormInputs> = (data) => {
    handleSaveAndContinue(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFinalSubmit)} className="p-6 space-y-4 bg-white rounded-lg shadow-xl dark:bg-gray-800">
      {/* Guest counter and price summary */}
      <div className="mb-4">
        {totalGuests > 1 && (
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Guest {currentGuest} of {totalGuests}
          </h3>
        )}
        {totalPrice > 0 && (
          <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Total for stay:</span> PKR {totalPrice.toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Form fields remain the same as before */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Full Name *
          </label>
          <input
            type="text"
            {...register("name", { 
              required: "Name is required",
              minLength: {
                value: 3,
                message: "Name must be at least 3 characters"
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
          )}
        </div>

        {/* CNIC */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            CNIC *
          </label>
          <input
            type="text"
            {...register("cnic", { 
              required: "CNIC is required",
              pattern: {
                value: /^[0-9]{5}-[0-9]{7}-[0-9]$/,
                message: "Format: 12345-1234567-1"
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="12345-1234567-1"
          />
          {errors.cnic && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.cnic.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email *
          </label>
          <input
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address"
              },
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone *
          </label>
          <PhoneInput
            country={'pk'}
            value={phoneValue}
            onChange={(phone) => {
              setValue("phone", phone, { shouldValidate: true });
            }}
            inputProps={{
              required: true,
              name: "phone"
            }}
            containerClass="w-full"
            inputClass="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            buttonClass="bg-gray-100 dark:bg-gray-700 border-r border-gray-300 dark:border-gray-600 rounded-l-md"
            dropdownClass="z-50"
          />
          {errors.phone && (
            <p className="text-sm text-red-600 dark:text-red-400">Phone number is required</p>
          )}
        </div>
      </div>

      {/* Date Pickers (Read-only) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Check-in Date
          </label>
          <ReactDatePicker
            selected={checkInDate}
            onChange={() => {}}
            dateFormat="MMMM d, yyyy"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed"
            readOnly
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Check-out Date
          </label>
          <ReactDatePicker
            selected={checkOutDate}
            onChange={() => {}}
            dateFormat="MMMM d, yyyy"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed"
            readOnly
          />
        </div>
      </div>

      {/* Hidden field for recieveables */}
      <input type="hidden" {...register("recieveables")} />

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={close}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        
        {currentGuest < totalGuests ? (
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isSubmitting || !isValid}
          >
            Save & Add Next Guest
          </button>
        ) : (
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : 'Complete Booking'}
          </button>
        )}
      </div>
    </form>
  );
}