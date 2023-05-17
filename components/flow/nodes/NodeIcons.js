import styles from "@components/styles/BlockContainer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
	faCubes,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

export function getTypeIcon(type, platform, desiredSize = 32) {
	switch (type) {
		//Moodle + Sakai
		case "quiz":
			return platform == "moodle" ? (
				<Image
					src="icons/moodle/quiz.svg"
					alt=""
					height={desiredSize}
					width={desiredSize}
					className={[styles.moodleIcon, "moodleIcon"].join(" ")}
				/>
			) : (
				<FontAwesomeIcon icon={faClipboardQuestion} />
			);
		case "assign":
			return platform == "moodle" ? (
				<Image
					src="icons/moodle/assign.svg"
					alt=""
					height={desiredSize}
					width={desiredSize}
					className={[styles.moodleIcon, "moodleIcon"].join(" ")}
				/>
			) : (
				<FontAwesomeIcon icon={faPenToSquare} />
			);
		case "forum":
			return platform == "moodle" ? (
				<Image
					src="icons/moodle/forum.svg"
					alt=""
					height={desiredSize}
					width={desiredSize}
					className={[styles.moodleIcon, "moodleIcon"].join(" ")}
				/>
			) : (
				<FontAwesomeIcon icon={faComments} />
			);
		case "resource":
			return platform == "moodle" ? (
				<Image
					src="icons/moodle/resource.svg"
					alt=""
					height={desiredSize}
					width={desiredSize}
					className={[styles.moodleIcon, "moodleIcon"].join(" ")}
				/>
			) : (
				<FontAwesomeIcon icon={faFile} />
			);
		case "folder":
			return platform == "moodle" ? (
				<Image
					src="icons/moodle/folder.svg"
					alt=""
					height={desiredSize}
					width={desiredSize}
					className={[styles.moodleIcon, "moodleIcon"].join(" ")}
				/>
			) : (
				<FontAwesomeIcon icon={faFolderOpen} />
			);
		case "url":
			return platform == "moodle" ? (
				<Image
					src="icons/moodle/url.svg"
					alt=""
					height={desiredSize}
					width={desiredSize}
					className={[styles.moodleIcon, "moodleIcon"].join(" ")}
				/>
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
				<Image
					src="icons/moodle/workshop.svg"
					alt=""
					height={desiredSize}
					width={desiredSize}
					className={[styles.moodleIcon, "moodleIcon"].join(" ")}
				/>
			) : (
				<FontAwesomeIcon icon={faHandshakeAngle} />
			);
		case "choice":
			return platform == "moodle" ? (
				<Image
					src="icons/moodle/choice.svg"
					alt=""
					height={desiredSize}
					width={desiredSize}
					className={[styles.moodleIcon, "moodleIcon"].join(" ")}
				/>
			) : (
				<FontAwesomeIcon icon={faQuestion} />
			);
		case "label":
			return platform == "moodle" ? (
				<Image
					src="icons/moodle/label.svg"
					alt=""
					height={desiredSize}
					width={desiredSize}
					className={[styles.moodleIcon, "moodleIcon"].join(" ")}
				/>
			) : (
				<FontAwesomeIcon icon={faTag} />
			);
		case "page":
			return platform == "moodle" ? (
				<Image
					src="icons/moodle/page.svg"
					alt=""
					height={desiredSize}
					width={desiredSize}
					className={[styles.moodleIcon, "moodleIcon"].join(" ")}
				/>
			) : (
				<FontAwesomeIcon icon={faFileLines} />
			);
		case "badge":
			return platform == "moodle" ? (
				<FontAwesomeIcon icon={faAward} className={"moodleIcon"} />
			) : (
				<FontAwesomeIcon icon={faAward} />
			);
		//Sakai
		case "exam":
			return null;
		case "contents":
			return null;
		case "text":
			return null;
		case "html":
			return null;
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
				<Image
					src="icons/moodle/lti.svg"
					alt=""
					height={desiredSize}
					width={desiredSize}
					className={[styles.moodleIcon, "moodleIcon"].join(" ")}
				/>
			) : (
				<FontAwesomeIcon icon={faCube} />
			);
	}
}
