import React, { useContext } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faEdit,
	faShuffle,
	faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { MetaDataContext } from "pages/_app";

const CourseCompletionComponent = ({
	condition,
	setConditionEdit,
	deleteCondition,
	parseDate,
	swapConditionGroup,
}) => {
	const { metaData, setMetaData } = useContext(MetaDataContext);

	return (
		<Container
			className="mb-3 mt-3"
			style={{ padding: "10px", border: "1px solid #C7C7C7" }}
		>
			<Row className="align-items-center">
				<Col>
					<div>
						{
							<div>
								Los usuarios deben finalizar el curso{" "}
								<strong>{metaData.name}</strong>
								{condition.dateTo && (
									<a>
										{" "}
										antes del <strong>{parseDate(condition.dateTo)}</strong>
									</a>
								)}
								{condition.method &&
									condition.method !== "0" &&
									condition.method !== "" && (
										<a>
											{" "}
											con calificación mínima de{" "}
											<strong>{condition.method}</strong>
										</a>
									)}
							</div>
						}
					</div>
				</Col>
				<Col className="col-md-2 d-flex align-items-center gap-2">
					<Button variant="light" onClick={() => setConditionEdit(condition)}>
						<div>
							<FontAwesomeIcon icon={faEdit} />
						</div>
					</Button>
					<Button variant="light" onClick={() => deleteCondition(condition.id)}>
						<div>
							<FontAwesomeIcon icon={faTrashAlt} />
						</div>
					</Button>
				</Col>
			</Row>
		</Container>
	);
};

export default CourseCompletionComponent;
