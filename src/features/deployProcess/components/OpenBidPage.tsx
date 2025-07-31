

import { useEffect } from 'react';
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

export const OpenBidPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { bidRequestId } = useParams<{ bidRequestId?: string }>();

  const { bidRequests, loading, error } = useAppSelector(
    (state: RootState) => state.bidRequest
  );

  useEffect(() => {
    dispatch(getBidRequestsByCreator());
  }, [dispatch]);

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
      label="View offers"
      icon="pi pi-eye"
      onClick={() => navigate(`/MyBidRequest/${rowData._id}`)}
      className="p-button-sm"
    />
  );

  const dateBodyTemplate = (rowData: BidRequest, field: keyof BidRequest) => {
    const dateValue = rowData[field];
    if (!dateValue) return '-';
    if (typeof dateValue === 'string' || dateValue instanceof Date) {
      const dateObj = dateValue instanceof Date ? dateValue : new Date(dateValue);
      return dateObj.toLocaleDateString('he-IL');
    }
    return '-';
  };

  const title = (
    <h2 className="text-xl font-bold mb-4 mt-8"> My BidRequests</h2>
  );

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
    <div className="p-4">
      {title}
      <DataTable
        value={bidRequests}
        paginator
        rows={10}
        responsiveLayout="scroll"
        sortMode="multiple"
      >
        <Column field='productId.title' body={(rowData: BidRequest) => rowData.productId?.title || '-'}
        header="Product" sortable />
        <Column field="categoryId.name" body={(rowData: BidRequest) => rowData.categoryId?.name || '-'}
        header="Category" sortable />
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
