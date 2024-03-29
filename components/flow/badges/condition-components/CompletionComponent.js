import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useReactFlow } from "reactflow";
import {
	faEdit,
	faTrashAlt,
	faShuffle,
} from "@fortawesome/free-solid-svg-icons";

const CompletionComponent = ({
	condition,
	parseDate,
	setConditionEdit,
	deleteCondition,
	swapConditionGroup,
}) => {
	const reactFlowInstance = useReactFlow();
	const nodes = reactFlowInstance.getNodes();

	return (
		<Container
			className="mb-3 mt-3"
			style={{ padding: "10px", border: "1px solid #C7C7C7" }}
		>
			<Row className="align-items-center">
				<Col>
					<div>
						{condition.method === "&" && (
							<a>
								<strong>TODAS</strong> las{" "}
							</a>
						)}
						{condition.method === "|" && (
							<a>
								<strong>CUALQUIERA</strong> de las{" "}
							</a>
						)}
						siguientes actividades se han finalizado:
						<ul>
							{condition.params.map((option) => {
								const node = nodes.find((node) => node.id === option.id);
								console.log(nodes, condition);
								return (
									<li key={option.id}>
										{node.data.label}{" "}
										{option.date && (
											<a>
												{" "}
												<strong>antes</strong> del{" "}
												<strong>{parseDate(option.date)}</strong>
											</a>
										)}
									</li>
								);
							})}
						</ul>
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
					<Button variant="light" onClick={() => swapConditionGroup(condition)}>
						<div>
							<FontAwesomeIcon icon={faShuffle} />
						</div>
					</Button>
				</Col>
			</Row>
		</Container>
	);
};

export default CompletionComponent;
