import { useEffect, useState } from 'react';
import { formatDeliveryTimeframe } from '../../../utils/date';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import type { BidRequest } from '../../../types';
import type { RootState } from '../../../store';
import { Tag } from 'primereact/tag';
import { getBidRequestsByCreator } from '../slices/BidRequestSlice';
import BidOffersList from './BidOffersList';
import { useNavigate, useParams } from 'react-router-dom';
import BidRequestsFilterFields from '../../../components/shared/BidRequestsFilterFields';

export const OpenBidPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { bidRequestId } = useParams<{ bidRequestId?: string }>();

  const { bidRequests, loading, error } = useAppSelector(
    (state: RootState) => state.bidRequest
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getBidRequestsByCreator());
  }, [dispatch]);

  const statusOptions = [
    { label: 'Open', value: 'open' },
    { label: 'Expired', value: 'expired' },
    { label: 'Closed', value: 'closed' },
  ];

  const filteredBidRequests = bidRequests
    .filter((bid) => {
      const productTitle =
        typeof bid.productId === 'object' && bid.productId !== null && 'title' in bid.productId
          ? bid.productId.title.toLowerCase()
          : '';
      const matchesSearch = productTitle.includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus ? bid.status === selectedStatus : true;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

  const statusTemplate = (rowData: BidRequest) => {
    const status = rowData.status;
    let severity: 'success' | 'warning' | 'danger' | 'info' = 'info';
    if (status === 'open') severity = 'success';
    else if (status === 'expired') severity = 'warning';
    else if (status === 'closed') severity = 'danger';
    return <Tag value={status} severity={severity} />;
  };

  const actionsTemplate = (rowData: BidRequest) => {
    return (
      <Button
        label="View offers"
        icon="pi pi-eye"
        onClick={() => {
          navigate(`/MyBidRequest/${rowData._id}`);
        }}
        className="p-button-sm"
      />
    )
  };

  const deliveryTimeframeTemplate = (rowData: BidRequest) => {
    return formatDeliveryTimeframe(rowData.deliveryTimeframe, 'he-IL');
  };

  const dateBodyTemplate = (rowData: BidRequest, field: keyof BidRequest) => {
    const value = rowData[field];
    let dateValue: string | Date | undefined = undefined;
    if (value instanceof Date || typeof value === 'string') {
      dateValue = value;
    } else if (typeof value === 'number') {
      dateValue = new Date(value);
    } else {
      // כל ערך אחר לא נתמך
      return '-';
    }
    return formatDeliveryTimeframe(dateValue, 'he-IL');
  };

  const title = (
    <h2 className="text-xl font-bold mb-4 mt-8"> My BidRequests</h2>
  );

  useEffect(() => {
    if (bidRequestId) {
      // Removed debug log
    }
  }, [bidRequestId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <ProgressSpinner />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-4">ERROR: {error}</div>;
  }

  if (!Array.isArray(bidRequests) || bidRequests.length === 0) {
    return (
      <div className="p-4 text-center text-gray-600">
        {title}
        <p>There are no open BidREquest to display at this time.</p>
      </div>
    );
  }

  if (bidRequestId) {
    return (
      <div className="p-4">
        <Button label="Back to My BidRequests" icon="pi pi-arrow-left" className="mb-4" onClick={() => navigate('/MyBidRequest')} />
        <BidOffersList bidRequestId={bidRequestId} />
      </div>
    );
  }

  return (
    <div className="p-4" style={{ margin: 0, padding: 0, background: 'none' }}>
      {title}

      <BidRequestsFilterFields
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        statusOptions={statusOptions}
      />

      <DataTable
        value={filteredBidRequests}
        paginator
        paginatorTemplate="PrevPageLink PageLinks NextPageLink"
        rows={10}
        responsiveLayout="scroll"
        sortMode="multiple"
      >
        <Column
          field="productId"
          body={(rowData: BidRequest) =>
            typeof rowData.productId === 'object' && rowData.productId !== null && 'title' in rowData.productId
              ? rowData.productId.title
              : '-'
          }
          header="Product"
          sortable
        />
        <Column
          field="categoryId"
          body={(rowData: BidRequest) =>
            typeof rowData.categoryId === 'object' && rowData.categoryId !== null && 'name' in rowData.categoryId
              ? (rowData.categoryId as { name?: string }).name || '-'
              : '-'
          }
          header="Category"
          sortable
        />
        <Column field="locationPreference" header="Preferred Region" sortable />
        <Column
          field="createdAt"
          header="Created At"
          body={(row) => dateBodyTemplate(row, 'createdAt')}
          sortable
          sortField="createdAt"
          dataType="date"
        />
        <Column
          field="deliveryTimeframe"
          header="Delivery Date"
          body={deliveryTimeframeTemplate}
          sortable
          sortField="deliveryTimeframe"
          dataType="date"
        />
        <Column
          field="status"
          header="Status"
          body={statusTemplate}
          sortable
          sortField="status"
          dataType="string"
        />
        <Column header="" body={actionsTemplate} style={{ width: '150px' }} />
      </DataTable>
    </div>
  );
};
