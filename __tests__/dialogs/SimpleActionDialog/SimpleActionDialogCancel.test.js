import { render, screen } from "@testing-library/react";
import React from "react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import SimpleActionDialog from "@components/dialogs/SimpleActionDialog";
import { useState } from "react";

const SimpleActionDialogWrapper = () => {
	const [showModal, setShowModal] = useState(true);
	const toggleModal = () => setShowModal(!showModal);
	const modalCallback = () => true;
	return (
		<div>
			<SimpleActionDialog
				showDialog={showModal}
				toggleDialog={toggleModal}
				title={"Testing Title"}
				body={"This is the body of the modal"}
				action="This is the Action Button"
				cancel="This is the Cancel Button"
				type="delete"
				callback={modalCallback}
			/>
		</div>
	);
};

const customRender = (ui, options) =>
	render(ui, { wrapper: SimpleActionDialogWrapper, ...options });

test("Load and render the Simple aaction Dialog", async () => {
	// ARRANGE
	const r = customRender();

	// TEST INITIAL VALUES

	expect(r.findByText("Testing Title"));
	expect(r.findByText("This is the body of the modal"));
	expect(
		r.getByRole("button", {
			name: "This is the Cancel Button",
			variant: "Secondary",
		})
	);
	expect(
		r.getByRole("button", {
			name: "This is the Action Button",
			variant: "danger",
			onClick: () => {},
		})
	);

	//ACT
	await userEvent.click(screen.getByText("This is the Cancel Button"));

	// ASSERT - TO DISAPPEAR
	expect(r.container.firstChild).toBeEmptyDOMElement();
});
