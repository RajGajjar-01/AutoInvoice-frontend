import { defineConfig } from "@hey-api/openapi-ts"

// Bundled legacy hey-api config (pre-1.0 plugin names "clientAxios"/"sdk"/"typescript").
// Values are kept verbatim because regenerating src/client with the installed
// @hey-api/openapi-ts@0.99 is a separate migration (see task 3.5 report).
var openapi_ts_config_default = defineConfig({
  // @ts-expect-error -- legacy generator config shape rejected by installed openapi-ts@0.99 typings
  input: "./openapi.json",
  output: "./src/client",
  plugins: [
    "clientAxios",
    {
      name: "sdk",
      asClass: true,
      operationId: true,
      classNameBuilder: "{{name}}Service",
      methodNameBuilder: (operation: { name: string; service?: string }) => {
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
