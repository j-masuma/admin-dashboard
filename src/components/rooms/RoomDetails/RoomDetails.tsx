import { useParams, Link } from "react-router";
import { useState, useEffect, useRef } from "react";
import { IoArrowBack, IoCalendar, IoPeople, IoHome, IoPricetag, IoCalendarOutline } from "react-icons/io5";

interface Room {
  id: string;
  name: string;
  type: string;
  price: number;
  availability: boolean;
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

export default function RoomDetails() {
  const { roomId } = useParams<{ roomId: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Date fields for quick booking
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [dateError, setDateError] = useState('');

  // Refs for date inputs to trigger calendar
  const checkInRef = useRef<HTMLInputElement>(null);
  const checkOutRef = useRef<HTMLInputElement>(null);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchRoomDetails = async () => {
      if (!roomId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch room data
        const roomResponse = await fetch(`https://api.sheetbest.com/sheets/72d038c4-48d2-4f11-9db7-f6dd4c90e828/tabs/rooms/id/${roomId}`);
        
        if (!roomResponse.ok) {
          throw new Error('Room not found');
        }
        
        const roomData = await roomResponse.json();
        const processedRoom = Array.isArray(roomData) ? roomData[0] : roomData;
        
        setRoom({
          ...processedRoom,
          price: Number(processedRoom.price),
          availability: processedRoom.availability === true || 
                       String(processedRoom.availability).toLowerCase() === "true" || 
                       String(processedRoom.availability) === "1"
        });

        // If room is booked, fetch customer data
        if (!processedRoom.availability) {
          const customerResponse = await fetch('https://api.sheetbest.com/sheets/72d038c4-48d2-4f11-9db7-f6dd4c90e828/tabs/customers');
          
          if (customerResponse.ok) {
            const customers = await customerResponse.json();
            const roomCustomer = customers.find((c: Customer) => c.roomId === roomId);
            setCustomer(roomCustomer || null);
          }
        }
        
      } catch (error) {
        console.error('Error fetching room details:', error);
        setError('Failed to load room details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomId]);

  // Function to trigger calendar for check-in date
  const openCheckInCalendar = () => {
    if (checkInRef.current) {
      checkInRef.current.focus();
      checkInRef.current.showPicker?.();
    }
  };

  // Function to trigger calendar for check-out date
  const openCheckOutCalendar = () => {
    if (checkOutRef.current) {
      checkOutRef.current.focus();
      checkOutRef.current.showPicker?.();
    }
  };

  // Validate dates
  const validateDates = () => {
    setDateError('');
    
    if (!checkInDate || !checkOutDate) {
      setDateError('Please select both check-in and check-out dates');
      return false;
    }
    
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    
    if (checkIn >= checkOut) {
      setDateError('Check-out date must be after check-in date');
      return false;
    }
    
    return true;
  };

  // Calculate number of nights and total price
  const calculateStay = () => {
    if (!checkInDate || !checkOutDate || !room) return null;
    
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (nights <= 0) return null;
    
    return {
      nights,
      totalPrice: nights * room.price
    };
  };

  const stayDetails = calculateStay();

  // Handle book room with pre-filled dates
  const handleQuickBook = () => {
    if (!validateDates()) return;
    
    // Store dates in localStorage to pre-fill the booking form
    localStorage.setItem('quickBooking', JSON.stringify({
      roomId: room?.id,
      checkInDate,
      checkOutDate
    }));
    
    // Navigate back to rooms page (booking form will open automatically)
    window.location.href = '/rooms';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading room details...</span>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Room not found'}
          </h2>
          <Link
            to="/rooms"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <IoArrowBack className="mr-2" />
            Back to Rooms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/rooms"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors mb-4"
          >
            <IoArrowBack className="mr-2" />
            Back to Rooms
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {room.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Room ID: #{room.id}
              </p>
            </div>
            
            <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full ${
              room.availability === true
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {room.availability === true ? 'Available' : 'Booked'}
            </span>
          </div>
        </div>

        {/* Room Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Room Details Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Room Information
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <IoHome className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Room Type</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{room.type}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <IoPricetag className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Price per Night</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    PKR {room.price?.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <IoPeople className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {room.availability ? 'Available for Booking' : 'Currently Occupied'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information Card (if booked) */}
          {!room.availability && customer && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Current Guest
              </h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Guest Name</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{customer.name}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{customer.email}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{customer.phone}</p>
                </div>
                
                <div className="flex items-center">
                  <IoCalendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Check-in Date</p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {new Date(customer.checkInDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <IoCalendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Check-out Date</p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {new Date(customer.checkOutDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Booking ID</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{customer.bookingId}</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Booking Card (if available) */}
          {room.availability && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Quick Booking
              </h2>
              
              <div className="space-y-4">
                {/* Check-in Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Check-in Date
                  </label>
                  <div className="relative">
                    <input
                      ref={checkInRef}
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      min={today}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={openCheckInCalendar}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-auto"
                    >
                      <IoCalendarOutline className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                    </button>
                  </div>
                </div>

                {/* Check-out Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Check-out Date
                  </label>
                  <div className="relative">
                    <input
                      ref={checkOutRef}
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      min={checkInDate || today}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={openCheckOutCalendar}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-auto"
                    >
                      <IoCalendarOutline className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                    </button>
                  </div>
                </div>

                {/* Stay Summary */}
                {stayDetails && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                      Booking Summary
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-blue-800 dark:text-blue-400">
                        <span className="font-medium">{stayDetails.nights}</span> night{stayDetails.nights > 1 ? 's' : ''}
                      </p>
                      <p className="text-blue-800 dark:text-blue-400">
                        <span className="font-medium">PKR {room.price.toLocaleString()}</span> per night
                      </p>
                      <div className="border-t border-blue-200 dark:border-blue-700 pt-2 mt-2">
                        <p className="text-blue-900 dark:text-blue-300 font-semibold">
                          Total: PKR {stayDetails.totalPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {dateError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-md text-sm">
                    {dateError}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleQuickBook}
                    disabled={!checkInDate || !checkOutDate}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Book This Room
                  </button>
                  
                  <Link
                    to="/rooms"
                    className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    View All Rooms
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}