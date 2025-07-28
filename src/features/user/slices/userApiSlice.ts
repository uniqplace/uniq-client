import apiSlice from '../../../api/apiSlice';
import { type User } from '../../../types';
import type { UserState } from './userSlice';
export const userApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUsers: builder.query<User[], void>({
            query: () => '/users',
            providesTags: ['User'],
        }),
        getUserById: builder.query<User, string>({
            query: (id) => `/users/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'User', id }],
        }),
        getMe: builder.query<User, void>({
            query: () => '/users/me',
            providesTags: ['User'],
        }),
        createUser: builder.mutation<User, Partial<User>>({
            query: (user) => ({
                url: '/users',
                method: 'POST',
                body: user,
            }),
            invalidatesTags: ['User'],
        }),
        updateUser: builder.mutation<User,Partial<UserState>>({
            query: (data) => ({
                url: '/users/profile',
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (_result, _error, { id }) =>
                id !== null && id !== undefined
                    ? [{ type: 'User', id }]
                    : [{ type: 'User' }],
        }),
        updateUserAvatar: builder.mutation<User, string>({
            query: (url) => ({
                url: '/users/avatar',
                method: 'PUT',
                body: url,
            }),
            invalidatesTags: (_result, _error, id) =>
                id !== null && id !== undefined
                    ? [{ type: 'User', id }]
                    : [{ type: 'User' }],
        }),
        deleteUser: builder.mutation<{ success: boolean }, string>({
            query: (id) => ({
                url: `/users/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'User', id }],
        }),
    }),
});

export const {
    useGetUsersQuery,
    useGetUserByIdQuery,
    useGetMeQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useUpdateUserAvatarMutation,
} = userApiSlice;
