// import { createContext, useState, ReactNode, useContext } from "react";

// export interface Room {
//   id: string;
//   room_no: number;
//   name: string;
//   type: string;
//   price: number;
//   status: "Available" | "Booked" | "Maintenance";
//   description: string;
// }

// export interface Customer {
//   id: string;
//   name: string;
//   email: string;
//   phone: string;
//   cnic: string;
//   bookings: number;
//   roomId?: string;
//   roomName?: string;
//   roomType?: string;
//   roomPrice?: number;
//   checkInDate?: string;
//   checkOutDate?: string;
//   bookingId?: string;
// }

// export interface Booking {
//   booking_id: string;
//   room_no: string;
//   customer_id: string;
//   check_in_date: string;
//   check_out_date: string;
//   status: "Booked" | "Cancelled" | "CheckedOut";
//   recieveables: number;
//   payment_status: "Pending" | "Paid" | "Not Applicable";
// }

// interface BookingContextType {
//   bookingRoom: Room | null;
//   openBooking: (room: Room) => void;
//   closeBooking: () => void;
//   handleBookingSave: (
//     data: {
//       name: string;
//       email: string;
//       phone: string;
//       cnic: string;
//       checkInDate: string;
//       checkOutDate: string;
//       recieveables: number;
//     } | {
//       name: string;
//       email: string;
//       phone: string;
//       cnic: string;
//       checkInDate: string;
//       checkOutDate: string;
//       recieveables: number;
//     }[]
//   ) => Promise<void>;
// }

// const BookingContext = createContext<BookingContextType | undefined>(undefined);

// export const BookingProvider = ({ children }: { children: ReactNode }) => {
//   const [bookingRoom, setBookingRoom] = useState<Room | null>(null);

//   const openBooking = (room: Room) => setBookingRoom(room);
//   const closeBooking = () => setBookingRoom(null);

//   const handleBookingSave = async (
//     data: {
//       name: string;
//       email: string;
//       phone: string;
//       cnic: string;
//       checkInDate: string;
//       checkOutDate: string;
//       recieveables: number;
//     } | {
//       name: string;
//       email: string;
//       phone: string;
//       cnic: string;
//       checkInDate: string;
//       checkOutDate: string;
//       recieveables: number;
//     }[]
//   ) => {
//     if (!bookingRoom) return;

//     // Normalize to array - handle both single guest and multiple guests
//     const guests = Array.isArray(data) ? data : [data];

//     // Ensure dates are in YYYY-MM-DD format
//     const formatDate = (dateStr: string) => {
//       const date = new Date(dateStr);
//       if (isNaN(date.getTime())) return "";
//       return date.toISOString().split("T")[0];
//     };

//     try {
//       // Get the next available customer ID
//       const customerRes = await fetch(
//         'https://api.sheetbest.com/sheets/72d038c4-48d2-4f11-9db7-f6dd4c90e828/tabs/customers'
//       );
//       let maxId = 0;

//       if (customerRes.ok) {
//         const existing = await customerRes.json();
//         maxId = Math.max(...existing.map((c: Customer) => Number(c.id) || 0), 0);
//       }

//       // Update room status to "Booked" only once
//       const updatedRoom = { ...bookingRoom, status: "Booked" };
//       await fetch(
//         `https://api.sheetbest.com/sheets/72d038c4-48d2-4f11-9db7-f6dd4c90e828/tabs/rooms/id/${bookingRoom.id}`,
//         {
//           method: 'PATCH',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(updatedRoom),
//         }
//       );

//       // Process each guest
//       const bookingPromises = guests.map(async (guest, index) => {
//         const checkInDate = formatDate(guest.checkInDate);
//         const checkOutDate = formatDate(guest.checkOutDate);
//         const customerId = maxId + index + 1;
//         const bookingId = `BK${Date.now()}${index}`;

//         // Save booking record
//         const bookingRecord = {
//           booking_id: bookingId,
//           customer_id: customerId,
//           room_no: bookingRoom.room_no,
//           check_in_date: checkInDate,
//           check_out_date: checkOutDate,
//           status: "Booked",
//           recieveables: guest.recieveables,
//           payment_status: "Pending",
//         };

//         await fetch(
//           'https://api.sheetbest.com/sheets/72d038c4-48d2-4f11-9db7-f6dd4c90e828/tabs/bookings',
//           {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(bookingRecord),
//           }
//         );

//         // Save customer data
//         const customerPayload = {
//           id: customerId,
//           name: guest.name,
//           cnic: guest.cnic,
//           email: guest.email,
//           phone: guest.phone,
//           bookings: 1,
//           roomId: bookingRoom.id,
//           roomName: bookingRoom.name,
//           roomType: bookingRoom.type,
//           roomPrice: bookingRoom.price,
//           checkInDate,
//           checkOutDate,
//           bookingId,
//         };

//         await fetch(
//           'https://api.sheetbest.com/sheets/72d038c4-48d2-4f11-9db7-f6dd4c90e828/tabs/customers',
//           {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(customerPayload),
//           }
//         );

//         return customerId;
//       });

//       const customerIds = await Promise.all(bookingPromises);
      
//       if (customerIds.length === 1) {
//         alert(`Room booked successfully! Customer ID: ${customerIds[0]}`);
//       } else {
//         alert(`Room booked successfully for ${customerIds.length} guests! Customer IDs: ${customerIds.join(', ')}`);
//       }
      
//       setBookingRoom(null);
//     } catch (err) {
//       console.error("Booking error:", err);
//       alert("Failed to book room. Please try again.");
//     }
//   };

//   return (
//     <BookingContext.Provider
//       value={{ bookingRoom, openBooking, closeBooking, handleBookingSave }}
//     >
//       {children}
//     </BookingContext.Provider>
//   );
// };

// export const useBooking = () => {
//   const context = useContext(BookingContext);
//   if (!context) {
//     throw new Error("useBooking must be used within BookingProvider");
//   }
//   return context;
// };

// export { BookingContext };












import { createContext, useState, ReactNode, useContext, useEffect } from "react";

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
  roomId?: string;
  roomName?: string;
  roomType?: string;
  roomPrice?: number;
  checkInDate?: string;  // Standard date string (YYYY-MM-DD)
  checkOutDate?: string; // Standard date string (YYYY-MM-DD)
  bookingId?: string;
}

export interface Booking {
  booking_id: string;
  room_no: string;
  customer_id: string;
  check_in_date: string;  // Standard date string (YYYY-MM-DD)
  check_out_date: string; // Standard date string (YYYY-MM-DD)
  status: "Booked" | "Cancelled" | "CheckedOut";
  recieveables: number;
  payment_status: "Pending" | "Paid" | "Not Applicable";
}

interface BookingContextType {
  bookingRoom: Room | null;
  openBooking: (room: Room) => void;
  closeBooking: () => void;
  handleBookingSave: (
    data: {
      name: string;
      email: string;
      phone: string;
      cnic: string;
      checkInDate: string;
      checkOutDate: string;
      recieveables: number;
    } | {
      name: string;
      email: string;
      phone: string;
      cnic: string;
      checkInDate: string;
      checkOutDate: string;
      recieveables: number;
    }[]
  ) => Promise<void>;
  checkAndUpdateRoomStatuses: () => Promise<void>;
  formatDateForSheet: (dateString: string) => string;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);
  const BASE_URL = import.meta.env.VITE_BASE_URL
  // Format date to YYYY-MM-DD for sheet storage
  const formatDateForSheet = (dateString: string): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  const openBooking = (room: Room) => setBookingRoom(room);
  const closeBooking = () => setBookingRoom(null);

  const handleBookingSave = async (
    data: {
      name: string;
      email: string;
      phone: string;
      cnic: string;
      checkInDate: string;
      checkOutDate: string;
      recieveables: number;
    } | {
      name: string;
      email: string;
      phone: string;
      cnic: string;
      checkInDate: string;
      checkOutDate: string;
      recieveables: number;
    }[]
  ) => {
    if (!bookingRoom) return;

    const guests = Array.isArray(data) ? data : [data];

    try {
      // Get next customer ID
      const customerRes = await fetch(
        `${BASE_URL}/customers`
      );
      let maxId = 0;

      if (customerRes.ok) {
        const existing = await customerRes.json();
        maxId = Math.max(...existing.map((c: Customer) => Number(c.id) || 0), 0);
      }

      // Update room status
      const updatedRoom = { ...bookingRoom, status: "Booked" };
      await fetch(
        `${BASE_URL}/rooms/id/${bookingRoom.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedRoom),
        }
      );

      // Process each guest
      const bookingPromises = guests.map(async (guest, index) => {
        const checkInDate = formatDateForSheet(guest.checkInDate);
        const checkOutDate = formatDateForSheet(guest.checkOutDate);
        const customerId = maxId + index + 1;
        const bookingId = `BK${Date.now()}${index}`;

        // Save booking record with standard dates
        const bookingRecord = {
          booking_id: bookingId,
          customer_id: customerId,
          room_no: bookingRoom.room_no,
          check_in_date: checkInDate,
          check_out_date: checkOutDate,
          status: "Booked",
          recieveables: guest.recieveables,
          payment_status: "Pending",
        };

        await fetch(
          `${BASE_URL}/bookings`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingRecord),
          }
        );

        // Save customer data with standard dates
        const customerPayload = {
          id: customerId,
          name: guest.name,
          cnic: guest.cnic,
          email: guest.email,
          phone: guest.phone,
          bookings: 1,
          roomId: bookingRoom.id,
          roomName: bookingRoom.name,
          roomType: bookingRoom.type,
          roomPrice: bookingRoom.price,
          checkInDate,
          checkOutDate,
          bookingId,
        };

        await fetch(
          `${BASE_URL}/customers`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerPayload),
          }
        );

        return customerId;
      });

      await Promise.all(bookingPromises);
      setBookingRoom(null);
    } catch (err) {
      console.error("Booking error:", err);
      alert("Failed to book room. Please try again.");
    }
  };

  const checkAndUpdateRoomStatuses = async () => {
    try {
      const [roomsRes, bookingsRes] = await Promise.all([
        fetch(`${BASE_URL}/rooms`),
        fetch(`${BASE_URL}/bookings`)
      ]);

      const [rooms, bookings] = await Promise.all([
        roomsRes.json(),
        bookingsRes.json()
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const updatePromises = bookings
        .filter((booking: Booking) => {
          if (booking.status !== "Booked") return false;
          
          const checkoutDate = new Date(booking.check_out_date);
          checkoutDate.setHours(0, 0, 0, 0);
          
          return checkoutDate < today;
        })
        .map(async (booking: Booking) => {
          // Update booking status
          await fetch(
            `${BASE_URL}/bookings/id/${booking.booking_id}`,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: "CheckedOut" }),
            }
          );

          // Update corresponding room
          const room = rooms.find((r: Room) => r.room_no.toString() === booking.room_no.toString());
          if (room) {
            await fetch(
              `${BASE_URL}/rooms/id/${room.id}`,
              {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: "Available" }),
              }
            );
          }
        });

      await Promise.all(updatePromises);
    } catch (err) {
      console.error("Error updating room statuses:", err);
    }
  };

  // Set up daily check for expired bookings
  useEffect(() => {
    checkAndUpdateRoomStatuses();
    const interval = setInterval(checkAndUpdateRoomStatuses, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BookingContext.Provider
      value={{ 
        bookingRoom, 
        openBooking, 
        closeBooking, 
        handleBookingSave,
        checkAndUpdateRoomStatuses,
        formatDateForSheet
      }}
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

export { BookingContext };