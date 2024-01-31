import React from "react";
import { Col, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const ShowConditionColumn = ({
	condition,
	conditionsList,
	swapConditionParam,
}) => {
	const MAIN_CONDITION = conditionsList.c.some((c) => c.id === condition.id);

	return (
		<>
			{MAIN_CONDITION &&
				(conditionsList.op === "&" || conditionsList.op === "!|") && (
					<Col className="col-1">
						<Button
							variant="light"
							onClick={() => swapConditionParam(condition, "showc")}
						>
							<div>
								{condition.showc ? (
									<FontAwesomeIcon icon={faEye} />
								) : (
									<FontAwesomeIcon icon={faEyeSlash} />
								)}
							</div>
						</Button>
					</Col>
				)}
		</>
	);
};

export default ShowConditionColumn;
