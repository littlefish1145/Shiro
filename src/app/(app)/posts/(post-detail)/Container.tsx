import type { PropsWithChildren } from "react"

import { BackgroundGlow } from "~/components/modules/shared/BackgroundGlow"

export const Container = ({ children }: PropsWithChildren) => {
  return (
    <div className="container m-auto mt-[120px] max-w-7xl px-2 md:px-6 lg:px-4 xl:px-0">
      <BackgroundGlow />
      {children}
    </div>
  )
}
