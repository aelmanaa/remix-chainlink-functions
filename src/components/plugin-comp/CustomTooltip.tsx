// https://github.com/ethereum/remix-project/blob/master/libs/remix-ui/helper/src/lib/components/custom-tooltip.tsx
import { Fragment } from "react"
import { OverlayTrigger, Tooltip } from "react-bootstrap"
import { CustomTooltipType } from "../../models"

export function CustomTooltip({
  children,
  placement,
  tooltipId,
  tooltipClasses,
  tooltipText,
  tooltipTextClasses,
  delay,
}: CustomTooltipType) {
  return (
    <Fragment>
      <OverlayTrigger
        placement={placement}
        overlay={
          <Tooltip id={!tooltipId ? `${tooltipText}Tooltip` : tooltipId} className={tooltipClasses}>
            {typeof tooltipText === "string" ? <span className={tooltipTextClasses}>{tooltipText}</span> : tooltipText}
          </Tooltip>
        }
        delay={delay}
      >
        {children}
      </OverlayTrigger>
    </Fragment>
  )
}
