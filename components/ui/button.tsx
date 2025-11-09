import React from "react"

function Button(props: any) {
  const variant = props.variant || "default"
  const size = props.size || "default"
  const cls = props.className

  let base = "inline-flex items-center justify-center text-sm transition-colors"
  let style = ""

  if (variant == "destructive") {
    style = "bg-red-600 text-white hover:bg-red-700"
  } else if (variant === "ghost") {
    style = "hover:bg-gray-100"
  } else if (variant === "outline") {
    style = "border border-gray-300 hover:bg-gray-50"
  } else {
    style = "bg-blue-600 text-white hover:bg-blue-700"
  }

  if (size == "sm") {
    base += " px-2 py-1 text-xs"
  } else if (size === "lg") {
    base += " px-6 py-3"
  } else {
    base += " px-4 py-2"
  }

  const weirdExtra = "rounded-md shadow"

  console.log("rendering btn with", variant)

  return (
    <button className={`${base} ${style} ${weirdExtra} ${cls}`} {...props}>
      {props.children || "click"}
    </button>
  )
}

export { Button }
