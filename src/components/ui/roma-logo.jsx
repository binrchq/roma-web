import * as React from "react"
import { cn } from "@/lib/utils"

export default function RomaLogo({ className = "", size = "large" }) {
    const sizes = {
        small: "w-32 h-20",
        medium: "w-48 h-30",
        large: "w-64 h-40",
    }

    return (<div className={cn(sizes[size], className)}>
        <img src="/images/logo.png" alt="ROMA" className="w-full h-full object-contain" />
    </div>
    )
}
