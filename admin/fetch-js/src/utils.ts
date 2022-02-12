export const isFormData = (v: unknown) => v instanceof FormData
export const isJson = (v: unknown) => v instanceof FormData

export function unionUint8Array(chunks: Uint8Array[], length: number) {
  let uint8Array = new Uint8Array(length)
  let position = 0
  for (const chunk of chunks) {
    uint8Array.set(chunk, position)
    position += chunk.length
  }
  return uint8Array
}
