import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const SelectContext = React.createContext(null)

const Select = ({ children, value, onValueChange, ...props }) => {
    const [open, setOpen] = React.useState(false)
    const [selectedValue, setSelectedValue] = React.useState(value || "")

    React.useEffect(() => {
        setSelectedValue(value || "")
    }, [value])

    const handleSelect = (val) => {
        setSelectedValue(val)
        setOpen(false)
        if (onValueChange) {
            onValueChange(val)
        }
    }

    return (
        <SelectContext.Provider value={{ open, setOpen, selectedValue, handleSelect }}>
            <div className="relative" {...props}>
                {children}
            </div>
        </SelectContext.Provider>
    )
}

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
    const context = React.useContext(SelectContext)
    if (!context) return null

    const { open, setOpen } = context

    return (
        <button
            ref={ref}
            type="button"
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:ring-offset-gray-950 dark:placeholder:text-gray-400",
                className
            )}
            onClick={() => setOpen(!open)}
            {...props}
        >
            {children}
            <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", open && "rotate-180")} />
        </button>
    )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder, ...props }) => {
    const context = React.useContext(SelectContext)
    if (!context) return <span className="text-gray-500" {...props}>{placeholder || "选择..."}</span>

    const { selectedValue } = context
    if (!selectedValue) {
        return <span className="text-gray-500" {...props}>{placeholder || "选择..."}</span>
    }

    // 如果有 children，使用 children；否则显示选中的值
    const displayText = props.children || selectedValue
    return <span className="text-gray-900 dark:text-gray-100 font-medium" {...props}>{displayText}</span>
}

const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => {
    const context = React.useContext(SelectContext)
    const contentRef = React.useRef(null)

    React.useImperativeHandle(ref, () => contentRef.current)

    if (!context) return null

    const { open, setOpen } = context

    React.useEffect(() => {
        if (!open) return

        const handleClickOutside = (event) => {
            if (contentRef.current && !contentRef.current.contains(event.target)) {
                setOpen(false)
            }
        }

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        document.addEventListener("keydown", handleEscape)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            document.removeEventListener("keydown", handleEscape)
        }
    }, [open, setOpen])

    if (!open) return null

    return (
        <div
            ref={contentRef}
            className={cn(
                "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-300 bg-white shadow-md",
                "top-full mt-1 w-full",
                "dark:border-gray-700 dark:bg-gray-800",
                className
            )}
            {...props}
        >
            <div className="p-1 max-h-[300px] overflow-auto">
                {children}
            </div>
        </div>
    )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
    const context = React.useContext(SelectContext)
    if (!context) return null

    const { handleSelect, selectedValue } = context
    const isSelected = selectedValue === value

    return (
        <div
            ref={ref}
            className={cn(
                "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none",
                "hover:bg-blue-50 hover:text-blue-900",
                "focus:bg-blue-50 focus:text-blue-900",
                "dark:hover:bg-blue-900 dark:hover:text-blue-100",
                "dark:focus:bg-blue-900 dark:focus:text-blue-100",
                isSelected && "bg-blue-100 text-blue-900 font-medium border-l-2 border-blue-600 dark:bg-blue-800 dark:text-blue-100",
                className
            )}
            onClick={() => handleSelect(value)}
            {...props}
        >
            {children}
        </div>
    )
})
SelectItem.displayName = "SelectItem"

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }

