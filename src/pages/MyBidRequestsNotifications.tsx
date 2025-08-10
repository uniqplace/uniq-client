import { useEffect, useState } from 'react';
import { ListBox } from 'primereact/listbox';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Paginator } from 'primereact/paginator';
import { deduplicateNotifications } from '../utils/notificationHelpers';
// import getUserIdFromToken from '../utils/getUserIdFromToken';
import { getNotificationsFetch } from '../services/notificationApi';
import { useNavigate } from 'react-router-dom';
import type { Notification } from '../types/notification';
import { useAppSelector } from '../hooks/hooks';

const MyBidRequestsNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const getUserId = useAppSelector((state) => state.user.id);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async (pageNum: number) => {
      setLoading(true);
      setError(null);
      try {

        if (!getUserId) {
          navigate('/login');
          return;
        }
        const limit = 10;
        const { notifications, pages } = await getNotificationsFetch(getUserId, pageNum, limit);
        const bidNotifications = deduplicateNotifications(notifications)
          .filter((n) => n.type === 'NEW_BID' || n.bidRequestId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setNotifications(bidNotifications);
        setTotalPages(pages);
      } catch (err: any) {
        setError('Error loading notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications(page);
  }, [page, navigate, getUserId]);

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-700">My Bid Requests Notifications</h2>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <ProgressSpinner />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : notifications.length === 0 ? (
        <div className="text-gray-500 text-center">No notifications found.</div>
      ) : (
        <>
          <ListBox
            value={null}
            options={notifications}
            optionLabel="title"
            style={{ height: '32rem', overflowY: 'auto', marginBottom: '1.5rem' }}
            itemTemplate={(n) => (
              <div
                className="p-3 border-b text-base cursor-pointer"
                onClick={() => {
                  const notificationUserId = n.userId;
                  if (n.link) {
                    navigate(n.link, { state: { userId: notificationUserId } });
                  } else if (n.bidRequestId) {
                    navigate(`/bids/${n.bidRequestId}`, { state: { userId: notificationUserId } });
                  }
                }}
              >
                <span className={n.isRead ? '' : 'font-bold'}>{n.title}</span>
              </div>
            )}
          />
          <div className="flex justify-center">
            <Paginator
              first={(page - 1) * 10}
              rows={10}
              totalRecords={totalPages * 10}
              pageLinkSize={2}
              template="PrevPageLink NextPageLink"
              onPageChange={(e: any) => {
                setPage(e.page + 1);
              }}
              currentPageReportTemplate=""
              className="p-paginator-sm"
              style={{ minWidth: '160px' }}
              leftContent={null}
              rightContent={null}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default MyBidRequestsNotifications;
