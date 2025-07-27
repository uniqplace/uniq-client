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
      providesTags: (_result, _error, id) => [{ type: 'Order', id }],
    }),
    getUserOrders: builder.query<Order[], void>({
      query: () => '/orders/user/me',
      providesTags: ['Order'],
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
  useGetUserOrdersQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
} = orderApiSlice;