import React from "react"

function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  const cls =
    "rounded-xl border bg-card text-card-foreground shadow " + (props.className || "")
  return <div {...props} className={cls}>{props.children}</div>
}

function CardHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  let base = "flex flex-col space-y-1.5 p-6"
  return <div className={`${base} ${props.className ?? ""}`} {...props} />
}

function CardTitle(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={"font-semibold leading-none tracking-tight " + (props.className || "")}
    />
  )
}

function CardDescription(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={(props.className || "") + " text-sm text-muted-foreground"}
    />
  )
}

function CardContent(props: React.HTMLAttributes<HTMLDivElement>) {
  const combined = "p-6 pt-0 " + (props.className || "")
  return <div className={combined} {...props} />
}

function CardFooter(props: React.HTMLAttributes<HTMLDivElement>) {
  const footerCls = props.className ? props.className : ""
  return <div {...props} className={`flex items-center p-6 pt-0 ${footerCls}`} />
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
}
