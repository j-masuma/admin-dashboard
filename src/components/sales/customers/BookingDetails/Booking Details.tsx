import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import { useState } from "react";

interface Order {
  id: number;
  room: string;
  checkIn: string;
  checkOut: string;
  total: number;
  paymentStatus: "Paid" | "Refunded" | "Pending";
  bookingStatus: "Booked" | "Cancelled" | "CheckedOut";
}

const bookings: Order[] = [
  {
    id: 1,
    room: "Room 101 (Deluxe)",
    checkIn: "2025-06-10",
    checkOut: "2025-06-15",
    total: 25000,
    paymentStatus: "Paid",
    bookingStatus: "Booked",
  },
  {
    id: 2,
    room: "Room 205 (Standard)",
    checkIn: "2025-04-02",
    checkOut: "2025-04-04",
    total: 10000,
    paymentStatus: "Refunded",
    bookingStatus: "Cancelled",
  },
  {
    id: 3,
    room: "Room 303 (Suite)",
    checkIn: "2025-01-20",
    checkOut: "2025-01-23",
    total: 40000,
    paymentStatus: "Paid",
    bookingStatus: "CheckedOut",
  },
];

export default function BookingDetails() {
  const [tableData] = useState<Order[]>(bookings);

  return (
    <>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Customer : Sarah Ali
        </h2>
      </div>

      <div className="overflow-hidden h-96 rounded-md border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-gray-900">
        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {[
                  "#",
                  "ROOM",
                  "CHECK-IN",
                  "CHECK-OUT",
                  "TOTAL (PKR)",
                  "PAYMENT STATUS",
                  "BOOKING STATUS",
                ].map((label, index) => (
                  <TableCell
                    key={index}
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {tableData.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {order.id}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <span className="block font-medium text-theme-sm text-gray-800 dark:text-white/90">
                      {order.room}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {order.checkIn}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {order.checkOut}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {order.total.toLocaleString()}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {order.paymentStatus}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {order.bookingStatus}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
