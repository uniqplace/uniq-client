
import { Message } from 'primereact/message';
import { EmptyOrders } from './EmptyOrders';
import { OrderDetailsModal } from './OrderDetailsModal';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import type { Order, OrderStatus } from '../../../../types';
import { OrderCard } from './OrderCard';
import { useAppSelector } from '../../../../hooks/hooks';
import { useEffect, useState } from 'react';
import { getStatusTag } from './getStatusTag';
import { OrderStatusTracker } from './OrderStatus';
import { useNavigate } from 'react-router-dom';

type Props = {
  orders: Order[];
};

export default function MyOrdersPage({ orders }: Props) {

  const user = useAppSelector((state) => state.user);
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showStatusOrder, setShowStatusOrder] = useState<string | null>(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 960);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (!user?.id) return <Message severity="warn" text=" the user isnot login " />;
  if (!orders || orders.length === 0) return <EmptyOrders />;

  const filteredOrders = orders.filter(order => {
    const title = order.product?.title?.toLowerCase() || '';
    const matchesSearch = title.includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus ? order.status === selectedStatus : true;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Paid', value: 'paid' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  return (
    <div className="container max-w-none px-6 py-6">
      <div className="flex flex-wrap gap-4 mb-4 border p-4 rounded-md bg-white">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by product name"
          />
        </span>

        <Dropdown
          value={selectedStatus}
          options={statusOptions}
          onChange={(e) => setSelectedStatus(e.value ?? null)}
          placeholder="Filter by status"
          className="w-60"
          showClear
        />

        <Button
          label="Reset"
          icon="pi pi-times"
          className="p-button-secondary"
          onClick={() => {
            setSearchTerm('');
            setSelectedStatus(null);
          }}
        />
      </div>

      {isMobile ? (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onShowDetails={() => setSelectedOrder(order)}
            />
          ))}
        </div>
      ) : (
        <DataTable
          value={filteredOrders}
          responsiveLayout="scroll"
          stripedRows
          className="shadow rounded border w-full"
          size="small"
        >
          <Column
             field="Product"
             header="Product"
             body={(rowData) => (
               <div className="flex items-center gap-3 w-full max-w-[240px]">
                 <img
                   src={rowData.product.images[0]}
                   width={50}
                   height={50}
                   className="rounded flex-shrink-0"
                   alt={rowData.product.title}
                 />
                 <span className="text-sm break-words whitespace-normal">
                   {rowData.product.title}
                 </span>
               </div>
             )}
             sortable
          />
          <Column
            field="createdAt"
            header="Date"
            body={(rowData) => new Date(rowData.createdAt).toLocaleDateString('he-IL')}
            sortable
          />
          <Column
            field="status"
            header="Status"
            body={(rowData) => getStatusTag(rowData.status)}
            sortable
          />
          <Column
            field="totalAmount"
            header="Total Payment"
            body={(rowData) => `${rowData.totalAmount} ₪`}
            sortable
          />
          <Column
            field="paymentMethod"
            header="Payment Method"
          />
          <Column
            header="Action"
            body={(rowData) => (
              <div className="flex gap-2">
                <Button
                  label="Details"
                  icon="pi pi-eye"
                  size="small"
                  className="p-button-sm text-xs"
                  onClick={() => setSelectedOrder(rowData)}
                />
                <Button
                  label="Track"
                  icon="pi pi-truck"
                  size="small"
                  className="p-button-sm text-xs"
                  onClick={() => setShowStatusOrder(rowData.status)}
                />
                <Button
                  label="Repeat"
                  icon="pi pi-refresh"
                  size="small"
                  className="p-button-sm text-xs flex-1"
                  onClick={() => navigate(`/checkout/${rowData.product._id}`)}
                />
              </div>
            )}
          />
        </DataTable>
      )}

      {showStatusOrder && (
        <OrderStatusTracker
          visible={!!showStatusOrder}
          status={showStatusOrder as OrderStatus}
          onHide={() => setShowStatusOrder(null)}
        />
      )}

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}

