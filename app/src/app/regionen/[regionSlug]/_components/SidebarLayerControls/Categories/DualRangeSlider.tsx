'use client'

import React from 'react'

interface DualRangeSliderProps {
  min: number
  max: number
  minValue: number
  maxValue: number
  onChange: (min: number, max: number) => void
  label: string
  formatValue?: (value: number) => string
}

export const DualRangeSlider = ({
  min,
  max,
  minValue,
  maxValue,
  onChange,
  label,
  formatValue = (v) => v.toString(),
}) => {
  const [isDragging, setIsDragging] = React.useState<'min' | 'max' | null>(null)

  const minPercentage = ((minValue - min) / (max - min)) * 100
  const maxPercentage = ((maxValue - min) / (max - min)) * 100

  const sliderRef = React.useRef<HTMLDivElement>(null)

  const handleMouseDown = (type: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(type)
  }

  React.useEffect(() => {
    if (!isDragging || !sliderRef.current) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!sliderRef.current) return
      const rect = sliderRef.current.getBoundingClientRect()
      const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
      const value = Math.round(min + (percentage / 100) * (max - min))

      if (isDragging === 'min') {
        const newMin = Math.max(min, Math.min(value, maxValue - 1))
        onChange(newMin, maxValue)
      } else {
        const newMax = Math.min(max, Math.max(value, minValue + 1))
        onChange(minValue, newMax)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, min, max, minValue, maxValue, onChange])

  return (
    <div className="space-y-2">
      <label className="mb-1 block text-xs text-gray-600">
        {label}
      </label>
      <div ref={sliderRef} className="relative h-8 w-full py-3">
        {/* Track */}
        <div className="absolute top-1/2 h-2 w-full -translate-y-1/2 rounded-lg bg-gray-200" />
        
        {/* Active range */}
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-lg bg-amber-400"
          style={{
            left: `${minPercentage}%`,
            width: `${maxPercentage - minPercentage}%`,
          }}
        />
        
        {/* Min handle */}
        <div
          className="absolute top-1/2 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-amber-500 bg-white shadow-md transition-shadow hover:shadow-lg active:cursor-grabbing active:shadow-xl"
          style={{ left: `${minPercentage}%` }}
          onMouseDown={handleMouseDown('min')}
        />
        
        {/* Max handle */}
        <div
          className="absolute top-1/2 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-amber-500 bg-white shadow-md transition-shadow hover:shadow-lg active:cursor-grabbing active:shadow-xl"
          style={{ left: `${maxPercentage}%` }}
          onMouseDown={handleMouseDown('max')}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-500">
        <span>{formatValue(min)}</span>
        <span className="font-semibold text-gray-700">
          {formatValue(minValue)} - {formatValue(maxValue)}
        </span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  )
}

