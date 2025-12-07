'use client'

import React from 'react'
import { useMap } from 'react-map-gl/maplibre'
import { useMapLoaded } from '../../../_hooks/mapState/useMapState'
import { useCategoriesConfig } from '../../../_hooks/useQueryState/useCategoriesConfig/useCategoriesConfig'
import { DualRangeSlider } from './DualRangeSlider'

const MIN_YEAR = 2018
const MAX_YEAR = 2024

export const BicycleAccidentsTimeFilter = () => {
  const { mainMap } = useMap()
  const mapLoaded = useMapLoaded()
  const { categoriesConfig } = useCategoriesConfig()

  const bicycleAccidentsActive = categoriesConfig?.some(
    (cat) => cat.id === 'bicycleAccidents' && cat.active
  )

  const [minYear, setMinYear] = React.useState(MIN_YEAR)
  const [maxYear, setMaxYear] = React.useState(MAX_YEAR)

  const originalFiltersRef = React.useRef<Map<string, unknown[]>>(new Map())
  const eventListenersRef = React.useRef<Array<() => void>>([])

  React.useEffect(() => {
    if (!mainMap || !mapLoaded || !bicycleAccidentsActive) {
      eventListenersRef.current.forEach((cleanup) => cleanup())
      eventListenersRef.current = []
      return
    }

    const map = mainMap.getMap()
    if (!map) return

    const updateFilters = () => {
      const sourceId = 'bicycle_accidents_umap'
      const subcategoryId = 'bicycleAccidents'

      if (!map.isStyleLoaded()) {
        const handler = () => updateFilters()
        map.once('styledata', handler)
        eventListenersRef.current.push(() => map.off('styledata', handler))
        return
      }

      try {
        const style = map.getStyle()
        if (!style?.layers) return

        const bicycleLayers = style.layers.filter((layer) =>
          layer.id.includes(`source:${sourceId}--subcat:${subcategoryId}`)
        )

        if (bicycleLayers.length === 0) {
          const handler = () => updateFilters()
          map.once('data', handler)
          eventListenersRef.current.push(() => map.off('data', handler))
          return
        }

        bicycleLayers.forEach((layerSpec) => {
          const layer = map.getLayer(layerSpec.id)
          if (!layer) return

          if (!originalFiltersRef.current.has(layerSpec.id)) {
            const originalFilter = layerSpec.filter || ['all']
            originalFiltersRef.current.set(layerSpec.id, originalFilter)
          }

          const originalFilter = originalFiltersRef.current.get(layerSpec.id) || ['all']

          let baseFilterParts: unknown[] = []
          if (Array.isArray(originalFilter)) {
            if (originalFilter[0] === 'all') {
              baseFilterParts = originalFilter.slice(1)
            } else {
              baseFilterParts = [originalFilter]
            }
          } else {
            baseFilterParts = [originalFilter]
          }

          const newFilter: unknown[] = [
            'all',
            ...baseFilterParts,
            ['>=', ['to-number', ['get', 'UJAHR']], minYear],
            ['<=', ['to-number', ['get', 'UJAHR']], maxYear],
          ]

          try {
            map.setFilter(layerSpec.id, newFilter)
          } catch (error) {
            // Silently handle filter errors - layer might not be ready yet
          }
        })
      } catch (error) {
        // Silently handle errors - layers might not be ready yet
      }
    }

    updateFilters()

    return () => {
      eventListenersRef.current.forEach((cleanup) => cleanup())
      eventListenersRef.current = []
    }
  }, [mainMap, mapLoaded, bicycleAccidentsActive, minYear, maxYear])

  const handleRangeChange = (newMin: number, newMax: number) => {
    setMinYear(newMin)
    setMaxYear(newMax)
  }

  if (!bicycleAccidentsActive) return null

  return (
    <div className="mx-2 mb-3 mt-2 space-y-2 rounded border border-gray-200 bg-gray-50 p-3">
      <div className="text-xs font-semibold text-gray-700">Zeitraum filtern</div>
      <DualRangeSlider
        min={MIN_YEAR}
        max={MAX_YEAR}
        minValue={minYear}
        maxValue={maxYear}
        onChange={handleRangeChange}
        label="Jahresbereich"
        formatValue={(v) => v.toString()}
      />
      <div className="text-xs text-gray-500">
        Zeige Unfälle von {minYear} bis {maxYear}
      </div>
    </div>
  )
}

