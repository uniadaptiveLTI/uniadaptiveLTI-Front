import { render, screen } from "@testing-library/react";
import React from "react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import SimpleActionDialog from "@components/dialogs/SimpleActionDialog";
import { useState } from "react";

const SimpleActionDialogWrapper = () => {
	const [showModal, setShowModal] = useState(true);
	const toggleModal = () => setShowModal(!showModal);
	const modalCallback = () => toggleModal();
	return (
		<div>
			<SimpleActionDialog
				showDialog={showModal}
				toggleDialog={toggleModal}
				title={"Testing Title"}
				body={"This is the body of the modal"}
				action=""
				cancel=""
				type=""
				callback={modalCallback}
			/>
		</div>
	);
};

const CUSTOM_RENDER = (ui, options) =>
	render(ui, { wrapper: SimpleActionDialogWrapper, ...options });

test("Load and render the Simple aaction Dialog", async () => {
	// ARRANGE
	const render = CUSTOM_RENDER();

	// TEST INITIAL VALUES

	expect(render.findByText("Testing Title"));
	expect(render.findByText("This is the body of the modal"));
	expect(
		render.getByRole("button", {
			name: "Cerrar",
			variant: "Secondary",
		})
	);
	expect(
		render.getByRole("button", {
			name: "Ok",
			variant: "primary",
			onClick: () => {},
		})
	);

	//ACT
	await userEvent.click(screen.getByText("Ok"));

	// ASSERT - TO DISAPPEAR
	expect(render.container.firstChild).toBeEmptyDOMElement();
});
