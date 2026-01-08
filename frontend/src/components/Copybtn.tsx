"use client"
import { useEffect, useRef, useState } from "react"
import { IoIosCheckmark } from "react-icons/io"
import { IoClipboardOutline } from "react-icons/io5"
import { toast } from "sonner"

const Copybtn = ({ value }: { value: string }) => {
	const [copy, setCopy] = useState(false)
	const copyTimerRef = useRef<NodeJS.Timeout | null>(null)
	useEffect(() => {
		return () => {
			if (copyTimerRef.current) {
				clearTimeout(copyTimerRef.current)
			}
		}
	}, [])
	return (
		<button type="button" onClick={() => {
			navigator.clipboard.writeText(value)
			toast.info("Value copied")
			setCopy(true)
			if (copyTimerRef.current) {
				clearTimeout(copyTimerRef.current)
			}
			copyTimerRef.current = setTimeout(() => setCopy(false), 2000)
		}}>
			{copy ? <IoIosCheckmark /> : <IoClipboardOutline />}
		</button>
	)
}
export default Copybtn