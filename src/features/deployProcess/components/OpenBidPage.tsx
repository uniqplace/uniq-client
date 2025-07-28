
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import type { BidRequest } from '../../../types';
import type { RootState } from '../../../store';
import { Tag } from 'primereact/tag';
import { getBidRequestsByCreator } from '../slices/BidRequestSlice';

export const OpenBidPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { bidRequests, loading, error } = useAppSelector(
    (state: RootState) => state.bidRequest
  );

  useEffect(() => {
    dispatch(getBidRequestsByCreator());
  }, [dispatch]);

  const goToBidOffers = (bidRequestId: string) => {
    navigate(`/bidOffers/${bidRequestId}`);
  };

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
      onClick={() => goToBidOffers(rowData._id)}
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
        <h2 className="text-xl font-bold mb-4"> My BidRequests</h2>
        <p>There are no open BidRequest to display at this time.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">My BidRequests </h2>
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
