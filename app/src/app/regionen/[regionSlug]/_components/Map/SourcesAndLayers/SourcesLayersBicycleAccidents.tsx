import { useBackgroundParam } from '@/src/app/regionen/[regionSlug]/_hooks/useQueryState/useBackgroundParam'
import { useCategoriesConfig } from '@/src/app/regionen/[regionSlug]/_hooks/useQueryState/useCategoriesConfig/useCategoriesConfig'
import { Fragment, useEffect, useState } from 'react'
import type { LayerProps } from 'react-map-gl/maplibre'
import { Layer, Source, useMap } from 'react-map-gl/maplibre'
import { getLayerHighlightId } from '../utils/layerHighlight'
import { layerVisibility } from '../utils/layerVisibility'
import { LayerHighlight } from './LayerHighlight'
import { beforeId } from './utils/beforeId'

const SOURCE_ID = 'bicycle_accidents_umap'
const API_URL = '/api/bicycle-accidents'

export const SourcesLayersBicycleAccidents = () => {
  const { categoriesConfig } = useCategoriesConfig()
  const { backgroundParam } = useBackgroundParam()
  const { mainMap } = useMap()
  const [geoJsonData, setGeoJsonData] = useState<GeoJSON.FeatureCollection | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bicycleAccidentsCategory = categoriesConfig?.find(
    (cat) => cat.id === 'bicycleAccidents' && cat.active,
  )

  useEffect(() => {
    if (!bicycleAccidentsCategory || !mainMap) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(API_URL)
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
        }
        const data = await response.json()
        setGeoJsonData(data)
      } catch (err) {
        console.error('Error fetching bicycle accident data:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [bicycleAccidentsCategory, mainMap])

  if (!bicycleAccidentsCategory) return null
  if (error) {
    console.error('Bicycle accidents data error:', error)
    return null
  }
  if (loading || !geoJsonData) return null

  const subcategoryConfig = bicycleAccidentsCategory.subcategories.find(
    (sub) => sub.id === 'bicycleAccidents',
  )

  if (!subcategoryConfig) return null

  const isHeatmapMode = subcategoryConfig.styles.find((s) => s.id === 'heatmap')?.active || false

  return (
    <Source id={SOURCE_ID} type="geojson" data={geoJsonData}>
      {subcategoryConfig.styles.map((styleConfig) => {
        const currStyleConfig = subcategoryConfig.styles.find((s) => s.id === styleConfig.id)

        let visible = false
        if (isHeatmapMode) {
          visible =
            styleConfig.id === 'heatmap' &&
            bicycleAccidentsCategory.active &&
            (currStyleConfig?.active ?? false)
        } else {
          visible =
            styleConfig.id !== 'heatmap' &&
            bicycleAccidentsCategory.active &&
            (currStyleConfig?.active ?? false)
        }

        const visibility = layerVisibility(visible)

        if (!styleConfig.layers) return null

        return styleConfig.layers.map((layer) => {
          const layerId = `source:${SOURCE_ID}--subcat:bicycleAccidents--style:${styleConfig.id}--layer:${layer.id}`

          let filter = layer.filter
          if (styleConfig.id === 'heatmap' && layer.id === 'heatmap') {
            filter = ['match', ['get', 'Unfallkate'], ['1', '2', '3'], true, false]
          }

          const layerProps = {
            id: layerId,
            source: SOURCE_ID,
            type: layer.type,
            layout: { ...visibility, ...(layer.layout || {}) },
            paint: layer.paint as any,
            filter: filter as any,
            beforeId: beforeId({
              backgroundId: backgroundParam,
              subcategoryBeforeId: subcategoryConfig.beforeId,
              layerType: layer.type,
            }),
            ...(layer.maxzoom ? { maxzoom: layer.maxzoom } : {}),
            ...(layer.minzoom ? { minzoom: layer.minzoom } : {}),
          } satisfies LayerProps

          const layerHighlightId = getLayerHighlightId(layer.id)

          return (
            <Fragment key={layerId}>
              <Layer {...layerProps} />
              <LayerHighlight key={layerHighlightId} {...layerProps} id={layerHighlightId} />
            </Fragment>
          )
        })
      })}
    </Source>
  )
}
