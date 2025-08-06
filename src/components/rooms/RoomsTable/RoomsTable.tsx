/* eslint-disable react-hooks/exhaustive-deps */

import { IoAdd, IoRefresh } from "react-icons/io5";
import { IoIosArrowDown, IoMdWarning } from "react-icons/io";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { useState, useEffect } from "react";
import RoomForm from '../RoomForm/RoomForm';
import RoomEditForm from '../RoomForm/RoomEditForm';
import { Link } from "react-router-dom";

interface Room {
  id: string;
  name: string;
  type: string;
  room_no: number;
  price: number;
  description: string;
  status: "Available" | "Booked" | "Maintenance";
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  roomName: string;
  roomId: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

const DeleteConfirmationModal = ({ 
  isOpen, 
  roomName, 
  roomId, 
  onConfirm, 
  onCancel, 
  isDeleting 
}: DeleteConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <IoMdWarning className="h-8 w-8 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Delete Room
              </h3>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to delete the room "{roomName}" (ID: {roomId})? 
              This action cannot be undone.
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 border border-transparent rounded-md hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
            >
              {isDeleting ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                'Delete Room'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Utility function to check and update room statuses
const checkAndUpdateRoomStatuses = async (currentRooms: Room[]) => {
  try {
    // Fetch all bookings
    const bookingsRes = await fetch(
      'https://api.sheetbest.com/sheets/72d038c4-48d2-4f11-9db7-f6dd4c90e828/tabs/bookings'
    );
    if (!bookingsRes.ok) throw new Error('Failed to fetch bookings');
    
    const bookings = await bookingsRes.json();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find rooms that should be available
    const roomsToUpdate = currentRooms.filter(room => {
      if (room.status !== "Booked") return false;
      
      // Find booking for this room
      const roomBooking = bookings.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (booking: any) => booking.room_no === room.room_no && booking.status === "Booked"
      );
      
      if (!roomBooking) return false;
      
      // Check if checkout date has passed
      const checkoutDate = new Date(roomBooking.check_out_date);
      checkoutDate.setHours(0, 0, 0, 0);
      
      return checkoutDate < today;
    });

    // Update each room that needs status change
    const updatePromises = roomsToUpdate.map(async (room) => {
      const updatedRoom: Room = { ...room, status: "Available" };
      
      await fetch(
        `https://api.sheetbest.com/sheets/72d038c4-48d2-4f11-9db7-f6dd4c90e828/tabs/rooms/id/${room.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: "Available" }),
        }
      );
      
      return updatedRoom;
    });

    const updatedRooms = await Promise.all(updatePromises);
    
    // Return the updated room list
    return currentRooms.map(room => {
      const updatedRoom = updatedRooms.find(r => r.id === room.id);
      return updatedRoom || room;
    });
    
  } catch (error) {
    console.error("Error updating room statuses:", error);
    return currentRooms;
  }
};

export default function RoomTable() {
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [tableData, setTableData] = useState<Room[]>([]);
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    roomId: '',
    roomName: ''
  });

  const toggleDropdown = (id: string) => {
    setOpenDropdownId((prevId) => (prevId === id ? null : id));
  };
  const BASE_URL = import.meta.env.VITE_BASE_URL
  // Click outside handler
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

  // Fetch room data and check statuses
  const getData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/rooms`);
      if (!res.ok) throw new Error('Failed to fetch data');
      
      const rawData = await res.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let processedData: Room[] = rawData.map((room: any) => ({
        ...room,
        price: Number(room.price),
        status: room.status as "Available" | "Booked" | "Maintenance",
      }));
      
      // Check and update room statuses based on bookings
      processedData = await checkAndUpdateRoomStatuses(processedData);
      
      setTableData(processedData || []);
    } catch (error) {
      console.error("Error fetching rooms data:", error);
      setError('Failed to load rooms data');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh table when needed
  useEffect(() => {
    if (shouldRefresh) {
      getData();
      setShouldRefresh(false);
    }
  }, [shouldRefresh]);

  // Initial data load
  useEffect(() => {
    getData();
  }, []);

  // Periodic status check
  useEffect(() => {
    const interval = setInterval(() => {
      if (tableData.length > 0) {
        checkAndUpdateRoomStatuses(tableData).then(updatedRooms => {
          setTableData(updatedRooms);
        });
      }
    }, 60 * 60 * 1000); // Check every hour
    
    return () => clearInterval(interval);
  }, [tableData]);

  const openDeleteModal = (roomId: string, roomName: string) => {
    setOpenDropdownId(null);
    setDeleteModal({
      isOpen: true,
      roomId,
      roomName
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      roomId: '',
      roomName: ''
    });
  };

  const handleConfirmDelete = async () => {
    const { roomId } = deleteModal;
    setIsDeleting(roomId);
    
    try {
      const response = await fetch(`${BASE_URL}/rooms/id/${roomId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTableData(prev => prev.filter(room => room.id !== roomId));
        closeDeleteModal();
      } else {
        throw new Error('Failed to delete room from server');
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Failed to delete room. Please try again.');
      getData();
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSaveForm = async (formData: {
    name: string;
    type: string;
    price: number;
    room_no: number;
    description: string;
    status: "Available" | "Booked" | "Maintenance";
  }) => {
    try {
      const maxId = tableData.length > 0 ? Math.max(...tableData.map(item => Number(item.id))) : 0;
      const newRoomData: Room = {
        id: (maxId + 1).toString(),
        name: formData.name,
        type: formData.type,
        room_no: formData.room_no,
        price: formData.price,
        description: formData.description,
        status: formData.status,
      };

      const response = await fetch(`${BASE_URL}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRoomData),
      });

      if (response.ok) {
        setTableData((prevData) => [newRoomData, ...prevData]);
        setShowForm(false);
      } else {
        throw new Error('Failed to save room');
      }
    } catch (error) {
      console.error('Error saving room data:', error);
      alert('Failed to save room data. Please try again.');
    }
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setOpenDropdownId(null);
  };

  const handleUpdateRoom = async (formData: {
    name: string;
    type: string;
    price: number;
    status: "Available" | "Booked" | "Maintenance";
  }) => {
    if (!editingRoom) return;

    try {
      const updatedRoomData = {
        ...editingRoom,
        name: formData.name,
        type: formData.type,
        price: formData.price,
        status: formData.status,
      };

      const response = await fetch(
        `${BASE_URL}/rooms/id/${editingRoom.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedRoomData),
        }
      );

      if (response.ok) {
        setTableData((prevData) =>
          prevData.map((room) =>
            room.id === editingRoom.id ? updatedRoomData : room
          )
        );
        setEditingRoom(null);
      } else {
        throw new Error("Failed to update room");
      }
    } catch (error) {
      console.error("Error updating room data:", error);
      alert("Failed to update room data. Please try again.");
    }
  };

  const handleRefresh = () => {
    getData();
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            All Rooms
          </h2>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
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
          <button
            onClick={() => setShowForm(true)}
            className="flex gap-1 items-center px-4 py-2 bg-blue-600 rounded-md text-white text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
          >
            <IoAdd /> New Room
          </button>
        </div>
      </div>

      {showForm ? (
        <RoomForm save={handleSaveForm} close={() => setShowForm(false)} />
      ) : editingRoom ? (
        <RoomEditForm 
          roomData={editingRoom}
          save={handleUpdateRoom}
          close={() => setEditingRoom(null)}
          isEditing={true}
        />
      ) : (
        <div className="overflow-x-auto h-96 rounded-md border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-gray-900">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading rooms...</span>
            </div>
          ) : tableData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 dark:text-gray-400">No rooms found</p>
            </div>
          ) : (
            <div className="max-w-full h-full overflow-x-auto overflow-y-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] sticky top-0 bg-white dark:bg-gray-900 z-20">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                      ROOM NO
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                      NAME
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                      TYPE
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                      PRICE (PKR)
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                      AVAILABILITY
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400 whitespace-nowrap">
                      ACTIONS
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {tableData.map((room) => (
                    <TableRow 
                      key={room.id} 
                      className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                        isDeleting === room.id ? 'opacity-50' : ''
                      }`}
                    >
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">
                        {room.room_no}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start whitespace-nowrap">    
                        <div>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            <Link to={`/room-details/${room.id}`}>{room.name}</Link>
                          </span>
                        </div>  
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">
                        {room.type}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">
                        <span className="font-medium">{room.price?.toLocaleString?.() ?? '-'}</span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          room.status === "Available"
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : room.status === "Booked"
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        }`}>
                          {room.status}
                        </span>
                      </TableCell>
                      <TableCell className="relative px-4 py-3 text-end whitespace-nowrap">
                        <div className="relative inline-block dropdown-container">
                          <button
                            onClick={() => toggleDropdown(room.id)}
                            disabled={isDeleting === room.id}
                            className="cursor-pointer rounded-full bg-blue-500 items-center justify-center text-white w-5 h-5 flex disabled:opacity-50 hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                          >
                            <IoIosArrowDown className={`transform transition-transform ${openDropdownId === room.id ? 'rotate-180' : ''}`} />
                          </button>

                          {openDropdownId === room.id && (
                            <div className="origin-top-right absolute right-0 mt-2 w-36 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50 border dark:border-gray-700">
                              <div className="py-1">
                                {room.status === "Available" ? (
                                  <Link
                                    to={`/room-details/${room.id}`}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                  >
                                    Book
                                  </Link>
                                ) : (
                                  <div className="block w-full text-left px-4 py-2 text-sm text-gray-400 dark:text-gray-500 cursor-not-allowed">
                                    {room.status}
                                  </div>
                                )}

                                <button 
                                  className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                                  onClick={() => handleEditRoom(room)}
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => openDeleteModal(room.id, room.name)}
                                  disabled={isDeleting === room.id}
                                  className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors focus:outline-none focus:bg-red-50 dark:focus:bg-red-900/20"
                                >
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
            </div>
          )}
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        roomName={deleteModal.roomName}
        roomId={deleteModal.roomId}
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteModal}
        isDeleting={isDeleting === deleteModal.roomId}
      />
    </>
  );
}