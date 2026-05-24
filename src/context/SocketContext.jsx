import { createContext, useContext, useEffect, useState } from 'react'
import io from 'socket.io-client'
import toast from 'react-hot-toast'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

export const useSocket = () => useContext(SocketContext)

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
      const newSocket = io(socketUrl, {
        auth: { token: localStorage.getItem('token') }
      })

      newSocket.on('booking:confirmed', (data) => {
        toast.success(data.message || 'Booking confirmed!')
      })

      newSocket.on('booking:cancelled', () => {
        toast('A booking was cancelled', { icon: '⚠️' })
      })

      newSocket.on('booking:completed', (data) => {
        toast.success(data.message || 'Session completed!')
      })

      setSocket(newSocket)
      return () => newSocket.close()
    }
  }, [isAuthenticated, user])

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  )
}
