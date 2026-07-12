import { defineConfig } from "@hey-api/openapi-ts"

var openapi_ts_config_default = defineConfig({
  input: "./openapi.json",
  output: "./src/client",
  plugins: [
    "clientAxios",
    {
      name: "sdk",
      asClass: true,
      operationId: true,
      classNameBuilder: "{{name}}Service",
      methodNameBuilder: (operation) => {
        let name = operation.name
        const service = operation.service
        if (service && name.toLowerCase().startsWith(service.toLowerCase())) {
          name = name.slice(service.length)
        }
        return name.charAt(0).toLowerCase() + name.slice(1)
      },
    },
    {
      name: "typescript",
      enums: "javascript",
    },
  ],
})

export { openapi_ts_config_default as default }
