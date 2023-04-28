import FocusTrap from "focus-trap-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faDiagramNext,
	faScissors,
	faClipboard,
	faTrashCan,
	faEdit,
} from "@fortawesome/free-solid-svg-icons";
import styles from "@components/styles/BlockContextualMenu.module.css";
import { Button } from "react-bootstrap";
import { ActionBlocks } from "../nodes/ActionNode";
import { notImplemented } from "@components/pages/_app";
import { useRef, forwardRef } from "react";

const Menu = (
	{
		handleShow,
		blockOrigin,
		blockData,
		handleDeleteBlock,
		setBlockOrigin,
		setShowContextualMenu,
		handleNewRelation,
		EnableEditPreconditions,
		EnableCreateRelation,
		EnableCut,
		EnableCopy,
		EnableDelete,
	},
	ref
) => {
	return (
		<div ref={ref} className={styles.cM + " "}>
			<li>
				<Button
					variant="light"
					onClick={handleShow}
					disabled={!EnableEditPreconditions}
				>
					<div>
						<FontAwesomeIcon icon={faEdit} />
						Editar precondiciones
					</div>
				</Button>
			</li>
			{blockOrigin ? (
				blockOrigin.id == blockData.id ? (
					<li>
						<Button
							variant="light"
							onClick={() => {
								setBlockOrigin();
								setShowContextualMenu(false);
							}}
						>
							<div>
								<FontAwesomeIcon icon={faDiagramNext} />
								Cancelar relación
							</div>
						</Button>
					</li>
				) : (
					<li>
						<Button
							variant="light"
							onClick={() => handleNewRelation(blockOrigin, blockData)}
						>
							<div>
								<FontAwesomeIcon icon={faDiagramNext} />
								<div
									style={{
										display: "flex",
										flexDirection: "column",
										alignItems: "flex-start",
									}}
								>
									<span>Terminar relación</span>
									<span style={{ fontSize: "0.7em" }}>
										Unir a "{blockOrigin.title}"
									</span>
								</div>
							</div>
						</Button>
					</li>
				)
			) : (
				[...ActionBlocks, "end"].includes(blockData.type) == false && (
					<li>
						<Button
							variant="light"
							onClick={() => {
								setBlockOrigin(blockData);
								setShowContextualMenu(false);
							}}
							disabled={!EnableCreateRelation}
						>
							<div>
								<FontAwesomeIcon icon={faDiagramNext} /> Crear relación
							</div>
						</Button>
					</li>
				)
			)}
			<li>
				<Button variant="light" onClick={notImplemented} disabled={!EnableCopy}>
					<div>
						<FontAwesomeIcon icon={faClipboard} />
						Copiar bloque
					</div>
				</Button>
			</li>
			<li>
				<Button variant="light" onClick={notImplemented} disabled={!EnableCut}>
					<div>
						<FontAwesomeIcon icon={faScissors} />
						Cortar bloque
					</div>
				</Button>
			</li>
			<li>
				<Button
					variant="light"
					onClick={handleDeleteBlock}
					disabled={!EnableDelete}
				>
					<div>
						<FontAwesomeIcon icon={faTrashCan} />
						Eliminar bloque...
					</div>
				</Button>
			</li>
		</div>
	);
};
const MenuWithRefs = forwardRef(Menu);

export default function CMBlockMenu({
	handleShow,
	blockOrigin,
	blockData,
	handleDeleteBlock,
	setBlockOrigin,
	setShowContextualMenu,
	handleNewRelation,
	EnableEditPreconditions = false,
	EnableCreateRelation = false,
	EnableCut = false,
	EnableCopy = false,
	EnableDelete = false,
}) {
	const ref = useRef(null);
	const focus = !(blockData.type == "end" && blockOrigin == undefined);

	return focus ? (
		<FocusTrap
			focusTrapOptions={{
				clickOutsideDeactivates: true,
				returnFocusOnDeactivate: true,
			}}
			active={true}
		>
			<MenuWithRefs
				ref={ref}
				handleShow={handleShow}
				blockOrigin={blockOrigin}
				blockData={blockData}
				handleDeleteBlock={handleDeleteBlock}
				setBlockOrigin={setBlockOrigin}
				setShowContextualMenu={setShowContextualMenu}
				handleNewRelation={handleNewRelation}
				EnableEditPreconditions={EnableEditPreconditions}
				EnableCreateRelation={EnableCreateRelation}
				EnableCut={EnableCut}
				EnableCopy={EnableCopy}
				EnableDelete={EnableDelete}
			/>
		</FocusTrap>
	) : (
		<MenuWithRefs
			ref={ref}
			handleShow={handleShow}
			blockOrigin={blockOrigin}
			blockData={blockData}
			handleDeleteBlock={handleDeleteBlock}
			setBlockOrigin={setBlockOrigin}
			setShowContextualMenu={setShowContextualMenu}
			handleNewRelation={handleNewRelation}
			EnableEditPreconditions={EnableEditPreconditions}
			EnableCreateRelation={EnableCreateRelation}
			EnableCut={EnableCut}
			EnableCopy={EnableCopy}
			EnableDelete={EnableDelete}
		/>
	);
}
