
import { IoAdd } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import { useState, useRef, useEffect } from "react";
import ExpenseForm from "../ExpenseForm/Expenseform";


interface Order {
    id: number;
    date: Date | string;
    expense_acc: string;
    vendor: string;
    customer: string;
    paid_through: string;
    status : string;
    amount: number;
}

// Define the table data using the interface
const data: Order[] = [
  {
    id: 1,
    date: "2023-10-01",
    expense_acc: 'Cost of goods sold',
    vendor: "Lindsey Curtis",
    customer: "Agency Website",
    paid_through : "kai@gmail.com",
    status : "pending",
    amount: 388,
  },
//   {
//     id: 2,
//     name: "Lindsey Curtis",
//     company: "Agency Website",
//     email : "kai@gmail.com",
//     phone : "+1 234 567 890",
//     amount: 300,
//   },
//   {
//     id: 3,
//    name: "Lindsey Curtis",
//     company: "Agency Website",
//     email : "kai@gmail.com",
//     phone : "+1 234 567 890",
//     amount: 366,
//   },
//   {
//     id: 4,
//     name: "Lindsey Curtis",
//     company: "Agency Website",
//     email : "kai@gmail.com",
//     phone : "+1 234 567 890",
//     amount: 399,
//   },
//   {
//     id: 5,
//     name: "Lindsey Curtis",
//     company: "Agency Website",
//     email : "kai@gmail.com",
//     phone : "+1 234 567 890",
//     amount: 399,
//   },
];

export default function ExpenseTable() {
  const [showForm, setShowForm] = useState(false);
  const [tableData, setTableData] = useState<Order[]>(data);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = (id: number) => {
    setOpenDropdownId((prevId) => (prevId === id ? null : id));
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setOpenDropdownId(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handleSaveForm = (formData: {
    date: Date | string;
    expense_acc: string;
    vendor: string;
    customer: string;
    paid_through: string;
    status : string;
    amount: number;
  }) => {
    const newOrder: Order = {
        id: tableData.length + 1,
        date: typeof formData.date === "string" ? formData.date : new Date(formData.date).toISOString().split("T")[0],
        expense_acc: formData.expense_acc,
        vendor: formData.vendor,
        customer: formData.customer,
        paid_through: formData.paid_through,
        status: formData.status,
        amount: formData.amount, // Convert number to string as in your existing data
    }

    setTableData((prevData) => [...prevData, newOrder]);
    setShowForm(false);
};

  const handleCloseForm = () => {
    setShowForm(false);
  }
  return (
        <>
          <div className="flex justify-between items-center mb-2">
            <h2 className=" text-xl font-semibold text-gray-800 dark:text-white">
              All Expenses
            </h2>
            
            <button
              type="submit"
              className="flex gap-1 items-center px-4 py-2 bg-blue-600 rounded-md text-white text-sm  hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              onClick={() => setShowForm(true)}>
              {<IoAdd />}  New
            </button>
          </div>
          {showForm ? (<ExpenseForm save={handleSaveForm} close={handleCloseForm}/>):(
            <div className="overflow-hidden h-96 rounded-md border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-gray-900">
              <div className="max-w-full overflow-x-auto">
                {
                  tableData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-96 p-4 space-y-4">
                      <h1 className="text-xl font-medium">It's time to get paid!</h1>
                      <p className="text-sm text-gray-500">We don't want to boast too much, but sending amazing invoices and getting paid is easier than ever. Go ahead! Try it yourself.</p>
                      <button
                          type="button"
                          className="flex gap-1 items-center px-4 py-2 bg-blue-600 rounded-md text-white text-sm  hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                          onClick={() => {
                              console.log("Clicked New Invoice");
                              setShowForm(true)}}>
                            NEW INVOICE
                      </button>
                  </div>
                  )  : (
                    <Table>
                      {/* Table Header */}
                      <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                            <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                          >
                            DATE
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                          >
                            EXPENSE ACCOUNT
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                          >
                            VENDOR NAME
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                          >
                            PAID THROUGH
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                          >
                            CUSTOMER NAME
                          </TableCell>
                          
                          <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                          >
                            STATUS
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                          >
                            AMOUNT
                          </TableCell>
                          
                        </TableRow>
                      </TableHeader>

                      {/* Table Body */}
                      <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {tableData.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {order.date}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-blue-600 text-start text-theme-sm dark:text-blue-400">
                              {order.expense_acc}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {order.vendor}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {order.paid_through}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {order.customer}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    order.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : order.status === "approved"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                >
                                    {order.status}
                                </span>
                            </TableCell>
                            
                            {/* <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              <Badge
                                size="sm"
                                color={
                                  order.status === "Active"
                                    ? "success"
                                    : order.status === "Pending"
                                    ? "warning"
                                    : "error"
                                }
                              >
                                {order.status}
                              </Badge>
                            </TableCell> */}
                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                              {order.amount} $
                            </TableCell>
                            <TableCell className="relative px-4 py-3 text-start">
                              <div className="relative inline-block" ref={dropdownRef}>
                                <button
                                  onClick={() => toggleDropdown(order.id)}
                                  className="cursor-pointer rounded-full bg-blue-500 items-center justify-center text-white w-6 h-6 flex"
                                >
                                  <IoIosArrowDown />
                                </button>

                                {openDropdownId === order.id && (
                                  <div className="origin-top-right absolute right-0 mt-2 w-fit rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                                    <div className="py-1">
                                      <button className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        Edit
                                      </button>
                                      <button className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-red-100">
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            
                              
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )
                }
              </div>
              
          
            </div>
            )
          }
        </>  
    
  );
}

