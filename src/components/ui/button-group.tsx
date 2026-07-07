import { forwardRef, createContext, useContext, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
}

const ButtonGroupContext = createContext<{ orientation: "horizontal" | "vertical" }>({
  orientation: "horizontal",
})

const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation = "horizontal", ...props }, ref) => {
    return (
      <ButtonGroupContext.Provider value={{ orientation }}>
        <div
          ref={ref}
          role="group"
          className={cn(
            "flex",
            orientation === "vertical" ? "flex-col" : "flex-row",
            className,
          )}
          {...props}
        />
      </ButtonGroupContext.Provider>
    )
  },
)
ButtonGroup.displayName = "ButtonGroup"

const useButtonGroup = () => useContext(ButtonGroupContext)

export { ButtonGroup, useButtonGroup, type ButtonGroupProps }
