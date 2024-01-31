import { Button } from "react-bootstrap";
import React from "react";

const ButtonComponent = ({ body, callback }, props) => (
	<Button
		variant="light"
		onClick={() => {
			if (callback && typeof callback === "function") callback();
		}}
		{...props}
	>
		{body}
	</Button>
);

export default ButtonComponent;
