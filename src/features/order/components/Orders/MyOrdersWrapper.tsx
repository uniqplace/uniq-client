// import { useState } from 'react';
// import MyOrdersPage from './OrdersPage';
// import { useGetOrdersByRoleQuery } from '../../../order/slices/orderApiSlice';
// import { Button } from 'primereact/button';
// import { ProgressSpinner } from 'primereact/progressspinner';
// import { Message } from 'primereact/message';
// import type { RootState } from '../../../../store';
// import { useAppSelector } from '../../../../hooks/hooks';

// export default function MyOrdersWrapper() {
//     const [tab, setTab] = useState<'buyer' | 'creator'>('buyer');
//     const user = useAppSelector((state: RootState) => state.user);
//     const { data: orders, isLoading, error } = useGetOrdersByRoleQuery(tab,{
//         refetchOnMountOrArgChange: true
//       });

//     return (
//         <div className="container mx-auto px-4 py-6">
//             <div className="flex gap-4 mb-6">
//                 {user?.role === 'creator' && (
//                     <div className="flex gap-4 mb-6">
//                         <Button
//                             label="My Orderes"
//                             className={tab === 'buyer' ? 'p-button-primary' : 'p-button-outlined'}
//                             onClick={() => setTab('buyer')}
//                         />
//                         <Button
//                             label="Orders placed from me"
//                             className={tab === 'creator' ? 'p-button-primary' : 'p-button-outlined'}
//                             onClick={() => setTab('creator')}
//                         />
//                     </div>
//                 )}

//             </div>

//             {isLoading && <div className="flex justify-center"><ProgressSpinner /></div>}
//             {error && <Message severity="error" text="שגיאה בטעינת ההזמנות" />}
//             {!isLoading && orders && <MyOrdersPage orders={orders} />}
//         </div>
//     );
// }


import { useState } from 'react';
import MyOrdersPage from './OrdersPage';
import { useGetOrdersByRoleQuery } from '../../slices/orderApiSlice';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import type { RootState } from '../../../../store';
import { useAppSelector } from '../../../../hooks/hooks';

export default function MyOrdersWrapper() {
  const [tab, setTab] = useState<'buyer' | 'creator'>('buyer');
  const user = useAppSelector((state: RootState) => state.user);
  const { data: orders, isLoading, error } = useGetOrdersByRoleQuery(tab, {
    refetchOnMountOrArgChange: true,
  });

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

      {isLoading && <div className="flex justify-center mt-10"><ProgressSpinner /></div>}
      {error && <Message severity="error" text="שגיאה בטעינת ההזמנות" />}
      {!isLoading && orders && <MyOrdersPage orders={orders} />}
    </div>
  );
}
