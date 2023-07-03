import styles from "@root/styles/BlockContainer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	miAssign,
	miQuiz,
	miForum,
	miFile,
	miFolder,
	miUrl,
	miWorkshop,
	miChoice,
	miLabel,
	miPage,
	miWiki,
	miBook,
	miChat,
	miDatabase,
	miFeedback,
	miH5P,
	miIMS,
	miLesson,
	miExternal,
	miScorm,
	miSurvey,
	miGlossary,
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
	faGraduationCap,
	faBookOpen,
	faCommentDots,
	faDatabase,
	faBullhorn,
	faH,
	faBox,
	faPersonChalkboard,
	faPuzzlePiece,
	faBoxes,
	faChartSimple,
	faRectangleList,
	faBook,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

export function getTypeIcon(type, platform, desiredSize = 32) {
	switch (type) {
		//Moodle + Sakai
		case "addgroup":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={faUserPlus} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faUserPlus} />
			);
		case "assign":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={miAssign} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faPenToSquare} />
			);
		case "folder":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={miFolder} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faFolderOpen} />
			);
		case "forum":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={miForum} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faComments} />
			);
		case "mail":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={faEnvelope} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faEnvelope} />
			);
		case "quiz":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={miQuiz} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faClipboardQuestion} />
			);
		case "remgroup":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={faUserMinus} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faUserMinus} />
			);

		case "resource":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={miFile} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faFile} />
			);

		case "url":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={miUrl} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faLink} />
			);
		case "wiki":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={miWiki} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faGraduationCap} />
			);

		//Moodle
		case "badge":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={faAward} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faAward} />
			);
		case "book":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={miBook} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faBookOpen} />
			);
		case "chat":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={miChat} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faCommentDots} />
			);
		case "choice":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={miChoice} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faQuestion} />
			);
		case "data":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={miDatabase} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faDatabase} />
			);
		case "feedback":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={miFeedback} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faBullhorn} />
			);
		case "generic":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={faQuestion} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faQuestion} />
			);
		case "glossary":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={miGlossary} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faBook} />
			);
		case "h5pactivity":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={miH5P} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faH} />
			);
		case "imscp":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={miIMS} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faBoxes} />
			);
		case "label":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={miLabel} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faTag} />
			);
		case "lesson":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={miLesson} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faPersonChalkboard} />
			);
		case "lti":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={miExternal} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faPuzzlePiece} />
			);
		case "page":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={miPage} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faFileText} />
			);
		case "scorm":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={miScorm} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faBox} />
			);
		case "survey":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={miSurvey} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faChartSimple} />
			);
		case "workshop":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={miWorkshop} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faHandshakeAngle} />
			);

		//Sakai
		case "exam":
			return <FontAwesomeIcon icon={faSquareCheck} />;
		case "html":
			return <FontAwesomeIcon icon={faFileCode} />;
		case "reflist":
			return <FontAwesomeIcon icon={faRectangleList} />;
		case "text":
			return <FontAwesomeIcon icon={faAlignJustify} />;
		// case "resources":
		// 	return <FontAwesomeIcon icon={faFile} />;
		// case "contents":
		// 	return <FontAwesomeIcon icon={faFileLines} />;
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
			return <FontAwesomeIcon icon={faQuestion} />;
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
				case "addgroup":
					return "#11A676";
				case "assign":
					return "#5D63F6";

				case "badge":
					return "#11A676";
				case "book":
					return "#399BE2";
				case "chat":
					return "#EB66A2";
				case "choice":
					return "#F7634D";
				case "database":
					return "#399BE2";
				case "feedback":
					return "#F7634D";
				case "folder":
					return "#399BE2";
				case "forum":
					return "#11A676";
				case "resource":
					return "#A378FF";
				case "generic":
					return "#11A676";
				case "glossary":
					return "#EB66A2";
				case "h5pactivity":
					return "#399BE2";
				case "imscp":
					return "#EB66A2";
				case "label":
					return "#F7634D";
				case "lesson":
					return "#5D63F6";
				case "external":
					return "#11A676";
				case "mail":
					return "#399BE2";
				case "page":
					return "#A378FF";
				case "quiz":
					return "#5D63F6";
				case "remgroup":
					return "#F7634D";
				case "resource":
					return "#A378FF";
				case "scorm":
					return "#5D63F6";
				case "survey":
					return "#11A676";
				case "url":
					return "#EB66A2";
				case "wiki":
					return "#A378FF";
				case "workshop":
					return "#A378FF";
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
