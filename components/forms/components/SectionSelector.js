import {
	faExclamationCircle,
	faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAutomaticReusableStyles, getRootStyle } from "@utils/Colors";
import { getNodeById } from "@utils/Nodes";
import { orderByPropertyAlphabetically } from "@utils/Utils";
import {
	forwardRef,
	useState,
	useLayoutEffect,
	useRef,
	useContext,
} from "react";
import { Form } from "react-bootstrap";
import { useNodes } from "reactflow";
import { PlatformContext } from "/pages/_app";

function getDuplicates(array) {
	let count = {};
	for (let i = 0; i < array.length; i++) {
		let element = array[i];
		count[element] = count[element] ? count[element] + 1 : 1;
	}
	return count;
}

export default forwardRef(function SectionSelector(
	{
		allowModularSelection = true,
		metaData,
		showErrors,
		errorList,
		warningList,
		handleSelectionChange,
		mapName,
	},
	ref
) {
	const rfNodes = useNodes();
	const SECTIONS = metaData.sections;
	const [selectors, setSelectors] = useState();
	const [selectionStatus, setSelectionStatus] = useState([]);
	const [updateSelectors, setUpdateSelectors] = useState(false);
	const [waitForWarnings, setWaitForWarnings] = useState(true);
	const innerSelectors = useRef([]);
	const [errorsPerSection, setErrorsPerSection] = useState([]);
	const [warningsPerSection, setWarningsPerSection] = useState([]);

	const { platform } = useContext(PlatformContext);

	//Checks if it has to wait for the warnings to generate
	useLayoutEffect(() => {
		if (showErrors == false) setWaitForWarnings(false);
	}, []);

	//Checks if it has errors or warnings (has to wait for the warnings to generate)
	useLayoutEffect(() => {
		if (showErrors == true && warningList != undefined) {
			getErrorsPerSection();
			setWaitForWarnings(false);
		}
	}, [warningList]);

	//Generates the selectors for the sections depending if only the general map selector is needed it needs more granulaty
	useLayoutEffect(() => {
		if (!waitForWarnings) {
			if (allowModularSelection) {
				setSelectionStatus([]);

				const ORDERED_SELECTORS = orderByPropertyAlphabetically(
					SECTIONS.map((section, idx) => {
						return {
							position: String(section.position), //ToString to be sorted
							html: (
								<div
									style={{ display: "flex", alignItems: "center" }}
									className="my-2 ms-4"
								>
									<Form.Check
										key={section.id}
										ref={(el) => (innerSelectors.current[idx] = el)}
										onClick={() => setUpdateSelectors(true)}
										type="switch"
										label={section.position + "- " + section.name}
										data-id={section.id}
									/>
									{showErrors && (
										<div className="d-flex ms-2" style={{ gap: "10px" }}>
											{errorsPerSection[section.id] > 0 && (
												<FontAwesomeIcon
													icon={faExclamationCircle}
													style={{
														color: getRootStyle("--error-background-color"),
													}}
													title={`${errorsPerSection[section.id]} error(es)`}
												/>
											)}
											{warningsPerSection[section.id] > 0 && (
												<FontAwesomeIcon
													icon={faExclamationTriangle}
													style={{
														color: getRootStyle("--warning-background-color"),
													}}
													title={`${
														warningsPerSection[section.id]
													} advertencia(s)`}
												/>
											)}
										</div>
									)}
								</div>
							),
						};
					}),
					"position"
				).map((orderedSection) => orderedSection.html);
				ORDERED_SELECTORS.unshift(
					<div
						className="my-2"
						style={{ display: "flex", alignItems: "center" }}
					>
						<Form.Check
							type="switch"
							label={mapName ? mapName : metaData.name}
							onClick={toggleInnerSelectors}
						/>
						{showErrors && (
							<div className="d-flex ms-2" style={{ gap: "10px" }}>
								{errorList.length > 0 && (
									<FontAwesomeIcon
										icon={faExclamationCircle}
										style={{
											color: getRootStyle("--error-background-color"),
										}}
										title={`${errorList.length} error(es)`}
									/>
								)}
								{warningList.length > 0 && (
									<FontAwesomeIcon
										icon={faExclamationTriangle}
										style={{
											color: getRootStyle("--warning-background-color"),
										}}
										title={`${warningList.length} advertencia(s)`}
									/>
								)}
							</div>
						)}
					</div>
				);
				setSelectors(ORDERED_SELECTORS);
			} else {
				setSelectors(
					<div
						className="my-2"
						style={{ display: "flex", alignItems: "center" }}
					>
						<Form.Check
							type="switch"
							label={mapName ? mapName : metaData.name}
							onClick={toggleMainSelector}
						/>
						{showErrors && (
							<div className="d-flex ms-2" style={{ gap: "10px" }}>
								{errorList.length > 0 && (
									<FontAwesomeIcon
										icon={faExclamationCircle}
										style={{
											color: getRootStyle("--error-background-color"),
										}}
										title={`${errorList.length} error(es)`}
									/>
								)}
								{warningList.length > 0 && (
									<FontAwesomeIcon
										icon={faExclamationTriangle}
										style={{
											color: getRootStyle("--warning-background-color"),
										}}
										title={`${warningList.length} advertencia(s)`}
									/>
								)}
							</div>
						)}
					</div>
				);
			}
		}
	}, [waitForWarnings == false]);

	function toggleInnerSelectors(e) {
		const TARGET_STATUS = e.target.checked;
		innerSelectors.current.forEach((input) => {
			input.checked = TARGET_STATUS;
			input.disabled = TARGET_STATUS;
			return input;
		});
		setSelectionStatus((prev) => {
			prev.all = TARGET_STATUS;
			if (TARGET_STATUS) {
				prev = SECTIONS.map((section) => section.id);
			} else {
				prev = [];
			}
			return prev;
		});
	}

	function toggleMainSelector(e) {
		const TARGET_STATUS = e.target.checked;
		if (platform == "moodle") {
			const SECTION_IDS = SECTIONS.map((section) => section.id);
			setSelectionStatus(TARGET_STATUS ? SECTION_IDS : []);
		} else {
			setSelectionStatus(
				TARGET_STATUS
					? [...new Set(rfNodes.map((node) => node.data.section))] //GET ALL SECTIONS USED
					: []
			);
		}
	}

	useLayoutEffect(() => {
		if (updateSelectors) {
			setUpdateSelectors(false);

			const NEW_SELECTED_SECTIONS = [];
			innerSelectors.current.forEach((selector) => {
				const targetStatus = selector.checked;
				if (targetStatus) {
					NEW_SELECTED_SECTIONS.push(Number(selector.dataset.id));
				}
			});
			setSelectionStatus(NEW_SELECTED_SECTIONS);
		}
	}, [updateSelectors]);

	useLayoutEffect(() => {
		handleSelectionChange({
			selection: selectionStatus,
			errors: errorsPerSection,
			warnings: warningsPerSection,
		});
	}, [selectionStatus]);

	function getErrorsPerSection() {
		const ERROR_SEARCH = errorList.map((error) => {
			return {
				id: error.nodeId,
				section: getNodeById(error.nodeId, rfNodes).data.section,
			};
		});
		const WARNING_SEARCH = warningList.map((warning) => {
			return {
				id: warning.nodeId,
				section: getNodeById(warning.nodeId, rfNodes).data.section,
			};
		});

		const ERROR_SUM = getDuplicates(
			ERROR_SEARCH.map((errorS) => errorS.section)
		);
		const WARNING_SUM = getDuplicates(
			WARNING_SEARCH.map((warningS) => warningS.section)
		);

		const ERRORS_PER_SECTION_ARRAY = [];
		const WARNINGS_PER_SECTION_ARRAY = [];
		for (const SECTION in ERROR_SUM) {
			const SECTION_ERRORRS = ERROR_SUM[SECTION];
			ERRORS_PER_SECTION_ARRAY[SECTION] = SECTION_ERRORRS;
		}
		for (const SECTION in WARNING_SUM) {
			const SECTION_WARNINGS = WARNING_SUM[SECTION];
			WARNINGS_PER_SECTION_ARRAY[SECTION] = SECTION_WARNINGS;
		}

		setErrorsPerSection(ERRORS_PER_SECTION_ARRAY);
		setWarningsPerSection(WARNINGS_PER_SECTION_ARRAY);
	}

	return (
		<>
			<Form className="ms-2">{selectors}</Form>
		</>
	);
});
