import applicationInfoSupplier from '../applicationInfo'

const applicationInfo = applicationInfoSupplier()

type RestClientBuilder<T> = (token: string) => T

export const dataAccess = () => ({
  applicationInfo,
})

export type DataAccess = ReturnType<typeof dataAccess>

export type { RestClientBuilder }
