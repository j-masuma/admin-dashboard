import {IoRefresh } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import { useState, useEffect } from "react";
import { Link } from "react-router";

interface Order {
  id: number;
  name: string;
  cnic: string;
  email: string;
  phone: string;
  bookings: number;
}

export default function CustomerTable() {
  
  const [tableData, setTableData] = useState<Order[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const BASE_URL = import.meta.env.VITE_BASE_URL
  const toggleDropdown = (id: number) => {
    setOpenDropdownId((prevId) => (prevId === id ? null : id));
  };

  // Improved click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Improved getData with loading state
  const getData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/customers`);
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setTableData(data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError('Failed to load customer data');
    } finally {
      setIsLoading(false);
    }
  };

  // Improved handleDelete with better error handling and UI feedback
  const handleDelete = async (id: number) => {
    // Close dropdown immediately
    setOpenDropdownId(null);
    
    if (!confirm('Are you sure you want to delete this customer?')) return;
    
    setIsDeleting(id);
    try {
      const response = await fetch(`https://api.sheetbest.com/sheets/72d038c4-48d2-4f11-9db7-f6dd4c90e828/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Update UI immediately for better UX
        setTableData(prev => prev.filter(customer => customer.id !== id));
        console.log('Customer deleted successfully');
      } else {
        throw new Error('Failed to delete customer from server');
      }
    } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Failed to delete customer. Please try again.');
        // Optionally refresh data to ensure sync
        getData();
    } finally {
      setIsDeleting(null);
    }
  };

  // Improved handleSaveForm
  // const handleSaveForm = async (formData: {
  //   name: string;
  //   cnic: string;
  //   email: string;
  //   phone: string;
  //   bookings: number;
  // }) => {
  //   try {
  //     // Generate proper ID based on existing data
  //     const maxId = tableData.length > 0 ? Math.max(...tableData.map(item => item.id)) : 0;
  //     const newCustomerData = {
  //       id: maxId + 1,
  //       ...formData,
  //     };

  //     const response = await fetch('https://api.sheetbest.com/sheets/72d038c4-48d2-4f11-9db7-f6dd4c90e828', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(newCustomerData),
  //     });

  //     if (response.ok) {
  //       setTableData((prevData) => [newCustomerData, ...prevData]);
  //       setShowForm(false);
  //       console.log('Customer added successfully');
  //     } else {
  //       throw new Error('Failed to save customer');
  //     }
  //   } catch (error) {
  //     console.error('Error saving data:', error);
  //     alert('Failed to save customer data. Please try again.');
  //   }
  // };

  // Add refresh functionality
  const handleRefresh = () => {
    getData();
  };

  useEffect(() => {
    getData();
  }, []);
  
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            All Customers
          </h2>
          {error && (
            <p className="text-red-500 text-sm mt-1">{error}</p>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex gap-1 items-center px-3 py-2 bg-gray-600 rounded-md text-white text-sm hover:bg-gray-700 disabled:opacity-50"
          >
            <IoRefresh className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
          
        </div>
      </div>

      
      <div className="max-w-full h-full overflow-x-auto overflow-y-auto">
        <Table>
          {/* Table Header */}
          <TableHeader
            className="border-b border-gray-100 dark:border-white/[0.05] sticky top-0 bg-white dark:bg-gray-900 z-10"
          >
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                S.no#
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                NAME
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                CNIC
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                EMAIL
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                PHONE
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                TOTAL BOOKINGS
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400 whitespace-nowrap"
              >
                ACTIONS
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {tableData.map((order) => (
              <TableRow key={order.id} className={isDeleting === order.id ? 'opacity-50' : ''}>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {order.id}
                </TableCell>
                <TableCell className="px-5 py-4 sm:px-6 text-start">    
                  <div>
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      <Link to={'/details'}>{order.name}</Link>
                    </span>
                  </div>  
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {order.cnic}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {order.email}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {order.phone}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {order.bookings} 
                </TableCell>
                <TableCell className="relative px-4 py-3 text-end">
                  <div className="relative inline-block dropdown-container">
                    <button
                      onClick={() => toggleDropdown(order.id)}
                      disabled={isDeleting === order.id}
                      className="cursor-pointer rounded-full bg-blue-500 items-center justify-center text-white w-5 h-5 flex disabled:opacity-50 hover:bg-blue-600 transition-colors"
                    >
                      <IoIosArrowDown className={`transform transition-transform ${openDropdownId === order.id ? 'rotate-180' : ''}`} />
                    </button>

                    {openDropdownId === order.id && (
                      <div className="origin-top-right absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-20">
                        <div className="py-1">
                          <button 
                            className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => {
                              setOpenDropdownId(null);
                              // Add edit functionality here
                              console.log('Edit customer:', order.id);
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(order.id)}
                            disabled={isDeleting === order.id}
                            className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
                          >
                            {isDeleting === order.id ? 'Deleting...' : 'Delete'}
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
      </div>
          
      
    </>
  );
}

