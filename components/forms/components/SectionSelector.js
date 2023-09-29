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
	const sections = metaData.sections;
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

	//Checks if it has  to wait for the warnings to generate
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

				const orderedSelectors = orderByPropertyAlphabetically(
					sections.map((section, idx) => {
						return {
							position: "" + section.position, //ToString to be sorted
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
				orderedSelectors.unshift(
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
				setSelectors(orderedSelectors);
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
		const targetStatus = e.target.checked;
		innerSelectors.current.forEach((input) => {
			input.checked = targetStatus;
			input.disabled = targetStatus;
			return input;
		});
		setSelectionStatus((prev) => {
			prev.all = targetStatus;
			if (targetStatus) {
				prev = sections.map((section) => section.id);
			} else {
				prev = [];
			}
			return prev;
		});
	}

	function toggleMainSelector(e) {
		const targetStatus = e.target.checked;
		if (platform == "moodle") {
			const sectionIds = sections.map((section) => section.id);
			setSelectionStatus(targetStatus ? sectionIds : []);
		} else {
			setSelectionStatus(
				targetStatus
					? [...new Set(rfNodes.map((node) => node.data.section))] //GET ALL SECTIONS USED
					: []
			);
		}
	}

	useLayoutEffect(() => {
		if (updateSelectors) {
			setUpdateSelectors(false);

			const newSelSections = [];
			innerSelectors.current.forEach((selector) => {
				const targetStatus = selector.checked;
				if (targetStatus) {
					newSelSections.push(Number(selector.dataset.id));
				}
			});
			setSelectionStatus(newSelSections);
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
		const errorSearch = errorList.map((error) => {
			return {
				id: error.nodeId,
				section: getNodeById(error.nodeId, rfNodes).data.section,
			};
		});
		const warningSearch = warningList.map((warning) => {
			return {
				id: warning.nodeId,
				section: getNodeById(warning.nodeId, rfNodes).data.section,
			};
		});

		const errorSum = getDuplicates(errorSearch.map((errorS) => errorS.section));
		const warningSum = getDuplicates(
			warningSearch.map((warningS) => warningS.section)
		);

		const errorPerSectionArray = [];
		const warningsPerSectionArray = [];
		for (const section in errorSum) {
			const sectionErrors = errorSum[section];
			errorPerSectionArray[section] = sectionErrors;
		}
		for (const section in warningSum) {
			const sectionWarnings = warningSum[section];
			warningsPerSectionArray[section] = sectionWarnings;
		}

		setErrorsPerSection(errorPerSectionArray);
		setWarningsPerSection(warningsPerSectionArray);
	}

	return (
		<>
			<Form className="ms-2">{selectors}</Form>
		</>
	);
});
