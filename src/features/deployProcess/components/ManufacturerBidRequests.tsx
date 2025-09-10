import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import type { BidRequest } from '../../../types';
import type { RootState } from '../../../store';
import { Tag } from 'primereact/tag';
import { getBidRequestsForManufacturer } from '../slices/BidRequestSlice';
import { getNestedFieldValue } from '../../../utils/objectHelpers';
import { formatDeliveryTimeframe } from '../../../utils/date';
import BidRequestsFilterFields from '../../../components/shared/BidRequestsFilterFields';

const ManufacturerBidRequests = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { bidRequests, loading, error } = useAppSelector(
    (state: RootState) => state.bidRequest
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getBidRequestsForManufacturer());
  }, [dispatch]);

  const statusOptions = [
    { label: 'Open', value: 'open' },
    { label: 'Expired', value: 'expired' },
    { label: 'Closed', value: 'closed' },
  ];

    // Sort bid requests by date descending (newest first)
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

  const actionsTemplate = (rowData: BidRequest) => (
    <Button
      label="View Details"
      icon="pi pi-pencil"
      onClick={() => navigate(`/myBidRequests/${rowData._id}`)}
      className="p-button-sm"
    />
  );

  const dateBodyTemplate = (rowData: BidRequest, field: keyof BidRequest) => {
    const value = rowData[field];
    let dateValue: string | Date | undefined = undefined;
    if (value instanceof Date || typeof value === 'string') {
      dateValue = value;
    } else if (typeof value === 'number') {
      dateValue = new Date(value);
    } else {
      return '-';
    }
    return formatDeliveryTimeframe(dateValue, 'he-IL');
  };

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
        <h2 className="text-xl font-bold mb-4 mt-8"> Bid Requests Sent to Me</h2>
        <p>There are no bid requests to display at this time.</p>
      </div>
    );
  }

  return (
    <div className="p-4" style={{ margin: 0, padding: 0, background: 'none' }}>
      <h2 className="text-xl font-bold mb-4 mt-8"> Bid Requests Sent to Me</h2>

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
          body={(rowData: BidRequest) => getNestedFieldValue(rowData, 'productId', 'title') || '-'}
          header="Product"
          sortable
        />
        <Column
          field="categoryId"
          body={(rowData: BidRequest) => getNestedFieldValue(rowData, 'categoryId', 'name') || '-'}
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
          body={(row) => dateBodyTemplate(row, 'deliveryTimeframe')}
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

export default ManufacturerBidRequests;
