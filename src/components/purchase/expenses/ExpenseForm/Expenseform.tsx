
// import { useForm, SubmitHandler } from "react-hook-form";
// import PhoneInput from "react-phone-input-2";
// import "react-phone-input-2/lib/style.css";

// interface ExpenseFormInputs {
//   name: string;
//   company: string;
//   email: string;
//   phone: string;
//   amount: number;
// }

// interface ExpenseFormProps {
//   save: (data: ExpenseFormInputs) => void;
//   close: () => void;
// }

// export default function ExpenseForm({ save, close }: ExpenseFormProps) {
//   const {
//     register,
//     handleSubmit,
//     setValue,
//     watch,
//     formState: { errors },
//     reset,
//   } = useForm<ExpenseFormInputs>({ mode: "onChange" });

//   const phoneValue = watch("phone");

//   const onSubmit: SubmitHandler<ExpenseFormInputs> = (data) => {
//     console.log("Form data:", data); // Optional debug
//     save(data);
//     reset();
//     close();
//   };

//   return (
    
//     <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4 bg-white rounded-md shadow-md dark:bg-gray-900 dark:text-white">
//       <div className="font-bold text-lg">
//         New Customer
//       </div>
//       <div className="w-full md:w-1/2">
//         <label className="block mb-1 text-sm">Name</label>
//         <input
//           type="text"
//           {...register("name", { required: "Name is required" })}
//           className="w-full border border-gray-300 p-2 rounded-lg"
//         />
//         {errors.name && <p className="text-red-400 text-sm">{errors.name.message}</p>}
//       </div>

//       {/* Company */}
//       <div className="w-full md:w-1/2">
//         <label className="block mb-1 text-sm">Company</label>
//         <input
//           type="text"
//           {...register("company", { required: "Company is required" })}
//           className="w-full border border-gray-300 p-2 rounded-lg"
//         />
//         {errors.company && <p className="text-red-400 text-sm">{errors.company.message}</p>}
//       </div>

//       {/* Email */}
//       <div className="w-full md:w-1/2">
//         <label className="block mb-1 text-sm">Email</label>
//         <input
//           type="email"
//           {...register("email", {
//             required: "Email is required",
//             pattern: {
//               value: /^\S+@\S+\.\S+$/,
//               message: "Enter a valid email",
//             },
//           })}
//           className="w-full border border-gray-300 p-2 rounded-lg"
//         />
//         {errors.email && <p className="text-red-400 text-sm">{errors.email.message}</p>}
//       </div>

//       {/* Phone */}
//       <div className="w-full md:w-1/2">
//         <label className="block mb-1 text-sm">Phone</label>
//         <PhoneInput
//           country={"us"}
//           value={phoneValue}
//           onChange={(phone: string) =>
//             setValue("phone", phone, { shouldValidate: true, shouldDirty: true })
//           }
//           buttonStyle={{
//             background:"transparent",
//             borderLeft: "1px solid #d1d5db",
//             borderTopLeftRadius: "0.5rem",
//             borderBottomLeftRadius: "0.5rem",
//           }}
//           dropdownStyle={{
//             borderRadius: "0.5rem",
//           }}
//           inputStyle={{
//             background:"transparent",
//             width: "100%",
//             padding: "10px",
//             paddingLeft: "2.75rem",
//             borderRadius: "0.5rem",
//             border: "1px solid #d1d5db",
//           }}
          
//         />
//         {!phoneValue && <p className="text-red-400 text-sm">Phone is required</p>}
//       </div>

//       {/* Amount */}
//       <div className="w-full md:w-1/2">
//         <label className="block mb-1 text-sm">Amount</label>
//         <input
//           type="number"
//           {...register("amount", {
//             required: "Amount is required",
//             min: { value: 1, message: "Amount must be greater than 0" },
//           })}
//           className="w-full border border-gray-300 p-2 rounded-lg"
//         />
//         {errors.amount && <p className="text-red-400 text-sm">{errors.amount.message}</p>}
//       </div>

//       {/* Buttons */}
//       <div className="flex justify-start gap-2 pt-4">
//         <button
//           type="button"
//           onClick={close}
//           className="px-4 py-2 text-sm rounded-md bg-gray-300 hover:bg-gray-400 dark:text-gray-600"
//         >
//           Cancel
//         </button>
//         <button
//           type="submit"
//           className="px-4 py-2 bg-blue-600 rounded-md text-white text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
//          >
//           Save
//         </button>
//       </div>
//     </form>
//   );
// }































import { useState } from "react";

interface ExpenseFormProps {
  save: (formData: {
    date: string;
    expense_acc: string;
    vendor: string;
    customer: string;
    paid_through: string;
    status: string;
    amount: number;
  }) => void;
  close: () => void;
}

export default function ExpenseForm({ save, close }: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    date: "",
    expense_acc: "",
    vendor: "",
    customer: "",
    paid_through: "",
    status: "pending",
    amount: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "amount" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    save(formData);
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 shadow-md rounded-md max-w-full mx-auto">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Add New Expense</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:text-white"
                />
            </div>
            <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expense Account</label>
                <input
                    type="text"
                    name="expense_acc"
                    value={formData.expense_acc}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:text-white"
                />
            </div>
            <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vendor</label>
                <input
                    type="text"
                    name="vendor"
                    value={formData.vendor}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:text-white"
                />
            </div>
            <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Customer</label>
                <input
                    type="text"
                    name="customer"
                    value={formData.customer}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:text-white"
                />
            </div>
            <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Paid Through</label>
                <input
                    type="text"
                    name="paid_through"
                    value={formData.paid_through}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:text-white"
                />
            </div>
            <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:text-white"
                >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>
            <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:text-white"
                />
            </div>

            <div className="flex justify-start gap-4 pt-2">
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
    </div>
  );
}

