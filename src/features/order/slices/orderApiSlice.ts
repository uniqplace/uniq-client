import apiSlice from '../../../api/apiSlice';
import { type Order } from '../../../types';
export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<Order[], void>({
      query: () => '/orders',
      providesTags: ['Order'],
    }),
    getOrderById: builder.query<Order, string>({
      query: (id) => `/orders/${id}`,
      transformResponse: (response: { success: boolean; data: Order }) => response.data, // ✅ תיקון כאן
      providesTags: (_result, _error, id) => [{ type: 'Order', id }],
    }),
    getOrdersByRole: builder.query<Order[], 'buyer' | 'creator'>({
      query: (role) => `/orders/user/me?role=${role}`,
      transformResponse: (response: { data: Order[] }) => response.data,
      providesTags: ['Order'],
    }),
    getOrderByUserAndProduct: builder.query<Order, { userId: string; productId: string }>({
      query: ({ userId, productId }) => `orders/byUserAndProduct?userId=${userId}&productId=${productId}`,
      transformResponse: (response: { success: boolean; data: Order }) => response.data,
    }),
    createOrder: builder.mutation<Order, Partial<Order>>({
      query: (order) => {
        return {
          url: '/orders',
          method: 'POST',
          body: order,
        }
      },
      invalidatesTags: ['Order'],
    }),
    updateOrderStatus: builder.mutation<Order, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Order', id }],
    }),
  }),
})
export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useGetOrdersByRoleQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useGetOrderByUserAndProductQuery,
} = orderApiSlice;
