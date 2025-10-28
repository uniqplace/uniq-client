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
      transformResponse: (response: { success: boolean; data: Order }) => response.data,
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
    // Assign manufacturer to order
    assignManufacturerToOrder: builder.mutation<Order, { orderId: string; manufacturerId: string }>({
      query: ({ orderId, manufacturerId }) => ({
        url: `/orders/${orderId}/assign-manufacturer`,
        method: 'PUT',
        body: { manufacturerId },
      }),
      transformResponse: (response: { success: boolean; data: Order }) => response.data,
      invalidatesTags: (_result, _error, { orderId }) => [
        { type: 'Order', id: orderId },
        'Order',
      ],
    }),
    // Assign manufacturer to order AND update product
    assignManufacturerAndUpdateProduct: builder.mutation<any, { orderId: string; manufacturerId: string; unitPrice?: number; review?: string }>({
      query: ({ orderId, manufacturerId, unitPrice, review }) => ({
        url: `/orders/${orderId}/assign-manufacturer-and-update-product`,
        method: 'PUT',
        body: { manufacturerId, unitPrice, review },
      }),
      transformResponse: (response: { success: boolean; data: any }) => response.data,
      invalidatesTags: (_result, _error, { orderId }) => [
        { type: 'Order', id: orderId },
        'Order',
      ],
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
  useAssignManufacturerToOrderMutation,
  useAssignManufacturerAndUpdateProductMutation,
} = orderApiSlice;
