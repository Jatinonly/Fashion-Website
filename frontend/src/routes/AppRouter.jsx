import { lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { GuestRoute, ProtectedRoute } from './ProtectedRoute'

// Every page is code-split; <Layout> wraps them in <Suspense>.
const HomePage = lazy(() => import('@/pages/HomePage'))
const ProductListingPage = lazy(() => import('@/pages/ProductListingPage'))
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'))
const CartPage = lazy(() => import('@/pages/CartPage'))
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const SignupPage = lazy(() => import('@/pages/SignupPage'))
const OrdersPage = lazy(() => import('@/pages/OrdersPage'))
const OrderDetailPage = lazy(() => import('@/pages/OrderDetailPage'))
const WishlistPage = lazy(() => import('@/pages/WishlistPage'))
const InfoPage = lazy(() => import('@/pages/InfoPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'shop/:collection', element: <ProductListingPage /> },
      { path: 'search', element: <ProductListingPage /> },
      { path: 'product/:slug', element: <ProductDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'wishlist', element: <WishlistPage /> },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders',
        element: (
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders/:orderId',
        element: (
          <ProtectedRoute>
            <OrderDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'login',
        element: (
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        ),
      },
      {
        path: 'signup',
        element: (
          <GuestRoute>
            <SignupPage />
          </GuestRoute>
        ),
      },
      { path: 'help/:topic', element: <InfoPage /> },
      { path: 'legal/:topic', element: <InfoPage /> },
      { path: 'about', element: <InfoPage /> },
      { path: 'stores', element: <InfoPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
