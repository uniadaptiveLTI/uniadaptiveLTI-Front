import FocusTrap from "focus-trap-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faDiagramNext,
	faScissors,
	faClipboard,
	faTrashCan,
	faEdit,
} from "@fortawesome/free-solid-svg-icons";
import styles from "@root/styles/ContextualMenu.module.css";
import { Button } from "react-bootstrap";
import { ActionNodes } from "@utils/Nodes";
import { useRef, forwardRef } from "react";

const Menu = (
	{
		handleShow,
		relationStarter,
		blockData,
		setRelationStarter,
		setShowContextualMenu,
		handleDeleteBlock,
		handleNewRelation,
		handleBlockCopy,
		handleBlockCut,
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
			{["fragment"].includes(blockData.type) == false && (
				<li>
					<Button
						variant="light"
						onClick={handleShow}
						disabled={!EnableEditPreconditions}
					>
						<div>
							<FontAwesomeIcon icon={faEdit} />
							<div>
								Editar precondiciones
								<span>CTRL/Cmd+E</span>
							</div>
						</div>
					</Button>
				</li>
			)}
			{relationStarter ? (
				relationStarter.id == blockData.id ? (
					<li>
						<Button
							variant="light"
							onClick={() => {
								setRelationStarter();
								setShowContextualMenu(false);
							}}
							disabled={!EnableCreateRelation}
						>
							<div>
								<FontAwesomeIcon icon={faDiagramNext} />
								<div>
									Cancelar relación
									<span>CTRL/Cmd+R</span>
								</div>
							</div>
						</Button>
					</li>
				) : (
					["fragment"].includes(blockData.type) == false && (
						<li>
							<Button
								variant="light"
								onClick={() => handleNewRelation(relationStarter, blockData)}
								disabled={!EnableCreateRelation}
							>
								<div>
									<FontAwesomeIcon icon={faDiagramNext} />
									<div>
										Terminar relación
										<span>Unir a "{relationStarter.title}"</span>
									</div>
								</div>
							</Button>
						</li>
					)
				)
			) : (
				[...ActionNodes, "end", "fragment"].includes(blockData.type) ==
					false && (
					<li>
						<Button
							variant="light"
							onClick={() => {
								setRelationStarter(blockData);
								setShowContextualMenu(false);
							}}
							disabled={!EnableCreateRelation}
						>
							<div>
								<FontAwesomeIcon icon={faDiagramNext} />
								<div>
									Crear relación
									<span>CTRL/Cmd+R</span>
								</div>
							</div>
						</Button>
					</li>
				)
			)}
			<li>
				<Button
					variant="light"
					onClick={() => handleBlockCopy([blockData])}
					disabled={!EnableCopy}
				>
					<div>
						<FontAwesomeIcon icon={faClipboard} />
						<div>
							Copiar bloque
							<span>CTRL+C</span>
						</div>
					</div>
				</Button>
			</li>
			<li>
				<Button
					variant="light"
					onClick={() => handleBlockCut([blockData])}
					disabled={!EnableCut}
				>
					<div>
						<FontAwesomeIcon icon={faScissors} />
						<div>
							Cortar bloque
							<span>CTRL+X</span>
						</div>
					</div>
				</Button>
			</li>
			<li>
				<Button
					variant="light"
					onClick={() => handleDeleteBlock(blockData)}
					disabled={!EnableDelete}
				>
					<div>
						<FontAwesomeIcon icon={faTrashCan} />
						<div>
							Eliminar bloque
							<span>Supr / Backspace</span>
						</div>
					</div>
				</Button>
			</li>
		</div>
	);
};
const MenuWithRefs = forwardRef(Menu);

export default function CMBlockMenu({
	handleShow,
	relationStarter,
	blockData,
	setRelationStarter,
	setShowContextualMenu,
	handleDeleteBlock,
	handleNewRelation,
	handleBlockCopy,
	handleBlockCut,
	EnableEditPreconditions = false,
	EnableCreateRelation = false,
	EnableCut = false,
	EnableCopy = false,
	EnableDelete = false,
}) {
	const ref = useRef(null);
	const focus = !(blockData.type == "end" && relationStarter == undefined);

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
				relationStarter={relationStarter}
				blockData={blockData}
				setRelationStarter={setRelationStarter}
				setShowContextualMenu={setShowContextualMenu}
				handleDeleteBlock={handleDeleteBlock}
				handleNewRelation={handleNewRelation}
				handleBlockCopy={handleBlockCopy}
				handleBlockCut={handleBlockCut}
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
			relationStarter={relationStarter}
			blockData={blockData}
			setRelationStarter={setRelationStarter}
			setShowContextualMenu={setShowContextualMenu}
			handleDeleteBlock={handleDeleteBlock}
			handleNewRelation={handleNewRelation}
			handleBlockCopy={handleBlockCopy}
			handleBlockCut={handleBlockCut}
			EnableEditPreconditions={EnableEditPreconditions}
			EnableCreateRelation={EnableCreateRelation}
			EnableCut={EnableCut}
			EnableCopy={EnableCopy}
			EnableDelete={EnableDelete}
		/>
	);
}
