import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faEdit,
	faShuffle,
	faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";

const BadgeListComponent = ({
	condition,
	badgeList,
	setConditionEdit,
	deleteCondition,
	swapConditionGroup,
}) => {
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
						siguientes insignias tienen que haber sido ganadas:
						<ul>
							{condition.params.map((option) => {
								const BADGE_FOUNDED = badgeList.find(
									(badge) => badge.id.toString() === option.toString()
								);

								return <li key={BADGE_FOUNDED.id}>{BADGE_FOUNDED.name}</li>;
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

export default BadgeListComponent;
