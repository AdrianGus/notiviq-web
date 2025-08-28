
export function Skeleton({className}:{className?:string}){
  return <div className={`animate-pulse rounded-md bg-neutral-200 ${className||''}`}/>
}

export function TableSkeleton(){
  return (
    <div className="animate-pulse space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-10 w-full rounded-md bg-neutral-200" />
      ))}
    </div>
  )
}
