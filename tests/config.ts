import path from "node:path"
import { fileURLToPath } from "node:url"
import dotenv from "dotenv"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, "../../.env") })
function getEnvVar(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Environment variable ${name} is undefined`)
  }
  return value
}
const firstSuperuser = getEnvVar("FIRST_SUPERUSER")
const firstSuperuserPassword = getEnvVar("FIRST_SUPERUSER_PASSWORD")
export { firstSuperuser, firstSuperuserPassword }
