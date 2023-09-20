import React from "react";
import { Badge } from "react-bootstrap"; // You might need to adjust the import path based on your setup.
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // You might need to import Font Awesome icons correctly.
import {
	faEnvelope,
	faEye,
	faEyeSlash,
	faMailBulk,
	faMailForward,
	faMailReply,
	faMessage,
	faPlus,
} from "@fortawesome/free-solid-svg-icons";

const SakaiBadges = ({
	data,
	type,
	hasExtraConditions,
	showDetails,
	highContrast,
	reducedAnimations,
	getParentExpanded,
	platform,
	styles,
}) => {
	return (
		<>
			{(type == "assign" || type == "exam") && getParentExpanded() && (
				<Badge
					bg="success"
					className={
						styles.badge +
						" " +
						styles.badgeVisibility +
						" " +
						(reducedAnimations && styles.noAnimation) +
						" " +
						(showDetails && styles.showBadges) +
						" " +
						(highContrast && styles.highContrast)
					}
					title="Visibilidad"
				>
					<FontAwesomeIcon icon={faEnvelope} style={{ color: "#ffffff" }} />
				</Badge>
			)}
			<div>
				{!isNaN(data.section) && getParentExpanded() && (
					<Badge
						bg="light"
						className={
							styles.badge +
							" " +
							styles.badgeSakaiSection +
							" " +
							(reducedAnimations && styles.noAnimation) +
							" " +
							(showDetails && styles.showBadges) +
							" " +
							(highContrast && styles.highContrast)
						}
						title="Sección"
					>
						{Number(data.section)}
					</Badge>
				)}

				{!isNaN(data.column) && getParentExpanded() && (
					<Badge
						className={
							styles.badge +
							" " +
							styles.badgeSakaiColumn +
							" " +
							(reducedAnimations && styles.noAnimation) +
							" " +
							(showDetails && styles.showBadges) +
							" " +
							(highContrast && styles.highContrast)
						}
						title="Columna"
					>
						{data.column}
					</Badge>
				)}

				{!isNaN(data.order) && getParentExpanded() && (
					<Badge
						bg="warning"
						className={
							styles.badge +
							" " +
							styles.badgeSakaiPos +
							" " +
							(reducedAnimations && styles.noAnimation) +
							" " +
							(showDetails && styles.showBadges) +
							" " +
							(highContrast && styles.highContrast)
						}
						title="Posición en la sección"
					>
						{data.order}
					</Badge>
				)}
			</div>
		</>
	);
};

export default SakaiBadges;
