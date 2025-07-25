import { createContext, useState, ReactNode, useContext  } from "react";

export interface Room {
  id: string;
  room_no: number;
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
  room_no: string;
  customer_id: string;
  check_in_date: string;
  check_out_date: string;
  status: "Booked" | "Cancelled" | "CheckedOut";
  recieveables: number;
  payment_status: "Pending" | "Paid" | "Not Applicable";
}

interface BookingContextType {
  bookingRoom: Room | null;
  openBooking: (room: Room) => void;
  closeBooking: () => void;
  handleBookingSave: (data: {
    name: string;
    email: string;
    phone: string;
    cnic: string;
    checkInDate: string;
    checkOutDate: string;
    recieveables: number;
  }) => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);

  const openBooking = (room: Room) => setBookingRoom(room);
  const closeBooking = () => setBookingRoom(null);

  const handleBookingSave = async (data: {
    name: string;
    email: string;
    phone: string;
    cnic: string;
    checkInDate: string;
    checkOutDate: string;
     recieveables: number;
  }) => {
    if (!bookingRoom) return;

    // Ensure dates are in YYYY-MM-DD format
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return ""; // invalid date
      return date.toISOString().split("T")[0];
    };

    const checkInDate = formatDate(data.checkInDate);
    const checkOutDate = formatDate(data.checkOutDate);

    try {
      const customerRes = await fetch(
        'https://api.sheetbest.com/sheets/72d038c4-48d2-4f11-9db7-f6dd4c90e828/tabs/customers'
      );
      let maxId = 0;

      if (customerRes.ok) {
        const existing = await customerRes.json();
        maxId = Math.max(...existing.map((c: Customer) => Number(c.id) || 0), 0);
      }

      // Update room status to "Booked"
      const updatedRoom = { ...bookingRoom, status: "Booked" };
      await fetch(
        `https://api.sheetbest.com/sheets/72d038c4-48d2-4f11-9db7-f6dd4c90e828/tabs/rooms/id/${bookingRoom.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedRoom),
        }
      );

      // Save booking record to bookings tab
      const bookingRecord = {
        booking_id: `BK${Date.now()}`,
        customer_id: maxId + 1,
        room_no: bookingRoom.room_no,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        status: "Booked",
        recieveables: data.recieveables, 
        payment_status: "Pending",
      };

      await fetch(
        'https://api.sheetbest.com/sheets/72d038c4-48d2-4f11-9db7-f6dd4c90e828/tabs/bookings',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingRecord),
        }
      );

      const bookingPayload = {
        id: maxId + 1,
        name: data.name,
        cnic: data.cnic,
        email: data.email,
        phone: data.phone,
        bookings: 1,
        roomId: bookingRoom.id,
        roomName: bookingRoom.name,
        roomType: bookingRoom.type,
        roomPrice: bookingRoom.price,
        checkInDate,
        checkOutDate,
        bookingId: bookingRecord.booking_id,
      };

      await fetch(
        'https://api.sheetbest.com/sheets/72d038c4-48d2-4f11-9db7-f6dd4c90e828/tabs/customers',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingPayload),
        }
      );

      alert(`Room booked successfully! Customer ID: ${bookingPayload.id}`);
      setBookingRoom(null);
    } catch (err) {
      console.error(err);
      alert("Failed to book room. Try again.");
    }
  };

  return (
    <BookingContext.Provider
      value={{ bookingRoom, openBooking, closeBooking, handleBookingSave }}
    >
      {children}
    </BookingContext.Provider>
  );
};












export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within BookingProvider");
  }
  return context;
};

export  { BookingContext};