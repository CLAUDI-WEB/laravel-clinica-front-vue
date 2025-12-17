import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,      // ← AGREGAR ESTO
  withXSRFToken: true,         // ← AGREGAR ESTO
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

export default api