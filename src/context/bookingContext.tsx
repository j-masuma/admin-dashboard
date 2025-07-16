import { createContext, useContext, useState, ReactNode } from "react";

export interface Room {
  id: string;
  room_no: string;
  name: string;
  type: string;
  price: number;
  status: "Available" | "Booked" | "Maintenance";
  description: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  cnic: string;
  bookings: number;
}

export interface Booking {
  booking_id: string;
  room_no: string; // room _id
  customer_id: string; // customer _id
  check_in_date: string;
  check_out_date: string;
  status: string;
  recieveables: number;
  payment_status: string;
}

interface BookingContextType {
  bookingRoom: Room | null;
  openBooking: (room: Room) => void;
  closeBooking: () => void;
  handleBookingSave: (customer: Customer, bookingData: Omit<Booking, "_id" | "roomno" | "customerId" | "createdAt" | "recieveable" | "status">) => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);

  // Open booking modal for a room
  const openBooking = (room: Room) => setBookingRoom(room);

  // Close booking modal
  const closeBooking = () => setBookingRoom(null);

  // Save booking (implement your API logic here)
  const handleBookingSave = async (customer: Customer, bookingData: Omit<Booking, "_id" | "roomno" | "customerId" | "createdAt" | "recieveable" | "status">) => {
    if (!bookingRoom) return;
    // ...API logic to save booking and update room availability...
    // After saving:
    setBookingRoom(null);
  };

  return (
    <BookingContext.Provider
      value={{
        bookingRoom,
        openBooking,
        closeBooking,
        handleBookingSave,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

// Custom hook for easy usage
export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error("useBooking must be used within BookingProvider");
  return context;
};