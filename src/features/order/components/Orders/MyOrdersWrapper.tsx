import { useState } from 'react';
import { Button } from 'primereact/button';
import type { RootState } from '../../../../store';
import { useAppSelector } from '../../../../hooks/hooks';
import OrdersPage from './OrdersPage';

export default function MyOrdersWrapper() {
  const [tab, setTab] = useState<'buyer' | 'creator'>('buyer');
  const user = useAppSelector((state: RootState) => state.user);

  return (
    <div className="container mx-auto px-4 py-4">
      {user?.role === 'creator' && (
        <div className="flex justify-start mb-4">
          <div className="flex gap-3">
            <Button
              label="My Orders"
              className={tab === 'buyer' ? 'p-button-primary' : 'p-button-outlined'}
              onClick={() => setTab('buyer')}
            />
            <Button
              label="Orders placed from me"
              className={tab === 'creator' ? 'p-button-primary' : 'p-button-outlined'}
              onClick={() => setTab('creator')}
            />
          </div>
        </div>
      )}

     <OrdersPage currentTab={tab} />

    </div>
  );
}
