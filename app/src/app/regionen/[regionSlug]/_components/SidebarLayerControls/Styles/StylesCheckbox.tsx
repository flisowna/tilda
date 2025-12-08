import { useCategoriesConfig } from '@/src/app/regionen/[regionSlug]/_hooks/useQueryState/useCategoriesConfig/useCategoriesConfig'
import { produce } from 'immer'
import React from 'react'
import { twJoin } from 'tailwind-merge'
import { MapDataSubcategoryConfig } from '../../../_hooks/useQueryState/useCategoriesConfig/type'
import { MapDataCategoryId } from '../../../_mapData/mapDataCategories/MapDataCategoryId'
import { createSubcatStyleKey } from '../../utils/sourceKeyUtils/sourceKeyUtilsAtlasGeo'
import { Legend } from '../Legend/Legend'

type Props = {
  categoryId: MapDataCategoryId
  subcatConfig: MapDataSubcategoryConfig
  disabled: boolean
}

export const StylesCheckbox = ({ categoryId, subcatConfig, disabled }: Props) => {
  const { categoriesConfig, setCategoriesConfig } = useCategoriesConfig()

  type ToggleActiveProps = {
    event: React.ChangeEvent<HTMLInputElement>
    subcatId: string
    styleId: string
  }
  const toggleActive = ({ event, subcatId, styleId }: ToggleActiveProps) => {
    const checked = event.target.checked
    const oldConfig = categoriesConfig
    const newConfig = produce(oldConfig, (draft) => {
      const subcat = draft
        ?.find((th) => th.id === categoryId)
        ?.subcategories.find((t) => t.id === subcatId)

      if (subcat) {
        // For bicycle accidents, allow multiple styles to be active simultaneously
        // For other subcategories, only one style active at a time (original behavior)
        if (subcat.id === 'bicycleAccidents') {
          const style = subcat.styles.find((s) => s.id === styleId)
          if (style) {
            style.active = checked
          }
        } else {
          // Original behavior: only one style active at a time
          subcat.styles.forEach((s) => (s.active = false))
          if (checked) {
            const style = subcat.styles.find((s) => s.id === styleId)
            style && (style.active = true)
          }
        }
      }
    })
    void setCategoriesConfig(newConfig)
  }

  if (!subcatConfig) return null

  const isBicycleAccidents = subcatConfig.id === 'bicycleAccidents'
  let currentView: 'standard' | 'heatmap' = 'standard'
  let currentStyleConfigs = subcatConfig.styles
  if (isBicycleAccidents) {
    const bicycleAccidentsCategory = categoriesConfig?.find((cat) => cat.id === 'bicycleAccidents')
    const bicycleSubcat = bicycleAccidentsCategory?.subcategories.find(
      (sub) => sub.id === 'bicycleAccidents',
    )
    if (bicycleSubcat) {
      currentStyleConfigs = bicycleSubcat.styles
      currentView = bicycleSubcat.styles.find((s) => s.id === 'heatmap')?.active
        ? 'heatmap'
        : 'standard'
    }
  }

  return (
    <div>
      {currentStyleConfigs.map((styleConfig) => {
        if (!styleConfig) return null

        if (isBicycleAccidents) {
          if (styleConfig.id === 'heatmap') {
            return null
          }
          if (['fatal', 'serious', 'light'].includes(styleConfig.id) && currentView === 'heatmap') {
            return null
          }
        }

        const key = createSubcatStyleKey(subcatConfig.id, styleConfig.id)
        const legendColor = styleConfig.legends?.[0]?.style?.color
        const showColorCoding =
          isBicycleAccidents &&
          currentView === 'standard' &&
          legendColor &&
          ['fatal', 'serious', 'light'].includes(styleConfig.id)

        return (
          <div key={key} className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id={`${subcatConfig.id}-${styleConfig.id}`}
                name={`${subcatConfig.id}-${styleConfig.id}`}
                type="checkbox"
                className={twJoin(
                  'h-4 w-4 rounded border-gray-300',
                  disabled ? 'text-gray-400' : 'text-yellow-500 focus:shadow-md focus:outline-none',
                )}
                disabled={disabled}
                checked={styleConfig.active}
                onChange={(event) =>
                  toggleActive({
                    event,
                    subcatId: subcatConfig.id,
                    styleId: styleConfig.id,
                  })
                }
              />
            </div>

            <div className="ml-2 mt-0.5 text-sm leading-4">
              <label
                htmlFor={`${subcatConfig.id}-${styleConfig.id}`}
                className={twJoin('font-medium', disabled ? 'text-gray-400' : 'text-gray-700')}
              >
                <span className="flex items-center gap-2">
                  {showColorCoding && (
                    <span
                      className="h-3 w-3 rounded-full border border-gray-300"
                      style={{ backgroundColor: legendColor }}
                    />
                  )}
                  <span>{styleConfig.name || subcatConfig.name}</span>
                </span>
              </label>

              {styleConfig.active && (!isBicycleAccidents || styleConfig.id === 'heatmap') && (
                <Legend subcategoryId={subcatConfig.id} styleConfig={styleConfig} />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
