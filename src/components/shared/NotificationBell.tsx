// import { useEffect, useState } from 'react';
// import { Button } from 'primereact/button';
// import { Toast } from 'primereact/toast';
// import { Bell } from 'lucide-react';
// import { ListBox } from 'primereact/listbox';
// import socket from '../../services/socket';
// // import  getUserIdFromToken from '../../utils/getUserIdFromToken';
// // import { getCookie } from '../../utils/cookies';
// import { getUnreadCount, markAsRead } from '../../services/notificationApi';
// import { deduplicateNotifications } from '../../utils/notificationHelpers';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { useNotifications } from '../../hooks/useNotifications';
// import { useSelector } from 'react-redux';

// // Utility function to check if a value is an object
// const isObject = (value: any): boolean => {
//   return value !== null && typeof value === 'object';
// };

// const NotificationBell = () => {
//   const navigate = useNavigate();
//   const {
//     count,
//     notifications,
//     hasMore,
//     authError,
//     loading,
//     error,
//     toastRef,
//     setNotifications,
//     setCount,
//     loadNotifications,
//     loadMore,
//   } = useNotifications();

//   const [isOpen, setIsOpen] = useState<boolean>(false);
//   const user = useSelector((state: any) => state.user);

//   useEffect(() => {
//     // Get token from cookies
//     // const token = getCookie('token');
//     // if (!token) {
//     //   return;
//     // }

//     // const userId = getUserIdFromToken();
//     if (!user?._id && !user?.id) {
//       return;
//     }

//     socket.on('new_bid', (data: any) => {
//       setCount((prev) => prev + 1);
//       setNotifications((prev) => [data.payload, ...prev]);
//     });

//     return () => {
//       socket.off('new_bid'); // Updated to match the listener event name
//     };
//   }, []);

//   const fetchUnreadCount = async (setCount: (count: number) => void, toastRef: React.RefObject<Toast | null>) => {
//     try {
//       const res = await getUnreadCount(user?._id || user?.id);
//       setCount(res.data.count);
//     } catch (err) {
//       if (toastRef.current) {
//         toastRef.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch unread count', life: 3000 });
//       } else {
//         toast.error('Failed to fetch unread count');
//       }
//     }
//   };

//   return (
//     <>
//       {/* PrimeReact Toast for errors */}
//       <Toast ref={toastRef} />
//       <div className="relative">
//         <button
//           className="relative"
//           onClick={async () => {
//             if (!isOpen) {
//               // On open: load notifications
//               await loadNotifications(1);
//             }
//             setIsOpen((prev) => !prev);
//           }}
//           style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
//         >
//           <Bell className="w-6 h-6 text-gray-700" />
//           {count > 0 && (
//             <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
//               {count}
//             </span>
//           )}
//         </button>
//         {isOpen && (
//           <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-md z-50 border border-gray-200 flex flex-col" style={{ minHeight: '350px' }}>
//             <Button
//               icon="pi pi-times"
//               className="p-button-rounded p-button-text absolute top-2 right-2"
//               style={{ zIndex: 10 }}
//               onClick={() => setIsOpen(false)}
//               aria-label="Close notifications"
//             />
//             <div className="px-4 pt-6 pb-2 flex-1 flex flex-col">
//               <h3 className="text-lg font-semibold mb-2 text-gray-700">Notifications</h3>
//               {authError ? (
//                 <div className="p-4 text-center text-red-500 text-sm">Please login to view notifications</div>
//               ) : loading ? (
//                 <div className="p-4 text-center text-gray-500 text-sm">Loading notifications...</div>
//               ) : error ? (
//                 <div className="p-4 text-center text-red-500 text-sm">{error}</div>
//               ) : (
//                 <div className="flex flex-col flex-1">
//                   <ListBox
//                     value={null}
//                     options={deduplicateNotifications(notifications)}
//                     optionLabel="title"
//                     style={{ maxHeight: '16rem', overflowY: 'auto', marginTop: '1.5rem', flex: '1 1 auto' }}
//                     onChange={async (e) => {
//                       if (!e.value || !isObject(e.value)) return; // Use the utility function
//                       const notification = e.value;
//                       setNotifications((prev) => prev.filter(item => item && item._id && item._id !== notification._id));
//                       try {
//                         await markAsRead(notification._id);
//                         // Update bell counter after marking as read
//                         await fetchUnreadCount(setCount, toastRef);
//                         setIsOpen(false);
//                         if (notification.type === 'NEW_BID' && notification.bidRequestId) {
//                           navigate(`/MyBidRequests/${notification.bidRequestId}`);
//                         } else if (notification.link) {
//                           navigate(notification.link);
//                         }
//                       } catch (err) {
//                         if (toastRef.current) {
//                           toastRef.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to mark notification as read', life: 3000 });
//                         } else {
//                           toast.error('Failed to mark notification as read');
//                         }
//                       }
//                     }}
//                     itemTemplate={(notification) => (
//                       <div className="p-2 border-b text-sm cursor-pointer">
//                         <span className={notification.isRead ? '' : 'font-bold'}>{notification.title}</span>
//                       </div>
//                     )}
//                   />
//                   {hasMore && (
//                     <div className="mt-2 flex-shrink-0">
//                       <Button
//                         label="Load more"
//                         className="w-full p-button-text p-button-sm"
//                         style={{ borderTop: '1px solid #eee' }}
//                         onClick={loadMore}
//                       />
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//             {/* <div className="px-4 pb-4 pt-2 border-t border-gray-200">
//               <Button
//                 label="Show all bid request notifications"
//                 className="w-full p-button-sm p-button-info"
//                 onClick={() => {
//                   setIsOpen(false);
//                   navigate('/myBidRequestsNotifications');
//                 }}
//               />
//             </div> */}
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default NotificationBell;


import { useEffect, useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Bell } from 'lucide-react';
import { ListBox } from 'primereact/listbox';
import socket from '../../services/socket';
import { getUnreadCount, markAsRead } from '../../services/notificationApi';
import { deduplicateNotifications } from '../../utils/notificationHelpers';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useNotifications } from '../../hooks/useNotifications';
import { useSelector } from 'react-redux';

// Utility function to check if a value is an object
const isObject = (value: any): boolean => {
  return value !== null && typeof value === 'object';
};

const NotificationBell = () => {
  const navigate = useNavigate();
  const {
    count,
    notifications,
    hasMore,
    authError,
    loading,
    error,
    toastRef,
    setNotifications,
    setCount,
    loadNotifications,
    loadMore,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [notificationsLoaded, setNotificationsLoaded] = useState(false);
  const user = useSelector((state: any) => state.user);

  // Ref למיכל התראות (scroll container)
  const listRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user?._id && !user?.id) return;

    // טוען את מספר ההתראות הלא נקראות מהשרת בהתחלת הקומפוננטה
    const fetchCount = async () => {
      try {
        const res = await getUnreadCount(user._id || user.id);
        setCount(res.data.count);
      } catch (err) {
        if (toastRef.current) {
          toastRef.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch unread count', life: 3000 });
        } else {
          toast.error('Failed to fetch unread count');
        }
      }
    };

    fetchCount();

    // מאזין לאירוע התראה חדשה דרך Socket
    socket.on('new_bid', (data: any) => {
      setCount((prev) => prev + 1);
      setNotifications((prev) => [data.payload, ...prev]);
    });

    return () => {
      socket.off('new_bid');
    };
  }, [user, setCount, setNotifications, toastRef]);

  // מאזין לגלילה במיכל ההתראות לטעינת עמוד נוסף אוטומטית
  useEffect(() => {
    const onScroll = () => {
      if (!listRef.current || !loading || !hasMore) return; // Stop if no more notifications

      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      // אם הגולל הגיע ל-90% מהתחתית, טען עוד
      if (scrollTop + clientHeight >= scrollHeight * 0.9) {
        loadMore();
      }
    };

    const el = listRef.current;
    if (el) {
      el.addEventListener('scroll', onScroll);
    }

    return () => {
      if (el) {
        el.removeEventListener('scroll', onScroll);
      }
    };
  }, [loading, hasMore, loadMore]);

  // Intersection observer to auto-load more
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loaderRef, hasMore, loadMore]);

  const handleBellClick = async () => {
    if (!isOpen && !notificationsLoaded) {
      await loadNotifications(1); // Load notifications only if not already loaded
      setNotificationsLoaded(true);
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <Toast ref={toastRef} />
      <div className="relative">
        <button
          className="relative"
          onClick={handleBellClick}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          aria-label="Toggle notifications"
        >
          <Bell className="w-6 h-6 text-gray-700" />
          {count > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-md z-50 border border-gray-200 flex flex-col" style={{ minHeight: '350px' }}>
            <Button
              icon="pi pi-times"
              className="p-button-rounded p-button-text absolute top-2 right-2"
              style={{ zIndex: 10 }}
              onClick={() => setIsOpen(false)}
              aria-label="Close notifications"
            />
            <div className="px-4 pt-6 pb-2 flex-1 flex flex-col">
              <h3 className="text-lg font-semibold mb-2 text-gray-700">Notifications</h3>
              {authError ? (
                <div className="p-4 text-center text-red-500 text-sm">Please login to view notifications</div>
              ) : loading ? (
                <div className="p-4 text-center text-gray-500 text-sm">Loading notifications...</div>
              ) : error ? (
                <div className="p-4 text-center text-red-500 text-sm">{error}</div>
              ) : (
                <div className="flex flex-col flex-1" style={{ maxHeight: '16rem', overflowY: 'auto', marginTop: '1.5rem', flex: '1 1 auto' }} ref={listRef}>
                  <ListBox
                    value={null}
                    options={deduplicateNotifications(notifications)}
                    optionLabel="title"
                    onChange={async (e) => {
                      if (!e.value || !isObject(e.value)) return;
                      const notification = e.value;
                      setNotifications((prev) => prev.filter((item) => item && item._id && item._id !== notification._id));
                      try {
                        await markAsRead(notification._id);
                        // עדכון הספירה לאחר סימון כה נקראה
                        const res = await getUnreadCount(user._id || user.id);
                        setCount(res.data.count);
                        setIsOpen(false);
                        if (notification.type === 'NEW_BID' && notification.bidRequestId) {
                          navigate(`/MyBidRequests/${notification.bidRequestId}`);
                        } else if (notification.link) {
                          navigate(notification.link);
                        }
                      } catch (err) {
                        if (toastRef.current) {
                          toastRef.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to mark notification as read', life: 3000 });
                        } else {
                          toast.error('Failed to mark notification as read');
                        }
                      }
                    }}
                    itemTemplate={(notification) => (
                      <div className="p-2 border-b text-sm cursor-pointer">
                        <span className={notification.isRead ? '' : 'font-bold'}>{notification.title}</span>
                      </div>
                    )}
                  />
                  {!hasMore && (
                    <div ref={loaderRef} style={{ textAlign: 'center', padding: '1rem', display: 'none' }}></div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationBell;
