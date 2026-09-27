import { OpenAPI, PrivateService } from "../../src/client"

OpenAPI.BASE = process.env.VITE_API_URL || "http://localhost:8000"
const createUser = async ({ email, password }) => {
  return await PrivateService.createUser({
    requestBody: {
      email,
      password,
      is_verified: true,
      full_name: "Test User",
    },
  })
}

export { createUser }
