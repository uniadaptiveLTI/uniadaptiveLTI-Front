import styles from "@root/styles/BlockContainer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	miAssign,
	miQuiz,
	miForum,
	miResource,
	miFolder,
	miUrl,
	miWorkshop,
	miChoice,
	miLabel,
	miPage,
	miFragment,
} from "@utils/MoodleIcons";
import {
	faCube,
	faClipboardQuestion,
	faPenToSquare,
	faComments,
	faFile,
	faFolderOpen,
	faLink,
	faHandshakeAngle,
	faQuestion,
	faTag,
	faFileLines,
	faAward,
	faEnvelope,
	faUserPlus,
	faUserMinus,
	faCaretDown,
	faFileCode,
	faCubes,
	faAlignJustify,
	faFileText,
	faSquareCheck,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

export function getTypeIcon(type, platform, desiredSize = 32) {
	switch (type) {
		//Moodle + Sakai
		case "quiz":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={miQuiz} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faClipboardQuestion} />
			);
		case "assign":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={miAssign} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faPenToSquare} />
			);
		case "forum":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={miForum} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faComments} />
			);
		case "resource":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={miResource} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faFile} />
			);
		case "folder":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={miFolder} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faFolderOpen} />
			);
		case "url":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={miUrl} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faLink} />
			);
		case "mail":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={faEnvelope} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faEnvelope} />
			);
		case "addgroup":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={faUserPlus} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faUserPlus} />
			);
		case "remgroup":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={faUserMinus} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faUserMinus} />
			);
		//Moodle
		case "workshop":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={miWorkshop} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faHandshakeAngle} />
			);
		case "choice":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={miChoice} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faQuestion} />
			);
		case "label":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={miLabel} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faTag} />
			);
		case "page":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={miPage} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faFileText} />
			);
		case "badge":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={faAward} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faAward} />
			);
		//Sakai
		case "exam":
			return <FontAwesomeIcon icon={faSquareCheck} />;
		case "contents":
			return <FontAwesomeIcon icon={faFileLines} />;
		case "text":
			return <FontAwesomeIcon icon={faAlignJustify} />;
		case "html":
			return <FontAwesomeIcon icon={faFileCode} />;
		case "resources":
			return <FontAwesomeIcon icon={faFile} />;
		//LTI
		case "start":
			return (
				<FontAwesomeIcon
					icon={faCaretDown}
					style={{ transform: "rotate(-90deg)" }}
				/>
			);
		case "end":
			return (
				<FontAwesomeIcon
					icon={faCaretDown}
					style={{ transform: "rotate(90deg)" }}
				/>
			);
		case "fragment":
			return <FontAwesomeIcon icon={faCubes} />;
		default:
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={miFragment} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faCube} />
			);
	}
}

export const getTypeStaticColor = (type, platform) => {
	if (typeof type == "object")
		//Used for minimap
		type = type.type;
	//TODO: Add the rest
	switch (platform) {
		case "moodle":
			switch (type) {
				case "quiz":
					return "#5D63F6";
				case "assign":
					return "#5D63F6";
				case "forum":
					return "#11A676";
				case "resource":
					return "#A378FF";
				case "folder":
					return "#399BE2";
				case "url":
					return "#EB66A2";
				case "workshop":
					return "#A378FF";
				case "choice":
					return "#F7634D";
				case "label":
					return "#F7634D";
				case "page":
					return "#A378FF";
				case "badge":
					return "#11A676";
				case "mail":
					return "#399BE2";
				case "addgroup":
					return "#11A676";
				case "remgroup":
					return "#F7634D";
				case "generic":
					return "#11A676";
				//LTI
				case "start":
					return "#363638";
				case "end":
					return "#363638";
				case "fragment":
					return "#00008b";
				default:
					return "#11A676";
			}
		default: {
			switch (type) {
				//Moodle + Sakai
				case "quiz":
					return "#eb9408";
				case "assign":
					return "#0dcaf0";
				case "forum":
					return "#800080";
				case "resource":
					return "#0d6efd";
				case "folder":
					return "#ffc107";
				case "url":
					return "#5f9ea0";
				case "mail":
					return "#5f9ea0";
				case "addgroup":
					return "#198754";
				case "remgroup":
					return "#dc3545";
				//Moodle
				case "workshop":
					return "#15a935";
				case "choice":
					return "#dc3545";
				case "label":
					return "#a91568";
				case "page":
					return "#6c757d";
				case "badge":
					return "#198754";
				case "generic":
					return "#1f1e42";
				//Sakai
				case "exam":
					return "#dc3545";
				case "contents":
					return "#15a935";
				case "text":
					return "#6c757d";
				case "html":
					return "#a91568";
				case "resources":
					return "#eb9408";
				//LTI
				case "start":
					return "#363638";
				case "end":
					return "#363638";
				case "fragment":
					return "#00008b";
				default:
					return "#ffc107";
			}
		}
	}
};
