import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"

const initialState = {
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => null,
}
const ThemeProviderContext = createContext(initialState)
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem(storageKey) || defaultTheme,
  )
  const getResolvedTheme = useCallback((theme) => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    }
    return theme
  }, [])
  const [resolvedTheme, setResolvedTheme] = useState(() =>
    getResolvedTheme(theme),
  )
  const updateTheme = useCallback((newTheme) => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    if (newTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"
      root.classList.add(systemTheme)
      return
    }
    root.classList.add(newTheme)
  }, [])
  useEffect(() => {
    updateTheme(theme)
    setResolvedTheme(getResolvedTheme(theme))
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      if (theme === "system") {
        updateTheme("system")
        setResolvedTheme(getResolvedTheme("system"))
      }
    }
    mediaQuery.addEventListener("change", handleChange)
    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [theme, updateTheme, getResolvedTheme])
  const value = {
    theme,
    resolvedTheme,
    setTheme: (theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }
  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}
export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
