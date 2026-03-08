import axios from "axios"
import { OpenAPI } from "@/client"

const apiBase = () => `${OpenAPI.BASE}/api/v1`

export const invoiceTemplatesApi = {
  list: async ({ skip = 0, limit = 200 } = {}) => {
    const res = await axios.get(`${apiBase()}/invoice-templates/`, {
      params: { skip, limit },
      withCredentials: true,
    })
    return res.data
  },
  getActive: async () => {
    const res = await axios.get(`${apiBase()}/invoice-templates/active`, {
      withCredentials: true,
    })
    return res.data
  },
  create: async (payload) => {
    const res = await axios.post(`${apiBase()}/invoice-templates/`, payload, {
      withCredentials: true,
    })
    return res.data
  },
  update: async ({ id, payload }) => {
    const res = await axios.put(`${apiBase()}/invoice-templates/${id}`, payload, {
      withCredentials: true,
    })
    return res.data
  },
  activate: async ({ id }) => {
    const res = await axios.post(`${apiBase()}/invoice-templates/${id}/activate`, {}, {
      withCredentials: true,
    })
    return res.data
  },
  remove: async ({ id }) => {
    const res = await axios.delete(`${apiBase()}/invoice-templates/${id}`, {
      withCredentials: true,
    })
    return res.data
  },
}
