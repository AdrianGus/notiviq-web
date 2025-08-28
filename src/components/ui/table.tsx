
import * as React from "react"

export function Table({ children }:{ children: React.ReactNode }){
  return <table className="w-full text-sm">{children}</table>
}
export function THead({ children }:{ children: React.ReactNode }){
  return <thead className="text-left text-xs uppercase tracking-wide text-neutral-500 bg-neutral-50">{children}</thead>
}
export function TRow({ children }:{ children: React.ReactNode }){
  return <tr className="border-b last:border-0 hover:bg-neutral-50 transition-colors">{children}</tr>
}
export function TH({ children, className }:{ children: React.ReactNode; className?: string }){
  return <th className={`px-4 py-3 font-medium ${className||""}`}>{children}</th>
}
export function TD({ children, className }:{ children: React.ReactNode; className?: string }){
  return <td className={`px-4 py-3 ${className||""}`}>{children}</td>
}
