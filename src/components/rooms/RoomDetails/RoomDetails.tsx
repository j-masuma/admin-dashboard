
import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { IoArrowBack, IoCalendar, IoPeople, IoHome, IoPricetag, IoCalendarOutline, IoPersonCircle, IoMail, IoCall, IoKey } from "react-icons/io5";
import BookRoomForm from "../RoomForm/BookRoomForm";
import { useBooking } from "../../../context/bookingContext";

interface Room {
  id: string;
  room_no: number;
  name: string;
  type: string;
  price: number;
  status: "Available" | "Booked" | "Maintenance";
  description: string;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  bookingDate: string;
  bookingId: string;
}

interface BookingData {
  name: string;
  email: string;
  phone: string;
  cnic: string;
  checkInDate: string;
  checkOutDate: string;
  recieveables: number;
}

export default function RoomDetails() {
  const { roomId } = useParams<{ roomId: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [showBookForm, setShowBookForm] = useState(false);
  const [noOfGuests, setNoOfGuests] = useState(1);
  const checkInRef = useRef<HTMLInputElement>(null);
  const checkOutRef = useRef<HTMLInputElement>(null);

  const BASE_URL = import.meta.env.VITE_BASE_URL
  const { bookingRoom, openBooking, closeBooking, handleBookingSave } = useBooking();
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchRoomDetails = async () => {
      if (!roomId) return;

      setIsLoading(true);
      setError(null);

      try {
        const roomResponse = await fetch(
          `${BASE_URL}/rooms/id/${roomId}`
        );

        if (!roomResponse.ok) throw new Error("Room not found");

        const roomData = await roomResponse.json();
        const processedRoom = Array.isArray(roomData) ? roomData[0] : roomData;

        setRoom({
          ...processedRoom,
          price: Number(processedRoom.price),
          status: processedRoom.status,
        });

        if (processedRoom.status === "Booked") {
          const customerResponse = await fetch(
           `${BASE_URL}/tabs/customers`
          );

          if (customerResponse.ok) {
            const customers = await customerResponse.json();
            const roomCustomer = customers.find((c: Customer) => c.roomId === roomId);
            setCustomer(roomCustomer || null);
          }
        }
      } catch (error) {
        console.error("Error fetching room details:", error);
        setError("Failed to load room details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomId]);

  const openCheckInCalendar = () => {
    checkInRef.current?.focus();
    checkInRef.current?.showPicker?.();
  };

  const openCheckOutCalendar = () => {
    checkOutRef.current?.focus();
    checkOutRef.current?.showPicker?.();
  };

  const validateDates = () => {
    setDateError("");

    if (!checkInDate || !checkOutDate) {
      setDateError("Please select both check-in and check-out dates");
      return false;
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      setDateError("Check-out date must be after check-in date");
      return false;
    }

    return true;
  };

  const calculateStay = () => {
    if (!checkInDate || !checkOutDate || !room) return null;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (nights <= 0) return null;

    return {
      nights,
      totalPrice: nights * room.price,
    };
  };

  const stayDetails = calculateStay();

  const handleQuickBook = () => {
    if (!validateDates()) return;
    setShowBookForm(true);
    if (room) openBooking(room);
  };

  const handleBookingSaveWithRefresh = async (data: BookingData | BookingData[]) => {
    try {
      const guests = Array.isArray(data) ? data : [data];
      await handleBookingSave(guests);
      navigate("/rooms");
    } catch (error) {
      console.error("Booking failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">
          Loading room details...
        </span>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || "Room not found"}
          </h2>
          <Link
            to="/rooms"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          >
            <IoArrowBack className="mr-2" />
            Back to Rooms
          </Link>
        </div>
      </div>
    );
  }

  if (showBookForm && bookingRoom) {
    return (
      <BookRoomForm
        save={handleBookingSaveWithRefresh}
        close={() => {
          setShowBookForm(false);
          closeBooking();
        }}
        initialCheckInDate={checkInDate}
        initialCheckOutDate={checkOutDate}
        totalGuests={Number(noOfGuests) || 1}
        roomPrice={room?.price || 0}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-center justify-between">
          <Link
            to="/rooms"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium"
          >
            <IoArrowBack className="mr-2" />
            Back to Rooms
          </Link>
          <span
            className={`inline-flex px-5 py-2 text-base font-semibold rounded-full shadow ${
              room.status === "Available"
                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                : room.status === "Booked"
                ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
            }`}
          >
            {room.status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-blue-100 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-6">
              <IoKey className="text-blue-500 dark:text-blue-400" size={32} />
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {room.name}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-8 mb-4">
              <div className="flex items-center gap-2">
                <IoHome className="h-6 w-6 text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {room.type}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <IoPricetag className="h-6 w-6 text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  PKR {room.price?.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 ml-1">/night</span>
              </div>
              <div className="flex items-center gap-2">
                <IoPeople className="h-6 w-6 text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {room.status === "Available"
                    ? "Available"
                    : room.status === "Booked"
                    ? "Occupied"
                    : "Maintenance"}
                </span>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {room.description}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Room ID: <span className="font-mono">{room.id}</span>
              </p>
            </div>
          </div>

          <div>
            {room.status === "Booked" && customer && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-blue-100 dark:border-gray-700 mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <IoPersonCircle className="text-blue-400" size={28} />
                  Current Guest
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <IoPersonCircle className="text-blue-400" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {customer.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IoMail className="text-blue-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {customer.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IoCall className="text-blue-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {customer.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IoCalendar className="text-blue-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Check-in:{" "}
                      <span className="font-medium">
                        {new Date(customer.checkInDate).toLocaleDateString()}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IoCalendar className="text-blue-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Check-out:{" "}
                      <span className="font-medium">
                        {new Date(customer.checkOutDate).toLocaleDateString()}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IoKey className="text-blue-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Booking ID:{" "}
                      <span className="font-mono">{customer.bookingId}</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {room.status === "Available" && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-blue-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <IoCalendarOutline className="text-blue-400" size={24} />
                  Quick Booking
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    No of Guests
                  </label>
                  <input
                    type="number"
                    value={noOfGuests}
                    onChange={(e) => setNoOfGuests(Number(e.target.value) || 1)}
                    min={1}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Check-in Date
                    </label>
                    <div className="relative">
                      <input
                        ref={checkInRef}
                        type="date"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        min={today}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={openCheckInCalendar}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-auto"
                      >
                        <IoCalendarOutline className="h-5 w-5 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Check-out Date
                    </label>
                    <div className="relative">
                      <input
                        ref={checkOutRef}
                        type="date"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        min={checkInDate || today}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={openCheckOutCalendar}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-auto"
                      >
                        <IoCalendarOutline className="h-5 w-5 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors" />
                      </button>
                    </div>
                  </div>

                  {stayDetails && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-700">
                      <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                        Booking Summary
                      </h3>
                      <div className="space-y-1 text-sm">
                        <p className="text-blue-800 dark:text-blue-400">
                          <span className="font-medium">{stayDetails.nights}</span>{" "}
                          night{stayDetails.nights > 1 ? "s" : ""}
                        </p>
                        <p className="text-blue-800 dark:text-blue-400">
                          <span className="font-medium">
                            PKR {room.price.toLocaleString()}
                          </span>{" "}
                          per night
                        </p>
                        <div className="border-t border-blue-200 dark:border-blue-700 pt-2 mt-2">
                          <p className="text-blue-900 dark:text-blue-300 font-semibold">
                            Total: PKR {stayDetails.totalPrice.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {dateError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-md text-sm">
                      {dateError}
                    </div>
                  )}

                  <div className="flex pt-2">
                    <button
                      onClick={handleQuickBook}
                      disabled={!checkInDate || !checkOutDate}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-3xl font-semibold shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Book This Room
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}