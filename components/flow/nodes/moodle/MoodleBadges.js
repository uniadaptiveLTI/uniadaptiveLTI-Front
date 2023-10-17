import React from "react";
import { Badge } from "react-bootstrap"; // You might need to adjust the import path based on your setup.
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // You might need to import Font Awesome icons correctly.
import { faEye, faEyeSlash, faPlus } from "@fortawesome/free-solid-svg-icons";

const MoodleBadges = ({
	data,
	showDetails,
	highContrast,
	reducedAnimations,
	getParentExpanded,
	styles,
}) => {
	return (
		<>
			{data.lmsVisibility && getParentExpanded() && (
				<Badge
					bg="primary"
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
					{data.lmsVisibility === "show_unconditionally" ? (
						<FontAwesomeIcon icon={faEye} style={{ color: "#ffffff" }} />
					) : (
						<FontAwesomeIcon icon={faEyeSlash} style={{ color: "#ffffff" }} />
					)}
				</Badge>
			)}

			{!isNaN(data.section) && getParentExpanded() && (
				<Badge
					bg="light"
					className={
						styles.badge +
						" " +
						styles.badgeSection +
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

			{!isNaN(data.order) && getParentExpanded() && (
				<Badge
					bg="warning"
					className={
						styles.badge +
						" " +
						styles.badgePos +
						" " +
						(reducedAnimations && styles.noAnimation) +
						" " +
						(showDetails && styles.showBadges) +
						" " +
						(highContrast && styles.highContrast)
					}
					title="Posición en la sección"
				>
					{data.order + 1}
				</Badge>
			)}
		</>
	);
};

export default MoodleBadges;
