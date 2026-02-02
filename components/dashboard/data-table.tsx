'use client'

import React from "react"

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export interface DataTableColumn<T> {
  key: keyof T | string
  label: string
  render?: (row: T, key: string) => React.ReactNode
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  title?: string
  description?: string
  onRowClick?: (row: T) => void
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  title,
  description,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <Card className="border border-border overflow-hidden">
      {(title || description) && (
        <div className="p-6 border-b border-border">
          {title && <h2 className="text-lg font-semibold text-foreground">{title}</h2>}
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="text-left py-3 px-6 text-sm font-semibold text-muted-foreground"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={row.id || idx}
                className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className="py-4 px-6">
                    {col.render
                      ? col.render(row, String(col.key))
                      : String((row as any)[col.key] || '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">No data found</p>
        </div>
      )}
    </Card>
  )
}
