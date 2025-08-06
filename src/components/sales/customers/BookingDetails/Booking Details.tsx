

import { IoRefresh } from "react-icons/io5";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import { useState, useEffect } from "react";

interface Booking {
  booking_id: string;
  customer_id: string;
  room_no: number;
  check_in_date: number; // Excel serial number
  check_out_date: number; // Excel serial number
  status: "Booked" | "CheckedOut" | "Cancelled";
  recieveables: number;
  payment_status: "Paid" | "Unpaid";
}

// Utility functions for Excel date conversion
const excelSerialToDate = (serial: number): Date => {
  const utcDays = Math.floor(serial - 25569); // 25569 is days from 1900 to 1970
  const utcValue = utcDays * 86400; // Convert to seconds
  return new Date(utcValue * 1000); // Convert to milliseconds
};

const dateToExcelSerial = (date: Date): number => {
  const utcMidnight = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  return (utcMidnight / 86400000) + 25569; // 86400000 = milliseconds in a day
};

export default function BookingDetails() {
  const [tableData, setTableData] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const BASE_URL = import.meta.env.VITE_BASE_URL
  const getData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/bookings`);
      if (!res.ok) throw new Error('Failed to fetch data');
      
      const rawData = await res.json();
      const todaySerial = dateToExcelSerial(new Date());

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const processedData = rawData.map((booking: any) => {
        // Check if booking should be marked as CheckedOut
        const status = booking.check_out_date < todaySerial ? "CheckedOut" : booking.status;

        return {
          ...booking,
          status,
          recieveables: Number(booking.recieveables) || 0,
          check_in_date: Number(booking.check_in_date),
          check_out_date: Number(booking.check_out_date)
        };
      });

      setTableData(processedData || []);
    } catch (error) {
      console.error("Error fetching booking data:", error);
      setError('Failed to load booking data');
    } finally {
      setIsLoading(false);
    }
  };

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
            All Bookings
          </h2>
          {error && (
            <p className="text-red-500 text-sm mt-1">{error}</p>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex gap-1 items-center px-3 py-2 bg-gray-600 rounded-md text-white text-sm hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            <IoRefresh className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="overflow-x-auto h-96 rounded-md border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-gray-900">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading bookings...</span>
          </div>
        ) : tableData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400">No bookings found</p>
          </div>
        ) : (
          <div className="max-w-full h-full overflow-x-auto overflow-y-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] sticky top-0 bg-white dark:bg-gray-900 z-20">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                    BOOKING ID
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                    CUSTOMER ID
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                    ROOM NO
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                    CHECK-IN
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                    CHECK-OUT
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                    RECIEVABLE (PKR)
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                    STATUS
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                    PAYMENT
                  </TableCell>
                  
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {tableData.map((booking) => {
                  const checkInDate = excelSerialToDate(booking.check_in_date);
                  const checkOutDate = excelSerialToDate(booking.check_out_date);
                  const isPastDue = new Date() > checkOutDate;
                  
                  return (
                    <TableRow key={booking.booking_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">
                        {booking.booking_id}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">
                        {booking.customer_id}
                      </TableCell>
                      
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">
                        {booking.room_no}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">
                        {checkInDate.toLocaleDateString()}
                      </TableCell>
                      <TableCell className={`px-4 py-3 text-start text-theme-sm whitespace-nowrap ${
                        isPastDue ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {checkOutDate.toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">
                        <span className="font-medium">{booking.recieveables.toLocaleString()}</span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          booking.status === "Booked"
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            : booking.status === "CheckedOut"
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {booking.status}
                          {isPastDue && booking.status === "Booked" && " (Due)"}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          booking.payment_status === "Paid"
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        }`}>
                          {booking.payment_status}
                        </span>
                      </TableCell>
                     
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
}