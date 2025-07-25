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
  save: (data: CustomerFormInputs) => void;
  close: () => void;
  initialCheckInDate?: string;   // <-- added
  initialCheckOutDate?: string;  // <-- added
}

export default function BookRoomForm({
  save,
  close,
  initialCheckInDate,
  initialCheckOutDate,
}: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<CustomerFormInputs>({ mode: "onChange" });

  const phoneValue = watch("phone");
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);

  // Pre-fill dates if provided
  useEffect(() => {
    if (initialCheckInDate) {
      setCheckInDate(new Date(initialCheckInDate));
    }
    if (initialCheckOutDate) {
      setCheckOutDate(new Date(initialCheckOutDate));
    }
  }, [initialCheckInDate, initialCheckOutDate]);

  const onSubmit: SubmitHandler<CustomerFormInputs> = (data) => {
    save({
      ...data,
      checkInDate: checkInDate ? checkInDate.toISOString().split("T")[0] : "",
      checkOutDate: checkOutDate ? checkOutDate.toISOString().split("T")[0] : "",
    });
    reset();
    close();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4 bg-white rounded-md shadow-md dark:bg-gray-900 dark:text-white">
      <div className="font-bold text-lg">
        Customer Info
      </div>
      <div className="w-full md:w-1/2">
        <label className="block mb-1 text-sm">Name</label>
        <input
          type="text"
          {...register("name", { required: "Name is required" })}
          className="w-full border border-gray-300 p-2 rounded-lg"
        />
        {errors.name && <p className="text-red-400 text-sm">{errors.name.message}</p>}
      </div>
      {/* CNIC */}
      <div className="w-full md:w-1/2">
        <label className="block mb-1 text-sm">CNIC</label>
        <input
          type="text"
          {...register("cnic", { required: "CNIC is required" })}
          className="w-full border border-gray-300 p-2 rounded-lg"
        />
        {errors.cnic && <p className="text-red-400 text-sm">{errors.cnic.message}</p>}
      </div>

      {/* Email */}
      <div className="w-full md:w-1/2">
        <label className="block mb-1 text-sm">Email</label>
        <input
          type="email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: "Enter a valid email",
            },
          })}
          className="w-full border border-gray-300 p-2 rounded-lg"
        />
        {errors.email && <p className="text-red-400 text-sm">{errors.email.message}</p>}
      </div>

      {/* Phone */}
      <div className="w-full md:w-1/2">
        <label className="block mb-1 text-sm">Phone</label>
        <PhoneInput
          country={"us"}
          value={phoneValue}
          onChange={(phone: string) =>
            setValue("phone", phone, { shouldValidate: true, shouldDirty: true })
          }
          buttonStyle={{
            background: "transparent",
            borderLeft: "1px solid #d1d5db",
            borderTopLeftRadius: "0.5rem",
            borderBottomLeftRadius: "0.5rem",
          }}
          dropdownStyle={{
            borderRadius: "0.5rem",
          }}
          inputStyle={{
            background: "transparent",
            width: "100%",
            padding: "10px",
            paddingLeft: "2.75rem",
            borderRadius: "0.5rem",
            border: "1px solid #d1d5db",
          }}
        />
        {!phoneValue && <p className="text-red-400 text-sm">Phone is required</p>}
      </div>

      {/* Check-in Date */}
      <div className="w-full md:w-1/2">
        <label className="block mb-1 text-sm">Check-in Date</label>
        <ReactDatePicker
          selected={checkInDate}
          onChange={date => setCheckInDate(date)}
          dateFormat="yyyy-MM-dd"
          className="w-full border border-gray-300 p-2 rounded-lg"
          placeholderText="Select check-in date"
        />
        {!checkInDate && <p className="text-red-400 text-sm">Check-in date is required</p>}
      </div>

      {/* Check-out Date */}
      <div className="w-full md:w-1/2">
        <label className="block mb-1 text-sm">Check-out Date</label>
        <ReactDatePicker
          selected={checkOutDate}
          onChange={date => setCheckOutDate(date)}
          dateFormat="yyyy-MM-dd"
          className="w-full border border-gray-300 p-2 rounded-lg"
          placeholderText="Select check-out date"
        />
        {!checkOutDate && <p className="text-red-400 text-sm">Check-out date is required</p>}
      </div>

      {/* Buttons */}
      <div className="flex justify-start gap-2 pt-4">
        <button
          type="button"
          onClick={close}
          className="px-4 py-2 text-sm rounded-md bg-gray-300 hover:bg-gray-400 dark:text-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 rounded-md text-white text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Save
        </button>
      </div>
    </form>
  );
}
